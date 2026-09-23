export default {
  id: "market-haggle",
  title: "Negociação de preço em um mercado de rua",
  difficulty: "easy-medium",
  context:
    "Você está viajando e quer comprar um artesanato em um mercado de rua. O vendedor começou pedindo um preço bem acima do que você quer pagar.",
  userGoal: "Negotiate a real discount off the vendor's opening price.",
  npc: {
    name: "Tariq",
    role: "Vendedor de artesanato em um mercado de rua",
    personality:
      "Caloroso, bom de conversa e experiente em regatear. Começa com um preço alto e cede pouco a pouco, mas só quando sente que o comprador está negociando de verdade (contraproposta, menção a comprar mais de um item, comparação com outro vendedor, etc.) — não cede a pedidos genéricos como 'mais barato, por favor'.",
    goal: "Manter a margem de lucro o máximo possível, cedendo o mínimo necessário.",
    resistance: "low",
  },
  winCondition:
    "O usuário consegue um desconto real (pelo menos ~20% abaixo do preço inicial oferecido), obtido através de negociação ativa — contraproposta, argumento de valor, ou alavancagem de compra — não apenas pedindo desconto de forma genérica.",
  maxTurns: 6,
  openingLine:
    "Ah, welcome, welcome! You have a good eye — this one, very special, hand-made. For you, only forty dollars!",
};
