# Prompt para Agente Backend — API CRUD do Carrossel da Home

## Contexto

No front `agenda-front`, a página inicial está em:

- `src/presentation/pages/Home/PageHome.vue`

Hoje o bloco de carrossel da Home possui imagens chapadas no código:

```ts
const imagensCarrossel = [
  { src: '/logo.svg', titulo: 'Plataforma contábil integrada' },
  { src: logoJpeg, titulo: 'Inteligência para escritórios modernos' },
  { src: profileSvg, titulo: 'Atendimento digital eficiente' },
  { src: '/logo.svg', titulo: 'Automação fiscal e financeira' },
  { src: logoJpeg, titulo: 'Produtividade com segurança' },
  { src: profileSvg, titulo: 'Experiência completa para clientes' }
];

const trilhaCarrossel = computed(() => [...imagensCarrossel, ...imagensCarrossel]);
```

E o template usa apenas:

```vue
<div class="carrossel__item" v-for="(imagem, indice) in trilhaCarrossel" :key="`${imagem.titulo}-${indice}`">
  <img :src="imagem.src" :alt="imagem.titulo" />
  <span>{{ imagem.titulo }}</span>
</div>
```

O objetivo agora é criar uma API no backend para que o administrador consiga cadastrar, editar, listar e excluir imagens do carrossel da Home, com upload de arquivo, deixando esse bloco dinâmico no front.

---

## Objetivo da API

Criar um CRUD completo para o recurso:

- **Imagem do carrossel da Home**

O backend deve expor endpoints para:

1. **GET**: listar imagens do carrossel.
2. **POST**: cadastrar uma nova imagem com upload.
3. **PUT**: atualizar dados e opcionalmente substituir a imagem.
4. **DELETE**: excluir uma imagem do carrossel.

O front público da Home deve consumir apenas imagens ativas e ordenadas.

A área administrativa deve conseguir visualizar todas, incluindo inativas, para manutenção.

---

## Nome sugerido do recurso

Usar um nome claro e específico:

- Tabela: `home_carrossel_imagens`
- Model: `HomeCarrosselImagem`
- Controller: `HomeCarrosselImagemController`
- Request de criação: `StoreHomeCarrosselImagemRequest`
- Request de atualização: `UpdateHomeCarrosselImagemRequest`
- Policy opcional: `HomeCarrosselImagemPolicy`

Caso o projeto backend tenha outro padrão de nomenclatura, adaptar mantendo o contrato HTTP.

---

## Modelo de dados

Criar migration para tabela `home_carrossel_imagens`.

### Campos obrigatórios

| Campo | Tipo | Obrigatório | Observação |
|-------|------|-------------|------------|
| `id` | bigint unsigned | Sim | Primary key |
| `titulo` | string(120) | Sim | Texto exibido abaixo da imagem no carrossel |
| `alt_text` | string(160) | Não | Texto alternativo da imagem; se vazio, usar `titulo` |
| `imagem_path` | string(255) | Sim | Caminho interno no storage, ex.: `home/carrossel/arquivo.webp` |
| `ordem` | integer | Sim | Ordem de exibição. Menor primeiro |
| `ativo` | boolean | Sim | Define se aparece na Home pública |
| `link_url` | string(500) | Não | URL opcional caso futuramente a imagem vire link |
| `abrir_em_nova_aba` | boolean | Sim | Default `false`, usado somente se houver `link_url` |
| `usuario_id` | foreignId nullable | Não | Usuário admin que criou/alterou, se o projeto já auditar por usuário |
| `created_at` | timestamp | Sim | Laravel default |
| `updated_at` | timestamp | Sim | Laravel default |
| `deleted_at` | timestamp nullable | Opcional | Usar se o projeto trabalhar com soft delete |

### Migration sugerida

```php
Schema::create('home_carrossel_imagens', function (Blueprint $table) {
    $table->id();
    $table->string('titulo', 120);
    $table->string('alt_text', 160)->nullable();
    $table->string('imagem_path', 255);
    $table->unsignedInteger('ordem')->default(0);
    $table->boolean('ativo')->default(true);
    $table->string('link_url', 500)->nullable();
    $table->boolean('abrir_em_nova_aba')->default(false);
    $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
    $table->timestamps();
    $table->softDeletes();

    $table->index(['ativo', 'ordem']);
});
```

Se a tabela de usuários no backend tiver outro nome, ajustar `constrained('usuarios')`.

---

## Storage dos arquivos

Salvar os uploads em:

```txt
storage/app/public/home/carrossel
```

URL pública esperada:

```txt
{APP_URL}/storage/home/carrossel/{nome-do-arquivo}
```

O backend deve garantir que:

- O arquivo seja salvo no disco público (`public`).
- O comando `php artisan storage:link` esteja documentado/necessário.
- Ao substituir imagem em `PUT`, o arquivo antigo seja removido do storage, se não estiver sendo usado por outro registro.
- Ao excluir em `DELETE`, remover também o arquivo físico, ou manter caso o projeto tenha política de retenção. Preferência: remover arquivo físico quando o registro for excluído permanentemente.

### Nome do arquivo

Gerar nome seguro e único, por exemplo:

```txt
home-carrossel-{uuid}.{ext}
```

Não confiar no nome original enviado pelo usuário.

---

## Formatos e validações de imagem

### Campo de upload

Nome do campo:

```txt
imagem
```

### Tipos permitidos

Preferir imagens rasterizadas seguras:

- `jpg`
- `jpeg`
- `png`
- `webp`

Evitar `svg` para upload administrativo porque SVG pode carregar payloads ativos se não for sanitizado. Se o backend decidir permitir SVG, sanitizar obrigatoriamente antes de salvar/servir.

### Tamanho máximo

Recomendação:

- Máximo: `5MB`

### Dimensões recomendadas

O layout atual do front usa:

```css
.carrossel__item img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
```

Portanto, recomendar upload com proporção horizontal:

- Largura recomendada: `680px` ou maior.
- Altura recomendada: `360px` ou maior.
- Proporção sugerida: `16:9` ou próxima.

O backend não precisa recortar obrigatoriamente, mas deve validar que é uma imagem válida. Opcionalmente pode gerar versão otimizada `.webp`.

---

## Autenticação e autorização

### Rotas públicas

O front da Home precisa listar imagens ativas sem autenticação.

### Rotas administrativas

`POST`, `PUT`, `DELETE` e a listagem administrativa devem exigir:

- `Authorization: Bearer {token}`
- Usuário autenticado.
- `tipo_usuario === 'administrador'`

Seguir o mesmo padrão já usado no backend para outras áreas administrativas, como serviços, avisos, blog e protocolos.

---

## Contrato JSON do recurso

Resposta ideal para cada item:

```json
{
  "id": 1,
  "titulo": "Plataforma contábil integrada",
  "alt_text": "Tela da plataforma contábil integrada",
  "imagem_path": "home/carrossel/home-carrossel-uuid.webp",
  "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-uuid.webp",
  "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-uuid.webp",
  "ordem": 1,
  "ativo": true,
  "link_url": null,
  "abrir_em_nova_aba": false,
  "created_at": "2026-05-12T17:00:00.000000Z",
  "updated_at": "2026-05-12T17:00:00.000000Z"
}
```

### Observações importantes

- `imagem_url` é o campo principal para a URL pública.
- `src` é um alias opcional recomendado para facilitar a adaptação do front atual, que hoje usa `imagem.src`.
- `alt_text` deve ser retornado. Se estiver vazio, o backend pode retornar `alt_text` igual ao `titulo`.
- O front pode usar:

```ts
{
  src: item.src ?? item.imagem_url,
  titulo: item.titulo,
  alt: item.alt_text ?? item.titulo
}
```

---

## Endpoints necessários

## 1) GET público — listar imagens ativas da Home

### Endpoint

```http
GET /api/home/carrossel
```

### Autenticação

Público, sem Bearer token.

### Regra

Retornar somente:

- `ativo = true`
- ordenado por `ordem ASC`, depois `id ASC`

### Query params opcionais

| Param | Tipo | Default | Observação |
|-------|------|---------|------------|
| `limit` | integer | null | Opcional. Se enviado, limitar quantidade |

### Resposta 200

```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Plataforma contábil integrada",
      "alt_text": "Tela da plataforma contábil integrada",
      "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-1.webp",
      "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-1.webp",
      "ordem": 1,
      "ativo": true,
      "link_url": null,
      "abrir_em_nova_aba": false
    },
    {
      "id": 2,
      "titulo": "Inteligência para escritórios modernos",
      "alt_text": "Imagem institucional sobre inteligência para escritórios modernos",
      "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-2.webp",
      "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-2.webp",
      "ordem": 2,
      "ativo": true,
      "link_url": null,
      "abrir_em_nova_aba": false
    }
  ]
}
```

### Resposta se vazio

```json
{
  "data": []
}
```

Não retornar erro se não houver imagens.

---

## 2) GET administrativo — listar imagens para manutenção

### Endpoint

```http
GET /api/admin/home/carrossel
```

### Autenticação

Obrigatória:

```http
Authorization: Bearer {token}
```

Somente administrador.

### Query params

| Param | Tipo | Default | Observação |
|-------|------|---------|------------|
| `page` | integer | 1 | Paginação |
| `per_page` | integer | 10 | Máximo sugerido: 100 |
| `ativo` | boolean/null | null | Se enviado, filtra por ativo/inativo |
| `titulo` | string/null | null | Busca parcial por título |

### Resposta 200

```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Plataforma contábil integrada",
      "alt_text": "Tela da plataforma contábil integrada",
      "imagem_path": "home/carrossel/home-carrossel-1.webp",
      "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-1.webp",
      "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-1.webp",
      "ordem": 1,
      "ativo": true,
      "link_url": null,
      "abrir_em_nova_aba": false,
      "created_at": "2026-05-12T17:00:00.000000Z",
      "updated_at": "2026-05-12T17:00:00.000000Z"
    }
  ],
  "total": 1,
  "pagina": 1,
  "porPagina": 10
}
```

Usar o mesmo padrão de paginação que o backend já retorna em outras listagens do projeto (`total`, `pagina`, `porPagina`), para facilitar integração com os componentes já existentes no front.

### Erros

| HTTP | Quando |
|------|--------|
| 401 | Token ausente ou inválido |
| 403 | Usuário não é administrador |
| 422 | Query params inválidos |

---

## 3) GET administrativo por ID

### Endpoint

```http
GET /api/admin/home/carrossel/{id}
```

### Autenticação

Obrigatória. Somente administrador.

### Resposta 200

```json
{
  "id": 1,
  "titulo": "Plataforma contábil integrada",
  "alt_text": "Tela da plataforma contábil integrada",
  "imagem_path": "home/carrossel/home-carrossel-1.webp",
  "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-1.webp",
  "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-1.webp",
  "ordem": 1,
  "ativo": true,
  "link_url": null,
  "abrir_em_nova_aba": false,
  "created_at": "2026-05-12T17:00:00.000000Z",
  "updated_at": "2026-05-12T17:00:00.000000Z"
}
```

### Erros

| HTTP | Quando |
|------|--------|
| 401 | Token ausente ou inválido |
| 403 | Usuário não é administrador |
| 404 | Imagem não encontrada |

---

## 4) POST administrativo — cadastrar imagem

### Endpoint

```http
POST /api/admin/home/carrossel
```

### Autenticação

Obrigatória. Somente administrador.

### Content-Type

```http
multipart/form-data
```

### Campos do body

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `titulo` | string | Sim | min 3, max 120 |
| `alt_text` | string | Não | max 160 |
| `imagem` | file | Sim | image, jpg/jpeg/png/webp, max 5120 KB |
| `ordem` | integer | Não | min 0 |
| `ativo` | boolean | Não | default true |
| `link_url` | string/url | Não | max 500, nullable |
| `abrir_em_nova_aba` | boolean | Não | default false |

### Exemplo multipart

```txt
titulo=Plataforma contábil integrada
alt_text=Tela da plataforma contábil integrada
imagem=(arquivo)
ordem=1
ativo=true
link_url=
abrir_em_nova_aba=false
```

### Resposta 201

```json
{
  "message": "Imagem do carrossel criada com sucesso.",
  "data": {
    "id": 1,
    "titulo": "Plataforma contábil integrada",
    "alt_text": "Tela da plataforma contábil integrada",
    "imagem_path": "home/carrossel/home-carrossel-uuid.webp",
    "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-uuid.webp",
    "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-uuid.webp",
    "ordem": 1,
    "ativo": true,
    "link_url": null,
    "abrir_em_nova_aba": false,
    "created_at": "2026-05-12T17:00:00.000000Z",
    "updated_at": "2026-05-12T17:00:00.000000Z"
  }
}
```

### Erros esperados

#### 401

```json
{
  "message": "Unauthenticated."
}
```

#### 403

```json
{
  "message": "Você não tem permissão para cadastrar imagens do carrossel."
}
```

#### 422

```json
{
  "message": "Dados inválidos.",
  "errors": {
    "titulo": ["O título é obrigatório."],
    "imagem": ["A imagem é obrigatória."]
  }
}
```

---

## 5) PUT administrativo — atualizar imagem

### Endpoint

```http
PUT /api/admin/home/carrossel/{id}
```

### Autenticação

Obrigatória. Somente administrador.

### Content-Type

Se atualizar apenas texto/status/ordem:

```http
application/json
```

Se substituir imagem:

```http
multipart/form-data
```

Observação para Laravel: se o backend tiver limitação com `PUT multipart/form-data`, aceitar também:

```http
POST /api/admin/home/carrossel/{id}
```

com campo:

```txt
_method=PUT
```

Mas o contrato principal deve ser `PUT`.

### Campos atualizáveis

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `titulo` | string | Sim | min 3, max 120 |
| `alt_text` | string/null | Não | max 160 |
| `imagem` | file | Não | image, jpg/jpeg/png/webp, max 5120 KB |
| `ordem` | integer | Não | min 0 |
| `ativo` | boolean | Não | true/false |
| `link_url` | string/url/null | Não | max 500 |
| `abrir_em_nova_aba` | boolean | Não | true/false |

### Body JSON sem troca de imagem

```json
{
  "titulo": "Inteligência para escritórios modernos",
  "alt_text": "Imagem sobre inteligência para escritórios modernos",
  "ordem": 2,
  "ativo": true,
  "link_url": null,
  "abrir_em_nova_aba": false
}
```

### Body multipart com troca de imagem

```txt
titulo=Inteligência para escritórios modernos
alt_text=Imagem sobre inteligência para escritórios modernos
imagem=(novo arquivo)
ordem=2
ativo=true
link_url=
abrir_em_nova_aba=false
```

### Resposta 200

```json
{
  "message": "Imagem do carrossel atualizada com sucesso.",
  "data": {
    "id": 1,
    "titulo": "Inteligência para escritórios modernos",
    "alt_text": "Imagem sobre inteligência para escritórios modernos",
    "imagem_path": "home/carrossel/home-carrossel-novo-uuid.webp",
    "imagem_url": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-novo-uuid.webp",
    "src": "http://127.0.0.1:8000/storage/home/carrossel/home-carrossel-novo-uuid.webp",
    "ordem": 2,
    "ativo": true,
    "link_url": null,
    "abrir_em_nova_aba": false,
    "created_at": "2026-05-12T17:00:00.000000Z",
    "updated_at": "2026-05-12T18:20:00.000000Z"
  }
}
```

### Regras importantes do PUT

- Se `imagem` vier no request, substituir o arquivo.
- Se `imagem` não vier no request, manter a imagem atual.
- Se `alt_text` vier vazio ou null, retornar `alt_text` como `titulo` na resposta ou deixar null, mas o front usará fallback para `titulo`.
- Se `ativo=false`, a imagem deve sumir do `GET /api/home/carrossel`, mas continuar aparecendo no `GET /api/admin/home/carrossel`.
- Se `ordem` for repetida entre vários registros, não precisa bloquear. Ordenar por `ordem ASC, id ASC`.

### Erros

| HTTP | Quando |
|------|--------|
| 401 | Token ausente/inválido |
| 403 | Usuário não é administrador |
| 404 | Imagem não encontrada |
| 422 | Dados inválidos |

---

## 6) DELETE administrativo — excluir imagem

### Endpoint

```http
DELETE /api/admin/home/carrossel/{id}
```

### Autenticação

Obrigatória. Somente administrador.

### Regra

Excluir a imagem do carrossel.

Recomendação:

- Usar soft delete no banco.
- Remover o arquivo físico do storage se a política do projeto permitir.
- Se usar soft delete e quiser preservar arquivo para auditoria, documentar essa escolha.

### Resposta 200

```json
{
  "message": "Imagem do carrossel excluída com sucesso."
}
```

Ou, se o padrão do backend for REST puro:

```http
204 No Content
```

Preferência para este projeto: retornar `200` com `message`, porque facilita feedback visual no painel administrativo.

### Erros

| HTTP | Quando |
|------|--------|
| 401 | Token ausente/inválido |
| 403 | Usuário não é administrador |
| 404 | Imagem não encontrada |

---

## Rotas sugeridas Laravel

```php
Route::get('/home/carrossel', [HomeCarrosselImagemController::class, 'indexPublic']);

Route::middleware(['auth:sanctum'])->prefix('admin/home/carrossel')->group(function () {
    Route::get('/', [HomeCarrosselImagemController::class, 'indexAdmin']);
    Route::get('/{id}', [HomeCarrosselImagemController::class, 'show']);
    Route::post('/', [HomeCarrosselImagemController::class, 'store']);
    Route::put('/{id}', [HomeCarrosselImagemController::class, 'update']);
    Route::post('/{id}', [HomeCarrosselImagemController::class, 'updateWithMethodSpoof'])->whereNumber('id');
    Route::delete('/{id}', [HomeCarrosselImagemController::class, 'destroy']);
});
```

Se não quiser criar `updateWithMethodSpoof`, apenas garantir que o frontend consiga enviar `PUT multipart/form-data`.

---

## Resource/Transformer recomendado

Criar um Resource para padronizar a resposta:

```php
class HomeCarrosselImagemResource extends JsonResource
{
    public function toArray($request): array
    {
        $url = $this->imagem_path
            ? Storage::disk('public')->url($this->imagem_path)
            : null;

        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'alt_text' => $this->alt_text ?: $this->titulo,
            'imagem_path' => $this->when($request->is('api/admin/*'), $this->imagem_path),
            'imagem_url' => $url,
            'src' => $url,
            'ordem' => $this->ordem,
            'ativo' => (bool) $this->ativo,
            'link_url' => $this->link_url,
            'abrir_em_nova_aba' => (bool) $this->abrir_em_nova_aba,
            'created_at' => $this->when($request->is('api/admin/*'), $this->created_at),
            'updated_at' => $this->when($request->is('api/admin/*'), $this->updated_at),
        ];
    }
}
```

Observação: `Storage::disk('public')->url(...)` deve retornar URL acessível pelo navegador.

---

## Regras de autorização

Criar uma verificação centralizada:

```php
private function ensureAdministrador(Request $request): void
{
    if (!$request->user() || $request->user()->tipo_usuario !== 'administrador') {
        abort(403, 'Você não tem permissão para gerenciar imagens do carrossel.');
    }
}
```

Ou usar Policy/Gate se o backend já tiver esse padrão.

---

## Validações sugeridas

### Store

```php
return [
    'titulo' => ['required', 'string', 'min:3', 'max:120'],
    'alt_text' => ['nullable', 'string', 'max:160'],
    'imagem' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
    'ordem' => ['nullable', 'integer', 'min:0'],
    'ativo' => ['nullable', 'boolean'],
    'link_url' => ['nullable', 'url', 'max:500'],
    'abrir_em_nova_aba' => ['nullable', 'boolean'],
];
```

### Update

```php
return [
    'titulo' => ['required', 'string', 'min:3', 'max:120'],
    'alt_text' => ['nullable', 'string', 'max:160'],
    'imagem' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
    'ordem' => ['nullable', 'integer', 'min:0'],
    'ativo' => ['nullable', 'boolean'],
    'link_url' => ['nullable', 'url', 'max:500'],
    'abrir_em_nova_aba' => ['nullable', 'boolean'],
];
```

---

## Integração esperada no front

Depois da API pronta, o front deve conseguir substituir:

```ts
const imagensCarrossel = [
  { src: '/logo.svg', titulo: 'Plataforma contábil integrada' },
  ...
];
```

por algo como:

```ts
type HomeCarrosselImagemDTO = {
  id: number;
  titulo: string;
  alt_text?: string | null;
  imagem_url?: string | null;
  src?: string | null;
  ordem: number;
  ativo: boolean;
  link_url?: string | null;
  abrir_em_nova_aba?: boolean;
};

const imagensCarrossel = ref<HomeCarrosselImagemDTO[]>([]);

const trilhaCarrossel = computed(() => [
  ...imagensCarrossel.value,
  ...imagensCarrossel.value
]);

async function carregarCarrosselHome() {
  const response = await api.get<{ data: HomeCarrosselImagemDTO[] }>('/home/carrossel');
  imagensCarrossel.value = response.data.data;
}
```

No template:

```vue
<div
  class="carrossel__item"
  v-for="(imagem, indice) in trilhaCarrossel"
  :key="`${imagem.id}-${indice}`"
>
  <img
    :src="imagem.src ?? imagem.imagem_url"
    :alt="imagem.alt_text ?? imagem.titulo"
  />
  <span>{{ imagem.titulo }}</span>
</div>
```

---

## Requisitos para a área administrativa do front

O backend deve permitir que futuramente o front admin implemente uma tela com:

1. Listagem das imagens cadastradas.
2. Preview da imagem.
3. Botão “Cadastrar imagem”.
4. Botão “Editar”.
5. Botão “Excluir”.
6. Campo de status `ativo/inativo`.
7. Campo `ordem` para organizar exibição.
8. Upload de nova imagem na criação.
9. Upload opcional de nova imagem na edição.
10. Mensagens de validação por campo seguindo o formato:

```json
{
  "message": "Dados inválidos.",
  "errors": {
    "titulo": ["O título é obrigatório."],
    "imagem": ["A imagem deve ser JPG, PNG ou WEBP."]
  }
}
```

---

## Critérios de aceite

A API será considerada pronta quando:

1. `GET /api/home/carrossel` retornar somente imagens ativas e ordenadas.
2. `GET /api/home/carrossel` funcionar sem autenticação.
3. `GET /api/admin/home/carrossel` exigir administrador autenticado.
4. `POST /api/admin/home/carrossel` criar registro e salvar arquivo em storage público.
5. `PUT /api/admin/home/carrossel/{id}` atualizar dados sem exigir novo upload.
6. `PUT /api/admin/home/carrossel/{id}` substituir imagem quando o campo `imagem` for enviado.
7. `DELETE /api/admin/home/carrossel/{id}` excluir o registro e tratar o arquivo conforme política definida.
8. Todos os endpoints administrativos retornarem `401` para não autenticado e `403` para usuário não administrador.
9. Todas as validações retornarem `422` no formato `{ message, errors }`.
10. A resposta conter `imagem_url` e preferencialmente também `src`.
11. O frontend conseguir montar diretamente o carrossel com `titulo`, `alt_text` e `src/imagem_url`.

---

## Seed opcional para desenvolvimento

Criar seeder com imagens de exemplo apenas em ambiente local/dev.

Exemplo de registros:

```php
[
    [
        'titulo' => 'Plataforma contábil integrada',
        'alt_text' => 'Imagem representando plataforma contábil integrada',
        'imagem_path' => 'home/carrossel/demo-1.webp',
        'ordem' => 1,
        'ativo' => true,
    ],
    [
        'titulo' => 'Inteligência para escritórios modernos',
        'alt_text' => 'Imagem representando inteligência para escritórios modernos',
        'imagem_path' => 'home/carrossel/demo-2.webp',
        'ordem' => 2,
        'ativo' => true,
    ],
]
```

---

## Observações finais

- Não salvar caminho absoluto do servidor no banco. Salvar apenas `imagem_path`.
- Não expor `storage/app/...` diretamente. Retornar URL pública via `Storage::disk('public')->url(...)`.
- Não aceitar arquivos acima de 5MB.
- Não confiar no nome original do arquivo.
- Não permitir gerenciamento sem usuário administrador.
- Manter o padrão de resposta e paginação já usado no restante do backend para reduzir adaptação no front.
- Garantir que o `GET` público seja rápido. Pode usar cache se necessário, invalidando no `POST`, `PUT` e `DELETE`.
