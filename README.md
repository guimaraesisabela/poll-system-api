# Poll System API

> API de enquetes em tempo real com atualização automática de votos via WebSocket.

---

## Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e configuração](#-instalação-e-configuração)
- [Rodando o projeto](#-rodando-o-projeto)
- [Endpoints](#-endpoints)
- [Realtime com WebSocket](#-realtime-com-websocket)
- [Status das enquetes](#-status-das-enquetes)
- [Testes](#-testes)
- [Variáveis de ambiente](#-variáveis-de-ambiente)

---

## Sobre o projeto

O **Poll System** é uma API REST que permite criar e gerenciar enquetes de múltipla escolha com atualização de votos em tempo real. Desenvolvida como desafio técnico, a API utiliza WebSocket para transmitir os resultados instantaneamente para todos os clientes conectados, sem necessidade de recarregar a página ou fazer novas requisições.

O sistema também gerencia automaticamente o **status das enquetes** com base nas datas de início e término configuradas, classificando cada enquete como `NOT_STARTED`, `STARTED`, `IN_PROGRESS` ou `FINISHED`.

---

## Funcionalidades

- [x] Criar enquetes com título, datas e opções
- [x] Editar enquetes existentes
- [x] Excluir enquetes
- [x] Listar todas as enquetes
- [x] Filtrar enquetes por status
- [x] Adicionar quantas opções quiser (mínimo 3)
- [x] Votar em uma opção da enquete
- [x] Atualização de votos em tempo real via WebSocket
- [x] Cálculo automático de status com base nas datas

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| [Node.js](https://nodejs.org) | Runtime JavaScript |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Fastify](https://fastify.dev) | Framework HTTP de alta performance |
| [@fastify/websocket](https://github.com/fastify/fastify-websocket) | Suporte a WebSocket |
| [Prisma ORM](https://www.prisma.io) | Acesso ao banco de dados |
| [PostgreSQL](https://www.postgresql.org) | Banco de dados relacional |
| [Docker](https://www.docker.com) | Containerização do banco |
| [Zod](https://zod.dev) | Validação de dados |
| [Vitest](https://vitest.dev) | Testes unitários |

---

## Arquitetura

```
src/
├── http/
│   ├── controllers/        # Lógica de cada endpoint
│   │   ├── create-poll.ts
│   │   ├── get-poll.ts
│   │   ├── list-polls.ts
│   │   ├── update-poll.ts
│   │   ├── delete-poll.ts
│   │   ├── vote-on-poll.ts
│   │   └── poll-results.ts
│   └── routes/
│       └── poll-routes.ts  # Registro de todas as rotas
├── lib/
│   └── prisma.ts           # Instância do Prisma Client
│   └── poll-sockets.ts     # Gerenciamento de conexões WebSocket
├── utils/
│   └── get-poll-status.ts  # Cálculo automático de status
├── tests/
│   ├── setup.ts            # Configuração global dos testes
│   ├── create-poll.spec.ts
│   ├── get-poll.spec.ts
│   ├── list-polls.spec.ts
│   ├── update-poll.spec.ts
│   ├── delete-poll.spec.ts
│   └── vote-on-poll.spec.ts
├── app.ts                  # Configuração do Fastify
└── server.ts               # Inicialização do servidor
prisma/
└── schema.prisma           # Modelos do banco de dados
```

---

## Pré-requisitos

Antes de começar, você vai precisar ter instalado:

- [Node.js](https://nodejs.org) v18 ou superior
- [Docker](https://www.docker.com/products/docker-desktop) (para rodar o PostgreSQL)
- [npm](https://www.npmjs.com)

---

## Instalação e configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/poll-system.git
cd poll-system
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

O arquivo `.env` gerado já vem configurado para o banco local criado pelo Docker. Veja a seção [Variáveis de ambiente](#-variáveis-de-ambiente) para mais detalhes.

### 4. Suba o banco de dados com Docker

```bash
docker compose up -d
```

Esse comando sobe um container PostgreSQL na porta `5432`.

### 5. Rode as migrations

```bash
npx prisma migrate deploy
```

Isso cria as tabelas `polls` e `poll_options` no banco de dados.

---

## Rodando o projeto

### Desenvolvimento (com hot reload)

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

A API estará disponível em `http://localhost:3333`.

---

## Endpoints

### Enquetes

#### `POST /polls` — Criar enquete

**Body:**
```json
{
  "title": "Qual a melhor linguagem?",
  "startsAt": "2026-05-13T00:00:00.000Z",
  "endsAt": "2026-05-20T00:00:00.000Z",
  "options": ["TypeScript", "Python", "Go"]
}
```

**Resposta `201`:**
```json
{
  "id": "uuid",
  "title": "Qual a melhor linguagem?",
  "status": "NOT_STARTED",
  "startsAt": "2026-05-13T00:00:00.000Z",
  "endsAt": "2026-05-20T00:00:00.000Z",
  "options": [
    { "id": "uuid", "title": "TypeScript", "votes": 0 },
    { "id": "uuid", "title": "Python", "votes": 0 },
    { "id": "uuid", "title": "Go", "votes": 0 }
  ]
}
```

---

#### `GET /polls` — Listar enquetes

Retorna todas as enquetes. Aceita filtro por status via query string.

```bash
GET /polls
GET /polls?status=NOT_STARTED
GET /polls?status=STARTED
GET /polls?status=IN_PROGRESS
GET /polls?status=FINISHED
```

---

#### `GET /polls/:id` — Buscar enquete por ID

```bash
GET /polls/uuid-da-enquete
```

---

#### `PUT /polls/:id` — Editar enquete

**Body (todos os campos são opcionais):**
```json
{
  "title": "Novo título",
  "startsAt": "2026-05-14T00:00:00.000Z",
  "endsAt": "2026-05-21T00:00:00.000Z",
  "options": ["Opção 1", "Opção 2", "Opção 3"]
}
```

>  Ao enviar `options`, as opções anteriores são substituídas e os votos são zerados.

---

#### `DELETE /polls/:id` — Deletar enquete

Remove a enquete e todas as suas opções.

---

#### `POST /polls/:pollId/votes` — Votar em uma opção

**Body:**
```json
{
  "optionId": "uuid-da-opcao"
}
```

---

### Realtime com WebSocket

#### `WS /polls/:pollId/results` — Resultados em tempo real

Conecte via WebSocket e receba atualizações automáticas sempre que alguém votar.

**Exemplo de mensagem recebida:**
```json
{
  "optionId": "uuid-da-opcao",
  "title": "TypeScript",
  "votes": 42
}
```

**Como funciona:**
1. O cliente abre uma conexão WebSocket com `/polls/:pollId/results`
2. Ele é adicionado a uma "sala" daquela enquete
3. Quando alguém vota via `POST /polls/:pollId/votes`, o servidor atualiza o banco e transmite o novo resultado para todos na sala
4. O cliente recebe a mensagem sem precisar recarregar ou fazer nova requisição

---

## Status das enquetes

O status de cada enquete é calculado automaticamente com base nas datas de início e término:

| Status | Condição |
|---|---|
| `NOT_STARTED` | A data de início ainda não chegou |
| `STARTED` | Passou da data de início, mas está na primeira metade do período |
| `IN_PROGRESS` | Está na segunda metade do período |
| `FINISHED` | A data de término já passou |

O status é recalculado e atualizado no banco sempre que a enquete é buscada ou listada.

---

## Testes

O projeto possui testes de integração para todos os controllers, cobrindo os cenários de sucesso e de erro.

```bash
# Rodar os testes
npm test

# Rodar com cobertura
npm run test:coverage
```

**Cobertura de testes:**

| Arquivo | Testes |
|---|---|
| `create-poll` | Criação com sucesso, rejeição com menos de 3 opções, rejeição sem título |
| `list-polls` | Listagem geral, filtro por status, lista vazia |
| `get-poll` | Busca por ID, 404 para ID inexistente |
| `update-poll` | Atualização de título, 404 para ID inexistente |
| `delete-poll` | Deleção com sucesso, 404 para ID inexistente |
| `vote-on-poll` | Voto registrado, 404 para opção inexistente |

---

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `DATABASE_URL` | URL de conexão com o PostgreSQL | `postgresql://docker:docker@localhost:5432/poll_system` |
| `PORT` | Porta do servidor | `3333` |
