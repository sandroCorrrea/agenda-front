<script setup lang="ts">
type CampoApi = {
  caminho: string;
  tipo: string;
  obrigatorio: string;
  regras: string;
  valores: string;
  exemplo: string;
};

type GrupoCampos = {
  titulo: string;
  descricao: string;
  campos: CampoApi[];
};

type LinhaResumo = {
  metodo: string;
  url: string;
  objetivo: string;
  auth: string;
};

/** Linha principal do cabecalho (mesmo padrao visual do BPe). */
const endpointProtocolo = {
  metodo: 'GET',
  url: '/api/protocolo',
  objetivo: 'Listar protocolos paginados; demais operacoes na tabela abaixo',
  nomeInterno: 'protocolo.index'
};

const resumoEndpoints: LinhaResumo[] = [
  { metodo: 'GET', url: '/api/protocolo', objetivo: 'Listar (query opcionais)', auth: 'Bearer' },
  { metodo: 'GET', url: '/api/protocolo/{id}', objetivo: 'Detalhe por id', auth: 'Bearer' },
  { metodo: 'POST', url: '/api/protocolo', objetivo: 'Criar', auth: 'Bearer' },
  { metodo: 'PUT', url: '/api/protocolo/{id}', objetivo: 'Atualizar', auth: 'Bearer' },
  { metodo: 'DELETE', url: '/api/protocolo/{id}', objetivo: 'Excluir', auth: 'Bearer' },
  {
    metodo: 'GET',
    url: '/api/protocolo/destinatarios/empresas/{id}/endereco',
    objetivo: 'Endereco da empresa',
    auth: 'Bearer'
  },
  {
    metodo: 'GET',
    url: '/api/protocolo/destinatarios/usuarios/{usuarioId}/endereco',
    objetivo: 'Endereco do cliente',
    auth: 'Bearer'
  },
  { metodo: 'GET', url: '/api/protocolo/assinatura/{token}', objetivo: 'Consultar assinatura', auth: 'Nao' },
  { metodo: 'POST', url: '/api/protocolo/assinatura/{token}', objetivo: 'Registrar assinatura', auth: 'Nao' }
];

const gruposCampos: GrupoCampos[] = [
  {
    titulo: 'Query GET /api/protocolo',
    descricao: 'Filtros opcionais na listagem',
    campos: [
      { caminho: 'page', tipo: 'integer', obrigatorio: 'Nao', regras: 'Pagina', valores: '-', exemplo: '1' },
      { caminho: 'per_page', tipo: 'integer', obrigatorio: 'Nao', regras: 'Itens por pagina', valores: '-', exemplo: '10' },
      { caminho: 'titulo', tipo: 'string', obrigatorio: 'Nao', regras: 'Trecho do titulo', valores: '-', exemplo: 'Contrato' },
      { caminho: 'ano', tipo: 'integer', obrigatorio: 'Nao', regras: 'Ano', valores: '-', exemplo: '2026' },
      {
        caminho: 'destinatario_tipo',
        tipo: 'string',
        obrigatorio: 'Nao',
        regras: 'Filtro',
        valores: 'fisica, juridica',
        exemplo: 'juridica'
      }
    ]
  },
  {
    titulo: 'Body POST /api/protocolo',
    descricao: 'Content-Type application/json',
    campos: [
      {
        caminho: 'destinatario_tipo',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'PF ou PJ',
        valores: 'fisica, juridica',
        exemplo: 'juridica'
      },
      {
        caminho: 'destinatario_usuario_id',
        tipo: 'integer|null',
        obrigatorio: 'Condicional',
        regras: 'Obrigatorio se PF',
        valores: '-',
        exemplo: '10'
      },
      {
        caminho: 'destinatario_empresa_id',
        tipo: 'integer|null',
        obrigatorio: 'Condicional',
        regras: 'Obrigatorio se PJ',
        valores: '-',
        exemplo: '3'
      },
      {
        caminho: 'administrador_usuario_id',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Usuario que cria',
        valores: '-',
        exemplo: '8'
      },
      { caminho: 'titulo', tipo: 'string', obrigatorio: 'Sim', regras: '-', valores: '-', exemplo: 'Entrega' },
      { caminho: 'descricao', tipo: 'string', obrigatorio: 'Sim', regras: '-', valores: '-', exemplo: 'Texto' },
      { caminho: 'ano', tipo: 'integer', obrigatorio: 'Sim', regras: '-', valores: '-', exemplo: '2026' },
      {
        caminho: 'data_para_entrega',
        tipo: 'string date',
        obrigatorio: 'Sim',
        regras: 'Y-m-d',
        valores: '-',
        exemplo: '2026-04-20'
      },
      {
        caminho: 'cep_destinatario',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '8 digitos',
        valores: '-',
        exemplo: '30140071'
      },
      { caminho: 'rua_destinatario', tipo: 'string', obrigatorio: 'Sim', regras: '-', valores: '-', exemplo: 'Rua X' },
      { caminho: 'bairro_destinatario', tipo: 'string', obrigatorio: 'Sim', regras: '-', valores: '-', exemplo: 'Centro' },
      { caminho: 'cidade_destinatario', tipo: 'string', obrigatorio: 'Sim', regras: '-', valores: '-', exemplo: 'BH' }
    ]
  },
  {
    titulo: 'Body POST /api/protocolo/assinatura/{token}',
    descricao: 'Publico; token = qrcodeToken',
    campos: [
      {
        caminho: 'nome_responsavel_recebimento',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'Nome completo',
        valores: '-',
        exemplo: 'Nome Completo'
      },
      {
        caminho: 'cpf_responsavel_recebimento',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '11 digitos',
        valores: '-',
        exemplo: '12345678901'
      }
    ]
  }
];

const requestExemplo = `{
  "destinatario_tipo": "juridica",
  "destinatario_usuario_id": null,
  "destinatario_empresa_id": 3,
  "administrador_usuario_id": 8,
  "titulo": "Entrega de documentacao",
  "descricao": "Texto completo do protocolo.",
  "ano": 2026,
  "data_para_entrega": "2026-04-20",
  "cep_destinatario": "30140071",
  "rua_destinatario": "Rua Exemplo, 100",
  "bairro_destinatario": "Centro",
  "cidade_destinatario": "Belo Horizonte"
}`;

const responseSucesso = `{
  "protocolo": [
    {
      "id": 15,
      "destinatarioTipo": "juridica",
      "titulo": "Entrega",
      "qrcodeToken": "550e8400-e29b-41d4-a716-446655440000"
    }
  ],
  "total": 42,
  "pagina": 1,
  "porPagina": 10
}`;

const responseErro = `{
  "message": "Dados invalidos",
  "errors": {
    "destinatario_tipo": ["O campo destinatario tipo e obrigatorio."],
    "cep_destinatario": ["CEP invalido."]
  }
}`;

const responseAssinatura201 = `{
  "message": "Assinatura registrada com sucesso.",
  "entrega": {
    "id": 1,
    "nome_responsavel_recebimento": "Maria Silva",
    "cpf_responsavel_recebimento": "12345678901",
    "data_entrega": "2026-04-01 14:30:00"
  }
}`;

const responseAssinatura409 = `{
  "message": "Este protocolo ja foi assinado."
}`;

const validacoesCondicionais = [
  'Se destinatario_tipo = fisica: enviar destinatario_usuario_id; destinatario_empresa_id = null.',
  'Se destinatario_tipo = juridica: enviar destinatario_empresa_id; destinatario_usuario_id = null.',
  'Links publicos e QR: usar qrcodeToken (UUID), nao o id numerico do protocolo.',
  'Assinatura: segunda tentativa retorna 409.',
  'Integracao B2B: POST /api/auth/token/integracao/protocolo; prefixo /api/v1/integracao/protocolo com mesmos caminhos; 403 se token sem escopo protocolo.'
];

const checklistFrontend = [
  'Enviar Authorization Bearer e Accept application/json nas rotas protegidas.',
  'Mapear 422 por path de campo nos formularios de criacao/edicao.',
  'Listagem: consumir total, pagina, porPagina para paginacao.',
  'Assinatura publica: sem Bearer; tratar 404 (token), 409 (ja assinado).',
  'Base URL configuravel por ambiente.'
];
</script>

<template>
  <article class="page-servicos d-flex align-items-start min-vh-100 py-4">
    <div class="container">
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3"
      >
        <div class="mb-2 mb-md-0">
          <h1 class="section-title">Protocolo</h1>
        </div>
      </div>

      <div class="pagina-bpe">
        <section class="cabecalho-bpe">
          <span class="selo">Documentacao API</span>
          <div class="meta-endpoint">
            <span class="metodo">{{ endpointProtocolo.metodo }}</span>
            <code>{{ endpointProtocolo.url }}</code>
            <span class="nome-interno">{{ endpointProtocolo.nomeInterno }}</span>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Resumo dos endpoints</h2>
          <div class="tabela-wrap">
            <table class="tabela-doc">
              <thead>
                <tr>
                  <th>Metodo</th>
                  <th>URL</th>
                  <th>Objetivo</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in resumoEndpoints" :key="i">
                  <td>{{ row.metodo }}</td>
                  <td><code>{{ row.url }}</code></td>
                  <td>{{ row.objetivo }}</td>
                  <td>{{ row.auth }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="nota">
            Prefixo Laravel <code>/api</code>. Rotas protegidas:
            <code>Authorization: Bearer {token}</code> +
            <code>Accept: application/json</code>. DELETE sucesso <strong>204</strong> sem corpo.
          </p>
        </section>

        <section class="bloco-doc">
          <h2>Campos do request</h2>
          <div v-for="grupo in gruposCampos" :key="grupo.titulo" class="grupo-campos">
            <h3>{{ grupo.titulo }}</h3>
            <p>{{ grupo.descricao }}</p>
            <div class="tabela-wrap">
              <table class="tabela-doc">
                <thead>
                  <tr>
                    <th>Campo</th>
                    <th>Tipo</th>
                    <th>Obrigatorio</th>
                    <th>Regras</th>
                    <th>Enum/Permitidos</th>
                    <th>Exemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="campo in grupo.campos" :key="campo.caminho + grupo.titulo">
                    <td><code>{{ campo.caminho }}</code></td>
                    <td>{{ campo.tipo }}</td>
                    <td>{{ campo.obrigatorio }}</td>
                    <td>{{ campo.regras }}</td>
                    <td>{{ campo.valores }}</td>
                    <td><code>{{ campo.exemplo }}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Validacoes condicionais</h2>
          <ul class="lista-check">
            <li v-for="item in validacoesCondicionais" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="bloco-doc">
          <h2>Request valido completo (POST criar)</h2>
          <pre class="bloco-json">{{ requestExemplo }}</pre>
        </section>

        <section class="bloco-doc">
          <h2>Responses da API</h2>
          <div class="respostas-grid">
            <div class="resposta-card sucesso">
              <h3>200 OK (listagem)</h3>
              <pre class="bloco-json">{{ responseSucesso }}</pre>
            </div>
            <div class="resposta-card erro">
              <h3>422 Unprocessable Entity</h3>
              <pre class="bloco-json">{{ responseErro }}</pre>
            </div>
            <div class="resposta-card sucesso">
              <h3>201 Created (assinatura)</h3>
              <pre class="bloco-json">{{ responseAssinatura201 }}</pre>
            </div>
            <div class="resposta-card erro">
              <h3>409 Conflict (assinatura)</h3>
              <pre class="bloco-json">{{ responseAssinatura409 }}</pre>
            </div>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Checklist de implementacao front-end</h2>
          <ul class="lista-check">
            <li v-for="item in checklistFrontend" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
.page-servicos {
  background: linear-gradient(180deg, rgba(250, 250, 250, 1) 0%, rgba(245, 247, 250, 1) 100%);
  padding-top: 6rem;
  padding-bottom: 4rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
  border-radius: 3px;
}

.pagina-bpe {
  display: grid;
  gap: 1rem;
}

.cabecalho-bpe {
  background: linear-gradient(140deg, rgba(92, 107, 192, 0.14), rgba(45, 160, 168, 0.16));
  border: 1px solid rgba(20, 30, 40, 0.06);
  border-radius: 20px;
  padding: 1.4rem;
}

.selo {
  display: inline-flex;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(28, 44, 99, 0.14);
  color: #1f2f66;
  font-size: 0.76rem;
  font-weight: 700;
  margin-bottom: 0.55rem;
}

.meta-endpoint {
  margin-top: 0.85rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.metodo {
  background: #1b8c72;
  color: #fff;
  border-radius: 8px;
  padding: 0.2rem 0.55rem;
  font-weight: 700;
  font-size: 0.78rem;
}

.meta-endpoint code,
.nome-interno {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(20, 30, 40, 0.08);
  border-radius: 8px;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.bloco-doc {
  background: #fff;
  border: 1px solid rgba(20, 30, 40, 0.08);
  border-radius: 16px;
  padding: 1.1rem;
}

.bloco-doc h2 {
  margin: 0 0 0.75rem;
  color: #1e2d58;
  font-size: 1.15rem;
  font-weight: 800;
}

.grupo-campos {
  margin-top: 1rem;
}

.grupo-campos:first-of-type {
  margin-top: 0;
}

.grupo-campos h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #243c73;
}

.grupo-campos p {
  margin: 0 0 0.6rem;
  color: #556584;
  font-size: 0.9rem;
}

.tabela-wrap {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(20, 30, 40, 0.08);
}

.tabela-doc {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
  background: #fff;
}

.tabela-doc th,
.tabela-doc td {
  border-bottom: 1px solid rgba(20, 30, 40, 0.08);
  padding: 0.65rem;
  text-align: left;
  vertical-align: top;
  font-size: 0.84rem;
  color: #394b6d;
}

.tabela-doc th {
  background: #f4f8ff;
  color: #1f3366;
  font-weight: 800;
}

.nota {
  margin-top: 0.7rem;
  color: #4d5d7b;
  font-size: 0.88rem;
}

.bloco-json {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 12px;
  padding: 0.9rem;
  overflow: auto;
  font-size: 0.8rem;
  line-height: 1.45;
  margin: 0;
}

.respostas-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

.resposta-card h3 {
  margin: 0 0 0.55rem;
  font-size: 0.98rem;
}

.resposta-card.sucesso h3 {
  color: #0f766e;
}

.resposta-card.erro h3 {
  color: #b91c1c;
}

.lista-check {
  list-style: none;
  display: grid;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
}

.lista-check li {
  background: #f8fbff;
  border: 1px solid rgba(20, 30, 40, 0.08);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  color: #34486b;
  font-size: 0.9rem;
}

@media (min-width: 1024px) {
  .pagina-bpe {
    gap: 1.1rem;
  }

  .cabecalho-bpe,
  .bloco-doc {
    padding: 1.35rem;
  }

  .respostas-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
