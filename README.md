# Desafio JusCash — Diário de Justiça Eletrônico

Aplicação fullstack que consome a API pública do **PJE (Diário de Justiça Eletrônico Nacional)**, armazena comunicações processuais em banco de dados e as apresenta em uma interface web com filtros, detalhamento e resumo por IA.

---

## Funcionalidades

- **Autenticação** — cadastro e login com JWT, rotas protegidas
- **Listagem de comunicações** — filtros por tribunal, período e número do processo, paginação, skeleton loading e estado vazio
- **Detalhe do processo** — todas as comunicações vinculadas, destinatários, destaque automático do trecho "transitou em julgado" e badge visual
- **Resumo com IA** — botão por comunicação que gera um resumo jurídico via Groq (Llama 3.3 70B)
- **Sincronização automática** — cron job diário às 01:00 que busca comunicações do dia anterior e salva sem duplicidade, com log de execução

---

## Execução local com Docker

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/desafio-draco-ajss-1304.git
cd desafio-draco-ajss-1304

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env e preencha:
# - JWT_SECRET (qualquer string segura)
# - GROQ_API_KEY (obtenha gratuitamente em console.groq.com)

# 3. Suba os serviços
docker compose up --build

# 4. Rode o seed para popular o banco com os últimos 20 dias
docker compose exec backend npx ts-node prisma/seed.ts
```

Acesse em **http://localhost:3000**

### Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `GROQ_API_KEY` | Chave da API Groq para resumo com IA (gratuita) |
| `DATABASE_URL` | String de conexão PostgreSQL (gerada automaticamente pelo docker-compose) |
| `NEXT_PUBLIC_API_URL` | URL do backend acessível pelo frontend |

---

## Links de produção

| Serviço | URL |
|---|---|
| **Frontend** | https://frontend-juscash.vercel.app |
| **Backend** | https://desafio-draco-ajss-1304-production-2617.up.railway.app |
| **Swagger (API Docs)** | https://desafio-draco-ajss-1304-production-2617.up.railway.app/api/docs |

> **Infraestrutura:** Frontend na Vercel, Backend + PostgreSQL no Railway (rede interna privada)

---

## Decisões técnicas e arquiteturais

### Backend — NestJS
Escolhi NestJS pela estrutura modular nativa (módulos, serviços, guards, decorators), que facilita a separação de responsabilidades e a testabilidade. A injeção de dependência built-in torna os testes unitários simples sem configuração extra.

### Banco de dados — PostgreSQL + Prisma
Prisma como ORM pela DX superior (tipagem automática, migrations versionadas, seed declarativo). O schema modela `communication` e `recipient` com relação 1:N, usando `hash` como campo único para evitar duplicatas no upsert do cron job.

### Autenticação — JWT + Passport
Guards do NestJS protegem todas as rotas autenticadas. Senhas hasheadas com bcrypt (salt 10). Token enviado no header `Authorization: Bearer`.

### IA — Groq (Llama 3.3 70B)
Optei pelo Groq por ser gratuito, extremamente rápido e com modelo de alta qualidade (Llama 3.3 70B). O resumo é gerado on-demand por comunicação, com prompt em português focado em linguagem jurídica.

### Frontend — Next.js App Router
Arquitetura com route groups `(auth)` e `(app)` para separar fluxos de autenticação e aplicação. Componentes client-side com `useState`/`useEffect` para gerenciamento de estado local. Tailwind CSS para estilização fiel ao Figma.

### Paginação
- Listagem: 10 itens por página, controlada pelo backend
- Detalhe: 6 comunicações por página, controlada pelo frontend (dados já carregados)

### Cron Job
Agendado com `@nestjs/schedule` para executar diariamente às 01:00. Usa `upsert` por `hash` para garantir idempotência. Registra log de execução (data, quantidade, status, erros) na tabela `syncLog`.

---

## O que eu melhoraria com mais tempo

- **Testes de integração** — E2E com banco de dados real usando supertest, cobrindo os fluxos completos de autenticação e listagem
- **Testes de componente no frontend** — React Testing Library para os componentes principais
- **Cache** — Redis para cachear listagens e evitar queries repetidas ao banco
- **Refresh token** — Implementar rotação de tokens para melhor segurança
- **Filtro por tipo de comunicação** — Campo `communicationType` já existe no banco, falta expor no filtro

---

## Uso de IA no desenvolvimento

Utilizei o **Claude Code (claude-sonnet-4-6)** como assistente de desenvolvimento durante todo o projeto:

- **Geração de código** — componentes React, serviços NestJS, configurações Docker
- **Refatoração** — ajustes de layout para fidelidade ao Figma, renomeação de rotas, padronização de nomenclatura
- **Testes** — escrita dos testes unitários para `AuthService` e `CommunicationsService`
- **Debugging** — diagnóstico de problemas (repositório git duplicado no frontend, variáveis de ambiente faltando)

A abordagem foi iterativa: o Claude gerava o código base e eu revisava, ajustava e direcionava as decisões de produto (quais features priorizar, como o Figma deveria ser interpretado, qual provedor de IA usar). Todo o código entregue foi compreendido e validado por mim antes de ser commitado.

O resumo com IA utiliza o modelo **Llama 3.3 70B via Groq** — escolhido por ser gratuito e de alta qualidade para o contexto jurídico em português.
