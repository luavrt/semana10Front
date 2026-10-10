export default function ResponseCard({ answer, streaming, error, mode }) {
  return (
    <section className="panel response-panel">
      <div className="response-head">
        <div>
          <div className="panel-kicker">Etapa 3 · saída</div>
          <h2>Resposta</h2>
        </div>
        <span className={`mode-badge ${mode}`}>
          {mode === 'local' ? 'inferência local' : 'resposta simulada'}
        </span>
      </div>

      {error ? (
        <div className="error-box">
          <b>Algo deu errado.</b><span>{error}</span>
        </div>
      ) : (
        <div className="answer-box">
          {answer || 'A resposta aparecerá aqui.'}
          {streaming && <span className="cursor">▍</span>}
        </div>
      )}
    </section>
  );
}