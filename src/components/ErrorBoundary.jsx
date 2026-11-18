/**
 * Sempadan ralat dan dialog ralat global.
 *
 * Tanpa sempadan ralat, satu ralat semasa render/commit menyebabkan React
 * menyahlekat seluruh pokok komponen — pengguna melihat halaman kosong tanpa
 * sebarang makluman. Komponen ini memaparkan dialog pemulihan dengan butiran
 * ralat dan tindakan yang jelas.
 *
 * Ralat `insertBefore` yang dilaporkan pengguna berpunca daripada Chrome
 * auto-translate yang menulis semula nod teks milik React. Pencegahan utama
 * ada pada `translate="no"` dalam index.html; dialog ini ialah jaring
 * keselamatan untuk ralat lain yang tidak dijangka.
 */
import { Component, useEffect, useRef, useState } from 'react';

/** Penanda supaya pendengar global tidak memaparkan dialog kedua. */
export const crashState = { crashed: false };

const formatDetails = (error, extra) =>
  [
    'NotaMesyuarat — butiran ralat',
    `Masa: ${new Date().toLocaleString('ms-MY')}`,
    `Ralat: ${error?.name || 'Ralat'}: ${error?.message || 'tiada mesej'}`,
    error?.stack ? `\nStack:\n${error.stack}` : '',
    extra ? `\nKomponen:\n${extra}` : '',
  ]
    .filter(Boolean)
    .join('\n');

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function DialogShell({ title, children, footer, labelledBy }) {
  return (
    <div className="modal-overlay">
      <div className="modal error-dialog" role="alertdialog" aria-modal="true" aria-labelledby={labelledBy}>
        <div className="modal-head">
          <h2 id={labelledBy}>{title}</h2>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

function ErrorDetails({ error, componentStack }) {
  return (
    <details className="error-details">
      <summary>Butiran teknikal</summary>
      <pre>{formatDetails(error, componentStack)}</pre>
    </details>
  );
}

/**
 * Dialog pemulihan apabila React tidak dapat meneruskan render.
 * Pengguna boleh menyalin butiran ralat atau memuat semula halaman.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null, copied: false };
  }

  static getDerivedStateFromError(error) {
    crashState.crashed = true;
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('Ralat aplikasi:', error, info?.componentStack);
  }

  handleCopy = async () => {
    const ok = await copyText(formatDetails(this.state.error, this.state.info?.componentStack));
    this.setState({ copied: ok });
  };

  render() {
    const { error, info, copied } = this.state;
    if (!error) return this.props.children;
    return (
      <DialogShell
        title="Aplikasi terhenti"
        labelledBy="crash-title"
        footer={
          <div className="modal-foot">
            <button type="button" className="btn ghost" onClick={this.handleCopy}>
              {copied ? 'Butiran disalin' : 'Salin butiran ralat'}
            </button>
            <button
              type="button"
              className="btn primary"
              autoFocus
              onClick={() => window.location.reload()}
            >
              Muat semula halaman
            </button>
          </div>
        }
      >
        <div className="modal-body">
          <p>
            Aplikasi tidak dapat meneruskan paparan kerana ralat teknikal. Mesyuarat yang sudah
            disimpan kekal dalam pelayar ini, tetapi rakaman yang belum disimpan perlu dimuat
            semula selepas halaman dimuat semula.
          </p>
          <p className="error-message">
            {error.name}: {error.message}
          </p>
          <ErrorDetails error={error} componentStack={info?.componentStack} />
        </div>
      </DialogShell>
    );
  }
}

/**
 * Menangkap ralat di luar render React (contoh: promise yang gagal tanpa
 * catch) dan memaparkannya sebagai dialog yang boleh ditutup.
 */
export function GlobalErrorListener() {
  const [fault, setFault] = useState(null);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!fault) return;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') setFault(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fault]);

  useEffect(() => {
    const onError = (event) => {
      if (crashState.crashed) return;
      // Ralat sumber (imej/model gagal dimuat) tiada objek ralat — bukan crash app.
      const err = event.error instanceof Error ? event.error : null;
      if (!err) return;
      setCopied(false);
      setFault(err);
    };
    const onRejection = (event) => {
      if (crashState.crashed) return;
      const reason = event.reason;
      setCopied(false);
      setFault(reason instanceof Error ? reason : new Error(String(reason)));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!fault) return null;

  return (
    <DialogShell
      title="Ralat tidak dijangka"
      labelledBy="global-error-title"
      footer={
        <div className="modal-foot">
          <button
            type="button"
            className="btn ghost"
            onClick={async () => setCopied(await copyText(formatDetails(fault)))}
          >
            {copied ? 'Butiran disalin' : 'Salin butiran'}
          </button>
          <button ref={closeRef} type="button" className="btn ghost" onClick={() => setFault(null)}>
            Tutup
          </button>
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            Muat semula halaman
          </button>
        </div>
      }
    >
      <div className="modal-body">
        <p>
          Tindakan terakhir tidak selesai kerana ralat teknikal. Anda boleh menutup mesej ini dan
          meneruskan, atau memuat semula halaman jika masalah berterusan.
        </p>
        <p className="error-message">
          {fault.name}: {fault.message}
        </p>
        <ErrorDetails error={fault} />
      </div>
    </DialogShell>
  );
}
