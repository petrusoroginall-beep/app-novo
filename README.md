# Missões de Conversação

App de prática de inglês falado baseado em **missões de conversação com consequência**: você entra em um cenário simulado por voz e precisa convencer, negociar ou resolver algo com um personagem de IA que tem um objetivo próprio e resiste ao seu pedido. Só "vence" quem alcança o objetivo através de argumentação em inglês — não apenas falando frases corretas.

## Estrutura do projeto

```
app-novo/
├── client/                    # Frontend React (Vite) + backend serverless (Vercel)
│   ├── api/                   # Funções serverless — usadas no deploy pela Vercel
│   │   ├── _lib/               # Lógica de negócio (fonte única de verdade)
│   │   │   ├── missions/        # Um arquivo por missão (config de cada NPC)
│   │   │   ├── promptBuilder.js # Monta o system prompt a partir da config da missão
│   │   │   ├── turnSchema.js    # Formato estruturado da resposta do Claude a cada turno
│   │   │   └── missionService.js
│   │   ├── missions.js               # GET /api/missions
│   │   └── missions/[id]/turn.js     # POST /api/missions/:id/turn (+ [id].js para detalhe)
│   └── src/                   # App React — captura/fala de voz via Web Speech API
│       ├── pages/        # HomeScreen, MissionScreen, ResultScreen
│       ├── components/   # MicButton, Transcript, MissionCard, etc.
│       └── hooks/        # useSpeechRecognition (voz→texto), useSpeechSynthesis (texto→voz)
└── server/                    # Backend Express — só para rodar num computador local
    └── src/index.js           # Casca fina: importa a lógica de client/api/_lib
```

Existem **dois jeitos de rodar o backend**, mas só **uma** lógica de negócio (`client/api/_lib`):

- **Local, num computador:** `server/` roda um servidor Express de verdade.
- **Publicado na internet:** `client/api/` vira funções serverless quando você faz deploy do projeto na [Vercel](https://vercel.com).

O frontend **nunca** chama a Anthropic diretamente — ele fala só com o backend (local ou na Vercel), que guarda a chave de API em segredo.

## Opção A — Rodando localmente num computador

1. Instale as dependências dos dois projetos:
   ```bash
   npm run install:all
   ```
2. Copie `server/.env.example` para `server/.env` e coloque sua chave:
   ```bash
   cp server/.env.example server/.env
   # edite server/.env e defina ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Na raiz do projeto:
   ```bash
   npm run dev
   ```
   Isso sobe o backend em `http://localhost:3001` e o frontend em `http://localhost:5173` ao mesmo tempo. Abra `http://localhost:5173` no navegador.

**Para testar pelo celular nesse caso:** o celular precisa estar na mesma rede Wi-Fi do computador; descubra o IP local do computador (`hostname -I` no Linux/Mac) e acesse `http://SEU_IP:5173` no navegador do celular.

## Opção B — Publicando na Vercel (funciona 100% pelo celular, sem instalar nada)

1. Garanta que o código está no GitHub (branch `claude/elegant-johnson-abdyfq`).
2. Acesse [vercel.com](https://vercel.com) e entre com sua conta do GitHub.
3. **Add New → Project** e importe o repositório `app-novo`.
4. Na tela de configuração do projeto:
   - Em **Root Directory**, clique em "Edit" e selecione a pasta **`client`** (é essencial — sem isso o deploy não encontra o app).
   - O **Framework Preset** deve detectar "Vite" automaticamente.
   - Em **Environment Variables**, adicione: `ANTHROPIC_API_KEY` = sua chave (`sk-ant-...`).
5. Clique em **Deploy** e aguarde ~1-2 minutos.
6. **Importante:** depois do primeiro deploy, vá em **Project Settings → Git** e defina **Production Branch** como `claude/elegant-johnson-abdyfq` (o branch `main` do repositório ainda está vazio). Isso dispara um novo deploy automaticamente a partir do branch certo.
7. Ao final, a Vercel te dá um link tipo `https://app-novo-xxxx.vercel.app` — abra esse link no navegador do celular. Pronto, é só usar.

Qualquer novo `git push` nesse branch faz a Vercel atualizar o app automaticamente.

> **Importante sobre voz no navegador:** a captura de voz usa a Web Speech API nativa do navegador. Funciona bem no **Chrome/Android**. No **Safari/iOS** o suporte é limitado ou ausente — nesse caso o app mostra automaticamente um campo de texto para digitar a resposta em inglês, para que a missão continue funcionando mesmo sem reconhecimento de voz.

## Adicionando uma nova missão

Veja `client/api/_lib/missions/gym-cancellation.js` como modelo. Basta criar um novo arquivo nesse diretório e registrá-lo em `client/api/_lib/missions/index.js`. Nenhuma outra parte do código precisa mudar — vale tanto para rodar local quanto para o deploy na Vercel.
