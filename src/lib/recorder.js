/**
 * Recorder — bungkus MediaRecorder + AnalyserNode
 * untuk rakaman audio dan visualisasi gelombang.
 */
export class Recorder {
  constructor() {
    this.stream = null;
    this.recorder = null;
    this.audioCtx = null;
    this.analyser = null;
    this.chunks = [];
    this.onLevel = null; // callback(amplitude 0..1)
    this._raf = null;
  }

  async start(deviceId = null) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
      },
    });

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    source.connect(this.analyser);

    const mime = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : '';
    this.recorder = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined);
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(1000); // gather setiap saat
    this._poll();
  }

  _poll() {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      this.analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        const v = Math.abs(data[i] - 128) / 128;
        if (v > peak) peak = v;
      }
      this.onLevel?.(peak);
      this._raf = requestAnimationFrame(tick);
    };
    tick();
  }

  async stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.onLevel?.(0);

    const blob = await new Promise((resolve) => {
      this.recorder.onstop = () => resolve(new Blob(this.chunks, { type: this.recorder.mimeType || 'audio/webm' }));
      this.recorder.stop();
    });

    this.stream.getTracks().forEach((t) => t.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') await this.audioCtx.close();
    return blob;
  }
}

export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Jam rakaman format hh:mm:ss seperti penunjuk premium */
export function formatClock(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
