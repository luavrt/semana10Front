export default function StatusCard({ webgpu, mode, status, progress, model }) {
  return (
    <section className="panel status-panel">
      <div className="panel-kicker">Etapa 1 · ambiente</div>
      <h2>Status da IA local</h2>

      <div className="status-grid">
        <div><span>WebGPU</span><b>{webgpu ? 'disponível ✓' : 'indisponível'}</b></div>
        <div><span>Modo</span><b>{mode === 'local' ? 'Local real' : 'Demonstração'}</b></div>
        <div><span>Modelo</span><b>{model || 'Qwen3 0.6B DQ'}</b></div>
        <div><span>Estado</span><b>{status}</b></div>
      </div>

      {progress != null && progress < 100 && (
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Download / preparação</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="progress-track">
            <i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
          </div>
        </div>
      )}
    </section>
  );
}