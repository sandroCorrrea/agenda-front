# Prompt para Agente — PDF do Protocolo + Assinatura via QR Code

## Contexto

O backend `agenda-service` passou a oferecer:

1. **Geração de PDF** do protocolo (administrador autenticado), com **QR Code** apontando para a página pública de assinatura.
2. **Assinatura do recebimento** pelo destinatário (nome + CPF), persistida na tabela unificada **`protocolo_entrega`** (substitui as duas tabelas legadas de física/jurídica).

Este documento descreve contratos HTTP, payloads e fluxo esperado para o **front admin**, **app mobile** ou **página web** consumirem sem divergência.

---

## Modelo de dados (`protocolo_entrega`)

Uma linha por protocolo assinado (constraint **única** em `protocolo_id`):

| Campo | Tipo | Observação |
|-------|------|------------|
| `protocolo_id` | FK → `protocolo.id` | Único |
| `nome_responsavel_recebimento` | string max 120 | Quem recebeu |
| `cpf_responsavel_recebimento` | string 11 dígitos | Somente números |
| `data_entrega` | datetime | Preenchido no servidor no momento da assinatura |

---

## 1) Gerar PDF (administrador)

- **GET** `/api/protocolo/{id}/pdf`
- **Auth:** `Bearer` Sanctum (`auth:sanctum`)
- **Permissão:** usuário com `tipo_usuario === 'administrador'`

### Sucesso

- **200** `Content-Type: application/pdf`
- **Content-Disposition:** `inline; filename="protocolo_{id}.pdf"`
- PDF contém:
  - Dados do protocolo **sem expor o ID numérico** do registro no corpo como “identificador principal”.
  - Endereço, descrição, tipo de destinatário, nomes resolvidos (destinatário e administrador).
  - Se já existir assinatura, bloco com dados de recebimento.
  - **QR Code** que aponta para a URL **web** de assinatura:  
    `{APP_URL}/protocolo/assinar/{qrcode_token}`  
    (o `qrcode_token` já vem na tabela `protocolo`).

### Erros

| HTTP | Quando |
|------|--------|
| 403 | Usuário não é administrador |
| 404 | Protocolo não encontrado |
| 401 | Token ausente/inválido |

### Front admin

- Botão “Gerar PDF” / “Baixar PDF” chamando `GET /api/protocolo/${id}/pdf` com `responseType: 'blob'`.
- Abrir em nova aba ou `download` com `filename` sugerido.

---

## 2) Página web de assinatura (aberta pelo QR)

Destino do QR (navegador do celular):

- **GET** `/protocolo/assinar/{token}`
  - `token` = UUID do campo `protocolo.qrcode_token` (36 caracteres com hífens).
- **Sem autenticação** (público).
- Exibe formulário **nome + CPF** se ainda não assinado; se já assinado, mensagem de confirmação.

- **POST** `/protocolo/assinar/{token}`
  - `Content-Type: application/x-www-form-urlencoded` ou `multipart/form-data`
  - Campos:
    - `nome_responsavel_recebimento` (obrigatório)
    - `cpf_responsavel_recebimento` (obrigatório; pode enviar com máscara; o backend normaliza para 11 dígitos)
  - `_token` CSRF (formulário Laravel).

### Sucesso (POST web)

- Redirect de volta ao GET com flash `status` = mensagem de sucesso.

### Erros

- Validação: redirect com erros de campo.
- **409** (lógica): “Este protocolo já foi assinado.” — tratado no controller e exibido como erro.

---

## 3) API JSON de assinatura (SPA / app nativo)

Úteis se o front preferir **não** usar o formulário HTML.

### 3.1 Consultar antes de assinar

- **GET** `/api/protocolo/assinatura/{token}`
- **Público** (sem Sanctum).
- **Throttle:** 60 req/min (ajustável no servidor).

**Resposta 200:**

```json
{
  "jaAssinado": false,
  "protocolo": {
    "destinatario_tipo": "fisica",
    "titulo": "...",
    "descricao": "...",
    "ano": 2026,
    "data_para_entrega": "2026-04-20",
    "cep_destinatario": "30140071",
    "rua_destinatario": "...",
    "bairro_destinatario": "...",
    "cidade_destinatario": "..."
  },
  "entrega": null
}
```

Se já assinado:

```json
{
  "jaAssinado": true,
  "protocolo": { "...": "..." },
  "entrega": {
    "nome_responsavel_recebimento": "...",
    "cpf_responsavel_recebimento": "12345678901",
    "data_entrega": "2026-04-01 14:30:00"
  }
}
```

**404:** token inválido.

---

### 3.2 Registrar assinatura

- **POST** `/api/protocolo/assinatura/{token}`
- **Público** (sem Sanctum).
- **Throttle:** 30 req/min.

**Body JSON:**

```json
{
  "nome_responsavel_recebimento": "Nome Completo",
  "cpf_responsavel_recebimento": "12345678901"
}
```

**Sucesso 201:**

```json
{
  "message": "Assinatura registrada com sucesso.",
  "entrega": {
    "id": 1,
    "nome_responsavel_recebimento": "...",
    "cpf_responsavel_recebimento": "12345678901",
    "data_entrega": "2026-04-01 14:30:00"
  }
}
```

**422:** validação (CPF com tamanho diferente de 11 após remover não-dígitos, nome vazio, etc.).

**404:** token inválido.

**409:** protocolo já assinado — mensagem JSON `{"message":"Este protocolo já foi assinado."}` (via `DomainException`).

---

## Regras de implementação no front

1. **Não** colocar o id da tabela `protocolo` no QR; use sempre o **`qrcode_token`** retornado pela API de protocolo ao criar/listar.
2. O fluxo de assinatura é **idempotente por protocolo**: uma segunda tentativa retorna **409**.
3. CPF deve ser validado no client (11 dígitos). O backend aceita máscara e remove caracteres não numéricos no POST.
4. Para PDF no admin, sempre enviar token Sanctum.
5. A URL pública de assinatura depende de **`APP_URL`** no `.env` (geração do QR no PDF).

---

## Critérios de aceite (QA)

- [ ] Admin autenticado baixa PDF do protocolo com QR legível.
- [ ] Escanear QR abre `/protocolo/assinar/{token}` no domínio correto.
- [ ] Primeiro POST grava `protocolo_entrega` e `data_entrega`.
- [ ] Segundo POST/POST duplicado retorna 409 (API) ou mensagem na web.
- [ ] GET `/api/protocolo/assinatura/{token}` reflete `jaAssinado` após assinar.

---

## Comandos úteis (dev)

- Rodar migration: `php artisan migrate`
- Conferir rotas: `php artisan route:list | grep protocolo`
