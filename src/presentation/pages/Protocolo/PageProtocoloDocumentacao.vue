<script setup lang="ts">
import '@/presentation/assets/styles/api-documentacao.css';

function classeMetodoHttp(metodo: string): string {
  const classes: Record<string, string> = {
    GET: 'metodo--get',
    POST: 'metodo--post',
    PUT: 'metodo--put',
    DELETE: 'metodo--delete'
  };

  return classes[metodo] ?? '';
}

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
  objetivo: 'Listar protocolos paginados; demais operações na tabela abaixo',
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
    objetivo: 'Endereço da empresa',
    auth: 'Bearer'
  },
  {
    metodo: 'GET',
    url: '/api/protocolo/destinatarios/usuarios/{usuarioId}/endereco',
    objetivo: 'Endereço do cliente',
    auth: 'Bearer'
  },
  { metodo: 'GET', url: '/api/protocolo/assinatura/{token}', objetivo: 'Consultar assinatura', auth: 'Não' },
  { metodo: 'POST', url: '/api/protocolo/assinatura/{token}', objetivo: 'Registrar assinatura', auth: 'Não' }
];

const gruposCampos: GrupoCampos[] = [
  {
    titulo: 'Query GET /api/protocolo',
    descricao: 'Filtros opcionais na listagem',
    campos: [
      { caminho: 'page', tipo: 'integer', obrigatorio: 'Não', regras: 'Página', valores: '-', exemplo: '1' },
      { caminho: 'per_page', tipo: 'integer', obrigatorio: 'Não', regras: 'Itens por página', valores: '-', exemplo: '10' },
      { caminho: 'titulo', tipo: 'string', obrigatorio: 'Não', regras: 'Trecho do título', valores: '-', exemplo: 'Contrato' },
      { caminho: 'ano', tipo: 'integer', obrigatorio: 'Não', regras: 'Ano', valores: '-', exemplo: '2026' },
      {
        caminho: 'destinatario_tipo',
        tipo: 'string',
        obrigatorio: 'Não',
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
        regras: 'Obrigatório se PF',
        valores: '-',
        exemplo: '10'
      },
      {
        caminho: 'destinatario_empresa_id',
        tipo: 'integer|null',
        obrigatorio: 'Condicional',
        regras: 'Obrigatório se PJ',
        valores: '-',
        exemplo: '3'
      },
      {
        caminho: 'administrador_usuario_id',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Usuário que cria',
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
        regras: '8 dígitos',
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
    descricao: 'Público; token = qrcodeToken',
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
        regras: '11 dígitos',
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
  "titulo": "Entrega de documentação",
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
  "message": "Dados inválidos",
  "errors": {
    "destinatario_tipo": ["O campo destinatário tipo é obrigatório."],
    "cep_destinatario": ["CEP inválido."]
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
  "message": "Este protocolo já foi assinado."
}`;

const validacoesCondicionais = [
  'Se destinatario_tipo = fisica: enviar destinatario_usuario_id; destinatario_empresa_id = null.',
  'Se destinatario_tipo = juridica: enviar destinatario_empresa_id; destinatario_usuario_id = null.',
  'Links públicos e QR: usar qrcodeToken (UUID), não o id numérico do protocolo.',
  'Assinatura: segunda tentativa retorna 409.',
  'Integração B2B: POST /api/auth/token/integracao/protocolo; prefixo /api/v1/integracao/protocolo com mesmos caminhos; 403 se token sem escopo protocolo.'
];

const checklistFrontend = [
  'Enviar Authorization Bearer e Accept application/json nas rotas protegidas.',
  'Mapear 422 por path de campo nos formulários de criação/edição.',
  'Listagem: consumir total, pagina, porPagina para paginação.',
  'Assinatura pública: sem Bearer; tratar 404 (token), 409 (já assinado).',
  'Base URL configurável por ambiente.'
];
</script>

<template>
  <article class="page-servicos d-flex flex-column align-items-stretch min-vh-100 py-4">
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
          <span class="selo">Documentação API</span>
          <div class="meta-endpoint">
            <span class="metodo" :class="classeMetodoHttp(endpointProtocolo.metodo)">
              {{ endpointProtocolo.metodo }}
            </span>
            <code class="doc-valor-tecnico">{{ endpointProtocolo.url }}</code>
            <span class="nome-interno doc-valor-tecnico">{{ endpointProtocolo.nomeInterno }}</span>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Resumo dos endpoints</h2>
          <div class="tabela-wrap">
            <table class="tabela-doc">
              <thead>
                <tr>
                  <th>Método</th>
                  <th>URL</th>
                  <th>Objetivo</th>
                  <th>Auth</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in resumoEndpoints" :key="i">
                  <td data-label="Método">
                    <span class="metodo" :class="classeMetodoHttp(row.metodo)">{{ row.metodo }}</span>
                  </td>
                  <td data-label="URL"><code class="doc-valor-tecnico">{{ row.url }}</code></td>
                  <td data-label="Objetivo"><span class="doc-valor-texto">{{ row.objetivo }}</span></td>
                  <td data-label="Auth"><span class="doc-valor-texto">{{ row.auth }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="nota">
            Prefixo <code>/api</code>. Rotas protegidas:
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
                    <th>Obrigatório</th>
                    <th>Regras</th>
                    <th>Enum/Permitidos</th>
                    <th>Exemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="campo in grupo.campos" :key="campo.caminho + grupo.titulo">
                    <td data-label="Campo"><code class="doc-valor-tecnico">{{ campo.caminho }}</code></td>
                    <td data-label="Tipo"><span class="doc-valor-texto">{{ campo.tipo }}</span></td>
                    <td data-label="Obrigatório"><span class="doc-valor-texto">{{ campo.obrigatorio }}</span></td>
                    <td data-label="Regras"><span class="doc-valor-texto">{{ campo.regras }}</span></td>
                    <td data-label="Enum"><span class="doc-valor-tecnico">{{ campo.valores }}</span></td>
                    <td data-label="Exemplo"><code class="doc-valor-tecnico">{{ campo.exemplo }}</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Validações condicionais</h2>
          <ul class="lista-check">
            <li v-for="item in validacoesCondicionais" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="bloco-doc">
          <h2>Request válido completo (POST criar)</h2>
          <div class="doc-scroll-wrap">
            <pre class="bloco-json">{{ requestExemplo }}</pre>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Responses da API</h2>
          <div class="respostas-grid">
            <div class="resposta-card sucesso">
              <h3>200 OK (listagem)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseSucesso }}</pre>
              </div>
            </div>
            <div class="resposta-card erro">
              <h3>422 Unprocessable Entity</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseErro }}</pre>
              </div>
            </div>
            <div class="resposta-card sucesso">
              <h3>201 Created (assinatura)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseAssinatura201 }}</pre>
              </div>
            </div>
            <div class="resposta-card erro">
              <h3>409 Conflict (assinatura)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseAssinatura409 }}</pre>
              </div>
            </div>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Checklist de implementação front-end</h2>
          <ul class="lista-check">
            <li v-for="item in checklistFrontend" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </div>
  </article>
</template>
