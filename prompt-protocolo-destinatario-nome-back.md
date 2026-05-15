# Ajuste API — incluir `destinatarioNome` na listagem de protocolos

## Contexto

O front (`agenda-front`) na tela **Gestão → Protocolos** (`PageAreaProtocolosAdmin.vue`) precisa exibir o **nome do destinatário** na coluna **Destinatário** (não mais “Pessoa física” / “Pessoa jurídica” nem a coluna **Cidade**, que foi removida no front).

O front já está preparado para ler o campo **`destinatarioNome`** (camelCase) ou **`destinatario_nome`** (snake_case) em cada item de `protocolo[]` retornado por:

- `GET /api/protocolo` (listagem paginada admin)
- Idealmente também `GET /api/protocolo/{id}` e `GET /api/protocolo/usuario/{usuarioId}` (mesmo DTO de resposta), para o modal de detalhes.

Hoje a API **não** envia o nome: cada item usa `ProtocoloPostResponseDTO` apenas com IDs e endereço.

A regra de negócio para o nome **já existe** no PDF:

- Arquivo: `app/Domain/Services/Protocolo/DownloadPdfProtocoloService.php`
- Método: `resolveDestinatarioNome(Protocolo $protocolo)`
  - Se `destinatario_tipo === 'fisica'`: nome de `destinatarioUsuario->pessoa->getNome()`
  - Se `destinatario_tipo === 'juridica'`: nome de `destinatarioEmpresa` (`getAttribute('nome')`)
  - Fallback: `'—'` se relação ausente

**Reutilize essa mesma lógica** (extrair para um helper/service compartilhado se fizer sentido) — não duplicar regra divergente.

---

## O que implementar

### 1. DTO de resposta

**Arquivo:** `app/Application/DTO/Protocolo/ProtocoloPostResponseDTO.php`

Adicionar propriedade pública:

```php
public ?string $destinatarioNome;
```

Incluir no construtor (após `destinatarioTipo` ou no final, mantendo compatibilidade com serialização JSON camelCase do projeto).

O JSON de cada item em `protocolo[]` deve passar a incluir, por exemplo:

```json
{
  "id": 15,
  "destinatarioUsuarioId": null,
  "destinatarioEmpresaId": 3,
  "administradorUsuarioId": 8,
  "destinatarioTipo": "juridica",
  "destinatarioNome": "Empresa Exemplo Ltda",
  "titulo": "Entrega",
  "descricao": "...",
  "ano": 2026,
  "dataParaEntrega": "2026-04-20",
  "cepDestinatario": "...",
  "ruaDestinatario": "...",
  "bairroDestinatario": "...",
  "cidadeDestinatario": "Belo Horizonte",
  "qrcodeToken": "..."
}
```

### 2. Montagem dos itens na listagem

**Arquivos:**

- `app/Domain/Services/Protocolo/FindProtocoloByPaginationService.php`
- `app/Domain/Services/Protocolo/FindProtocoloByUsuarioIdService.php` (se usar o mesmo builder de item)
- `app/Application/Builder/Protocolo/ProtocoloPostEntityByDtoBuilder.php` (se for onde o DTO é instanciado — ajustar assinatura para receber `destinatarioNome`)

Ao montar cada `ProtocoloPostResponseDTO` a partir do model `Protocolo`, preencher `destinatarioNome` com a mesma regra do PDF.

### 3. Eager loading (performance)

**Arquivo:** `app/Infrastructure/Repositories/ProtocoloRepository.php` (ou onde `findPagination` / `findPaginationByUsuarioId` buscam os models)

Na query paginada, carregar relações necessárias para evitar N+1:

- `destinatarioUsuario.pessoa` (quando PF)
- `destinatarioEmpresa` (quando PJ)

Exemplo conceitual:

```php
Protocolo::query()
    ->with(['destinatarioUsuario.pessoa', 'destinatarioEmpresa', ...])
```

Ajustar conforme os nomes reais das relações no model `app/Models/Protocolo.php`.

### 4. Detalhe por ID (recomendado)

**Arquivo:** `app/Domain/Services/Protocolo/FindProtocoloByIdService.php` (ou equivalente)

Garantir que `GET /api/protocolo/{id}` também retorne `destinatarioNome` no mesmo formato, pois o front usa esse endpoint no modal “Ver detalhes”.

### 5. Não quebrar contratos existentes

- Manter todos os campos atuais de `ProtocoloPostResponseDTO`.
- `destinatarioNome` pode ser `null` ou string vazia apenas em casos excepcionais (destinatário órfão); preferir `'—'` só se o front já tratar — o front hoje exibe **"—"** quando o nome vier vazio/ausente.
- Não remover `cidadeDestinatario` da API (o front só removeu da **tabela**; o modal ainda pode usar cidade).

---

## Endpoints afetados

| Método | Rota | Uso no front |
|--------|------|----------------|
| GET | `/api/protocolo` | Listagem admin |
| GET | `/api/protocolo/usuario/{usuarioId}` | Área do cliente (opcional, mesmo campo) |
| GET | `/api/protocolo/{id}` | Modal detalhes admin |

---

## Critérios de aceite

1. `GET /api/protocolo?page=1&per_page=10` retorna em cada elemento de `protocolo[]` o campo **`destinatarioNome`** com o nome real da pessoa (PF) ou da empresa (PJ).
2. Protocolo PF com usuário/pessoa válidos → nome da pessoa.
3. Protocolo PJ com empresa válida → nome da empresa.
4. Listagem não dispara N+1 queries (verificar com debugbar ou log de queries).
5. `GET /api/protocolo/{id}` também inclui `destinatarioNome`.
6. Comportamento alinhado ao PDF gerado por `DownloadPdfProtocoloService`.

---

## Referências no repositório

- Rotas: `routes/api.php` (grupo `protocolo`)
- Listagem: `ProtocoloGetController` → `FindProtocoloByPaginationService`
- DTO resposta item: `ProtocoloPostResponseDTO`
- Builder listagem: `ProtocoloPostEntityByDtoBuilder` / loop em `FindProtocoloByPaginationService`
- Nome no PDF (fonte da verdade da regra): `DownloadPdfProtocoloService::resolveDestinatarioNome`
- Model: `app/Models/Protocolo.php` (relações `destinatarioUsuario`, `destinatarioEmpresa`)

---

## Front (somente leitura — não alterar aqui)

O front já mapeia:

```typescript
destinatarioNome ?? destinatario_nome
```

na entidade `Protocolo` (`src/domain/entities/Protocolo.ts`) e exibe na coluna **Destinatário**. Após este ajuste no back, os nomes devem aparecer sem mudança adicional no front.

---

## Tarefa

Implementar o campo `destinatarioNome` na resposta da API de protocolos conforme acima, reutilizando a lógica do PDF, com eager loading na listagem, e validar com um exemplo de resposta JSON real.
