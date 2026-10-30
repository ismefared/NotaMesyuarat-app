import { useCallback, useEffect, useRef, useState } from 'react';
import { get, set, del } from 'idb-keyval';
import { Recorder, formatDuration } from './lib/recorder';
import { transcribe, loadASR, MODELS, LANGUAGES } from './lib/whisper';
import {
  transcribeWithOpenCode,
  generateNotesWithOpenCode,
  getAPIKey,
  setAPIKey,
  OPENCODE_MODELS,
} from './lib/opencode';
import { generateMinutes, transcriptToMarkdown } from './lib/minutes';
import { exportPDF, exportWord } from './lib/exporters';
import { Spinner, ProcessTracker, BusyButton } from './components/feedback';
import ZikirPanel from './components/ZikirPanel';
import {
  getCloudConfig,
  saveCloudConfig,
  testCloud,
  uploadToCloud,
  listCloudFiles,
  downloadFromCloud,
  getCloudFolderWebUrl,
  isCloudConfigured,
} from './lib/cloud';
import {
  MicIcon,
  UploadIcon,
  WaveformIcon,
  NoteIcon,
  ClipboardIcon,
  TargetIcon,
  LaptopIcon,
  CloudIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  FolderIcon,
  SaveIcon,
  FileIcon,
  DownloadIcon,
  CopyIcon,
  ShieldIcon,
  CloudUploadIcon,
  CloudDownloadIcon,
  SettingsIcon,
  RefreshIcon,
  CloseIcon,
} from './components/icons';

const MEETINGS_KEY = 'notamesyuarat:meetings';
const THEME_KEY = 'notamesyuarat:theme';

// Tetapkan tema pada <html> dan pulangkan nilai seterusnya.
// 'system' mengikut keutamaan pelayar pengguna.
function applyTheme(theme) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  // Meta theme-color ikut tema supaya chrome pelayar selari (R-34)
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    dark ? '#191714' : '#0f766e'
  );
  return dark ? 'dark' : 'light';
}

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'system';
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EMPTY_DETAILS = {
  tarikh: '',
  masa: '',
  lokasi: '',
  organisasi: '',
  ahli: '',
};

const STEPS = [
  { n: 1, label: 'Audio', Icon: WaveformIcon },
  { n: 2, label: 'Transkrip', Icon: ClipboardIcon },
  { n: 3, label: 'Nota', Icon: NoteIcon },
];

export default function App() {
  // rakaman
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [inputMode, setInputMode] = useState('rakam');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const recorderRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const rafRef = useRef(null);

  // aliran kerja
  const [step, setStep] = useState(1);

  // proses
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(null);
  const [status, setStatus] = useState('');
  const [modelPercent, setModelPercent] = useState(null);

  // nota & tetapan
  const [mode, setMode] = useState('minit');
  const [minutes, setMinutes] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [modelKey, setModelKey] = useState('base');
  const [language, setLanguage] = useState('auto');
  const [source, setSource] = useState('device');
  const [apiKey, setKey] = useState(getAPIKey());
  const [noteModel, setNoteModel] = useState('glm-5.3-flash-free');
  const [diarize, setDiarize] = useState(false);

  // butiran mesyuarat (pilihan)
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // awan (WebDAV)
  const [cloudCfg, setCloudCfg] = useState(getCloudConfig);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMsg, setCloudMsg] = useState('');
  const [cloudFiles, setCloudFiles] = useState(null);

  // storan
  const [meetings, setMeetings] = useState([]);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Ikut perubahan tema sistem secara langsung bila mod 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }, []);

  const loadMeetings = useCallback(async () => {
    // MEETINGS_KEY menyimpan senarai ID; objek penuh setiap mesyuarat
    // disimpan di kekunci sendiri. Ambil dan susun mengikut tarikh.
    const ids = (await get(MEETINGS_KEY)) || [];
    const items = await Promise.all(ids.map((id) => get(`${MEETINGS_KEY}:${id}`)));
    const list = items.filter(Boolean);
    list.sort((a, b) => b.createdAt - a.createdAt);
    setMeetings(list);
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Tutup modal awan dengan Escape (R-32)
  useEffect(() => {
    if (!cloudModalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setCloudModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cloudModalOpen]);

  // Auto-upload ke awan bila konfigurasi ada dan autoUpload aktif.
  // Tidak menyekat aliran utama: kegagalan hanya memaparkan toast.
  const maybeAutoUpload = useCallback(
    async (blob, filename) => {
      const cfg = getCloudConfig();
      if (!cfg.baseUrl || !cfg.autoUpload) return;
      try {
        await uploadToCloud(blob, filename, cfg);
        showToast(`Audio dihantar ke awan: ${filename}`);
      } catch (err) {
        console.error(err);
        showToast(`Auto-upload awan gagal: ${err.message}`);
      }
    },
    [showToast]
  );

  const fetchCloudFiles = useCallback(async (cfg = cloudCfg) => {
    setCloudBusy(true);
    setCloudMsg('');
    try {
      const files = await listCloudFiles(cfg);
      // Normalisasi: WebDAV beri {href}, GDrive beri {id}. Simpan rujukan seragam.
      const normalized = files.map((f) => ({
        ...f,
        ref: f.href || `gdrive:${f.id}`,
      }));
      setCloudFiles(normalized);
      if (normalized.length === 0) setCloudMsg('Tiada fail audio dalam folder awan ini.');
    } catch (err) {
      console.error(err);
      setCloudMsg(`Gagal senarai fail: ${err.message}`);
      setCloudFiles(null);
    } finally {
      setCloudBusy(false);
    }
  }, [cloudCfg]);

  const downloadCloudFile = async (file) => {
    setCloudBusy(true);
    setCloudMsg(`Memuat turun ${file.name}... 0%`);
    try {
      const blob = await downloadFromCloud(file.ref, cloudCfg, (percent) => {
        setCloudMsg(`Memuat turun ${file.name}... ${percent}%`);
      });
      const ext = file.name.split('.').pop()?.toLowerCase();
      const mimeMap = {
        mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', webm: 'audio/webm',
        ogg: 'audio/ogg', oga: 'audio/ogg', mp4: 'audio/mp4', mov: 'video/quicktime',
        aac: 'audio/aac', flac: 'audio/flac',
      };
      const downloaded = new File([blob], file.name, {
        type: mimeMap[ext] || blob.type || 'audio/mpeg',
      });
      acceptFile(downloaded);
    } catch (err) {
      console.error(err);
      setCloudMsg(`Muat turun gagal: ${err.message}`);
    } finally {
      setCloudBusy(false);
    }
  };

  const openCloudFolder = async () => {
    setCloudBusy(true);
    setCloudMsg('');
    try {
      const url = await getCloudFolderWebUrl(cloudCfg);
      window.open(url, '_blank', 'noopener');
      // Buka folder biasanya bermakna pengguna mahu lihat kandungan — segarkan senarai
      await fetchCloudFiles();
    } catch (err) {
      console.error(err);
      setCloudMsg(`Gagal membuka folder: ${err.message}`);
    } finally {
      setCloudBusy(false);
    }
  };

  const saveCloudSettings = async () => {
    setCloudBusy(true);
    setCloudMsg('');
    try {
      await testCloud(cloudCfg);
      saveCloudConfig(cloudCfg);
      setCloudMsg('Sambungan berjaya dan tetapan disimpan.');
      showToast('Tetapan awan disimpan');
    } catch (err) {
      console.error(err);
      setCloudMsg(`Sambungan gagal: ${err.message}`);
    } finally {
      setCloudBusy(false);
    }
  };

  const updateCloudCfg = (field, value) => {
    const next = { ...cloudCfg, [field]: value };
    setCloudCfg(next);
  };

  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = recorderRef.current?.analyser;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = 48;
    const stepW = Math.floor(data.length / bars);
    const barW = canvas.width / bars - 2;
    ctx.fillStyle = '#0f766e';
    for (let i = 0; i < bars; i++) {
      const v = data[i * stepW] / 255;
      const h = Math.max(2, v * canvas.height * 0.9);
      ctx.fillRect(i * (barW + 2), (canvas.height - h) / 2, barW, h);
    }
    rafRef.current = requestAnimationFrame(drawWave);
  }, []);

  const startRecording = async () => {
    try {
      recorderRef.current = new Recorder();
      recorderRef.current.onLevel = () => {};
      await recorderRef.current.start();
      setIsRecording(true);
      setElapsed(0);
      setAudioBlob(null);
      setTranscript('');
      setMinutes('');
      setStatus('');
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      rafRef.current = requestAnimationFrame(drawWave);
    } catch {
      setStatus('Tidak dapat mengakses mikrofon. Sila benarkan kebenaran mic.');
    }
  };

  const stopRecording = async () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    const blob = await recorderRef.current.stop();
    setIsRecording(false);
    setAudioBlob(blob);
    const name = `rakaman-notamesyuarat-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    setAudioName(`${name} (${formatBytes(blob.size)})`);
    setAudioUrl(URL.createObjectURL(blob));
    setStatus('Rakaman selesai.');
    setStep(2);
    maybeAutoUpload(blob, name);
  };

  const acceptFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setStatus('Format fail tidak disokong. Sila guna fail audio (mp3, m4a, wav, webm, ogg).');
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(file);
    setAudioName(`${file.name} (${formatBytes(file.size)})`);
    setAudioUrl(URL.createObjectURL(file));
    setTranscript('');
    setMinutes('');
    setStatus(`Fail "${file.name}" sedia untuk ditranskripsi.`);
    setStep(2);
    maybeAutoUpload(file, file.name);
  };

  const onFilePicked = (e) => {
    acceptFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const doTranscribe = async () => {
    if (!audioBlob) return;
    setBusy('transcribe');

    if (source === 'opencode') {
      if (!apiKey.trim()) {
        setStatus('Sila masukkan OpenCode API key terlebih dahulu.');
        setBusy(null);
        return;
      }
      setStatus('Mentranskripsi melalui OpenCode (Gemini)...');
      try {
        const text = await transcribeWithOpenCode(audioBlob, apiKey.trim(), { diarize, language });
        setTranscript(text);
        setStatus(text ? 'Transkrip siap.' : 'Tiada suara dikesan dalam rakaman.');
        if (text) setStep(3);
      } catch (err) {
        console.error(err);
        setStatus(`Transkripsi OpenCode gagal: ${err.message}`);
      } finally {
        setBusy(null);
      }
      return;
    }

    setStatus('Memuatkan model transkripsi...');
    setModelPercent(0);
    try {
      await loadASR(({ percent }) => setModelPercent(percent), modelKey);
      setModelPercent(null);
      setStatus('Mentranskripsi rakaman...');
      const text = await transcribe(audioBlob, modelKey, language);
      setTranscript(text);
      setStatus(text ? 'Transkrip siap.' : 'Tiada suara dikesan dalam rakaman.');
      if (text) setStep(3);
    } catch (err) {
      console.error(err);
      setStatus('Transkripsi gagal. Sila cuba lagi.');
    } finally {
      setBusy(null);
      setModelPercent(null);
    }
  };

  const doGenerate = async () => {
    if (!transcript.trim()) return;
    setBusy('minutes');
    let result = null;
    if (useAI) {
      if (apiKey.trim()) {
        try {
          setStatus(`Menjana nota melalui OpenCode (${noteModel})...`);
          result = await generateNotesWithOpenCode(transcript, mode, apiKey.trim(), noteModel, details);
        } catch (err) {
          console.error(err);
          setStatus(`AI OpenCode gagal: ${err.message}. Guna kaedah pantas.`);
        }
      } else {
        setStatus('API key OpenCode tiada, guna kaedah pantas.');
      }
    }
    if (!result) {
      result = generateMinutes(transcript, Date.now(), mode, details);
    }
    setMinutes(result);
    setStatus('');
    setBusy(null);
  };

  const saveMeeting = async () => {
    const title =
      minutes.match(/^# (.+)$/m)?.[1] ||
      `Mesyuarat ${new Date().toLocaleDateString('ms-MY')}`;
    const item = {
      id: crypto.randomUUID(),
      title,
      createdAt: Date.now(),
      transcript,
      minutes,
      mode,
      details,
    };
    await set(`${MEETINGS_KEY}:${item.id}`, item);
    await set(MEETINGS_KEY, [...((await get(MEETINGS_KEY)) || []), item.id]);
    await loadMeetings();
    showToast('Mesyuarat disimpan');
  };

  const removeMeeting = async (id) => {
    await del(`${MEETINGS_KEY}:${id}`);
    const ids = ((await get(MEETINGS_KEY)) || []).filter((x) => x !== id);
    await set(MEETINGS_KEY, ids);
    await loadMeetings();
    showToast('Mesyuarat dipadam');
  };

  const openMeeting = async (id) => {
    const item = await get(`${MEETINGS_KEY}:${id}`);
    if (!item) return;
    setTranscript(item.transcript || '');
    setMinutes(item.minutes || '');
    setMode(item.mode || 'minit');
    setDetails(item.details || EMPTY_DETAILS);
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioName('');
    setStatus('Dibuka daripada simpanan.');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportMinutes = () => {
    if (!minutes) return;
    download(`minit-mesyuarat-${Date.now()}.md`, minutes);
    showToast('Fail Markdown dimuat turun');
  };

  const exportTranscript = () => {
    if (!transcript) return;
    download(`transkrip-${Date.now()}.md`, transcriptToMarkdown(transcript, Date.now()));
    showToast('Transkrip dimuat turun');
  };

  const copyMinutes = async () => {
    if (!minutes) return;
    await navigator.clipboard.writeText(minutes);
    showToast('Nota disalin');
  };

  const exportMinutesPDF = () => {
    if (!minutes) return;
    exportPDF(minutes, `minit-mesyuarat-${Date.now()}`);
    showToast('PDF dimuat turun');
  };

  const exportMinutesWord = () => {
    if (!minutes) return;
    exportWord(minutes, `minit-mesyuarat-${Date.now()}`);
    showToast('Fail Word dimuat turun');
  };

  const stepReached = { 1: true, 2: !!audioBlob, 3: !!transcript.trim() };

  // Fasa proses transkripsi untuk ProcessTracker
  const transcribePhases = [
    { key: 'download', label: 'Model/Audio' },
    { key: 'transcribe', label: 'Transkripsi' },
    { key: 'done', label: 'Siap' },
  ];
  const transcribeCurrent =
    busy === 'transcribe' ? (modelPercent !== null ? 'download' : 'transcribe') : 'done';

  // Fasa proses penjanaan nota
  const generatePhases = [
    { key: 'read', label: 'Baca transkrip' },
    { key: 'generate', label: 'Menjana nota' },
    { key: 'done', label: 'Siap' },
  ];
  const generateCurrent =
    busy === 'minutes'
      ? useAI && apiKey.trim()
        ? 'generate'
        : 'generate'
      : 'done';

  return (
    <div className="shell">
      <header className="topbar">
        <div className="wordmark">
          <span className="wordmark-name">NotaMesyuarat</span>
          <span className="wordmark-sub">Rakam, transkrip, jana minit. Semuanya dalam pelayar.</span>
        </div>
        <div className="topbar-actions">
          <button
            className="btn ghost small"
            onClick={() => setCloudModalOpen(true)}
            aria-haspopup="dialog"
          >
            <SettingsIcon size={15} /> Awan
          </button>
          <div className="theme-toggle" role="radiogroup" aria-label="Tema">
          {[
            { id: 'light', label: 'Cerah', Icon: SunIcon },
            { id: 'dark', label: 'Gelap', Icon: MoonIcon },
            { id: 'system', label: 'Sistem', Icon: MonitorIcon },
          ].map(({ id: tId, label, Icon: ThemeIcon }) => (
            <button
              key={tId}
              role="radio"
              aria-checked={theme === tId}
              className={`theme-option${theme === tId ? ' theme-active' : ''}`}
              onClick={() => setTheme(tId)}
              title={label}
            >
              <ThemeIcon size={15} />
              <span>{label}</span>
            </button>
          ))}
          </div>
        </div>
      </header>

      <nav className="stepper" aria-label="Langkah kerja">
        {STEPS.map(({ n, label, Icon: StepIcon }) => {
          const state = step === n ? 'current' : stepReached[n] ? 'done' : 'locked';
          return (
            <button
              key={n}
              className={`step step-${state}`}
              onClick={() => stepReached[n] && setStep(n)}
              disabled={!stepReached[n]}
              aria-current={step === n ? 'step' : undefined}
            >
              <span className="step-num">{step > n && stepReached[n] ? '✓' : n}</span>
              <StepIcon size={15} />
              <span className="step-label">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="layout">
        <main className="content">
          {step === 1 && (
            <section className="panel">
              <div className="segmented" role="tablist" aria-label="Kaedah input">
                <button
                  className={inputMode === 'rakam' ? 'seg-active' : ''}
                  onClick={() => setInputMode('rakam')}
                >
                  <MicIcon size={15} />
                  Rakam
                </button>
                <button
                  className={inputMode === 'upload' ? 'seg-active' : ''}
                  onClick={() => setInputMode('upload')}
                >
                  <UploadIcon size={15} />
                  Fail
                </button>
                <button
                  className={inputMode === 'cloud' ? 'seg-active' : ''}
                  onClick={() => {
                    setInputMode('cloud');
                    if (cloudFiles === null && isCloudConfigured(cloudCfg)) fetchCloudFiles();
                  }}
                >
                  <CloudDownloadIcon size={15} />
                  Dari awan
                </button>
              </div>

              <div className="details-block">
                <button
                  className="details-toggle"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  aria-expanded={detailsOpen}
                >
                  <NoteIcon size={15} />
                  Butiran mesyuarat (pilihan)
                  <span className={`details-chev${detailsOpen ? ' open' : ''}`} aria-hidden="true">▾</span>
                </button>
                {detailsOpen && (
                  <div className="details-grid">
                    <div className="details-field">
                      <label htmlFor="d-tarikh">Tarikh</label>
                      <input
                        id="d-tarikh"
                        type="date"
                        value={details.tarikh}
                        onChange={(e) => setDetails({ ...details, tarikh: e.target.value })}
                      />
                    </div>
                    <div className="details-field">
                      <label htmlFor="d-masa">Masa</label>
                      <input
                        id="d-masa"
                        type="time"
                        value={details.masa}
                        onChange={(e) => setDetails({ ...details, masa: e.target.value })}
                      />
                    </div>
                    <div className="details-field">
                      <label htmlFor="d-lokasi">Lokasi</label>
                      <input
                        id="d-lokasi"
                        type="text"
                        placeholder="Contoh: Bilik Mesyuarat A / Zoom"
                        value={details.lokasi}
                        onChange={(e) => setDetails({ ...details, lokasi: e.target.value })}
                      />
                    </div>
                    <div className="details-field">
                      <label htmlFor="d-org">Organisasi</label>
                      <input
                        id="d-org"
                        type="text"
                        placeholder="Contoh: Jabatan IT"
                        value={details.organisasi}
                        onChange={(e) => setDetails({ ...details, organisasi: e.target.value })}
                      />
                    </div>
                    <div className="details-field details-full">
                      <label htmlFor="d-ahli">Ahli mesyuarat</label>
                      <textarea
                        id="d-ahli"
                        className="details-ahli"
                        placeholder="Satu nama setiap baris, atau pisahkan dengan koma"
                        rows={3}
                        value={details.ahli}
                        onChange={(e) => setDetails({ ...details, ahli: e.target.value })}
                      />
                    </div>
                    <p className="hint details-full">
                      Butiran ini akan disertakan dalam minit mesyuarat atau nota yang dijana. Kosongkan jika tidak perlu.
                    </p>
                  </div>
                )}
              </div>

              {inputMode === 'rakam' ? (
                <div className="record-area">
                  <canvas ref={canvasRef} className="waveform" width={420} height={56} />
                  <div className="timer">{formatDuration(elapsed)}</div>
                  {isRecording ? (
                    <button className="mic-button recording" onClick={stopRecording} aria-label="Henti rakaman">
                      <span className="mic-stop" />
                    </button>
                  ) : (
                    <button className="mic-button" onClick={startRecording} aria-label="Mula rakaman">
                      <span className="mic-icon" />
                    </button>
                  )}
                  <p className="hint">
                    {isRecording ? 'Sedang merakam. Tekan butang untuk berhenti.' : 'Tekan butang untuk mula merakam mesyuarat.'}
                  </p>
                </div>
              ) : inputMode === 'upload' ? (
                <div
                  className={`upload-area${dragOver ? ' dragover' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                >
                  <p className="upload-title">Seret & lepas fail audio di sini</p>
                  <button className="btn secondary" onClick={() => fileInputRef.current?.click()}>
                    Pilih fail
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*,.mp4,.m4a,.mp3,.wav,.webm,.ogg,.mov,.aac,.flac"
                    style={{ display: 'none' }}
                    onChange={onFilePicked}
                  />
                  <p className="hint">mp3, m4a, wav, webm, ogg, mov, mp4 dan lain-lain. Termasuk rakaman Zoom, Meet, atau video iPhone (mov).</p>
                </div>
              ) : (
                <div className="cloud-area">
                  {!isCloudConfigured(cloudCfg) ? (
                    <>
                      <p className="hint">
                        {cloudCfg.cloudType === 'gdrive'
                          ? 'Awan Google Drive belum dikonfigurasi. Buka Tetapan Awan untuk tampal OAuth Client ID anda.'
                          : 'Awan belum dikonfigurasi. Buka Tetapan Awan untuk masukkan URL pelayan WebDAV anda (contoh: Nextcloud).'}
                      </p>
                      <div className="action-row">
                        <button className="btn secondary" onClick={() => setCloudModalOpen(true)}>
                          <SettingsIcon size={15} /> Buka Tetapan Awan
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="action-row">
                        <button
                          className="btn secondary"
                          onClick={() => fetchCloudFiles()}
                          disabled={cloudBusy}
                        >
                          <RefreshIcon size={15} /> Segar semula
                        </button>
                        <button
                          className="btn secondary"
                          onClick={openCloudFolder}
                          disabled={cloudBusy}
                        >
                          <FolderIcon size={15} /> Buka folder awan
                        </button>
                        <button className="btn ghost" onClick={() => setCloudModalOpen(true)}>
                          <SettingsIcon size={15} /> Tetapan
                        </button>
                      </div>
                      {cloudBusy && <p className="hint status-animated"><Spinner size={12} /> Melakukan operasi awan...</p>}
                      {cloudMsg && <p className="hint">{cloudMsg}</p>}
                      {cloudFiles && cloudFiles.length > 0 && (
                        <ul className="cloud-list">
                          {cloudFiles.map((f) => (
                            <li key={f.ref} className="cloud-file">
                              <div className="cloud-file-info">
                                <FileIcon size={15} />
                                <span className="cloud-file-name">{f.name}</span>
                                <span className="cloud-file-meta">{formatBytes(f.size)}</span>
                              </div>
                              <button
                                className="btn secondary small"
                                onClick={() => downloadCloudFile(f)}
                                disabled={cloudBusy}
                              >
                                <DownloadIcon size={14} /> Pilih
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}

              {audioUrl && (
                <div className="audio-block">
                  <p className="file-name">{audioName}</p>
                  <audio controls src={audioUrl} />
                  <button className="btn primary" onClick={() => setStep(2)}>
                    Teruskan ke transkrip
                  </button>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="panel">
              <div className="segmented" role="tablist" aria-label="Enjin transkripsi">
                <button
                  className={source === 'device' ? 'seg-active' : ''}
                  onClick={() => setSource('device')}
                >
                  <LaptopIcon size={15} />
                  On-device
                </button>
                <button
                  className={source === 'opencode' ? 'seg-active' : ''}
                  onClick={() => setSource('opencode')}
                >
                  <CloudIcon size={15} />
                  OpenCode (ketepatan tinggi)
                </button>
              </div>

              {source === 'device' ? (
                <div className="option-row">
                  <div className="field-pair">
                    <div className="field-col">
                      <label className="field-label" htmlFor="model-select">Model</label>
                      <select
                        id="model-select"
                        value={modelKey}
                        onChange={(e) => setModelKey(e.target.value)}
                        disabled={busy !== null}
                      >
                        {Object.entries(MODELS).map(([key, m]) => (
                          <option key={key} value={key}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field-col">
                      <label className="field-label" htmlFor="lang-select">Bahasa</label>
                      <select
                        id="lang-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={busy !== null}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="hint">Berjalan dalam pelayar. Audio tidak dihantar ke mana-mana. Pilih "Melayu" jika mesyuarat dalam Bahasa Melayu untuk hasil lebih konsisten.</p>
                </div>
              ) : (
                <div className="option-row">
                  <div className="field-pair">
                    <div className="field-col">
                      <label className="field-label" htmlFor="api-key-input">OpenCode API key</label>
                      <input
                        id="api-key-input"
                        type="password"
                        placeholder="Tampal API key anda di sini"
                        value={apiKey}
                        onChange={(e) => {
                          setKey(e.target.value);
                          setAPIKey(e.target.value);
                        }}
                      />
                    </div>
                    <div className="field-col">
                      <label className="field-label" htmlFor="lang-select-cloud">Bahasa</label>
                      <select
                        id="lang-select-cloud"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        disabled={busy !== null}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className="check-row">
                    <input type="checkbox" checked={diarize} onChange={(e) => setDiarize(e.target.checked)} />
                    Kenal pasti pembicara (Pembicara 1, Pembicara 2, ...)
                  </label>
                  <p className="hint">Kunci disimpan dalam pelayar anda sahaja. Transkripsi melalui Gemini Flash Lite.</p>
                </div>
              )}

              {modelPercent !== null && (
                <div className="model-progress">
                  <p className="hint">
                    <Spinner size={12} /> Memuat turun model (sekali sahaja)... <strong>{modelPercent}%</strong>
                  </p>
                  <div className="progress-bar">
                    <div style={{ width: `${modelPercent}%` }} />
                  </div>
                </div>
              )}

              {busy === 'transcribe' && (
                <ProcessTracker
                  phases={transcribePhases}
                  currentKey={transcribeCurrent}
                  doneKeys={transcribeCurrent === 'done' ? ['download', 'transcribe', 'done'] : ['download']}
                />
              )}

              <div className="action-row">
                <BusyButton
                  busy={busy === 'transcribe'}
                  busyLabel={modelPercent !== null ? 'Memuat model...' : 'Mentranskripsi...'}
                  icon={WaveformIcon}
                  onClick={doTranscribe}
                  disabled={!audioBlob || busy !== null}
                >
                  Jana transkrip
                </BusyButton>
                <button className="btn ghost" onClick={exportTranscript} disabled={!transcript}>
                  <DownloadIcon size={15} /> Eksport transkrip
                </button>
              </div>

              {audioName && (
                <div className="loaded-file">
                  <FileIcon size={15} />
                  <span>{audioName}</span>
                  <audio controls src={audioUrl} />
                </div>
              )}

              <textarea
                className="transcript"
                placeholder="Transkrip akan muncul di sini. Anda boleh edit terus."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <p className="hint status-animated">{status}</p>
              {transcript.trim() && (
                <button className="btn primary" onClick={() => setStep(3)}>
                  Teruskan ke nota
                </button>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="panel">
              <div className="segmented" role="tablist" aria-label="Jenis nota">
                <button className={mode === 'minit' ? 'seg-active' : ''} onClick={() => setMode('minit')}>
                  <ClipboardIcon size={15} />
                  Minit mesyuarat
                </button>
                <button className={mode === 'skop' ? 'seg-active' : ''} onClick={() => setMode('skop')}>
                  <TargetIcon size={15} />
                  Skop keperluan
                </button>
              </div>

              <div className="option-row">
                <label className="check-row">
                  <input type="checkbox" checked={useAI} onChange={(e) => setUseAI(e.target.checked)} />
                  Jana dengan AI OpenCode
                </label>
                {useAI && (
                  <select value={noteModel} onChange={(e) => setNoteModel(e.target.value)} disabled={busy !== null} aria-label="Model AI">
                    {OPENCODE_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                )}
              </div>

              {busy === 'minutes' && (
                <ProcessTracker
                  phases={generatePhases}
                  currentKey={generateCurrent}
                  doneKeys={generateCurrent === 'done' ? ['read', 'generate', 'done'] : ['read']}
                />
              )}

              <div className="action-row">
                <BusyButton
                  busy={busy === 'minutes'}
                  busyLabel="Menjana nota..."
                  icon={NoteIcon}
                  onClick={doGenerate}
                  disabled={!transcript.trim() || busy !== null}
                >
                  Jana nota
                </BusyButton>
                {minutes && (
                  <>
                    <button className="btn secondary" onClick={saveMeeting}><SaveIcon size={15} /> Simpan</button>
                    <button className="btn ghost" onClick={exportMinutesPDF}><FileIcon size={15} /> PDF</button>
                    <button className="btn ghost" onClick={exportMinutesWord}><NoteIcon size={15} /> Word</button>
                    <button className="btn ghost" onClick={exportMinutes}><DownloadIcon size={15} /> Markdown</button>
                    <button className="btn ghost" onClick={copyMinutes}><CopyIcon size={15} /> Salin</button>
                  </>
                )}
              </div>

              {busy === 'minutes' && status && <p className="hint">{status}</p>}
              <textarea
                className="minutes"
                placeholder="Nota akan dijana di sini berdasarkan transkrip."
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </section>
          )}
        </main>

        <aside className="aside">
          <div className="sidebar">
            <h2 className="sidebar-title">
              <FolderIcon size={16} />
              Mesyuarat tersimpan
            </h2>
            {meetings.length === 0 && (
              <p className="empty-state">
                Belum ada mesyuarat disimpan. Jana nota, kemudian tekan Simpan untuk melihatnya di sini.
              </p>
            )}
            {meetings.map((m) => (
              <div className="meeting-item" key={m.id}>
                <h3>{m.title || 'Tanpa tajuk'}</h3>
                <time>
                  {new Date(m.createdAt).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
                <div className="action-row">
                  <button className="btn secondary small" onClick={() => openMeeting(m.id)}>Buka</button>
                  <button className="btn danger small" onClick={() => removeMeeting(m.id)}>Padam</button>
                </div>            </div>
            ))}
          </div>
          <ZikirPanel />
        </aside>
      </div>

      {cloudModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCloudModalOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cloud-modal-title">
            <div className="modal-head">
              <h2 id="cloud-modal-title">
                <CloudIcon size={16} /> Tetapan Awan (WebDAV)
              </h2>
              <button className="btn ghost small" onClick={() => setCloudModalOpen(false)} aria-label="Tutup">
                <CloseIcon size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="segmented" role="tablist" aria-label="Jenis awan">
                <button
                  className={cloudCfg.cloudType !== 'gdrive' ? 'seg-active' : ''}
                  onClick={() => updateCloudCfg('cloudType', 'webdav')}
                >
                  <CloudIcon size={15} /> WebDAV
                </button>
                <button
                  className={cloudCfg.cloudType === 'gdrive' ? 'seg-active' : ''}
                  onClick={() => updateCloudCfg('cloudType', 'gdrive')}
                >
                  <CloudUploadIcon size={15} /> Google Drive
                </button>
              </div>

              {cloudCfg.cloudType === 'gdrive' ? (
                <>
                  <label className="field-label" htmlFor="c-gid">Google OAuth Client ID</label>
                  <input
                    id="c-gid"
                    type="text"
                    placeholder="xxxx.apps.googleusercontent.com"
                    value={cloudCfg.gdriveClientId}
                    onChange={(e) => updateCloudCfg('gdriveClientId', e.target.value)}
                  />
                  <p className="hint">
                    Cipta di Google Cloud Console: aktifkan Google Drive API, cipta OAuth Client
                    ID (Web application), dan tambah origin ini
                    ({window.location.origin}) pada Authorized JavaScript origins.
                  </p>
                </>
              ) : (
                <>
                  <label className="field-label" htmlFor="c-url">URL pelayan WebDAV</label>
                  <input
                    id="c-url"
                    type="url"
                    placeholder="https://awan.contoh.com/remote.php/dav/files/pengguna"
                    value={cloudCfg.baseUrl}
                    onChange={(e) => updateCloudCfg('baseUrl', e.target.value)}
                  />
                </>
              )}
              <label className="field-label" htmlFor="c-folder">Folder</label>
              <input
                id="c-folder"
                type="text"
                placeholder="notamesyuarat"
                value={cloudCfg.folder}
                onChange={(e) => updateCloudCfg('folder', e.target.value)}
                disabled={cloudCfg.cloudType === 'gdrive'}
              />
              {cloudCfg.cloudType !== 'gdrive' && (
                <>
                  <label className="field-label" htmlFor="c-user">Nama pengguna</label>
                  <input
                    id="c-user"
                    type="text"
                    autoComplete="off"
                    value={cloudCfg.username}
                    onChange={(e) => updateCloudCfg('username', e.target.value)}
                  />
                  <label className="field-label" htmlFor="c-pass">Kata laluan</label>
                  <input
                    id="c-pass"
                    type="password"
                    autoComplete="new-password"
                    value={cloudCfg.password}
                    onChange={(e) => updateCloudCfg('password', e.target.value)}
                  />
                </>
              )}
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={cloudCfg.autoUpload}
                  onChange={(e) => updateCloudCfg('autoUpload', e.target.checked)}
                />
                Auto-upload audio ke awan selepas rakam atau muat naik
              </label>
              {cloudCfg.cloudType === 'gdrive' && (
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={cloudCfg.searchAll}
                    onChange={(e) => updateCloudCfg('searchAll', e.target.checked)}
                  />
                  Cari keseluruhan Drive (termasuk fail di luar folder app)
                </label>
              )}
              {cloudMsg && <p className="hint">{cloudMsg}</p>}
              <p className="hint">
                {cloudCfg.cloudType === 'gdrive'
                  ? 'Fail disimpan dalam folder "notamesyuarat" di Google Drive anda. Skop akses: keseluruhan Drive (perlu untuk melihat fail yang diupload manual).'
                  : 'Kredensial disimpan dalam pelayar anda sahaja. Sesuai dengan Nextcloud, ownCloud, atau mana-mana pelayan WebDAV. Pastikan pelayan membenarkan akses CORS dari laman ini.'}
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn primary" onClick={saveCloudSettings} disabled={cloudBusy}>
                {cloudBusy ? 'Menguji...' : 'Uji sambungan & simpan'}
              </button>
              <button className="btn ghost" onClick={() => setCloudModalOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
