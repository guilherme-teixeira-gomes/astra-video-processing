# ASTRA — Sistema de Processamento de Vídeos

Hackathon FIAP — Fase 5. Refatoração do projeto base (monólito em Go) para uma
arquitetura de microsserviços escalável em Node.js/TypeScript.

O sistema recebe vídeos, extrai os frames (1 por segundo) com FFmpeg e entrega
um arquivo .zip com as imagens.

## Arquitetura

```
  Frontend (React)
        |
        v
  API Service  ──publica──>  RabbitMQ  ──consome──>  Processor Service (N réplicas)
   |      |                  (fila durável)              |        |
 Postgres Redis                                       FFmpeg   e-mail (erro)
   ^                                                     |
   └─────────────── atualiza status ────────────────────┘

  Prometheus + Grafana  <── métricas /metrics
```

- **API Service** — autenticação (JWT), upload, listagem de status, download. Postgres + Redis.
- **Processor Service** — consome a fila, processa o vídeo com FFmpeg, gera o zip, notifica erro por e-mail. Escalável por réplicas.
- **RabbitMQ** — fila durável: em picos, nenhuma requisição é perdida; múltiplos vídeos processam em paralelo somando réplicas do Processor.
- **PostgreSQL** — persistência (usuários e vídeos). **Redis** — cache de status.
- **Prometheus + Grafana** — monitoramento.

## Como rodar (local, com Docker)

```bash
docker compose up --build
```

Serviços:
- Frontend: http://localhost:8080
- API: http://localhost:3000
- RabbitMQ: http://localhost:15672 (guest/guest)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

Para processar vários vídeos em paralelo, escale o Processor:
```bash
docker compose up --build --scale processor-service=3
```

## Fluxo de uso

1. Acesse o frontend e crie uma conta (e-mail + senha).
2. Faça login.
3. Envie um vídeo (arraste ou selecione).
4. Acompanhe o status na lista (atualiza sozinho): Na fila → Processando → Concluído.
5. Baixe o .zip com os frames. Em caso de erro, o motivo aparece na lista e um e-mail é enviado.

## Requisitos atendidos

| Requisito | Como |
|-----------|------|
| Processar vários vídeos ao mesmo tempo | Réplicas do Processor consumindo a fila |
| Não perder requisição em picos | Fila durável do RabbitMQ (mensagens persistentes) |
| Proteção por usuário e senha | JWT + bcrypt no API Service |
| Listagem de status por usuário | Endpoint GET /videos + tela de histórico |
| Notificação de erro | E-mail (nodemailer) ao falhar o processamento |
| Persistência | PostgreSQL |
| Escalabilidade | Kubernetes (HPA) + fila; Processor stateless |
| Versionamento | GitHub |
| Testes | Jest (unitários + integração) |
| CI/CD | GitHub Actions |
| Monitoramento | Prometheus + Grafana + /metrics |

## Testes

```bash
cd services/api-service && npm install && npm run test:coverage
cd services/processor-service && npm install && npm run test:coverage
```

## Estrutura

```
fiapx/
├── services/
│   ├── api-service/          API REST (auth, upload, status, download)
│   └── processor-service/    Worker FFmpeg (consome a fila)
├── frontend/                 Interface web (React) — ASTRA CONNECT
├── k8s/                      Manifestos Kubernetes
├── monitoring/               Config do Prometheus
├── docs/                     Documentação, diagrama e script do banco (init.sql)
├── .github/workflows/        CI/CD
└── docker-compose.yml        Ambiente local completo
```
