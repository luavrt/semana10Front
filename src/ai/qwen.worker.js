import { pipeline, TextStreamer } from '@huggingface/transformers';

const MODEL_ID = 'onnx-community/Qwen3-0.6B-DQ-ONNX';
let generator = null;
let loadingPromise = null;

function send(type, payload = {}) {
  self.postMessage({ type, ...payload });
}

function cleanProgress(info = {}) {
  return {
    status: info.status ?? 'progress',
    name: info.name ?? '',
    file: info.file ?? '',
    progress: Number.isFinite(info.progress) ? info.progress : null,
    loaded: Number.isFinite(info.loaded) ? info.loaded : null,
    total: Number.isFinite(info.total) ? info.total : null,
  };
}

async function loadModel() {
  if (generator) return generator;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    send('status', { status: 'loading', message: 'Preparando Transformers.js e WebGPU…' });

    const pipe = await pipeline('text-generation', MODEL_ID, {
      device: 'webgpu',
      dtype: 'q4f16',
      progress_callback: (info) => send('progress', { info: cleanProgress(info) }),
    });

    generator = pipe;
    send('ready', { model: MODEL_ID, device: 'webgpu', dtype: 'q4f16' });
    return generator;
  })();

  try {
    return await loadingPromise;
  } finally {
    loadingPromise = null;
  }
}

async function generate(prompt, maxNewTokens = 96) {
  const pipe = await loadModel();
  const startedAt = performance.now();
  let streamed = '';

  const messages = [
    {
      role: 'system',
      content: 'Você é um assistente didático. Responda em português do Brasil, de forma curta, clara e objetiva. /no_think',
    },
    {
      role: 'user',
      content: `${prompt.trim()}\n/no_think`,
    },
  ];

  const streamer = new TextStreamer(pipe.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      streamed += text;
      send('token', { text });
    },
  });

  const output = await pipe(messages, {
    max_new_tokens: maxNewTokens,
    do_sample: true,
    temperature: 0.7,
    top_p: 0.8,
    top_k: 20,
    streamer,
  });

  const finalFromChat = output?.[0]?.generated_text?.at?.(-1)?.content;
  const answer = typeof finalFromChat === 'string' && finalFromChat.trim()
    ? finalFromChat.trim()
    : streamed.trim();

  send('complete', {
    answer,
    elapsedMs: Math.round(performance.now() - startedAt),
  });
}

self.onmessage = async (event) => {
  const { type, prompt, maxNewTokens } = event.data ?? {};
  try {
    if (type === 'load') {
      await loadModel();
      return;
    }
    if (type === 'generate') {
      if (!prompt?.trim()) throw new Error('Digite uma pergunta antes de gerar.');
      await generate(prompt, maxNewTokens);
    }
  } catch (error) {
    send('error', {
      message: error?.message || String(error),
      stack: error?.stack || '',
    });
  }
};
