/**
 * Komponen maklum balas proses: spinner, penunjuk fasa, dan bar kemajuan.
 * Animasi hanya berlaku semasa proses sebenar (R-19) — tiada loop tanpa tujuan.
 */

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

/** Butang dengan spinner terbina — ganti teks semasa sibuk */
export function BusyButton({ busy, busyLabel, icon: IconComp, children, ...props }) {
  return (
    <button {...props} className={`btn ${props.className || 'primary'}`}>
      {busy ? (
        <>
          <Spinner size={14} />
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
