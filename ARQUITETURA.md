# G FIT TIME — Arquitetura

Sistema de timers para academias (CrossFit, Hyrox, funcional), dividido em dois
ambientes com necessidades opostas: um **painel administrativo** denso, operado
de perto, e uma **tela de TV** lida a metros de distância.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Backend | Supabase (Postgres, Auth, Realtime) |
| Ícones | lucide-react |
| Linguagem | TypeScript estrito |

## Decisões estruturais

**Route Groups separam os ambientes.** `(painel)`, `(tv)` e `(controle)` têm
layouts independentes sem afetar a URL. É o que permite a TV e o controle
remoto não carregarem sidebar, topbar nem barra de navegação — cada um é uma
aplicação visualmente distinta compartilhando o mesmo código. O controle fica
fora do shell de propósito: durante a aula, no celular, qualquer cromo de
navegação vira alvo de toque errado.

**Sessão sincronizada: UMA engine, uma fonte de verdade (`src/lib/sessao/`).**
Notebook, TV e controle consomem o mesmo estado. Ninguém conta tempo por conta
própria.

- `engine/engine.ts` — a **única** engine. Pura (sem React, sem I/O): recebe
  `(estado, ação, agora)` e devolve o novo estado; `derivarVisao` calcula a
  exibição. Ações: START, PAUSE, RESUME, NEXT, PREVIOUS, FINISH, ADD_TIME,
  REMOVE_TIME.
- `realtime/transporte-supabase.ts` — transporte oficial: **Supabase Realtime**,
  canal `gfit-session` (Broadcast, `self:false`) + persistência da linha única
  `sessoes` para durabilidade e hidratação de quem entra no meio.
- `realtime/mapear-sessao.ts` — EstadoSessao ↔ linha `sessoes` (UMA sessão ativa,
  id fixo).
- `providers/sessao-provider.tsx` — liga engine ↔ transporte. Papéis:
  `controlador` (painel/controle) pode despachar e hospeda o laço de
  auto-avanço; `observador` (TV) só escuta, nunca altera, nunca avança sozinho.
- `hooks/use-sessao.ts` e `hooks/use-visao-sessao.ts` — leitura e tique local
  de exibição (único rAF por tela, só deriva, nunca muta).
- `services/mapear-tv.ts` — converte a visão no `EstadoTv` que a `DisplayTv` já
  consome, sem tocar no visual da TV.

**Só eventos trafegam, nunca o tempo por segundo.** Ao iniciar uma fase publica-se
o instante de fim (`Date.now()`-based) + fase + round; cada cliente calcula o
restante localmente. Um treino inteiro pode gerar poucas dezenas de mensagens.
Usa `Date.now()` (relógio de parede) e não `performance.now()`, porque a âncora
precisa valer entre dispositivos diferentes.

`expandir.ts` continua transformando etapas em fases concretas (o "Repetir" vira
rounds reais) — é a entrada da engine.

> **Auto-avanço e o `estadoRef`:** o laço de auto-avanço lê `estadoRef` (não o
> state) para decidir o `NEXT`. Por isso o `estadoRef` é sincronizado
> **sincronamente** tanto no `despachar` local quanto ao receber um estado por
> broadcast (`aplicar`). Sem isso, um ref atrasado faria o laço disparar `NEXT`
> sobre estado velho e cascatear pelas fases. O laço também só avança com a aba
> `visible`. Validado em build de produção: avança uma fase por vez, em sincronia
> com o banco (a cascata só aparecia no dev, por loops de `rAF` órfãos do HMR).

**Design tokens em um lugar só.** Toda a identidade visual vive no bloco
`@theme` de `src/app/globals.css`. Trocar o amarelo da marca é editar
`--color-marca`. Nenhum componente tem cor hardcoded — usam `bg-marca`,
`text-texto-suave`, `border-borda`, etc.

**Navegação declarativa.** `src/config/navegacao.ts` é a fonte única: sidebar
desktop e barra inferior mobile derivam da mesma lista. Adicionar uma seção é
acrescentar um objeto ao array. Cada item carrega `titulo` e `tituloCurto` —
"Controle pelo Celular" não cabe na barra inferior do celular, então vira
"Controle" ali.

**Novo/Editar Treino compartilham o mesmo layout.** `EditorTreino` é usado
pelas duas rotas; só o cabeçalho e as ações diferem. Evita duas telas que
divergem com o tempo.

**Catálogo de modos, não `switch`.** `src/lib/timer/modos.ts` descreve cada modo
(Relógio, Tabata, For Time, EMOM, AMRAP) como dado — quais campos o formulário
mostra, se conta para cima. A engine e a UI consomem essa lista, então um modo
novo não espalha condicionais pelo código.

**Sem autenticação.** Não há login, senha, usuários nem papéis. É uma
instalação única por academia: quem alcança a URL usa o sistema. Isso removeu
o grupo `(auth)`, o `proxy.ts` e a renovação de sessão do Supabase.

> ⚠️ Consequência: qualquer pessoa com o endereço pode criar, editar e apagar
> treinos. Aceitável numa rede local da academia; se o painel for exposto na
> internet, vale no mínimo uma proteção de rede (VPN, IP restrito) ou uma
> senha única de acesso.

**Supabase em dois clientes.** `client.ts` (navegador) e `server.ts` (Server
Components e Actions) — usados só para dados, não para autenticação.

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx              raiz: fontes, metadata, <html lang="pt-BR">
│   ├── globals.css             ⭐ tokens de design (marca, superfícies, fases)
│   ├── page.tsx                redireciona para /painel
│   │
│   ├── (painel)/               ⭐ ambiente administrativo
│   │   ├── layout.tsx          shell: sidebar + topbar + nav mobile
│   │   └── painel/
│   │       ├── page.tsx            Home
│   │       ├── treinos/            Biblioteca de Treinos
│   │       │   ├── novo/               Novo Treino
│   │       │   └── [id]/               Editar Treino
│   │       ├── templates/          Templates
│   │       ├── historico/          Histórico
│   │       ├── controle/           Controle pelo Celular
│   │       └── configuracoes/      Configurações
│   │
│   └── (tv)/                   ⭐ ambiente de exibição
│       ├── layout.tsx          tela cheia, sem chrome, sem scroll
│       └── tv/
│           ├── page.tsx            Tela da TV (pareamento)
│           └── [codigo]/           Tela da TV (exibição)
│
├── components/
│   ├── ui/                     primitivos: Button, Card, Input, Select,
│   │                           Badge, Table, Skeleton, Toolbar,
│   │                           PageHeader, EmptyState
│   ├── layout/                 Logo, Sidebar, Topbar, MobileNav
│   ├── painel/                 CardTreino, EditorTreino, ConstrutorBlocos,
│   │                           PreviewTv, ControleRemoto
│   └── tv/                     DisplayTv
│
├── config/
│   ├── navegacao.ts            fonte única da navegação
│   └── site.ts                 nome, descrição, URL
│
├── lib/
│   ├── supabase/               client / server / middleware
│   ├── timer/modos.ts          catálogo dos modos + constantes
│   └── utils.ts                cn(), formatarTempo()
│
└── types/index.ts              modelo de domínio

public/marca/                   selo da logo
supabase/migrations/            schema versionado
prototipo/                      protótipo HTML da fase de validação
```

## Convenções

- **Domínio em português** (`treinos`, `telas`, `rounds`), **primitivos de UI em
  inglês** (`Button`, `Card`). Rotas em português.
- Server Components por padrão; `"use client"` só onde há interatividade
  (hoje: `Sidebar` e `MobileNav`, que dependem de `usePathname`).
- Componentes não sabem de cores absolutas — só de tokens.

## Tela da TV

Divisão fixa **65% / 35%**: treino à esquerda, patrocinadores à direita.
A faixa de patrocinadores roda nos dois estados — é receita da academia e
não pode depender de ter treino no ar.

Dois estados, mesma moldura:

| Estado | Coluna principal |
|---|---|
| `treino` | round, fase, exercício, cronômetro gigante, próximo exercício, barra segmentada |
| `aguardando` | relógio, próxima aula, horário, contagem regressiva |

Toda a escala é em `vw`/`vh`, **sem breakpoints**: o mesmo componente serve
de um tablet na parede a um telão 4K.

A barra de progresso é **segmentada por round**, não contínua — a vários
metros de distância é mais fácil contar blocos acesos do que interpretar
o preenchimento de uma barra.

> ⚠️ Armadilha de layout: a peça do patrocinador é 9:16 e sua altura
> intrínseca estica a linha do grid, empurrando o cronômetro para fora da
> tela. Por isso o grid usa `grid-rows-[minmax(0,1fr)]` e os filhos têm
> `min-h-0`. Não remover.

Peças em `src/config/patrocinadores.ts` → arquivos em
`public/patrocinadores/`. Imagens trocam por tempo; vídeos avançam ao
terminar e, se falharem, são pulados sem travar a rotação.

## Identidade visual

A marca inteira sai de `--color-marca` em `globals.css`. O amarelo atual
(`#fcc200`) foi **estimado a partir da imagem da logo** — se a identidade
tiver um hex oficial, trocar ali corrige o sistema todo.

`public/marca/gfit-time.svg` é o selo oficial da marca (aprovado). Para
trocá-lo, basta apontar `site.logo` (em `src/config/site.ts`) para o novo
arquivo em `public/marca/`.

Dois componentes: `Logo` (wordmark em texto, para sidebar e topbar) e
`LogoSelo` (o selo do cronômetro, para a TV, onde há espaço vertical).

## Modelo de domínio

```
Treino ── BlocoTimer[]   (sequência ordenada)
Tela ──── treinoAtivoId
Sessao ── treinoId + telaId   (histórico de execuções)
Configuracoes                 (únicas por instalação)
```

Um **Treino** é uma sequência de **BlocoTimer**, cada um com seu modo. Isso
permite encadear blocos diferentes num treino só (aquecimento → AMRAP →
descanso → Tabata) — algo que os timers de prateleira não fazem e que Hyrox
pede bastante.

Uma **Tela** é uma TV pareada por código curto. O painel escreve
`treinoAtivoId`; a TV escuta via Supabase Realtime.

## Próximos passos sugeridos

1. Schema no Supabase (sem RLS por tenant — instalação única)
2. Engine de contagem (a lógica já validada em `prototipo/index.html`)
3. Construtor de treinos
4. Pareamento e sincronia TV ↔ painel via Realtime
5. Registro de sessões alimentando o Histórico
