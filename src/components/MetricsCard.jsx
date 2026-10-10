function formatMs(value) {
  if (!Number.isFinite(value)) return '—';
  return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`;
}

export default function MetricsCard({ loadMs, inferenceMs, runs, firstInferenceMs, lastInferenceMs }) {
  const delta = Number.isFinite(firstInferenceMs) && Number.isFinite(lastInferenceMs) && runs > 1
    ? firstInferenceMs - lastInferenceMs
    : null;

  return (
    <section className="panel metrics-panel">
      <div className="panel-kicker">Etapa 4 · observação</div>
      <h2>Métricas da experiência</h2>
      <div className="metrics-grid">
        <div><span>Carregamento</span><b>{formatMs(loadMs)}</b></div>
        <div><span>Última inferência</span><b>{formatMs(inferenceMs)}</b></div>
        <div><span>Execuções</span><b>{runs}</b></div>
        <div><span>Diferença 1ª → última</span><b>{delta == null ? '—' : formatMs(delta)}</b></div>
      </div>
      <p className="hint">Meça separadamente: download/carregamento não é o mesmo que tempo de inferência.</p>
    </section>
  );
}
