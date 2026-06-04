# Deploy do front Vue na Hostgator (raiz do domínio)

Objetivo: publicar o SPA em **https://agenda-contabilidade.com/** (substituir o `index.php` legado), mantendo a API em **https://api.agenda-contabilidade.com/api** e a pasta **`Upload/`** do site antigo.

## Arquitetura em produção

| Componente | URL / caminho |
|------------|----------------|
| Site Vue (SPA) | `https://agenda-contabilidade.com/` → `public_html/` |
| API Laravel | `https://api.agenda-contabilidade.com/api` → `agenda-service/public` |
| Fotos legadas | `https://agenda-contabilidade.com/Upload/...` (manter pasta no `public_html`) |
| Health API | `GET https://api.agenda-contabilidade.com/up` |

## 1. Variáveis do front (build)

Arquivo `.env.production` (já no repositório):

```env
VITE_API_BASE_URL=https://api.agenda-contabilidade.com/api
VITE_STORAGE_BASE_URL=https://api.agenda-contabilidade.com/storage
VITE_LEGACY_UPLOAD_BASE_URL=https://agenda-contabilidade.com
```

Build local ou no CI:

```bash
npm ci
npm run build
```

Saída: pasta `dist/` (inclui `.htaccess` copiado de `public/`).

## 2. Backend — após publicar o front na raiz

No `.env` do **agenda-service** (servidor):

```env
FRONTEND_PASSWORD_RESET_URL=https://agenda-contabilidade.com/redefinir-senha
```

Depois:

```bash
/usr/local/bin/ea-php84 artisan config:clear
/usr/local/bin/ea-php84 artisan config:cache
```

## 3. CORS (Laravel)

Liberar o origin exato do front:

```text
https://agenda-contabilidade.com
```

(sem barra final). Com Bearer token, o front não usa `withCredentials`.

## 4. Publicar no `public_html` sem perder `Upload/`

### Antes do go-live

1. Backup completo de `public_html` (FTP/cPanel File Manager).
2. Confirmar que **`public_html/Upload/`** existe e contém fotos de perfil legadas (`profile_*`).

### Deploy do Vue

1. No servidor, renomeie o legado (opcional): `public_html` → `public_html_legado_backup`.
2. Crie `public_html` vazio ou use o mesmo após limpar **apenas** o que será substituído pelo SPA.
3. Envie **todo o conteúdo de `dist/`** para `public_html/` (`index.html`, `assets/`, `.htaccess`).
4. Copie de volta **somente** o que deve continuar servindo como arquivo estático:
   - `Upload/` (obrigatório para avatares migrados)
   - Outros diretórios legados que ainda precisem de URL direta (ex.: PDFs antigos), se houver.

O `.htaccess` do build não reescreve URLs quando o arquivo ou pasta existe no disco — `Upload/foo.jpeg` continua acessível.

### O que **não** colocar no `public_html`

- Código Laravel (`agenda-service` fica fora de `public_html`, no subdomínio `api`).
- `node_modules/`, fontes Vue — só o `dist/`.

## 5. Rotas do Vue alinhadas ao e-mail de senha

| Rota front | Uso |
|------------|-----|
| `/login` | CPF 11 dígitos + senha → `POST /api/auth/login` |
| `/recuperar-senha` | `POST /api/auth/senha/recuperacao` |
| `/redefinir-senha?token=...` | `POST /api/auth/senha/redefinir` |

Link do e-mail (Laravel):  
`https://agenda-contabilidade.com/redefinir-senha?token=...`

## 6. Testes manuais pós-deploy

```bash
curl -i https://api.agenda-contabilidade.com/up

curl -X POST https://api.agenda-contabilidade.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"cpf":"SEU_CPF","senha":"SUA_SENHA"}'
```

No navegador:

1. Abrir `https://agenda-contabilidade.com/` (home Vue).
2. Login e logout.
3. Recuperar senha → e-mail → link → `/redefinir-senha`.
4. Área autenticada (ex.: perfil) com Bearer.
5. Avatar legado `Upload/profile_...` se o usuário migrado tiver esse caminho em `img`.

## 7. Desenvolvimento local

```env
# .env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STORAGE_BASE_URL=http://127.0.0.1:8000/storage
VITE_LEGACY_UPLOAD_BASE_URL=https://agenda-contabilidade.com
```

Laravel local:

```env
FRONTEND_PASSWORD_RESET_URL=http://127.0.0.1:5173/redefinir-senha
```

## 8. Site legado PHP

Rotas antigas (`Admin/`, blog PHP, etc.) deixam de ser o `index.php` na raiz; o Vue passa a responder em `/`. Se ainda precisar de URLs legadas específicas, mantenha subpastas com arquivos reais em `public_html` ou redirecione no `.htaccess` antes da regra da SPA.
