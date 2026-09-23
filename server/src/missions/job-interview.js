export default {
  id: "job-interview",
  title: "Entrevista de emprego — pergunta difícil",
  difficulty: "medium",
  context:
    "Você está em uma entrevista de emprego. O entrevistador acabou de perguntar por que você saiu do seu emprego anterior, e está desconfiado de respostas vagas ou evasivas.",
  userGoal:
    "Give a convincing, professional answer about why you left your last job, without sounding negative about your former employer, and get the interviewer to move on satisfied.",
  npc: {
    name: "Mr. Whitfield",
    role: "Entrevistador de RH cético",
    personality:
      "Calmo, observador e nada convencido por respostas genéricas. Pressiona com perguntas de acompanhamento sempre que sente que o candidato está sendo vago, evasivo ou reclamando do empregador anterior.",
    goal:
      "Identificar sinais de alerta (red flags) na resposta do candidato e decidir se ele avança no processo seletivo.",
    resistance: "medium",
  },
  winCondition:
    "O usuário dá uma resposta específica, profissional e orientada a fatos/crescimento (sem reclamar do ex-empregador) que satisfaz o entrevistador o suficiente para ele dizer explicitamente que vai avançar o candidato para a próxima etapa.",
  maxTurns: 7,
  openingLine: "So, tell me — why did you decide to leave your last position?",
};
