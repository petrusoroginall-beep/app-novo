/**
 * Cada arquivo neste diretório é uma missão. Para criar uma nova missão,
 * copie este arquivo, ajuste os campos abaixo e registre-o em index.js.
 * Nenhuma outra parte do código precisa mudar.
 */
export default {
  id: "gym-cancellation",
  title: "Cancelamento de assinatura de academia",
  difficulty: "easy",
  context:
    "Você quer cancelar sua assinatura da academia FitLife sem pagar a taxa de cancelamento de $50. Você ligou para o atendimento ao cliente.",
  userGoal:
    "Cancel the gym membership without paying any cancellation fee.",
  npc: {
    name: "Jordan",
    role: "Atendente de retenção de clientes da academia FitLife, por telefone",
    personality:
      "Simpático, tagarela e bem treinado em retenção. Nunca aceita um 'não' na primeira tentativa: oferece pausar a assinatura, descontos de 50%, um mês grátis, antes de sequer considerar o cancelamento. Fica visivelmente relutante quando o assunto é dispensar a taxa de cancelamento.",
    goal:
      "Reter o cliente na assinatura a qualquer custo. Se não conseguir, ao menos cobrar a taxa de cancelamento de $50 prevista em contrato.",
    resistance: "low",
  },
  winCondition:
    "O usuário consegue uma confirmação clara de cancelamento SEM taxa extra, apoiado em um argumento válido (ex: cláusula contratual, não uso do serviço, problema no atendimento, ainda dentro do período de arrependimento) — e não apenas repetindo o pedido ou sendo grosseiro.",
  maxTurns: 6,
  openingLine:
    "Hi there, thanks for calling FitLife Member Services, this is Jordan — how can I make your day better?",
};
