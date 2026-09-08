# Prompt Front (`agenda-front`) — Integração com Grupos, Menu e Permissões

> Gerado pelo backend `agenda-service` após a implementação da ACL.  
> Use este arquivo como contrato atualizado para adaptar o Vue 3.

---

## 1. O que o backend entregou

Foram criadas **5 tabelas** (padrão singular do projeto):

- `menu_modulo`
- `menu_opcao`
- `grupo_acesso`
- `grupo_membro` (1 usuário = no máximo 1 grupo)
- `grupo_permissao` (flags explícitas V/I/U/D)

Endpoints disponíveis sob `{VITE_API_BASE_URL}` (ex.: `http://127.0.0.1:8000/api`).

Auth: `Authorization: Bearer {token}` (Sanctum).

---

## 2. Divergências / decisões em relação ao prompt original do front

O contrato de API **foi mantido** (paths, payloads e shapes principais). Ajustes abaixo:

| Item | Decisão do backend | O que o front deve fazer |
|------|--------------------|---------------------------|
| `menu` no `POST /auth/login` | **Não** incluso no login (evita payload pesado) | Após login **e** ao restaurar sessão, chamar `GET /auth/menu` |
| `usuario.grupo_id` no login | **Sim**, incluído (`number \| null`) | Persistir no store de auth |
| Campo extra `escopo` em grupo | Detalhe/lista de grupo pode trazer `escopo: "cliente" \| "admin" \| null` | Usar para UX (ex.: filtrar catálogo); não quebra contrato |
| `DELETE /grupos/{id}/membros/{usuario}` | Resposta **204** sem body | Tratar 204 como sucesso |
| Exclusão de grupo com membros | **422** com mensagem clara (não desvincula automaticamente) | Exibir mensagem e exigir remoção dos membros antes |
| Homogeneidade de grupo | Backend **rejeita** misturar escopos cliente+admin no mesmo grupo | Na UI, ao montar permissões, filtrar pelo escopo do grupo / tipo dos membros |
| Contabilidade no seletor | Nunca retorna em `usuarios-elegiveis` | Não precisa filtrar no front |
| Prefeitura sem grupo | `GET /auth/menu` → `modulos: []`, `destino_sugerido: null` | Redirecionar para tela “sem acesso” / perfil |
| Cliente sem grupo | Menu padrão do portal (seed) | Não exigir grupo para cliente |
| Menu público | Continua fixo no front; existe `GET /menu/publico` opcional | Pode ignorar por enquanto |
| Enforcement de API | `VerificarPermissaoMenuService` criado; **ainda não** foi plugado em todos os CRUDs legados | Não confiar só no menu: esconder botões pelas flags; backend irá endurecer gradualmente |
| Rotas Vue novas | Seed já prevê `AdministradorGrupos`, `AdministradorGrupoCadastro`, `AdministradorGrupoEditar` | Criar essas rotas/telas no router |

---

## 3. Endpoints para o front

### 3.1 Menu da sessão (obrigatório)

```http
GET /api/auth/menu
Authorization: Bearer {token}
```

Resposta:

```json
{
  "destino_sugerido": { "rota_nome": "ClienteProtocolos", "path": "/cliente/protocolos" },
  "grupo": { "id": 3, "nome": "Clientes plus" },
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
    }
  ]
}
```

### 3.2 Login (estendido)

```http
POST /api/auth/login
```

`usuario` agora inclui:

```json
{
  "id": 10,
  "pessoa_id": 55,
  "tipo_usuario": "cliente",
  "perfil_administrador": null,
  "grupo_id": 3
}
```

Campos antigos **não foram removidos**.

### 3.3 Catálogo (master)

```http
GET /api/menu/catalogo?atribuivel=1
```

Somente contabilidade. Use `atribuivel=1` na tela de permissões do grupo.

### 3.4 CRUD grupos (master)

| Método | Path |
|--------|------|
| GET | `/api/grupos?page=1&per_page=15` |
| POST | `/api/grupos` |
| GET | `/api/grupos/{id}` |
| PUT | `/api/grupos/{id}` |
| DELETE | `/api/grupos/{id}` |
| PUT | `/api/grupos/{id}/permissoes` |
| GET | `/api/grupos/{id}/membros` |
| POST | `/api/grupos/{id}/membros` |
| DELETE | `/api/grupos/{id}/membros/{usuarioId}` |
| GET | `/api/grupos/usuarios-elegiveis` |

Bodies iguais ao prompt original:

**POST grupo**

```json
{ "nome": "Prefeitura — Participação", "descricao": "...", "ativo": true }
```

**PUT permissões (sync total)**

```json
{
  "permissoes": [
    {
      "menu_opcao_id": 40,
      "pode_visualizar": true,
      "pode_inserir": false,
      "pode_atualizar": true,
      "pode_excluir": false
    }
  ]
}
```

**POST membros**

```json
{ "usuario_ids": [88, 91] }
```

**Usuários elegíveis**

```http
GET /api/grupos/usuarios-elegiveis?q=maria&tipo=prefeitura&somente_sem_grupo=1&page=1&per_page=20
```

`tipo`: `cliente` | `prefeitura` | `todos`

---

## 4. Regras de UX que o front deve respeitar

1. **Navbar autenticada** deixa de ser hardcoded por `tipo_usuario`/`perfil_administrador`.
2. Renderizar a partir de `menu.modulos` (agrupados).
3. Botões Novo/Editar/Excluir só se `pode_inserir` / `pode_atualizar` / `pode_excluir`.
4. Navegação para `rota_nome_cadastro` / `rota_nome_editar` só se a flag correspondente for true.
5. Se `eh_master === true`, mostrar também Administradores + Grupos (já vêm no menu resolvido).
6. Contabilidade **não** aparece no seletor de membros.
7. Cliente **nunca** deve receber item `escopo=admin` (backend já filtra).
8. Prefeitura sem menu → tela segura de “sem permissões”.

---

## 5. Fluxo sugerido no `main.ts` / auth store

```ts
// após login OK
const { token, usuario } = loginResponse
authStore.setSession(token, usuario)

const menu = await api.get('/auth/menu')
menuStore.setMenu(menu.data)

const destino = menu.data.destino_sugerido?.path
router.replace(destino ?? (usuario.tipo_usuario === 'cliente' ? '/cliente/protocolos' : '/sem-acesso'))
```

Ao restaurar sessão (token no storage):

```ts
const menu = await api.get('/auth/menu')
menuStore.setMenu(menu.data)
```

---

## 6. Telas novas no front (master)

Rotas Vue já seedadas no backend:

| rota_nome | path |
|-----------|------|
| `AdministradorGrupos` | `/admin/grupos` |
| `AdministradorGrupoCadastro` | `/admin/grupos/nova` |
| `AdministradorGrupoEditar` | `/admin/grupos/:id/editar` |

Checklist da tela de grupos:

- [ ] Listagem paginada
- [ ] Criar/editar nome, descrição, ativo
- [ ] Aba permissões com catálogo `atribuivel=1`
- [ ] Flags V/I/U/D desabilitando ações sem `suporta_*`
- [ ] Aba membros + busca em `usuarios-elegiveis`
- [ ] Impedir misturar cliente e prefeitura no mesmo grupo (UX)

---

## 7. Códigos de menu (contrato estável)

Não renomear sem alinhar com o backend. Principais:

**Cliente:** `cliente.protocolos`, `cliente.perfil`, `cliente.chaves`, `cliente.empresas`  
**Admin atribuíveis:** `admin.painel`, `admin.servicos`, `admin.protocolos`, `admin.avisos`, `admin.home_carrossel`, `admin.participacao`, `admin.participacao_link`, `admin.blog_categorias`, `admin.blog_postagens`, `admin.clientes_pf`, `admin.empresas`, `admin.vinculacoes`, `admin.perfil`, `admin.chaves`  
**Só master:** `admin.administradores`, `admin.grupos`

---

## 8. Critérios de aceite no front

1. Login + `GET /auth/menu` alimentam a Navbar.
2. Cliente sem grupo vê portal padrão.
3. Prefeitura sem grupo vê menu vazio / sem acesso.
4. Contabilidade vê menu admin completo + item Grupos.
5. Flags I/U/D controlam botões das telas.
6. Tela de grupos consome catálogo + CRUD + membros + elegíveis.
7. `grupo_id` do login é armazenado (mesmo que o menu venha do GET dedicado).

---

## 9. Fora de escopo neste ciclo

- Remover de vez o menu hardcoded público (continua fixo).
- Confiar que toda API admin já bloqueia por flag (ainda em migração no backend).
- Alterar Sanctum / fluxo de recuperação de senha.

---

**Fim.** Implemente o store de menu + Navbar data-driven + tela de grupos usando este contrato.
