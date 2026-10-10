export const DEMO_RESPONSES = {
  default: 'Modo demonstração ativo. Esta resposta foi simulada para que você continue construindo e testando a interface mesmo sem WebGPU. Em uma máquina compatível, use o modo local para executar o Qwen no navegador.',
  ia: 'Inteligência artificial é o uso de modelos computacionais para reconhecer padrões e produzir previsões ou respostas a partir de dados.',
  inferencia: 'Inferência é a etapa em que um modelo já treinado recebe uma nova entrada e produz uma saída, sem reaprender os pesos a cada consulta.',
};

export function pickDemoResponse(prompt) {
  const text = prompt.toLowerCase();
  if (text.includes('infer')) return DEMO_RESPONSES.inferencia;
  if (text.includes('intelig') || text.includes(' ia ')) return DEMO_RESPONSES.ia;
  return DEMO_RESPONSES.default;
}
