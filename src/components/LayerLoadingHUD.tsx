import { useEffect, useMemo, useState } from "react";

export function LayerLoadingHUD({ active, label }: { active: boolean; label: string }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    let interval = 0;
    let finishTimer = 0;
    if (active) {
      setVisible(true);
      setProgress(1);
      interval = window.setInterval(() => {
        setProgress((value) => Math.min(94, value + Math.max(1, Math.ceil((96 - value) / 13))));
      }, 145);
    } else if (visible) {
      setProgress(100);
      finishTimer = window.setTimeout(() => setVisible(false), 620);
    }
    return () => { window.clearInterval(interval); window.clearTimeout(finishTimer); };
  }, [active, visible]);

  const dots = useMemo(() => Array.from({ length: 100 }, (_, index) => index < progress), [progress]);
  if (!visible) return null;

  return <div className={`api-loader-hud ${progress === 100 ? "is-complete" : ""}`} role="status" aria-label={`${label} ${progress}%`}>
    <div className="api-loader-corners" aria-hidden="true"><i/><i/><i/><i/></div>
    <header><span><i/> DATA LINK</span><b>{String(progress).padStart(3, "0")}%</b></header>
    <div className="api-dot-matrix" aria-hidden="true">
      {dots.map((lit, index) => <i key={index} className={lit ? "lit" : ""}/>) }
    </div>
    <div className="api-loader-track" aria-hidden="true"><span style={{ width: `${progress}%` }}/><i style={{ left: `${progress}%` }}/></div>
    <footer><span>{progress === 100 ? "STREAM SYNCHRONISED" : label}</span><b>{progress < 35 ? "HANDSHAKE" : progress < 78 ? "INGEST" : progress < 100 ? "VERIFY" : "READY"}</b></footer>
  </div>;
}
