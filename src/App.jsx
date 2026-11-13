import { useCallback, useEffect, useRef, useState } from 'react';
import { get, set, del } from 'idb-keyval';
import { Recorder, formatClock } from './lib/recorder';
import { transcribe, loadASR, MODELS, LANGUAGES } from './lib/whisper';
import {
  transcribeWithOpenCode,
  generateNotesWithOpenCode,
  getAPIKey,
  setAPIKey,
  OPENCODE_MODELS,
} from './lib/opencode';
import { generateMinutes, transcriptToMarkdown } from './lib/minutes';
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
import { Spinner, ProcessTracker, BusyButton, Skeleton, SkeletonMeetingRow } from './components/feedback';
import ZikirPanel from './components/ZikirPanel';
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
  CloudDownloadIcon,
  CloudUploadIcon,
  SettingsIcon,
  RefreshIcon,
  CloseIcon,
  CalendarIcon,
  GlobeIcon,
  KebabIcon,
  ChevronDownIcon,
  ClockIcon,
} from './components/icons';

const MEETINGS_KEY = 'notamesyuarat:meetings';
const THEME_KEY = 'notamesyuarat:theme';

// Tetapkan tema pada <html> dan pulangkan nilai seterusnya.
function applyTheme(theme) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    'content',
    dark ? '#191714' : '#0f766e'
  );
  return dark ? 'dark' : 'light';
}

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'system';
}

// Aksesibiliti: navigasi anak panah bagi corak ARIA tablist — fokus mengikut
// ArrowLeft/Right mengaktifkan tab (activation follows focus).
function tablistKeyDown(e) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const tabs = [...e.currentTarget.querySelectorAll('[role="tab"]')];
  const i = tabs.indexOf(document.activeElement);
  if (i === -1) return;
  e.preventDefault();
  const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
  next.focus();
  next.click();
}

// Aksesibiliti: perangkap fokus modal — Tab tidak boleh keluar daripada dialog.
function modalTrapFocus(e) {
  if (e.key !== 'Tab') return;
  const els = [
    ...e.currentTarget.querySelectorAll('button, input, select, textarea, a[href]'),
  ].filter((el) => !el.disabled);
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
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
  tajuk: '',
  tarikh: '',
  masa: '',
  lokasi: '',
  organisasi: '',
  ahli: '',
};

const STEPS = [
  { n: 1, label: 'Audio', sub: 'Rakam atau muat naik audio', Icon: MicIcon },
  { n: 2, label: 'Transkrip', sub: 'Tukar audio kepada teks', Icon: ClipboardIcon },
  { n: 3, label: 'Nota', sub: 'Jana minit mesyuarat', Icon: NoteIcon },
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

  // peranti mic
  const [mics, setMics] = useState([]);
  const [micId, setMicId] = useState('');
  const [micStatus, setMicStatus] = useState('belum'); // 'belum' | 'aktif' | 'tiada'

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
  const [source, setSource] = useState('device');
  const [apiKey, setKey] = useState(getAPIKey());
  const [noteModel, setNoteModel] = useState('glm-5.3-flash-free');
  const [diarize, setDiarize] = useState(false);

  // butiran mesyuarat (pilihan)
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [language, setLanguage] = useState('ms');

  // awan (WebDAV / Google Drive)
  const [cloudCfg, setCloudCfg] = useState(getCloudConfig);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMsg, setCloudMsg] = useState('');
  const [cloudFiles, setCloudFiles] = useState(null);

  // storan
  const [meetings, setMeetings] = useState([]);
  const [meetingsLoading, setMeetingsLoading] = useState(true); // UX-AUDIT #3
  const [savedSig, setSavedSig] = useState(null); // DEF-FUNC-005
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState(getStoredTheme());
  const [kebabOpen, setKebabOpen] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }, []);

  const loadMeetings = useCallback(async () => {
    const ids = (await get(MEETINGS_KEY)) || [];
    const items = await Promise.all(ids.map((id) => get(`${MEETINGS_KEY}:${id}`)));
    const list = items.filter(Boolean);
    list.sort((a, b) => b.createdAt - a.createdAt);
    setMeetings(list);
    setMeetingsLoading(false);
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  // Senarai peranti mic — muat serta dengar perubahan peranti
  useEffect(() => {
    const refresh = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === 'audioinput');
        setMics(mics);
        setMicStatus(mics.length ? 'aktif' : 'tiada');
      } catch {
        setMicStatus('tiada');
      }
    };
    refresh();
    navigator.mediaDevices.addEventListener?.('devicechange', refresh);
    return () => navigator.mediaDevices.removeEventListener?.('devicechange', refresh);
  }, []);

  // Tutup menu kebab bila klik di luar / Escape
  useEffect(() => {
    if (kebabOpen === null) return;
    const onKey = (e) => e.key === 'Escape' && setKebabOpen(null);
    const onClick = () => setKebabOpen(null);
    window.addEventListener('keydown', onKey);
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('click', onClick);
    };
  }, [kebabOpen]);

  // Tutup modal awan dengan Escape
  useEffect(() => {
    if (!cloudModalOpen) return;
    const onKey = (e) => e.key === 'Escape' && setCloudModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cloudModalOpen]);

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
      await recorderRef.current.start(micId || null);
      setIsRecording(true);
      setElapsed(0);
      setAudioBlob(null);
      setTranscript('');
      setMinutes('');
      setStatus('');
      setMicStatus('aktif');
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
      details.tajuk ||
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
      status: 'Selesai',
      durationSec: elapsed,
      language,
    };
    await set(`${MEETINGS_KEY}:${item.id}`, item);
    await set(MEETINGS_KEY, [...((await get(MEETINGS_KEY)) || []), item.id]);
    await loadMeetings();
    // DEF-FUNC-005: ingat apa yang telah disimpan — elak pendua tanpa pengesahan
    setSavedSig(`${transcript}|${minutes}|${mode}`);
    showToast('Mesyuarat disimpan');
  };

  const removeMeeting = async (id) => {
    // DEF-UX-004: pengesahan sebelum pemadaman kekal
    if (!window.confirm('Padam mesyuarat ini secara kekal?')) return;
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
    setLanguage(item.language || 'ms');
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioName('');
    setSavedSig(null); // DEF-FUNC-005: mesyuarat lain — butang Simpan aktif semula
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

  // DEF-PERF-007: eksport dimuat lengai — jsPDF (~233 kB) hanya dimuat bila diperlukan
  const exportMinutesPDF = async () => {
    if (!minutes) return;
    const { exportPDF } = await import('./lib/exporters');
    exportPDF(minutes, `minit-mesyuarat-${Date.now()}`);
    showToast('PDF dimuat turun');
  };

  const exportMinutesWord = async () => {
    if (!minutes) return;
    const { exportWord } = await import('./lib/exporters');
    exportWord(minutes, `minit-mesyuarat-${Date.now()}`);
    showToast('Fail Word dimuat turun');
  };

  const stepReached = { 1: true, 2: !!audioBlob, 3: !!transcript.trim() };

  // DEF-FUNC-005: butang Simpan dilumpuhkan bila kandungan tidak berubah sejak simpanan
  const saveDisabled = minutes && savedSig === `${transcript}|${minutes}|${mode}`;

  // Fasa proses transkripsi
  const transcribePhases = [
    { key: 'download', label: 'Model/Audio' },
    { key: 'transcribe', label: 'Transkripsi' },
    { key: 'done', label: 'Siap' },
  ];
  const transcribeCurrent =
    busy === 'transcribe' ? (modelPercent !== null ? 'download' : 'transcribe') : 'done';

  const generatePhases = [
    { key: 'read', label: 'Baca transkrip' },
    { key: 'generate', label: 'Menjana nota' },
    { key: 'done', label: 'Siap' },
  ];
  const generateCurrent = busy === 'minutes' ? 'generate' : 'done';

  const fetchCloudFiles = useCallback(async (cfg = cloudCfg) => {
    setCloudBusy(true);
    setCloudMsg('');
    try {
      const files = await listCloudFiles(cfg);
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

  // DEF-FUNC-001: fungsi telah tertinggal semasa penstrukturan — dipulihkan.
  // Auto-upload audio ke awan selepas rakam/muat naik jika diaktifkan.
  const maybeAutoUpload = async (blob, name) => {
    if (!cloudCfg.autoUpload || !isCloudConfigured(cloudCfg)) return;
    try {
      await uploadToCloud(blob, name, cloudCfg);
      showToast(`"${name}" dimuat naik ke awan`);
    } catch (err) {
      console.error(err);
      showToast(`Auto-upload awan gagal: ${err.message}`);
    }
  };

  // Badge status mesyuarat
  const statusBadge = (m) =>
    m.status === 'Selesai' ? 'Selesai' : m.minutes ? 'Selesai' : m.transcript ? 'Transkrip' : 'Draf';

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo"><WaveformIcon size={22} /></span>
          <div className="wordmark">
            <span className="wordmark-name">NotaMesyuarat</span>
            <span className="wordmark-sub">Rakaman, transkrip dan minit mesyuarat — semuanya dalam satu ruang kerja.</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-button"
            onClick={() => setCloudModalOpen(true)}
            aria-haspopup="dialog"
            aria-label="Tetapan awan"
            title="Tetapan awan"
          >
            <SettingsIcon size={17} />
          </button>
          <div className="theme-toggle" role="radiogroup" aria-label="Tema">
            {[
              { id: 'system', label: 'Sistem', Icon: MonitorIcon },
              { id: 'light', label: 'Cerah', Icon: SunIcon },
              { id: 'dark', label: 'Gelap', Icon: MoonIcon },
            ].map(({ id: tId, label, Icon: ThemeIcon }) => (
              <button
                key={tId}
                role="radio"
                aria-checked={theme === tId}
                className={`theme-option${theme === tId ? ' theme-active' : ''}`}
                onClick={() => setTheme(tId)}
              >
                <ThemeIcon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav className="stepper-card" aria-label="Langkah kerja">
        {STEPS.map(({ n, label, sub, Icon: StepIcon }, i) => {
          const state = step === n ? 'current' : stepReached[n] ? 'done' : 'locked';
          return (
            <div key={n} className="step-wrap">
              {i > 0 && <span className="step-connector" aria-hidden="true" />}
              <button
                className={`step step-${state}`}
                onClick={() => stepReached[n] && setStep(n)}
                disabled={!stepReached[n]}
                aria-current={step === n ? 'step' : undefined}
              >
                <span className="step-num">{step > n && stepReached[n] ? '✓' : n}</span>
                <StepIcon size={18} className="step-icon" />
                <span className="step-text">
                  <span className="step-label">{label}</span>
                  <span className="step-sub">{sub}</span>
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      <div className="layout">
        <main className="content">
          {step === 1 && (
            <section className="panel">
              {/* Tab tiga mod dengan subtajuk */}
              <div className="mode-tabs" role="tablist" aria-label="Kaedah input" onKeyDown={tablistKeyDown}>
                {[
                  { id: 'rakam', label: 'Rakam', sub: 'Rakam terus dari mikrofon', Icon: MicIcon },
                  { id: 'upload', label: 'Muat naik fail', sub: 'Audio atau video fail', Icon: UploadIcon },
                  { id: 'cloud', label: 'Import awan', sub: 'Google Drive, WebDAV', Icon: CloudDownloadIcon },
                ].map(({ id: mId, label, sub, Icon: TabIcon }) => (
                  <button
                    key={mId}
                    role="tab"
                    aria-selected={inputMode === mId}
                    className={`mode-tab${inputMode === mId ? ' mode-active' : ''}`}
                    onClick={() => {
                      setInputMode(mId);
                      if (mId === 'cloud' && cloudFiles === null && isCloudConfigured(cloudCfg)) fetchCloudFiles();
                    }}
                  >
                    <TabIcon size={20} className="mode-icon" />
                    <span className="mode-text">
                      <span className="mode-label">{label}</span>
                      <span className="mode-sub">{sub}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* Butiran mesyuarat */}
              <div className="details-block">
                <button
                  className="details-toggle"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  aria-expanded={detailsOpen}
                >
                  <NoteIcon size={16} />
                  <span className="mode-text">
                    <span className="mode-label">Butiran mesyuarat</span>
                    <span className="mode-sub">Lengkapkan maklumat asas mesyuarat (pilihan)</span>
                  </span>
                  <ChevronDownIcon size={16} className={`details-chev${detailsOpen ? ' open' : ''}`} />
                </button>
                {detailsOpen && (
                  <div className="details-grid">
                    <div className="details-field">
                      <label htmlFor="d-tajuk">Tajuk mesyuarat</label>
                      <input
                        id="d-tajuk"
                        type="text"
                        placeholder="Contoh: Mesyuarat Pengurusan Mingguan"
                        value={details.tajuk}
                        onChange={(e) => setDetails({ ...details, tajuk: e.target.value })}
                      />
                    </div>
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
                      <label htmlFor="lang-detail">Bahasa</label>
                      <select
                        id="lang-detail"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
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

              {/* Kandungan ikut mod */}
              {inputMode === 'rakam' && (
                <div className="record-stage">
                  <canvas ref={canvasRef} className="waveform" width={420} height={56} />
                  <div className="timer">{formatClock(elapsed)}</div>
                  <button
                    className={isRecording ? 'mic-button recording' : 'mic-button'}
                    onClick={isRecording ? stopRecording : startRecording}
                    aria-label={isRecording ? 'Henti rakaman' : 'Mula rakaman'}
                  >
                    {isRecording ? <span className="mic-stop" /> : <span className="mic-icon" />}
                  </button>
                  <p className="record-question" aria-live="polite">
                    {isRecording ? 'Sedang merakam...' : 'Sedia untuk merakam?'}
                  </p>
                  <p className="record-hint">
                    {isRecording ? 'Tekan butang untuk berhenti.' : 'Pastikan mikrofon anda aktif.'}
                  </p>

                  <div className="mic-bar">
                    <span className={`mic-status${micStatus === 'aktif' ? ' ok' : ''}`}>
                      <span className="mic-status-dot" />
                      {micStatus === 'aktif' ? 'Mikrofon sedia' : micStatus === 'tiada' ? 'Mikrofon tidak dijumpai' : 'Mikrofon belum diaktifkan'}
                    </span>
                    <div className="mic-select-wrap">
                      <MicIcon size={15} />
                      <select
                        value={micId}
                        onChange={(e) => setMicId(e.target.value)}
                        aria-label="Pilih mikrofon"
                        disabled={isRecording || mics.length === 0}
                      >
                        <option value="">Mikrofon lalai</option>
                        {mics.map((m, i) => (
                          <option key={m.deviceId} value={m.deviceId}>
                            {m.label || `Mikrofon ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {inputMode === 'upload' && (
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
                  <p className="hint">mp3, m4a, wav, webm, ogg, mov, mp4. Termasuk rakaman Zoom, Meet, atau video iPhone.</p>
                </div>
              )}

              {inputMode === 'cloud' && (
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
                        <button className="btn secondary" onClick={() => fetchCloudFiles()} disabled={cloudBusy}>
                          <RefreshIcon size={15} /> Segar semula
                        </button>
                        <button className="btn secondary" onClick={openCloudFolder} disabled={cloudBusy}>
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

              {/* DEF-UX-008: maklum balas (cth. fail tidak disokong) mesti dilihat pada langkah 1 */}
              {status && <p className="hint status-animated">{status}</p>}
            </section>
          )}

          {step === 2 && (
            <section className="panel">
              <div className="mode-tabs" role="tablist" aria-label="Enjin transkripsi" onKeyDown={tablistKeyDown}>
                {[
                  { id: 'device', label: 'On-device', sub: 'Berjalan dalam pelayar', Icon: LaptopIcon },
                  { id: 'opencode', label: 'OpenCode', sub: 'Ketepatan tinggi (Gemini)', Icon: CloudIcon },
                ].map(({ id: mId, label, sub, Icon: TabIcon }) => (
                  <button
                    key={mId}
                    role="tab"
                    aria-selected={source === mId}
                    className={`mode-tab${source === mId ? ' mode-active' : ''}`}
                    onClick={() => setSource(mId)}
                  >
                    <TabIcon size={20} className="mode-icon" />
                    <span className="mode-text">
                      <span className="mode-label">{label}</span>
                      <span className="mode-sub">{sub}</span>
                    </span>
                  </button>
                ))}
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
                  </div>
                  <p className="hint">Audio tidak dihantar ke mana-mana. Bahasa dipilih dalam Butiran mesyuarat.</p>
                </div>
              ) : (
                <div className="option-row">
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
              <div className="mode-tabs" role="tablist" aria-label="Jenis nota" onKeyDown={tablistKeyDown}>
                {[
                  { id: 'minit', label: 'Minit mesyuarat', sub: 'Rumasan, keputusan, tindakan', Icon: ClipboardIcon },
                  { id: 'skop', label: 'Skop keperluan', sub: 'Draf keperluan projek', Icon: TargetIcon },
                ].map(({ id: mId, label, sub, Icon: TabIcon }) => (
                  <button
                    key={mId}
                    role="tab"
                    aria-selected={mode === mId}
                    className={`mode-tab${mode === mId ? ' mode-active' : ''}`}
                    onClick={() => setMode(mId)}
                  >
                    <TabIcon size={20} className="mode-icon" />
                    <span className="mode-text">
                      <span className="mode-label">{label}</span>
                      <span className="mode-sub">{sub}</span>
                    </span>
                  </button>
                ))}
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
                    <button className="btn secondary" onClick={saveMeeting} disabled={!!saveDisabled}><SaveIcon size={15} /> Simpan</button>
                    <button className="btn ghost" onClick={exportMinutesPDF}><FileIcon size={15} /> PDF</button>
                    <button className="btn ghost" onClick={exportMinutesWord}><NoteIcon size={15} /> Word</button>
                    <button className="btn ghost" onClick={exportMinutes}><DownloadIcon size={15} /> Markdown</button>
                    <button className="btn ghost" onClick={copyMinutes}><CopyIcon size={15} /> Salin</button>
                  </>
                )}
              </div>

              {busy === 'minutes' && status && <p className="hint status-animated">{status}</p>}
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
            <div className="sidebar-head">
              <h2 className="sidebar-title">
                <ClockIcon size={16} />
                Mesyuarat terkini
              </h2>
            </div>
            {meetingsLoading ? (
              // UX-AUDIT #3: skeleton semasa IndexedDB dimuat — layout stabil, tiada lompat
              <div aria-busy="true" className="meeting-skeleton-group">
                <SkeletonMeetingRow />
                <SkeletonMeetingRow />
                <SkeletonMeetingRow />
              </div>
            ) : (
              meetings.length === 0 && (
                <p className="empty-state">
                  Belum ada mesyuarat disimpan. Jana nota, kemudian tekan Simpan untuk melihatnya di sini.
                </p>
              )
            )}
            {meetings.slice(0, 5).map((m) => {
              const d = new Date(m.createdAt);
              return (
                <div className="meeting-item" key={m.id}>
                  <span className="meeting-date">
                    <span className="meeting-day">{d.getDate()}</span>
                    <span className="meeting-month">
                      {d.toLocaleDateString('ms-MY', { month: 'short' })}
                    </span>
                  </span>
                  <div className="meeting-info">
                    <h3>{m.title || 'Tanpa tajuk'}</h3>
                    <span className="meeting-meta">
                      {d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                      {m.durationSec ? ` • ${Math.round(m.durationSec / 60)} min` : ''}
                      {m.language ? ` • ${LANGUAGES.find((l) => l.id === m.language)?.label || m.language}` : ''}
                    </span>
                  </div>
                  <span className={`badge badge-${(m.status || 'Draf').toLowerCase()}`}>
                    {m.status || 'Draf'}
                  </span>
                  <div className="kebab-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="icon-button small"
                      aria-label="Tindakan mesyuarat"
                      onClick={() => setKebabOpen(kebabOpen === m.id ? null : m.id)}
                    >
                      <KebabIcon size={15} />
                    </button>
                    {kebabOpen === m.id && (
                      <div className="kebab-menu">
                        <button onClick={() => { openMeeting(m.id); setKebabOpen(null); }}>Buka</button>
                        <button className="kebab-danger" onClick={() => { removeMeeting(m.id); setKebabOpen(null); }}>Padam</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <ZikirPanel />
        </aside>
      </div>

      {cloudModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setCloudModalOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cloud-modal-title" onKeyDown={modalTrapFocus}>
            <div className="modal-head">
              <h2 id="cloud-modal-title">
                <CloudIcon size={16} /> Tetapan Awan
              </h2>
              <button className="icon-button small" onClick={() => setCloudModalOpen(false)} aria-label="Tutup">
                <CloseIcon size={15} />
              </button>
            </div>
            <div className="modal-body">
              <div className="segmented" role="tablist" aria-label="Jenis awan" onKeyDown={tablistKeyDown}>
                <button
                  role="tab"
                  aria-selected={cloudCfg.cloudType !== 'gdrive'}
                  className={cloudCfg.cloudType !== 'gdrive' ? 'seg-active' : ''}
                  onClick={() => updateCloudCfg('cloudType', 'webdav')}
                >
                  <CloudIcon size={15} /> WebDAV
                </button>
                <button
                  role="tab"
                  aria-selected={cloudCfg.cloudType === 'gdrive'}
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
                    ID (Web application), dan tambah origin ini ({window.location.origin}) pada
                    Authorized JavaScript origins.
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
                  ? 'Fail disimpan dalam folder "notamesyuarat" di Google Drive anda.'
                  : 'Kredensial disimpan dalam pelayar anda sahaja. Sesuai dengan Nextcloud, ownCloud, atau mana-mana pelayan WebDAV.'}
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
