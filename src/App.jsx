import { useEffect, useRef, useState } from 'react';
import { createQwenClient } from './ai/qwenClient.js';
import { pickDemoResponse } from './data/demoResponses.js';
import StatusCard from './components/StatusCard.jsx';
import PromptCard from './components/PromptCard.jsx';
import ResponseCard from './components/ResponseCard.jsx';
import MetricsCard from './components/MetricsCard.jsx';
import ArchitectureCard from './components/ArchitectureCard.jsx';

const MODEL_LABEL = 'Qwen3 0.6B DQ · q4f16';

function clampProgress(info) {
  if (Number.isFinite(info?.progress)) return Math.max(0, Math.min(100, info.progress));
  if (Number.isFinite(info?.loaded) && Number.isFinite(info?.total) && info.total > 0) {
    return Math.max(0, Math.min(100, (info.loaded / info.total) * 100));
  }
  return null;
}

export default function App() {
  const webgpu = typeof navigator !== 'undefined' && !!navigator.gpu;
  const [mode, setMode] = useState(webgpu ? 'local' : 'demo');
  const [status, setStatus] = useState(webgpu ? 'não carregado' : 'WebGPU ausente');
  const [progress, setProgress] = useState(null);
  const [prompt, setPrompt] = useState('Explique inferência em IA em duas frases.');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadMs, setLoadMs] = useState(null);
  const [inferenceMs, setInferenceMs] = useState(null);
  const [runs, setRuns] = useState(0);
  const [firstInferenceMs, setFirstInferenceMs] = useState(null);
  const [lastInferenceMs, setLastInferenceMs] = useState(null);
  const clientRef = useRef(null);
  const loadStartedRef = useRef(null);

  useEffect(() => {
    if (!webgpu) return undefined;

    clientRef.current = createQwenClient({
      status(message) {
        setStatus(message.message || message.status || 'carregando');
      },
      progress(message) {
        const value = clampProgress(message.info);
        if (value != null) setProgress(value);
        const label = message.info?.file ? `baixando ${message.info.file}` : 'baixando/preparando modelo';
        setStatus(label);
      },
      ready() {
        setReady(true);
        setBusy(false);
        setProgress(100);
        setStatus('modelo pronto ✓');
        if (loadStartedRef.current != null) setLoadMs(Math.round(performance.now() - loadStartedRef.current));
      },
      token(message) {
        setStreaming(true);
        setAnswer((current) => current + message.text);
      },
      complete(message) {
        setStreaming(false);
        setBusy(false);
        setAnswer(message.answer || 'Resposta concluída.');
        setInferenceMs(message.elapsedMs);
        setRuns((current) => current + 1);
        setFirstInferenceMs((current) => current ?? message.elapsedMs);
        setLastInferenceMs(message.elapsedMs);
        setStatus('modelo pronto ✓');
      },
      error(message) {
        setBusy(false);
        setStreaming(false);
        setError(message.message || 'Falha ao executar o modelo.');
        setStatus('erro');
      },
    });

    return () => clientRef.current?.destroy();
  }, [webgpu]);

  function loadModel() {
    setError('');
    if (mode === 'demo') {
      setReady(true);
      setStatus('modo demonstração pronto');
      setProgress(100);
      setLoadMs(0);
      return;
    }
    if (!webgpu) {
      setError('WebGPU não está disponível neste navegador/dispositivo. Use o modo demonstração ou uma máquina compatível.');
      return;
    }
    setBusy(true);
    setStatus('iniciando download…');
    setProgress(0);
    loadStartedRef.current = performance.now();
    clientRef.current?.load();
  }

  async function runDemo() {
    const fake = pickDemoResponse(prompt);
    const started = performance.now();
    setAnswer('');
    setStreaming(true);
    setBusy(true);
    setStatus('simulando streaming…');
    const chunks = fake.match(/.{1,18}(?:\s|$)/g) || [fake];
    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 55));
      setAnswer((current) => current + chunk);
    }
    const elapsed = Math.round(performance.now() - started);
    setInferenceMs(elapsed);
    setFirstInferenceMs((current) => current ?? elapsed);
    setLastInferenceMs(elapsed);
    setRuns((current) => current + 1);
    setStreaming(false);
    setBusy(false);
    setStatus('modo demonstração pronto');
  }

  function generate() {
    setError('');
    setAnswer('');
    if (mode === 'demo') {
      runDemo();
      return;
    }
    if (!ready) {
      setError('Carregue o modelo antes de executar a inferência.');
      return;
    }
    setBusy(true);
    setStreaming(true);
    setStatus('gerando localmente…');
    clientRef.current?.generate(prompt, 96);
  }

  function switchMode(nextMode) {
    if (nextMode === 'local' && !webgpu) return;
    setMode(nextMode);
    setError('');
    setAnswer('');
    setReady(nextMode === 'demo');
    setStatus(nextMode === 'demo' ? 'modo demonstração pronto' : 'não carregado');
    setProgress(nextMode === 'demo' ? 100 : null);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">Frontend para IA · Semana 10 · prática</span>
          <h1>Qwen Local Lab</h1>
          <p>Uma interface React para carregar um modelo pronto do Hugging Face e executar inferência no navegador.</p>
        </div>
        <div className="hero-badges"><span>React</span><span>Transformers.js</span><span>WebGPU</span><span>Qwen3</span></div>
      </header>

      <section className="mode-switch panel compact-panel">
        <div><b>Escolha o modo</b><span>Use Local real sempre que WebGPU estiver disponível.</span></div>
        <div className="segmented">
          <button className={mode === 'local' ? 'active' : ''} onClick={() => switchMode('local')} disabled={!webgpu}>Local real</button>
          <button className={mode === 'demo' ? 'active' : ''} onClick={() => switchMode('demo')}>Demonstração</button>
        </div>
      </section>

      {!webgpu && (
        <div className="warning">⚠ Este navegador não expôs <code>navigator.gpu</code>. O modo local foi bloqueado para evitar uma experiência muito lenta; o modo demonstração permanece disponível.</div>
      )}

      <div className="dashboard-grid">
        <StatusCard webgpu={webgpu} mode={mode} status={status} progress={progress} model={MODEL_LABEL} />
        <PromptCard
          prompt={prompt}
          onPromptChange={setPrompt}
          onLoad={loadModel}
          onGenerate={generate}
          canLoad={mode === 'demo' || (webgpu && !ready)}
          canGenerate={mode === 'demo' || ready}
          busy={busy}
        />
        <ResponseCard answer={answer} streaming={streaming} error={error} mode={mode} />
        <MetricsCard loadMs={loadMs} inferenceMs={inferenceMs} runs={runs} firstInferenceMs={firstInferenceMs} lastInferenceMs={lastInferenceMs} />
      </div>

      <ArchitectureCard mode={mode} />

      <footer>
        <b>Objetivo da prática:</b> observar claramente a diferença entre baixar/carregar um modelo e executar a inferência — e construir uma interface que comunique estado, progresso, resultado e limitações.
      </footer>
    </main>
  );
}
