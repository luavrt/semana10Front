export default function PromptCard({
  prompt, onPromptChange, onLoad, onGenerate,
  canLoad, canGenerate, busy
}) {
  return (
    <section className="panel prompt-panel">
      <div className="panel-kicker">Etapa 2 · entrada</div>
      <h2>Faça uma pergunta ao modelo</h2>

      <textarea
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Ex.: Explique inferência em IA em duas frases."
        maxLength={320}
      />

      <div className="prompt-meta">
        <span>{prompt.length}/320 caracteres</span>
        <span>Resposta curta · até 96 novos tokens</span>
      </div>

      <div className="actions">
        <button className="button secondary" onClick={onLoad} disabled={!canLoad || busy}>
          Carregar modelo
        </button>
        <button className="button primary" onClick={onGenerate}
          disabled={!canGenerate || busy || !prompt.trim()}>
          {busy ? 'Processando…' : 'Executar inferência'}
        </button>
      </div>
    </section>
  );
}