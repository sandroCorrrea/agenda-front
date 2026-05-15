# Carrossel da Home — Correção de upload e exposição correta do storage (`agenda-service`)

Prompt para o back-end resolver dois problemas relacionados às imagens do carrossel da página inicial:

1. **Upload `422` — `"The imagem failed to upload."`**
2. **URLs servidas no `imagem_url` / `src` apontando para host quebrado (`http://localhost/storage/...`).**

Os dois problemas são de **infra/configuração do backend** (PHP + Laravel). O front já está implementado, validado e em produção interno; nenhuma alteração no contrato JSON é necessária.

---

## 1. Contexto do front (referência)

- `POST http://127.0.0.1:8000/api/admin/home/carrossel`
- `Content-Type: multipart/form-data` (boundary gerado automaticamente pelo Axios).
- Headers: `Authorization: Bearer <token>` + `Accept: application/json`.
- Campos enviados (nomes exatos):

| Campo | Tipo | Origem |
|-------|------|--------|
| `titulo` | string | input texto |
| `imagem` | File (JPG/PNG/WEBP, ≤ 5 MB) | input `type="file"` |
| `ordem` | string (inteiro) | input number |
| `ativo` | `"1"` ou `"0"` | switch |
| `abrir_em_nova_aba` | `"1"` ou `"0"` | switch |
| `alt_text` | string (opcional) | input texto |
| `link_url` | string (opcional) | input texto |

Validação client-side já garante:

- `titulo`: 3–120 caracteres.
- `imagem`: tipos `image/jpeg`, `image/png`, `image/webp` e tamanho ≤ `5 * 1024 * 1024` bytes.
- `link_url`: passa pelo construtor `new URL(...)` antes de submeter.

Nada é alterado no header `Content-Type` (deixa o navegador setar com boundary). O Axios usado é o instance global definido em `src/presentation/main.ts`.

---

## 2. Problema 1 — `422` no upload

### Resposta atual da API

```http
HTTP/1.1 422 Unprocessable Content
Content-Type: application/json

{
  "message": "Dados inválidos.",
  "errors": {
    "imagem": ["The imagem failed to upload."]
  }
}
```

A mensagem `The imagem failed to upload.` é a tradução padrão da regra `validation.uploaded` do Laravel. Ela é disparada **antes** das regras `image` / `mimes` / `max`, no momento em que o Laravel pergunta ao PHP "esse arquivo foi recebido com sucesso?" e a resposta é não.

### Causas possíveis (em ordem de probabilidade)

1. **`upload_max_filesize` do PHP** menor que o tamanho enviado.
   - Padrão em muitas instalações = `2M`. A API aceita 5 MB.
2. **`post_max_size` do PHP** menor que o tamanho total da requisição multipart.
   - Precisa ser **maior** que `upload_max_filesize` (Laravel + PHP recomendam pelo menos +50%).
3. **`upload_tmp_dir`** apontando para diretório inexistente / sem permissão de escrita.
4. **`file_uploads = Off`** no `php.ini`.
5. **Disco do storage cheio** ou diretório `storage/app/public/home/carrossel` sem permissão de escrita para o usuário do PHP.

### Verificação passo a passo

```bash
# 1) Identificar QUAL php.ini o `php artisan serve` está usando:
php -i | grep -E "Loaded Configuration File|upload_max_filesize|post_max_size|file_uploads|upload_tmp_dir|memory_limit"
```

Saída esperada (alvo):

```
Loaded Configuration File => /caminho/para/seu/php.ini
file_uploads => On => On
upload_max_filesize => 10M => 10M
post_max_size => 20M => 20M
upload_tmp_dir => /tmp => /tmp
memory_limit => 256M => 256M
```

```bash
# 2) Conferir permissões dos diretórios do storage do Laravel:
ls -ld storage storage/app storage/app/public storage/app/public/home 2>/dev/null
ls -ld bootstrap/cache

# 3) Conferir disco:
df -h .

# 4) Conferir se o symlink existe:
ls -l public/storage
# Esperado: public/storage -> ../storage/app/public

# 5) Conferir se o usuário do PHP consegue escrever no tmp:
TEMP_DIR=$(php -r 'echo sys_get_temp_dir();')
echo "tmp dir: $TEMP_DIR"
touch "$TEMP_DIR/teste_upload_carrossel" && rm "$TEMP_DIR/teste_upload_carrossel" \
  && echo "OK: escrita permitida em $TEMP_DIR" \
  || echo "FALHA: sem permissão em $TEMP_DIR"
```

### Correção sugerida

Edite o `php.ini` mostrado por `php -i` e ajuste para:

```ini
file_uploads = On
upload_max_filesize = 10M
post_max_size = 20M
memory_limit = 256M
; opcional, descomente se o ambiente exigir um tmp dedicado e gravável
; upload_tmp_dir = /var/tmp
```

Garanta permissões do Laravel:

```bash
php artisan storage:link
chmod -R 775 storage bootstrap/cache
# Se estiver em ambiente compartilhado com usuário do web server:
# chown -R $USER:_www storage bootstrap/cache
```

Reinicie o `php artisan serve` (o servidor embutido **não** recarrega `php.ini` em tempo de execução). Em produção sob `php-fpm` + Apache/Nginx, reinicie o pool:

```bash
# Mac com Homebrew, por exemplo:
brew services restart php

# Ou, se rodar via artisan serve:
# Ctrl+C no terminal atual e:
php artisan serve --host=127.0.0.1 --port=8000
```

### Teste de aceite

```bash
# Imagem pequena para sanidade (< 200 KB):
curl -i -X POST "http://127.0.0.1:8000/api/admin/home/carrossel" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Accept: application/json" \
  -F "titulo=Teste de upload" \
  -F "ordem=0" \
  -F "ativo=1" \
  -F "abrir_em_nova_aba=0" \
  -F "imagem=@/caminho/local/imagem-pequena.png"

# Imagem grande, próxima ao limite (4 MB):
curl -i -X POST "http://127.0.0.1:8000/api/admin/home/carrossel" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -H "Accept: application/json" \
  -F "titulo=Teste 4MB" \
  -F "ordem=1" \
  -F "ativo=1" \
  -F "abrir_em_nova_aba=0" \
  -F "imagem=@/caminho/local/imagem-4mb.jpg"
```

Resultado esperado: `201 Created` em ambos os casos, com o JSON do recurso criado.

---

## 3. Problema 2 — URLs servidas com host quebrado

### Sintoma

A API admin/pública está devolvendo:

```json
{
  "imagem_url": "http://localhost/storage/home/carrossel/home-carrossel-<uuid>.png",
  "src": "http://localhost/storage/home/carrossel/home-carrossel-<uuid>.png",
  "imagem_path": "home/carrossel/home-carrossel-<uuid>.png"
}
```

Esse URL `http://localhost/...` **não abre nem direto no navegador** porque não há um servidor servindo o storage nesse endereço. Quem realmente serve o storage no ambiente atual é `http://127.0.0.1:8000`.

### Causa

`APP_URL` do `.env` do Laravel está como `http://localhost` (ou apenas `http://localhost/`). O `Storage::url()` e os helpers do Laravel concatenam `APP_URL + '/storage/' + path`, gerando uma URL que aponta para um host que não tem o storage publicado.

### Correção

Em `.env` do `agenda-service`:

```env
APP_URL=http://127.0.0.1:8000
ASSET_URL=http://127.0.0.1:8000
```

Depois:

```bash
php artisan config:clear
php artisan storage:link   # idempotente, ok rodar de novo
```

Reinicie o `php artisan serve` para recarregar o `.env`.

### Teste de aceite

```bash
# A URL devolvida agora deve abrir no navegador e via curl:
curl -I "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-<uuid>.png"
# Esperado: HTTP/1.1 200 OK
```

Resposta da API após o fix:

```json
{
  "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-<uuid>.png",
  "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-<uuid>.png",
  "imagem_path": "home/carrossel/home-carrossel-<uuid>.png"
}
```

> **Observação**: o front foi feito defensivo e já reconstrói a URL a partir do `imagem_path` ou do trecho `/storage/...` usando `VITE_STORAGE_BASE_URL` do `.env` do front. Mesmo assim, **devolva URLs absolutas válidas** para não depender da camada do front em integrações futuras (mobile, e-mail, sitemap, etc.).

---

## 4. Hardening recomendado (opcional, mas vale a pena)

### 4.1. Validação explícita do upload

No `FormRequest` do POST/PUT, mantenha **`uploaded`** explícito antes das regras de tipo e tamanho, para mensagens mais claras:

```php
public function rules(): array
{
    return [
        'titulo' => ['required', 'string', 'min:3', 'max:120'],
        'imagem' => [
            'required',
            'file',
            'uploaded',
            'mimes:jpg,jpeg,png,webp',
            'max:5120', // KB
        ],
        // ...demais regras
    ];
}
```

E sobrescreva as mensagens em PT-BR (ou via `lang/pt_BR/validation.php`):

```php
public function messages(): array
{
    return [
        'imagem.uploaded'  => 'Falha no upload da imagem. Verifique o tamanho do arquivo e os limites do servidor.',
        'imagem.required'  => 'Envie um arquivo de imagem.',
        'imagem.mimes'     => 'Formato inválido. Use JPG, JPEG, PNG ou WEBP.',
        'imagem.max'       => 'Imagem acima do limite permitido (máximo 5 MB).',
        'imagem.image'     => 'O arquivo enviado precisa ser uma imagem válida.',
    ];
}
```

### 4.2. Conferir limites efetivos da requisição (debug)

Endpoint temporário para confirmar configurações sem reiniciar o terminal:

```php
Route::get('/_debug/php', function () {
    return response()->json([
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size'       => ini_get('post_max_size'),
        'memory_limit'        => ini_get('memory_limit'),
        'file_uploads'        => ini_get('file_uploads'),
        'upload_tmp_dir'      => ini_get('upload_tmp_dir') ?: sys_get_temp_dir(),
        'tmp_writable'        => is_writable(ini_get('upload_tmp_dir') ?: sys_get_temp_dir()),
        'app_url'             => config('app.url'),
        'storage_link_exists' => file_exists(public_path('storage')),
    ]);
})->middleware('auth:sanctum'); // restrinja em produção
```

> Remova esse endpoint após o diagnóstico.

### 4.3. Mensagens consistentes

Garanta que o `errors.imagem` sempre venha como **array de strings** (`["mensagem"]`). É o que o front consome. O Laravel já faz isso por padrão; só vale checar middlewares custom.

---

## 5. Critérios de aceite

- [ ] `php -i | grep upload_max_filesize` retorna `>= 10M`.
- [ ] `php -i | grep post_max_size` retorna `>= 20M`.
- [ ] `php -i | grep file_uploads` retorna `On`.
- [ ] `upload_tmp_dir` é gravável pelo usuário do PHP.
- [ ] `public/storage` existe e aponta para `../storage/app/public`.
- [ ] `php artisan serve` reiniciado após mudança no `php.ini` e `.env`.
- [ ] `APP_URL=http://127.0.0.1:8000` (ou host real onde o storage é servido) no `.env`.
- [ ] `curl -I http://127.0.0.1:8000/storage/home/carrossel/<arquivo>` retorna `200 OK`.
- [ ] `POST /api/admin/home/carrossel` com imagem `.jpg` de 200 KB retorna `201 Created`.
- [ ] `POST /api/admin/home/carrossel` com imagem `.png` de 4 MB retorna `201 Created`.
- [ ] `POST /api/admin/home/carrossel` com imagem `.pdf` retorna `422` com `errors.imagem` claro (mimes).
- [ ] `POST /api/admin/home/carrossel` com imagem de 8 MB retorna `422` com `errors.imagem` claro (max).
- [ ] `GET /api/home/carrossel` retorna `imagem_url`/`src` apontando para host que efetivamente serve o arquivo (testar via `curl -I`).

---

## 6. Referências rápidas

- Documentação PHP: <https://www.php.net/manual/pt_BR/features.file-upload.common-pitfalls.php>
- Documentação Laravel — Storage URL: <https://laravel.com/docs/filesystem#the-public-disk>
- Documentação Laravel — Validation `uploaded`: <https://laravel.com/docs/validation#rule-uploaded>
- Manual da API do carrossel (já entregue ao front): `agenda-front/prompt-api-home-carrossel-agent.md`

Última atualização alinhada ao estado atual do front no branch principal do `agenda-front`.
