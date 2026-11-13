/**
 * Komponen maklum balas proses: spinner, penunjuk fasa, dan bar kemajuan.
 * Animasi hanya berlaku semasa proses sebenar (R-19) — tiada loop tanpa tujuan.
 */
import { useEffect, useState } from 'react';

export function Spinner({ size = 16 }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />;
}

/**
 * Penunjuk fasa proses: senarai fasa dengan yang aktif diserlahkan.
 * phases: [{ key, label }], currentKey: fasa semasa, doneKeys: fasa selesai
 */
export function ProcessTracker({ phases, currentKey, doneKeys = [] }) {
  return (
    <div className="process-tracker" role="status">
      {phases.map((p, i) => {
        const isDone = doneKeys.includes(p.key);
        const isCurrent = currentKey === p.key;
        return (
          <div key={p.key} className={`ptracker-item${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}`}>
            <span className="ptracker-dot">
              {isDone ? '✓' : isCurrent ? <Spinner size={10} /> : i + 1}
            </span>
            <span className="ptracker-label">{p.label}</span>
            {i < phases.length - 1 && <span className="ptracker-line" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}

/** Butang dengan spinner terbina — ganti teks semasa sibuk.
 * UX-AUDIT #6: spinner hanya muncul jika operasi > 300ms — elak kelip
 * untuk operasi hampir-segera (garis panduan "Loading Indicators"). */
export function BusyButton({ busy, busyLabel, icon: IconComp, children, ...props }) {
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (!busy) {
      setShowSpinner(false);
      return;
    }
    const t = setTimeout(() => setShowSpinner(true), 300);
    return () => clearTimeout(t);
  }, [busy]);
  return (
    <button {...props} className={`btn ${props.className || 'primary'}`} aria-busy={busy || undefined}>
      {busy ? (
        <>
          {showSpinner && <Spinner size={14} />}
          {busyLabel || 'Memproses...'}
        </>
      ) : (
        <>
          {IconComp && <IconComp size={15} />}
          {children}
        </>
      )}
    </button>
  );
}

/**
 * Skeleton loading (UX-AUDIT #3): pembetulan layout stabil semasa data dimuat.
 * `lines`: bilangan baris skeleton untuk senarai/teks. `aria-hidden` — maklumat
 * sebenar disampaikan melalui aria-busy pada bekas induk, bukan skeleton itu sendiri.
 */
export function Skeleton({ lines = 1, className = '' }) {
  return (
    <span className={`skeleton ${className}`} aria-hidden="true" data-lines={lines}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="skeleton-line" style={{ width: `${88 - i * 18}%` }} />
      ))}
    </span>
  );
}

/** Baris skeleton ala-senarai mesyuarat: bulatan tarikh + dua baris teks */
export function SkeletonMeetingRow() {
  return (
    <div className="meeting-item skeleton-meeting" aria-hidden="true">
      <span className="skeleton skeleton-block" style={{ width: 46, height: 46 }} />
      <span className="meeting-info">
        <Skeleton lines={1} className="skeleton-inline" />
        <Skeleton lines={1} className="skeleton-inline" />
      </span>
    </div>
  );
}
