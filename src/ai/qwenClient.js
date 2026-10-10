export function createQwenClient(handlers = {}) {
  const worker = new Worker(new URL('./qwen.worker.js', import.meta.url), { type: 'module' });

  worker.onmessage = (event) => {
    const message = event.data ?? {};
    const handler = handlers[message.type];
    if (typeof handler === 'function') handler(message);
  };

  worker.onerror = (event) => {
    handlers.error?.({
      type: 'error',
      message: event.message || 'Falha no Web Worker da IA.',
    });
  };

  return {
    load() {
      worker.postMessage({ type: 'load' });
    },
    generate(prompt, maxNewTokens = 96) {
      worker.postMessage({ type: 'generate', prompt, maxNewTokens });
    },
    destroy() {
      worker.terminate();
    },
  };
}
