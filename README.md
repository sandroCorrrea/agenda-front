# agenda-front

Front **Vue 3 + Vite** da Agenda Contabilidade, integrado à API Laravel (**agenda-service**) em produção.

## API

| Ambiente | Base URL |
|----------|----------|
| Produção | `https://api.agenda-contabilidade.com/api` |
| Local | `http://127.0.0.1:8000/api` |

Autenticação: **Sanctum** — header `Authorization: Bearer {token}`.

## Configuração

Copie `.env.example` para `.env` e ajuste as variáveis.

```sh
npm install
npm run dev
```

Build de produção (usa `.env.production`):

```sh
npm run build
```

## Deploy na Hostgator (raiz do domínio)

O SPA deve ficar em **https://agenda-contabilidade.com/**, com a API no subdomínio `api`.

Passo a passo completo: [docs/DEPLOY-HOSTGATOR.md](docs/DEPLOY-HOSTGATOR.md)

Resumo:

1. `npm run build` → enviar `dist/` para `public_html/`
2. Manter `public_html/Upload/` para fotos legadas
3. No Laravel: `FRONTEND_PASSWORD_RESET_URL=https://agenda-contabilidade.com/redefinir-senha`
4. Configurar CORS para `https://agenda-contabilidade.com`

## Rotas públicas relevantes

- `/login` — entrada (CPF sem máscara na API)
- `/recuperar-senha` — solicita e-mail
- `/redefinir-senha?token=...` — nova senha (link do e-mail)

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server Vite |
| `npm run build` | Build produção |
| `npm run preview` | Preview do `dist/` |
| `npm run lint` | ESLint + oxlint |
