export default function ArchitectureCard({ mode }) {
  return (
    <section className="panel architecture-panel">
      <div className="panel-kicker">Mapa mental</div>
      <h2>Onde a IA está rodando?</h2>
      <div className="arch-flow">
        <div><b>1</b><span>Hugging Face</span><small>fornece arquivos do modelo</small></div>
        <i>→</i>
        <div><b>2</b><span>Browser</span><small>carrega o modelo</small></div>
        <i>→</i>
        <div className={mode === 'local' ? 'active' : ''}><b>3</b><span>WebGPU</span><small>executa inferência local</small></div>
        <i>→</i>
        <div><b>4</b><span>React</span><small>apresenta a resposta</small></div>
      </div>
      <p className="hint">Depois do download, a inferência local não precisa enviar o prompt para uma API de geração. O modo demonstração, porém, não executa o modelo.</p>
    </section>
  );
}
