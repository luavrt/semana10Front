# Semana 10 — Qwen Local Lab

Prática de Frontend para IA: carregar um modelo pronto do Hugging Face e executar inferência local no navegador com Transformers.js + WebGPU.

## Modelo

- `onnx-community/Qwen3-0.6B-DQ-ONNX`
- dtype: `q4f16`
- execução principal: `webgpu`
- tarefa: `text-generation`

> O modelo precisa ser baixado no primeiro carregamento. A variante DQ reduz o pacote para cerca de 370 MB no repositório, mas a rede e o hardware ainda influenciam muito a experiência.

## Requisitos

- Node.js 20.19+ ou 22.12+
- Chrome/Edge recente com WebGPU disponível
- internet para `npm install` e para baixar o modelo no primeiro uso
- memória livre suficiente no computador

## Rodar

```bash
npm install
npm run dev
```

Abra a URL mostrada pelo Vite (normalmente `http://localhost:5173`).

## Validar build

Abra um segundo terminal na mesma pasta:

```bash
npm run build
```

## Estrutura

```text
src/
├─ ai/
│  ├─ qwen.worker.js   # carregamento e inferência do modelo
│  └─ qwenClient.js    # ponte entre React e Web Worker
├─ components/
│  ├─ StatusCard.jsx
│  ├─ PromptCard.jsx
│  ├─ ResponseCard.jsx
│  ├─ MetricsCard.jsx
│  └─ ArchitectureCard.jsx
├─ data/
│  └─ demoResponses.js # fallback didático explícito
├─ App.jsx
├─ App.css
└─ main.jsx
```

## Sobre o fallback

O modo demonstração **não executa o Qwen**. Ele existe para que o aluno possa continuar a prática de frontend se WebGPU estiver indisponível ou se o download do modelo falhar. A interface deixa isso explícito.

## Segurança e privacidade

Não há chave de API. No modo local real, a geração ocorre no navegador após o modelo ser disponibilizado. Isso não significa que todo aplicativo local seja automaticamente privado: outras partes da aplicação poderiam enviar dados para serviços externos. Neste projeto, não há backend nem endpoint de geração.
