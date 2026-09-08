# Prompt para o Backend Laravel — Grupos, Menus e Permissões (ACL)

> **Projeto:** `agenda-service` (API Laravel) consumida pelo front `agenda-front` (Vue 3).  
> **Base URL atual:** `{VITE_API_BASE_URL}` → ex.: `http://127.0.0.1:8000/api`  
> **Auth:** Laravel Sanctum — header `Authorization: Bearer {token}`  
> **Objetivo deste documento:** instruir o backend a criar migrations, seeders, models, policies/middleware e rotas REST para menus dinâmicos + grupos de acesso com flags `SELECT/VIEW`, `INSERT`, `UPDATE` e `DELETE`.

Use este arquivo como **especificação funcional + contrato de API**. Implemente exatamente os endpoints, payloads e regras abaixo para o frontend conseguir integrar sem ambiguidade.

---

## 1. Contexto e problema

Hoje o frontend controla menus de forma **hardcoded** com base em:

| Campo | Valores |
|-------|---------|
| `tipo_usuario` | `administrador` \| `cliente` |
| `perfil_administrador` | `contabilidade` \| `prefeitura` \| `null` (cliente) |

Não existem tabelas/APIs de menu, grupo ou permissão. Precisamos migrar para:

1. **Catálogo de menus no banco** (módulos + opções + rotas Vue).
2. **Grupos de acesso** gerenciados apenas pelo master.
3. **Permissões por opção** com flags explícitas: `pode_visualizar` (SELECT/VIEW), `pode_inserir`, `pode_atualizar`, `pode_excluir`.
4. **Menu dinâmico no login** (ou endpoint dedicado) para o usuário autenticado.

---

## 2. Regras de negócio (fechadas — não alterar)

### 2.1 Master (gestor)

- **Quem é:** `tipo_usuario = administrador` **E** `perfil_administrador = contabilidade`.
- **Pode:** CRUD de grupos, membros, permissões; gerenciar administradores; ver **todo** o menu admin (incluindo itens fora do catálogo atribuível).
- **Não aparece** no seletor de membros de grupo.
- **Bypass de ACL:** ignora grupos; sempre tem acesso total às rotas admin (exceto regras de negócio específicas que já existirem).

### 2.2 Membros elegíveis de grupo

Podem ser associados a um grupo **somente**:

1. `tipo_usuario = cliente` (com `perfil_administrador = null`), **ou**
2. `tipo_usuario = administrador` **E** `perfil_administrador = prefeitura`.

**Proibido** em grupo:

- Qualquer `administrador` + `contabilidade`.

### 2.3 Cardinalidade

- Um usuário pode estar em **no máximo 1 grupo** (`usuario.grupo_id` único ou unique em `grupo_membro.usuario_id`).
- Se tentar vincular usuário já em outro grupo → `422` com mensagem clara.

### 2.4 Cliente e rotas `/admin/*`

- **Cliente NUNCA recebe opções cujo `escopo = admin` ou path começando com `/admin`.**
- Ao atribuir permissões a um grupo, se o grupo tiver **qualquer membro cliente**, o backend deve:
  - **ou** rejeitar permissões de escopo `admin` com `422`,
  - **ou** (preferido) permitir o save do grupo, mas na **resolução do menu do cliente** filtrar e **nunca** devolver itens `escopo = admin`.
- Recomendação forte: **na atribuição**, se o grupo contém cliente, bloquear opções `escopo = admin`. Se o grupo contém só prefeitura, permitir opções `escopo = admin` (atribuíveis).

### 2.5 Prefeitura sem grupo

- Admin `prefeitura` **sem grupo** → menu autenticado **vazio** (não herda mais o menu antigo fixo).
- Só vê o que o master atribuir via grupo.
- Destino pós-login: primeira opção `pode_visualizar = true` do menu resolvido; se vazio → rota segura de “sem acesso” ou perfil (definir no front; backend pode retornar `menu: []` e `destino_sugerido: null`).

### 2.6 Cliente sem grupo

- Cliente **sem grupo** → recebe o **menu padrão do cliente** (seed fixo, ver seção 5.2).
- Cliente **com grupo** → recebe **somente** as opções do grupo com `pode_visualizar = true` (escopo `cliente` apenas).

### 2.7 Visitante (não autenticado)

- Menu público permanece **fixo no frontend** (não depende de API para renderizar navbar pública).
- Ainda assim, o backend deve **seedar** as opções públicas no catálogo (`escopo = publico`) para inventário/auditoria e eventual uso futuro.
- Endpoint público opcional: `GET /menu/publico` (sem auth).

### 2.8 Flags de permissão

Presença no grupo **não** implica visualizar. É obrigatório:

| Flag | Significado no front |
|------|----------------------|
| `pode_visualizar` | Mostra item no menu e permite acessar a rota de listagem/detalhe |
| `pode_inserir` | Mostra botões “Novo/Cadastrar” e permite POST |
| `pode_atualizar` | Mostra “Editar” e permite PUT/PATCH |
| `pode_excluir` | Mostra “Excluir” e permite DELETE |

Regras de consistência:

- Se `pode_inserir|pode_atualizar|pode_excluir = true`, então `pode_visualizar` **deve** ser `true` (normalizar no save).
- Middleware/Policy nas rotas de recurso Laravel deve checar a flag correspondente (não confiar só no front).

### 2.9 Itens fora do catálogo atribuível (só contabilidade)

Estas opções existem no sistema, mas **NÃO** entram no seletor de permissões de grupo:

| Código | Label | Rota Vue |
|--------|-------|----------|
| `admin.administradores` | Administradores | `AdministradorUsuarios` |
| `admin.grupos` | Grupos de acesso | `AdministradorGrupos` (rota nova no front; backend já deve prever) |

Campo no catálogo: `atribuivel = false`.

---

## 3. Modelo de dados sugerido

> Nomes podem ser ajustados ao padrão do projeto (snake_case Oracle/MySQL), mas os campos conceituais são obrigatórios.

### 3.1 `menu_modulos`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | PK | |
| `codigo` | string unique | Ex.: `gestao`, `blog`, `clientes`, `conta_admin`, `portal_cliente`, `publico_conteudo` |
| `label` | string | Texto no menu (ex.: “Gestão”) |
| `icone` | string nullable | Opcional (ex.: remix icon name) |
| `ordem` | int | Ordenação |
| `escopo` | enum/string | `publico` \| `cliente` \| `admin` |
| `ativo` | boolean | default true |
| `created_at` / `updated_at` | timestamps | |

### 3.2 `menu_opcoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | PK | |
| `menu_modulo_id` | FK | |
| `codigo` | string unique | Ex.: `admin.servicos` |
| `label` | string | Ex.: “Serviços” |
| `rota_nome` | string | **Nome da rota Vue** (ex.: `AdministradorServicos`) — chave principal do front |
| `path` | string | Path SPA (ex.: `/admin/servicos`) |
| `rota_nome_cadastro` | string nullable | Ex.: `AdministradorServicoCadastro` |
| `path_cadastro` | string nullable | Ex.: `/admin/servicos/nova` |
| `rota_nome_editar` | string nullable | Ex.: `AdministradorServicoEditar` |
| `path_editar` | string nullable | Ex.: `/admin/servicos/:id/editar` |
| `ordem` | int | |
| `escopo` | `publico` \| `cliente` \| `admin` | Deve bater com o módulo |
| `atribuivel` | boolean | `false` = só master vê / não vai para grupo |
| `suporta_inserir` | boolean | Se a funcionalidade tem ação INSERT |
| `suporta_atualizar` | boolean | Se tem UPDATE |
| `suporta_excluir` | boolean | Se tem DELETE |
| `ativo` | boolean | |
| `created_at` / `updated_at` | | |

**Importante:** rotas filhas de CRUD (nova/editar) **não** precisam ser linhas separadas no menu. Elas ficam nas colunas `rota_nome_cadastro` / `rota_nome_editar` da opção pai. O front usa as flags I/U/D para liberar navegação a essas rotas.

### 3.3 `grupos_acesso`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | PK | |
| `nome` | string | |
| `descricao` | text nullable | |
| `ativo` | boolean | default true |
| `created_at` / `updated_at` | | |
| `created_by` | FK usuario nullable | Auditoria |

### 3.4 `grupo_membros`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | PK | |
| `grupo_id` | FK | |
| `usuario_id` | FK unique | **Um usuário = no máximo um grupo** |
| `created_at` / `updated_at` | | |

Constraint/validação: usuário elegível (cliente ou admin prefeitura).

### 3.5 `grupo_permissoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | PK | |
| `grupo_id` | FK | |
| `menu_opcao_id` | FK | |
| `pode_visualizar` | boolean | **obrigatório explícito** |
| `pode_inserir` | boolean | |
| `pode_atualizar` | boolean | |
| `pode_excluir` | boolean | |
| unique(`grupo_id`, `menu_opcao_id`) | | |

Validar:

- `menu_opcao.atribuivel = true`
- Flags I/U/D só podem ser `true` se `suporta_*` da opção for `true`
- Se I/U/D true → forçar `pode_visualizar = true`

### 3.6 Alternativa na tabela `usuarios`

Em vez de só `grupo_membros`, pode existir `usuarios.grupo_acesso_id` nullable. Se usar as duas, manter sincronizadas. Preferência: tabela pivô `grupo_membros` + unique em `usuario_id`.

---

## 4. Escopos e resolução de menu (algoritmo obrigatório)

```
function resolverMenu(usuario):
  se usuario.tipo_usuario == administrador AND usuario.perfil_administrador == contabilidade:
      retornar todas menu_opcoes ativas com escopo=admin
           (incluindo atribuivel=false)
           com todas flags true (respeitando suporta_*)
      + destino_sugerido = AdministradorPainel

  se usuario tem grupo ativo:
      permissoes = grupo_permissoes do grupo onde pode_visualizar=true
      se usuario.tipo_usuario == cliente:
          filtrar escopo == cliente
      se usuario é admin prefeitura:
          filtrar escopo == admin
      agrupar por modulo, ordenar
      destino_sugerido = primeira opcao (ordem modulo + ordem opcao)
      retornar

  se usuario.tipo_usuario == cliente AND sem grupo:
      retornar seed padrão portal_cliente (todas opções cliente ativas com visualizar=true;
           inserir/atualizar/excluir conforme seed padrão — tipicamente false,
           exceto se a tela cliente tiver ações próprias no futuro)
      destino_sugerido = ClienteProtocolos

  se usuario é admin prefeitura AND sem grupo:
      retornar menu vazio
      destino_sugerido = null

  senão:
      retornar menu vazio
```

---

## 5. Seed obrigatório — inventário completo do frontend atual

> **Códigos (`codigo`) e `rota_nome` são contratos.** Não renomear sem alinhar com o front.

### 5.1 Escopo `publico` (navbar visitante — fixa no front; seedar mesmo assim)

#### Módulo `publico_raiz` — label: _(raiz, sem submenu)_ — ordem 1

| codigo | label | rota_nome | path | I/U/D | atribuivel |
|--------|-------|-----------|------|-------|------------|
| `publico.home` | Home | `Home` | `/` | F/F/F | false* |
| `publico.servicos` | Serviços | `Servico` | `/servico` | F/F/F | false* |
| `publico.contato` | Contato | `Contato` | `/contato` | F/F/F | false* |

\*Itens públicos não entram no seletor de grupos (`atribuivel = false`). Escopo público não é atribuído a grupos.

#### Módulo `publico_conteudo` — label: `Conteúdo` — ordem 2

| codigo | label | rota_nome | path |
|--------|-------|-----------|------|
| `publico.aviso` | Aviso | `Aviso` | `/aviso` |
| `publico.blog` | Blog | `Blog` | `/blog` |

#### Módulo `publico_apis` — label: `APIs` — ordem 3

| codigo | label | rota_nome | path |
|--------|-------|-----------|------|
| `publico.bpe` | BPe | `BpeDocumentacao` | `/bpe` |
| `publico.protocolo_docs` | Protocolo | `ProtocoloDocumentacao` | `/protocolo/documentacao-api` |

#### Módulo `publico_acesso` — label: `Acesso` — ordem 4

| codigo | label | rota_nome | path |
|--------|-------|-----------|------|
| `publico.login` | Login | `Login` | `/login` |
| `publico.cadastro` | Cadastro | `Cadastro` | `/cadastro` |

Rotas públicas auxiliares (não estão na navbar, mas existem no SPA — seed opcional como `atribuivel=false`, `ativo=true`, sem módulo de menu ou módulo `publico_outros`):

| codigo | label | rota_nome | path |
|--------|-------|-----------|------|
| `publico.recuperar_senha` | Recuperar senha | `RecuperarSenha` | `/recuperar-senha` |
| `publico.redefinir_senha` | Redefinir senha | `RedefinirSenha` | `/redefinir-senha` |
| `publico.blog_detalhe` | Blog detalhe | `BlogDetalhe` | `/blog/:id` |
| `publico.protocolo_assinar` | Assinar protocolo | `ProtocoloAssinar` | `/protocolo/assinar/:token` |
| `publico.participacao_consulta` | Consultar participação | `ParticipacaoConsulta` | `/participacao/consulta` |
| `publico.participacao_popular` | Participação (sem município) | `ParticipacaoPopular` | `/participacao-popular` |
| `publico.participacao_form` | Formulário participação | `ParticipacaoFormulario` | `/participacao/:municipioToken` |

---

### 5.2 Escopo `cliente` — menu padrão sem grupo

#### Módulo `portal_cliente` — label: _(raiz)_ — ordem 1

| codigo | label | rota_nome | path | visualizar padrão | I | U | D | atribuivel | notas |
|--------|-------|-----------|------|-------------------|---|---|---|------------|-------|
| `cliente.protocolos` | Protocolos | `ClienteProtocolos` | `/cliente/protocolos` | true | F | F | F | true | listagem do portal |

#### Módulo `cliente_conta` — label: `Conta` — ordem 2

| codigo | label | rota_nome | path | I | U | D | atribuivel |
|--------|-------|-----------|------|---|---|---|------------|
| `cliente.perfil` | Perfil | `ClientePerfil` | `/cliente/perfil` | F | T* | F | true |
| `cliente.chaves` | Chaves | `ClienteChaves` | `/cliente/chaves` | T* | F | F | true |
| `cliente.empresas` | Empresas | `ClienteEmpresas` | `/cliente/empresas` | F | T* | F | true |

\*No portal do cliente, “atualizar” costuma significar editar próprio perfil / gerenciar vínculos. Marque `suporta_atualizar` / `suporta_inserir` conforme a API real de cada tela. No seed padrão **sem grupo**, liberar `pode_visualizar=true` e as flags que o comportamento atual do portal já permite (perfil edita dados → `pode_atualizar=true` no default).

Redirect existente: `/cliente` → `ClienteProtocolos` (`AreaCliente`). Não precisa de opção de menu.

---

### 5.3 Escopo `admin` — opções atribuíveis a grupos (prefeitura)

#### Módulo `admin_painel` — label: _(raiz)_ — ordem 1

| codigo | label | rota_nome | path | cadastro | editar | I | U | D | atribuivel |
|--------|-------|-----------|------|----------|--------|---|---|---|------------|
| `admin.painel` | Painel | `AdministradorPainel` | `/admin` | — | — | F | F | F | true |

#### Módulo `admin_gestao` — label: `Gestão` — ordem 2

| codigo | label | rota_nome | path | rota_cadastro / path | rota_editar / path | I | U | D | atribuivel |
|--------|-------|-----------|------|----------------------|--------------------|---|---|---|------------|
| `admin.servicos` | Serviços | `AdministradorServicos` | `/admin/servicos` | `AdministradorServicoCadastro` `/admin/servicos/nova` | `AdministradorServicoEditar` `/admin/servicos/:id/editar` | T | T | T | true |
| `admin.protocolos` | Protocolos | `AdministradorProtocolos` | `/admin/protocolos` | `AdministradorProtocoloCadastro` `/admin/protocolos/novo` | `AdministradorProtocoloEditar` `/admin/protocolos/:id/editar` | T | T | T | true |
| `admin.avisos` | Avisos | `AdministradorAvisos` | `/admin/avisos` | `AdministradorAvisoCadastro` `/admin/avisos/novo` | `AdministradorAvisoEditar` `/admin/avisos/:id/editar` | T | T | T | true |
| `admin.home_carrossel` | Carrossel da Home | `AdministradorHomeCarrossel` | `/admin/home-carrossel` | `AdministradorHomeCarrosselCadastro` `/admin/home-carrossel/novo` | `AdministradorHomeCarrosselEditar` `/admin/home-carrossel/:id/editar` | T | T | T | true |
| `admin.participacao` | Participação popular | `AdministradorParticipacao` | `/admin/participacao-popular` | — | detalhe: `AdministradorParticipacaoDetalhe` `/admin/participacao-popular/:id` | F | T | F | true |

> Para participação: `pode_atualizar` = analisar/salvar análise. Guardar `rota_nome_editar = AdministradorParticipacaoDetalhe` (é detalhe, não formulário “editar” clássico).

| codigo | label | rota_nome | path | I | U | D | atribuivel | notas |
|--------|-------|-----------|------|---|---|---|------------|-------|
| `admin.participacao_link` | Link do formulário | `AdministradorParticipacaoLink` | `/admin/participacao-popular/link` | F | F | F | true | hoje era exclusivo prefeitura; agora via grupo |

#### Módulo `admin_blog` — label: `Blog` — ordem 3

| codigo | label | rota_nome | path | cadastro | editar | I | U | D |
|--------|-------|-----------|------|----------|--------|---|---|---|
| `admin.blog_categorias` | Categorias | `BlogCategorias` | `/blog/categorias` | `BlogCategoriaCadastro` `/blog/categorias/nova` | `BlogCategoriaEditar` `/blog/categorias/:id/editar` | T | T | T |
| `admin.blog_postagens` | Postagens | `BlogPostagem` | `/blog/postagem` | `BlogPostagemCadastro` `/blog/postagem/nova` | `BlogPostagemEditar` `/blog/postagem/:id/editar` | T | T | T |

#### Módulo `admin_clientes` — label: `Clientes` — ordem 4

| codigo | label | rota_nome | path | editar | I | U | D | notas |
|--------|-------|-----------|------|--------|---|---|---|-------|
| `admin.clientes_pf` | Pessoa física | `AdministradorClientesPessoaFisica` | `/admin/clientes/pessoa-fisica` | `AdministradorClienteFisicaEditar` `/admin/clientes/pessoa-fisica/:id/edit` | F | T | F | |
| `admin.empresas` | Pessoa jurídica | `AdministradorEmpresas` | `/admin/empresas` | `AdministradorEmpresaEditar` `/admin/empresas/:id/edit` | T* | T | F | *criar empresa se API permitir |
| `admin.vinculacoes` | Vinculações | `AdministradorVinculacoes` | `/admin/vinculacoes` | — | T* | T* | F | *criar vínculo admin; aprovar/rejeitar = update |

#### Módulo `admin_conta` — label: `Conta` — ordem 5

| codigo | label | rota_nome | path | I | U | D |
|--------|-------|-----------|------|---|---|---|
| `admin.perfil` | Perfil | `AdministradorPerfil` | `/admin/perfil` | F | T | F |
| `admin.chaves` | Chaves | `AdministradorChaves` | `/admin/chaves` | T | F | F |

---

### 5.4 Escopo `admin` — NÃO atribuíveis (só contabilidade)

| codigo | label | rota_nome | path | atribuivel |
|--------|-------|-----------|------|------------|
| `admin.administradores` | Administradores | `AdministradorUsuarios` | `/admin/administradores` | **false** |
| `admin.grupos` | Grupos de acesso | `AdministradorGrupos` | `/admin/grupos` | **false** |
| `admin.grupos_form` (opcional) | Novo/editar grupo | `AdministradorGrupoCadastro` / `AdministradorGrupoEditar` | `/admin/grupos/nova`, `/admin/grupos/:id/editar` | **false** |

Master sempre recebe esses itens no menu resolvido.

---

## 6. Endpoints — contrato completo

Convenções:

- Prefixo: `/api`
- JSON UTF-8
- Auth: `Authorization: Bearer {token}` salvo quando indicado
- Erros no padrão Laravel: `{ "message": "...", "errors": { "campo": ["..."] } }`
- Datas ISO 8601
- Booleanos JSON `true/false`

---

### 6.1 Obter menu da sessão (obrigatório)

O front chamará isso **após login** e também ao **restaurar sessão** (`main.ts`).

#### `GET /api/auth/menu`

- Auth: **sim**
- Quem: qualquer autenticado

**Exemplo de chamada (Axios / front):**

```http
GET /api/auth/menu HTTP/1.1
Host: 127.0.0.1:8000
Authorization: Bearer 1|xxxxxxxxxxxxxxxx
Accept: application/json
```

```ts
// agenda-front — exemplo de uso
await api.get('/auth/menu')
```

**Resposta 200 esperada:**

```json
{
  "destino_sugerido": {
    "rota_nome": "ClienteProtocolos",
    "path": "/cliente/protocolos"
  },
  "grupo": {
    "id": 3,
    "nome": "Clientes padrão plus"
  },
  "eh_master": false,
  "modulos": [
    {
      "codigo": "portal_cliente",
      "label": null,
      "ordem": 1,
      "escopo": "cliente",
      "opcoes": [
        {
          "id": 20,
          "codigo": "cliente.protocolos",
          "label": "Protocolos",
          "rota_nome": "ClienteProtocolos",
          "path": "/cliente/protocolos",
          "rota_nome_cadastro": null,
          "path_cadastro": null,
          "rota_nome_editar": null,
          "path_editar": null,
          "ordem": 1,
          "pode_visualizar": true,
          "pode_inserir": false,
          "pode_atualizar": false,
          "pode_excluir": false
        }
      ]
    },
    {
      "codigo": "cliente_conta",
      "label": "Conta",
      "ordem": 2,
      "escopo": "cliente",
      "opcoes": [
        {
          "id": 21,
          "codigo": "cliente.perfil",
          "label": "Perfil",
          "rota_nome": "ClientePerfil",
          "path": "/cliente/perfil",
          "rota_nome_cadastro": null,
          "path_cadastro": null,
          "rota_nome_editar": null,
          "path_editar": null,
          "ordem": 1,
          "pode_visualizar": true,
          "pode_inserir": false,
          "pode_atualizar": true,
          "pode_excluir": false
        }
      ]
    }
  ]
}
```

**Casos especiais:**

| Usuário | `grupo` | `modulos` | `destino_sugerido` | `eh_master` |
|---------|---------|-----------|--------------------|-------------|
| Contabilidade | `null` | todos admin (incl. não atribuíveis) | Painel | `true` |
| Cliente sem grupo | `null` | menu padrão cliente | Protocolos | `false` |
| Cliente com grupo | objeto | só permissões do grupo (escopo cliente) | 1ª opção | `false` |
| Prefeitura sem grupo | `null` | `[]` | `null` | `false` |
| Prefeitura com grupo | objeto | permissões admin do grupo | 1ª opção | `false` |

**Resposta 401:** token inválido/ausente.

---

### 6.2 Enriquecer login (recomendado)

#### `POST /api/auth/login` — manter contrato atual e **adicionar** campos

Request atual (não quebrar):

```json
{
  "cpf": "00000000000",
  "senha": "secret123"
}
```

Resposta atual + extensão:

```json
{
  "token": "1|xxxx",
  "token_type": "Bearer",
  "expires_in": 3600,
  "usuario": {
    "id": 10,
    "pessoa_id": 55,
    "tipo_usuario": "cliente",
    "perfil_administrador": null,
    "grupo_id": 3
  },
  "menu": {
    "destino_sugerido": { "rota_nome": "ClienteProtocolos", "path": "/cliente/protocolos" },
    "grupo": { "id": 3, "nome": "Clientes padrão plus" },
    "eh_master": false,
    "modulos": []
  }
}
```

> Se preferir não inchir o login, o front fará `GET /auth/menu` em seguida. **Implemente pelo menos o GET.** Se incluir `menu` no login, use o **mesmo shape** do GET.

**Exemplo de chamada front:**

```ts
await api.post('/auth/login', { cpf, senha }, { skipAuth: true })
// depois:
await api.get('/auth/menu')
```

---

### 6.3 Catálogo de menus (para tela de grupos — master)

#### `GET /api/menu/catalogo`

- Auth: **sim**
- Quem: **somente** contabilidade (`403` para demais)

Query opcional:

- `atribuivel=1` → só opções que podem ir para grupo (exclui Administradores/Grupos e públicos)

**Chamada:**

```http
GET /api/menu/catalogo?atribuivel=1 HTTP/1.1
Authorization: Bearer 1|master-token
Accept: application/json
```

```ts
await api.get('/menu/catalogo', { params: { atribuivel: 1 } })
```

**Resposta 200:**

```json
{
  "data": [
    {
      "id": 2,
      "codigo": "admin_gestao",
      "label": "Gestão",
      "ordem": 2,
      "escopo": "admin",
      "opcoes": [
        {
          "id": 30,
          "codigo": "admin.servicos",
          "label": "Serviços",
          "rota_nome": "AdministradorServicos",
          "path": "/admin/servicos",
          "escopo": "admin",
          "atribuivel": true,
          "suporta_inserir": true,
          "suporta_atualizar": true,
          "suporta_excluir": true,
          "ordem": 1
        },
        {
          "id": 31,
          "codigo": "admin.protocolos",
          "label": "Protocolos",
          "rota_nome": "AdministradorProtocolos",
          "path": "/admin/protocolos",
          "escopo": "admin",
          "atribuivel": true,
          "suporta_inserir": true,
          "suporta_atualizar": true,
          "suporta_excluir": true,
          "ordem": 2
        }
      ]
    },
    {
      "id": 10,
      "codigo": "portal_cliente",
      "label": null,
      "ordem": 1,
      "escopo": "cliente",
      "opcoes": [
        {
          "id": 20,
          "codigo": "cliente.protocolos",
          "label": "Protocolos",
          "rota_nome": "ClienteProtocolos",
          "path": "/cliente/protocolos",
          "escopo": "cliente",
          "atribuivel": true,
          "suporta_inserir": false,
          "suporta_atualizar": false,
          "suporta_excluir": false,
          "ordem": 1
        }
      ]
    }
  ]
}
```

---

### 6.4 Menu público (opcional)

#### `GET /api/menu/publico`

- Auth: **não**
- Retorna módulos `escopo=publico` ativos

```ts
await api.get('/menu/publico', { skipAuth: true })
```

---

### 6.5 CRUD de grupos (somente contabilidade)

Base: `/api/grupos`

#### `GET /api/grupos`

Lista paginada.

```http
GET /api/grupos?page=1&per_page=15 HTTP/1.1
Authorization: Bearer 1|master-token
```

```ts
await api.get('/grupos', { params: { page: 1, per_page: 15 } })
```

**Resposta 200:**

```json
{
  "data": [
    {
      "id": 1,
      "nome": "Prefeitura — Participação",
      "descricao": "Acesso só a participação e perfil",
      "ativo": true,
      "total_membros": 4,
      "total_permissoes": 3,
      "created_at": "2026-07-22T12:00:00.000000Z",
      "updated_at": "2026-07-22T12:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 1,
    "last_page": 1
  }
}
```

#### `POST /api/grupos`

```ts
await api.post('/grupos', {
  nome: 'Prefeitura — Participação',
  descricao: 'Acesso só a participação e perfil',
  ativo: true
})
```

**Body:**

```json
{
  "nome": "Prefeitura — Participação",
  "descricao": "Acesso só a participação e perfil",
  "ativo": true
}
```

**Resposta 201:**

```json
{
  "data": {
    "id": 1,
    "nome": "Prefeitura — Participação",
    "descricao": "Acesso só a participação e perfil",
    "ativo": true,
    "created_at": "2026-07-22T12:00:00.000000Z",
    "updated_at": "2026-07-22T12:00:00.000000Z"
  }
}
```

#### `GET /api/grupos/{id}`

Detalhe completo (membros + permissões).

```ts
await api.get(`/grupos/${id}`)
```

**Resposta 200:**

```json
{
  "data": {
    "id": 1,
    "nome": "Prefeitura — Participação",
    "descricao": "Acesso só a participação e perfil",
    "ativo": true,
    "membros": [
      {
        "usuario_id": 88,
        "pessoa_id": 120,
        "nome": "Maria Prefeitura",
        "cpf": "12345678901",
        "email": "maria@pref.gov.br",
        "tipo_usuario": "administrador",
        "perfil_administrador": "prefeitura"
      }
    ],
    "permissoes": [
      {
        "menu_opcao_id": 40,
        "codigo": "admin.participacao",
        "label": "Participação popular",
        "escopo": "admin",
        "pode_visualizar": true,
        "pode_inserir": false,
        "pode_atualizar": true,
        "pode_excluir": false
      },
      {
        "menu_opcao_id": 41,
        "codigo": "admin.participacao_link",
        "label": "Link do formulário",
        "escopo": "admin",
        "pode_visualizar": true,
        "pode_inserir": false,
        "pode_atualizar": false,
        "pode_excluir": false
      },
      {
        "menu_opcao_id": 50,
        "codigo": "admin.perfil",
        "label": "Perfil",
        "escopo": "admin",
        "pode_visualizar": true,
        "pode_inserir": false,
        "pode_atualizar": true,
        "pode_excluir": false
      }
    ]
  }
}
```

#### `PUT /api/grupos/{id}`

```ts
await api.put(`/grupos/${id}`, {
  nome: 'Prefeitura — Participação v2',
  descricao: 'Atualizado',
  ativo: true
})
```

#### `DELETE /api/grupos/{id}`

- Soft delete **ou** hard delete.
- Se houver membros: preferir `422` pedindo remoção dos membros, **ou** desvincular todos e apagar (documentar a escolha). Recomendação: **bloquear** se `total_membros > 0`.

```ts
await api.delete(`/grupos/${id}`)
```

**422 exemplo:**

```json
{
  "message": "Não é possível excluir o grupo enquanto houver membros vinculados."
}
```

---

### 6.6 Substituir permissões do grupo

#### `PUT /api/grupos/{id}/permissoes`

Substituição total (sync): envia a lista completa; o backend remove as que não vierem e upserta as enviadas.

```ts
await api.put(`/grupos/${id}/permissoes`, {
  permissoes: [
    {
      menu_opcao_id: 40,
      pode_visualizar: true,
      pode_inserir: false,
      pode_atualizar: true,
      pode_excluir: false
    },
    {
      menu_opcao_id: 41,
      pode_visualizar: true,
      pode_inserir: false,
      pode_atualizar: false,
      pode_excluir: false
    }
  ]
})
```

**Validações 422:**

- `menu_opcao_id` inexistente / inativo / `atribuivel=false`
- Flag true em ação não suportada (`suporta_excluir=false` e `pode_excluir=true`)
- Mistura inválida cliente+admin: se o grupo já tem membro `cliente`, rejeitar opções `escopo=admin`
- Se o grupo já tem membro `prefeitura`, rejeitar opções `escopo=cliente` (**recomendado**: um grupo = um escopo homogêneo)

**Regra recomendada de homogeneidade do grupo:**

- Na primeira permissão/membro, “trava” o escopo do grupo (`cliente` **ou** `admin`).
- Campo opcional `grupos_acesso.escopo` preenchido automaticamente.

**Resposta 200:** mesmo shape de `permissoes` do GET detalhe.

---

### 6.7 Membros do grupo

#### `GET /api/grupos/{id}/membros`

```ts
await api.get(`/grupos/${id}/membros`)
```

#### `POST /api/grupos/{id}/membros`

```ts
await api.post(`/grupos/${id}/membros`, {
  usuario_ids: [88, 91, 102]
})
```

**Body:**

```json
{
  "usuario_ids": [88, 91, 102]
}
```

**Validações:**

- Cada usuário deve ser elegível (cliente **ou** admin prefeitura).
- Nenhum pode ser contabilidade → `422`
- Nenhum pode já pertencer a outro grupo → `422`
- Se o grupo tem `escopo=admin`, só aceitar prefeitura; se `escopo=cliente`, só clientes
- Se grupo ainda sem escopo, inferir pelo primeiro membro/permissão

**Resposta 200/201:**

```json
{
  "data": [
    {
      "usuario_id": 88,
      "pessoa_id": 120,
      "nome": "Maria Prefeitura",
      "tipo_usuario": "administrador",
      "perfil_administrador": "prefeitura"
    }
  ]
}
```

#### `DELETE /api/grupos/{id}/membros/{usuarioId}`

```ts
await api.delete(`/grupos/${grupoId}/membros/${usuarioId}`)
```

**Resposta 204** (sem body) ou `{ "message": "Membro removido." }`.

---

### 6.8 Seletor de usuários elegíveis (master)

#### `GET /api/grupos/usuarios-elegiveis`

- Auth: contabilidade
- **Nunca** retornar usuários `perfil_administrador = contabilidade`
- Query:

| Param | Descrição |
|-------|-----------|
| `q` | busca nome/cpf/email |
| `tipo` | `cliente` \| `prefeitura` \| `todos` (default) |
| `somente_sem_grupo` | `1` (default) \| `0` |
| `page`, `per_page` | paginação |

```ts
await api.get('/grupos/usuarios-elegiveis', {
  params: {
    q: 'maria',
    tipo: 'prefeitura',
    somente_sem_grupo: 1,
    page: 1,
    per_page: 20
  }
})
```

**Resposta 200:**

```json
{
  "data": [
    {
      "usuario_id": 88,
      "pessoa_id": 120,
      "nome": "Maria Prefeitura",
      "cpf": "12345678901",
      "email": "maria@pref.gov.br",
      "tipo_usuario": "administrador",
      "perfil_administrador": "prefeitura",
      "grupo_id": null,
      "grupo_nome": null
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 1,
    "last_page": 1
  }
}
```

---

## 7. Enforcement nas rotas de negócio existentes

Além de devolver o menu, o backend **deve** proteger os endpoints já existentes.

Exemplo para Serviços:

| Método | Rota API (exemplo atual) | Flag exigida |
|--------|--------------------------|--------------|
| GET list/show | `/api/servico` ... | `pode_visualizar` em `admin.servicos` |
| POST | criar | `pode_inserir` |
| PUT/PATCH | atualizar | `pode_atualizar` |
| DELETE | excluir | `pode_excluir` |

Master contabilidade: sempre autorizado.

Cliente: **403** em qualquer endpoint admin, mesmo que por bug o menu mostre algo.

Helper sugerido:

```php
// pseudo
Gate::define('menu-acao', function ($user, string $codigoOpcao, string $acao) {
    // acao: visualizar|inserir|atualizar|excluir
});
```

Mapear `codigo` da opção ↔ recurso.

---

## 8. Middleware / Policies sugeridos

1. `EnsureMasterContabilidade` — rotas `/api/grupos*`, `/api/menu/catalogo`
2. `EnsureMenuPermission:codigo,acao` — rotas de recurso
3. Manter checagens atuais de `tipo_usuario` onde fizer sentido, mas **prefeitura deixa de ter allowlist fixa**; passa a depender do grupo

---

## 9. Migration / Seeder — checklist de entrega

O backend deve entregar:

- [ ] Migrations das 5 tabelas (ou equivalente)
- [ ] Seeder com **todas** as opções da seção 5 (códigos e `rota_nome` idênticos)
- [ ] Modelos Eloquent + relationships
- [ ] Form Requests de validação
- [ ] Controllers + rotas em `routes/api.php`
- [ ] Policy/Gate para ACL
- [ ] Testes Feature mínimos:
  - [ ] Cliente sem grupo recebe menu padrão
  - [ ] Prefeitura sem grupo recebe menu vazio
  - [ ] Contabilidade recebe menu completo + `eh_master=true`
  - [ ] Contabilidade não aparece em `usuarios-elegiveis`
  - [ ] Usuário não pode estar em 2 grupos
  - [ ] Cliente não resolve opções `escopo=admin`
  - [ ] Flags I/U/D sem visualizar são normalizadas/rejeitadas
  - [ ] Opções `atribuivel=false` não podem ir em `PUT .../permissoes`

---

## 10. Rotas Laravel — resumo para `routes/api.php`

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/menu', [AuthMenuController::class, 'show']);

    Route::middleware('master.contabilidade')->group(function () {
        Route::get('/menu/catalogo', [MenuCatalogoController::class, 'index']);

        Route::get('/grupos/usuarios-elegiveis', [GrupoUsuarioElegivelController::class, 'index']);

        Route::apiResource('grupos', GrupoController::class);
        Route::put('/grupos/{grupo}/permissoes', [GrupoPermissaoController::class, 'sync']);
        Route::get('/grupos/{grupo}/membros', [GrupoMembroController::class, 'index']);
        Route::post('/grupos/{grupo}/membros', [GrupoMembroController::class, 'store']);
        Route::delete('/grupos/{grupo}/membros/{usuario}', [GrupoMembroController::class, 'destroy']);
    });
});

Route::get('/menu/publico', [MenuPublicoController::class, 'index']); // opcional, sem auth
```

> Ajuste namespaces ao padrão do `agenda-service`.

---

## 11. Matriz rápida — quem vê o quê

| Situação | Menu |
|----------|------|
| Visitante | Fixo no front (público) |
| Cliente sem grupo | Seed `cliente.*` padrão |
| Cliente com grupo | Só `cliente.*` do grupo com `pode_visualizar` |
| Prefeitura sem grupo | **Vazio** |
| Prefeitura com grupo | Só `admin.*` atribuídos (nunca Administradores/Grupos) |
| Contabilidade | Tudo `admin.*` incluindo Administradores + Grupos |

| Situação | Pode gerenciar grupos? |
|----------|------------------------|
| Contabilidade | Sim |
| Demais | Não (`403`) |

---

## 12. Exemplos de fluxo ponta a ponta

### 12.1 Master cria grupo para prefeitura

```ts
// 1) catálogo atribuível
const catalogo = await api.get('/menu/catalogo', { params: { atribuivel: 1 } })

// 2) cria grupo
const grupo = await api.post('/grupos', {
  nome: 'Prefeitura LOA',
  descricao: 'Participação + link + perfil',
  ativo: true
})

// 3) permissões
await api.put(`/grupos/${grupo.data.id}/permissoes`, {
  permissoes: [
    { menu_opcao_id: ID_PARTICIPACAO, pode_visualizar: true, pode_inserir: false, pode_atualizar: true, pode_excluir: false },
    { menu_opcao_id: ID_LINK, pode_visualizar: true, pode_inserir: false, pode_atualizar: false, pode_excluir: false },
    { menu_opcao_id: ID_PERFIL_ADMIN, pode_visualizar: true, pode_inserir: false, pode_atualizar: true, pode_excluir: false }
  ]
})

// 4) busca elegíveis (sem contabilidade)
const elegiveis = await api.get('/grupos/usuarios-elegiveis', {
  params: { tipo: 'prefeitura', somente_sem_grupo: 1 }
})

// 5) vincula
await api.post(`/grupos/${grupo.data.id}/membros`, {
  usuario_ids: [elegiveis.data[0].usuario_id]
})
```

### 12.2 Usuário prefeitura loga

```ts
const login = await api.post('/auth/login', { cpf, senha }, { skipAuth: true })
// armazena token + usuario

const menu = await api.get('/auth/menu')
// menu.modulos → Navbar dinâmica
// menu.destino_sugerido → redirect pós-login
// para cada botão: opcao.pode_inserir / pode_atualizar / pode_excluir
```

### 12.3 Cliente sem grupo

```ts
const menu = await api.get('/auth/menu')
// espera modulos do portal padrão mesmo com grupo: null
```

---

## 13. Compatibilidade com o front atual

Campos de usuário já usados no front (`LoginPostResponseDTO`):

```ts
{
  id: number
  pessoa_id: number
  tipo_usuario: string // 'administrador' | 'cliente'
  perfil_administrador?: 'contabilidade' | 'prefeitura' | null
}
```

**Não remover** esses campos. Apenas adicionar `grupo_id` (opcional) e o endpoint de menu.

Enums existentes no front:

- `TipoUsuario.ADMINISTRADOR = 'administrador'`
- `TipoUsuario.CLIENTE = 'cliente'`
- `PerfilAdministrador.CONTABILIDADE = 'contabilidade'`
- `PerfilAdministrador.PREFEITURA = 'prefeitura'`

---

## 14. Critérios de aceite

1. Seed contém todas as opções listadas nas seções 5.1–5.4 com `codigo` e `rota_nome` corretos.
2. `GET /auth/menu` implementa o algoritmo da seção 4.
3. Prefeitura sem grupo → `modulos: []`.
4. Cliente sem grupo → menu portal padrão.
5. Cliente nunca recebe item `escopo=admin` no menu resolvido.
6. Contabilidade é master, vê Administradores + Grupos, não aparece no seletor.
7. Um usuário ∈ no máximo 1 grupo.
8. Permissões têm as 4 flags explícitas; VIEW não é implícito pela presença.
9. Endpoints de grupo retornam 403 para não-master.
10. Documentação interna (OpenAPI/Scribe/Postman) atualizada com os exemplos deste arquivo.

---

## 15. Fora de escopo deste prompt

- Implementação Vue (Navbar data-driven) — será feita no `agenda-front` após a API.
- Alterar fluxos públicos de participação/assinatura.
- Mudar autenticação Sanctum.

---

## 16. Contato com o contrato do front

Qualquer divergência de `rota_nome` / `codigo` deve ser alinhada antes do merge. A fonte de rotas Vue atual está em:

`agenda-front/src/router/index.ts`

e o menu hardcoded atual em:

`agenda-front/src/presentation/components/Layout/Navbar.vue`

---

**Fim do prompt.** Implemente migrations → seed → endpoints → policies → testes, nesta ordem.
