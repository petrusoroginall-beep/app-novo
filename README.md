# Missões de Conversação

App de prática de inglês falado baseado em **missões de conversação com consequência**: você entra em um cenário simulado por voz e precisa convencer, negociar ou resolver algo com um personagem de IA que tem um objetivo próprio e resiste ao seu pedido. Só "vence" quem alcança o objetivo através de argumentação em inglês — não apenas falando frases corretas.

## Estrutura do projeto

```
app-novo/
├── server/      # Backend Express — única parte que fala com a API da Anthropic
│   └── src/
│       ├── missions/        # Um arquivo por missão (config de cada NPC)
│       ├── promptBuilder.js # Monta o system prompt a partir da config da missão
│       ├── turnSchema.js    # Formato estruturado da resposta do Claude a cada turno
│       └── index.js         # Rotas da API (/api/missions, /api/missions/:id/turn)
└── client/      # Frontend React (Vite) — captura de voz e fala via Web Speech API
    └── src/
        ├── pages/        # HomeScreen, MissionScreen, ResultScreen
        ├── components/   # MicButton, Transcript, MissionCard, etc.
        └── hooks/        # useSpeechRecognition (voz→texto), useSpeechSynthesis (texto→voz)
```

O frontend **nunca** chama a Anthropic diretamente — ele fala só com o backend, que guarda a chave de API em segredo.

## Configuração

1. Instale as dependências dos dois projetos:
   ```bash
   npm run install:all
   ```
2. Copie `server/.env.example` para `server/.env` e coloque sua chave:
   ```bash
   cp server/.env.example server/.env
   # edite server/.env e defina ANTHROPIC_API_KEY=sk-ant-...
   ```

## Rodando localmente

Na raiz do projeto:

```bash
npm run dev
```

Isso sobe o backend em `http://localhost:3001` e o frontend em `http://localhost:5173` ao mesmo tempo. Abra `http://localhost:5173` no navegador.

## Testando pelo celular

1. Certifique-se de que o celular está na **mesma rede Wi-Fi** do computador rodando `npm run dev`.
2. Descubra o IP local do computador (ex: `192.168.0.15`) — no Linux/Mac: `hostname -I` ou `ifconfig`.
3. No celular, acesse `http://SEU_IP:5173` (ex: `http://192.168.0.15:5173`).
4. Permita o acesso ao microfone quando o navegador pedir.

> **Importante sobre voz no navegador:** a captura de voz usa a Web Speech API nativa do navegador. Funciona bem no **Chrome/Android**. No **Safari/iOS** o suporte é limitado ou ausente — nesse caso o app mostra automaticamente um campo de texto para digitar a resposta em inglês, para que a missão continue funcionando mesmo sem reconhecimento de voz.

## Adicionando uma nova missão

Veja `server/src/missions/gym-cancellation.js` como modelo. Basta criar um novo arquivo nesse diretório e registrá-lo em `server/src/missions/index.js`. Nenhuma outra parte do código precisa mudar.
