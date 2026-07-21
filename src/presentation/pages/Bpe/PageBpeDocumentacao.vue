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

/** Linha principal do cabeçalho (mesmo padrão visual do Protocolo). */
const endpointBpe = {
  metodo: 'POST',
  url: '/api/bpe/emissao',
  objetivo: 'Emitir BP-e na SEFAZ; integração externa no endpoint abaixo',
  nomeInterno: 'bpe.emissao.store'
};

const resumoEndpoints: LinhaResumo[] = [
  { metodo: 'POST', url: '/api/auth/login', objetivo: 'Login (token de sessão)', auth: 'Não' },
  {
    metodo: 'POST',
    url: '/api/auth/token/integracao',
    objetivo: 'Gerar token integração (ability bpe)',
    auth: 'Bearer'
  },
  { metodo: 'POST', url: '/api/bpe/emissao', objetivo: 'Emitir (app / usuário logado)', auth: 'Bearer' },
  {
    metodo: 'POST',
    url: '/api/v1/integracao/bpe/emissao',
    objetivo: 'Emitir (sistema terceiro)',
    auth: 'Bearer (bpe)'
  }
];

const gruposCampos: GrupoCampos[] = [
  {
    titulo: 'Body POST emissão (app ou integração)',
    descricao: 'Mesmo body nos dois endpoints; Content-Type application/json; campos em snake_case',
    campos: [
      {
        caminho: 'client_uuid',
        tipo: 'string (UUID)',
        obrigatorio: 'Não',
        regras: 'Idempotência; evita reprocessamento',
        valores: '-',
        exemplo: '550e8400-e29b-41d4-a716-446655440000'
      },
      { caminho: 'ide', tipo: 'object', obrigatorio: 'Sim', regras: 'Identificação do BP-e', valores: '-', exemplo: '-' },
      {
        caminho: 'inf_passagem',
        tipo: 'object',
        obrigatorio: 'Sim',
        regras: 'Origem, destino e validade',
        valores: '-',
        exemplo: '-'
      },
      {
        caminho: 'inf_viagem',
        tipo: 'array',
        obrigatorio: 'Sim',
        regras: 'Mín. 1 trecho',
        valores: '-',
        exemplo: '-'
      },
      {
        caminho: 'inf_valor_b_pe',
        tipo: 'object',
        obrigatorio: 'Sim',
        regras: 'Valores e componentes',
        valores: '-',
        exemplo: '-'
      },
      { caminho: 'imp', tipo: 'object', obrigatorio: 'Sim', regras: 'Impostos (ICMS00)', valores: '-', exemplo: '-' },
      { caminho: 'pag', tipo: 'array', obrigatorio: 'Sim', regras: '1 a 10 formas de pagamento', valores: '-', exemplo: '-' }
    ]
  },
  {
    titulo: 'ide',
    descricao: 'Identificação principal da emissão',
    campos: [
      { caminho: 'ide.c_uf', tipo: 'integer', obrigatorio: 'Sim', regras: 'UF emissora', valores: '31', exemplo: '31' },
      {
        caminho: 'ide.tp_amb',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: '1 produção, 2 homologação',
        valores: '1, 2',
        exemplo: '2'
      },
      { caminho: 'ide.mod', tipo: 'integer', obrigatorio: 'Sim', regras: 'Modelo', valores: '63', exemplo: '63' },
      { caminho: 'ide.serie', tipo: 'integer', obrigatorio: 'Sim', regras: '0 a 999', valores: '-', exemplo: '1' },
      { caminho: 'ide.n_bp', tipo: 'integer', obrigatorio: 'Sim', regras: '1 a 999999999', valores: '-', exemplo: '123' },
      {
        caminho: 'ide.modal',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Se 1, exatamente 1 item em inf_viagem',
        valores: '1, 3, 4',
        exemplo: '1'
      },
      {
        caminho: 'ide.dh_emi',
        tipo: 'string datetime',
        obrigatorio: 'Sim*',
        regras: 'YYYY-MM-DDTHH:mm:ss±HH:mm; se omitido, API usa now()',
        valores: '-',
        exemplo: '2026-07-21T10:00:00-03:00'
      },
      {
        caminho: 'ide.tp_emis',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: '1 normal, 2 contingência',
        valores: '1, 2',
        exemplo: '1'
      },
      {
        caminho: 'ide.ver_proc',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '1 a 20 chars',
        valores: '-',
        exemplo: '1.0.0'
      },
      {
        caminho: 'ide.tp_bpe',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Se 0, API calcula dh_validade = dh_emi + 1 ano',
        valores: '0, 3',
        exemplo: '0'
      },
      {
        caminho: 'ide.ind_pres',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Indicador presença',
        valores: '1, 2, 3, 4, 5, 9',
        exemplo: '1'
      },
      { caminho: 'ide.uf_ini', tipo: 'string', obrigatorio: 'Sim', regras: 'UF origem (2 chars)', valores: '-', exemplo: 'MG' },
      {
        caminho: 'ide.c_mun_ini',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'IBGE 7 dígitos',
        valores: '-',
        exemplo: '3106200'
      },
      { caminho: 'ide.uf_fim', tipo: 'string', obrigatorio: 'Sim', regras: 'UF destino (2 chars)', valores: '-', exemplo: 'MG' },
      {
        caminho: 'ide.c_mun_fim',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'IBGE 7 dígitos',
        valores: '-',
        exemplo: '3170206'
      },
      {
        caminho: 'ide.dh_cont',
        tipo: 'string datetime',
        obrigatorio: 'Condicional',
        regras: 'Obrigatório se tp_emis = 2',
        valores: '-',
        exemplo: '2026-07-21T10:05:00-03:00'
      },
      {
        caminho: 'ide.x_just',
        tipo: 'string',
        obrigatorio: 'Condicional',
        regras: '15 a 256 chars; obrigatório se tp_emis = 2',
        valores: '-',
        exemplo: 'Falha de comunicação principal, emissão em contingência'
      }
    ]
  },
  {
    titulo: 'inf_passagem',
    descricao: 'Origem, destino e validade; dh_emb preenchido pela API a partir de dh_emi',
    campos: [
      {
        caminho: 'inf_passagem.c_loc_orig',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '7 dígitos',
        valores: '-',
        exemplo: '3106200'
      },
      {
        caminho: 'inf_passagem.x_loc_orig',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '2 a 60 chars',
        valores: '-',
        exemplo: 'Belo Horizonte'
      },
      {
        caminho: 'inf_passagem.c_loc_dest',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '7 dígitos',
        valores: '-',
        exemplo: '3170206'
      },
      {
        caminho: 'inf_passagem.x_loc_dest',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '2 a 60 chars',
        valores: '-',
        exemplo: 'Uberlândia'
      },
      {
        caminho: 'inf_passagem.dh_emb',
        tipo: 'string datetime',
        obrigatorio: 'Sim',
        regras: 'Preenchido pela API (= dh_emi)',
        valores: '-',
        exemplo: '2026-07-21T10:00:00-03:00'
      },
      {
        caminho: 'inf_passagem.dh_validade',
        tipo: 'string datetime',
        obrigatorio: 'Sim',
        regras: 'Se tp_bpe = 0, API calcula (+1 ano)',
        valores: '-',
        exemplo: '2027-07-21T10:00:00-03:00'
      }
    ]
  },
  {
    titulo: 'inf_viagem[]',
    descricao: 'Trechos da viagem (mínimo 1 item)',
    campos: [
      {
        caminho: 'inf_viagem[].c_percurso',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '7 dígitos',
        valores: '-',
        exemplo: '3106200'
      },
      {
        caminho: 'inf_viagem[].x_percurso',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: '2 a 100 chars',
        valores: '-',
        exemplo: 'BH x Uberlândia'
      },
      {
        caminho: 'inf_viagem[].tp_viagem',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'Tipo viagem',
        valores: '00, 01',
        exemplo: '00'
      },
      {
        caminho: 'inf_viagem[].tp_serv',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Tipo serviço',
        valores: '1 a 9',
        exemplo: '1'
      },
      {
        caminho: 'inf_viagem[].tp_acomodacao',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Tipo acomodação',
        valores: '1 a 5',
        exemplo: '1'
      },
      {
        caminho: 'inf_viagem[].tp_trecho',
        tipo: 'integer',
        obrigatorio: 'Sim',
        regras: 'Tipo trecho',
        valores: '1, 2, 3',
        exemplo: '1'
      },
      {
        caminho: 'inf_viagem[].dh_viagem',
        tipo: 'string datetime',
        obrigatorio: 'Sim',
        regras: 'Datetime com timezone',
        valores: '-',
        exemplo: '2026-07-21T14:00:00-03:00'
      },
      {
        caminho: 'inf_viagem[].dh_conexao',
        tipo: 'string datetime',
        obrigatorio: 'Condicional',
        regras: 'Obrigatório se tp_trecho = 3',
        valores: '-',
        exemplo: '2026-07-21T15:30:00-03:00'
      },
      {
        caminho: 'inf_viagem[].prefixo',
        tipo: 'string',
        obrigatorio: 'Não',
        regras: 'Máx. 20',
        valores: '-',
        exemplo: 'BH-UDI'
      },
      {
        caminho: 'inf_viagem[].poltrona',
        tipo: 'string',
        obrigatorio: 'Não',
        regras: 'Máx. 3',
        valores: '-',
        exemplo: '12'
      }
    ]
  },
  {
    titulo: 'inf_valor_b_pe',
    descricao: 'Valores e componentes (decimal ^\\d+(\\.\\d{1,2})?$)',
    campos: [
      {
        caminho: 'inf_valor_b_pe.v_bp',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Até 2 casas',
        valores: '-',
        exemplo: '100.00'
      },
      {
        caminho: 'inf_valor_b_pe.v_desconto',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Até 2 casas',
        valores: '-',
        exemplo: '0.00'
      },
      {
        caminho: 'inf_valor_b_pe.v_pgto',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Até 2 casas',
        valores: '-',
        exemplo: '100.00'
      },
      {
        caminho: 'inf_valor_b_pe.v_troco',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Até 2 casas',
        valores: '-',
        exemplo: '0.00'
      },
      {
        caminho: 'inf_valor_b_pe.tp_desconto',
        tipo: 'string',
        obrigatorio: 'Não',
        regras: 'Tipo desconto',
        valores: '01…10, 99',
        exemplo: '01'
      },
      {
        caminho: 'inf_valor_b_pe.x_desconto',
        tipo: 'string',
        obrigatorio: 'Não',
        regras: '2 a 100',
        valores: '-',
        exemplo: 'Campanha promocional'
      },
      {
        caminho: 'inf_valor_b_pe.c_desconto',
        tipo: 'string',
        obrigatorio: 'Não',
        regras: 'Máx. 20',
        valores: '-',
        exemplo: 'PROMO-2026'
      },
      {
        caminho: 'inf_valor_b_pe.comps[]',
        tipo: 'array',
        obrigatorio: 'Sim',
        regras: 'Mínimo 1 componente',
        valores: '-',
        exemplo: '-'
      },
      {
        caminho: 'inf_valor_b_pe.comps[].tp_comp',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'Tipo componente',
        valores: '01, 02, 03, 04, 05, 06, 99',
        exemplo: '01'
      },
      {
        caminho: 'inf_valor_b_pe.comps[].v_comp',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Até 2 casas',
        valores: '-',
        exemplo: '100.00'
      }
    ]
  },
  {
    titulo: 'imp.icms00',
    descricao: 'Tributação ICMS',
    campos: [
      {
        caminho: 'imp.icms00.cst',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'Máx. 2',
        valores: '-',
        exemplo: '00'
      },
      {
        caminho: 'imp.icms00.v_bc',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Base de cálculo',
        valores: '-',
        exemplo: '100.00'
      },
      {
        caminho: 'imp.icms00.p_icms',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Alíquota',
        valores: '-',
        exemplo: '18.00'
      },
      {
        caminho: 'imp.icms00.v_icms',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Valor ICMS',
        valores: '-',
        exemplo: '18.00'
      }
    ]
  },
  {
    titulo: 'pag[]',
    descricao: 'Formas de pagamento (1 a 10 itens)',
    campos: [
      {
        caminho: 'pag[].t_pag',
        tipo: 'string',
        obrigatorio: 'Sim',
        regras: 'Tipo pagamento',
        valores: '01, 02, 03, 04, 05, 06, 99',
        exemplo: '01'
      },
      {
        caminho: 'pag[].x_pag',
        tipo: 'string',
        obrigatorio: 'Condicional',
        regras: '2 a 100; obrigatório se t_pag = 99',
        valores: '-',
        exemplo: 'PIX QR Code'
      },
      {
        caminho: 'pag[].v_pag',
        tipo: 'string decimal',
        obrigatorio: 'Sim',
        regras: 'Até 2 casas',
        valores: '-',
        exemplo: '100.00'
      }
    ]
  }
];

const requestExemplo = `{
  "client_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "ide": {
    "c_uf": 31,
    "tp_amb": 2,
    "mod": 63,
    "serie": 1,
    "n_bp": 123,
    "modal": 1,
    "dh_emi": "2026-07-21T10:00:00-03:00",
    "tp_emis": 1,
    "ver_proc": "1.0.0",
    "tp_bpe": 0,
    "ind_pres": 1,
    "uf_ini": "MG",
    "c_mun_ini": "3106200",
    "uf_fim": "MG",
    "c_mun_fim": "3170206"
  },
  "inf_passagem": {
    "c_loc_orig": "3106200",
    "x_loc_orig": "Belo Horizonte",
    "c_loc_dest": "3170206",
    "x_loc_dest": "Uberlândia"
  },
  "inf_viagem": [
    {
      "c_percurso": "3106200",
      "x_percurso": "BH x Uberlândia",
      "tp_viagem": "00",
      "tp_serv": 1,
      "tp_acomodacao": 1,
      "tp_trecho": 1,
      "dh_viagem": "2026-07-21T14:00:00-03:00",
      "prefixo": "BH-UDI",
      "poltrona": "12"
    }
  ],
  "inf_valor_b_pe": {
    "v_bp": "100.00",
    "v_desconto": "0.00",
    "v_pgto": "100.00",
    "v_troco": "0.00",
    "comps": [
      {
        "tp_comp": "01",
        "v_comp": "100.00"
      }
    ]
  },
  "imp": {
    "icms00": {
      "cst": "00",
      "v_bc": "100.00",
      "p_icms": "18.00",
      "v_icms": "18.00"
    }
  },
  "pag": [
    {
      "t_pag": "01",
      "v_pag": "100.00"
    }
  ]
}`;

const responseLogin = `{
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "usuario": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@empresa.com"
  },
  "expires_in": 3600
}`;

const responseTokenIntegracao = `{
  "token": "2|yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
  "token_type": "Bearer",
  "expires_in": 3600
}`;

const responseSucesso = `{
  "ambiente": 2,
  "codigoUf": 31,
  "versaoAplicativo": "1.00",
  "codigoStatus": 100,
  "motivo": "Autorizado o uso do BP-e",
  "chaveBpe": "31260700000000000000630010000001231000000010",
  "protocolo": "131260000000001",
  "dataRecebimento": "2026-07-21T10:01:02-03:00",
  "numeroRecibo": null,
  "xmlResponse": "<?xml version=\\"1.0\\" encoding=\\"UTF-8\\"?>..."
}`;

const response401 = `{
  "message": "Autenticação necessária para acessar este recurso."
}`;

const response403 = `{
  "message": "Este token não possui permissão (escopo) para acessar a API de integração de protocolo."
}`;

const responseErro = `{
  "message": "Dados inválidos",
  "errors": {
    "ide.n_bp": ["O campo Número do BP-e (nBP) é obrigatório."],
    "pag.0.x_pag": ["x_pag é obrigatório quando t_pag=99."]
  }
}`;

const validacoesCondicionais = [
  'Se ide.tp_emis = 2: enviar ide.dh_cont e ide.x_just (15 a 256 chars).',
  'Se ide.modal = 1: exatamente 1 item em inf_viagem.',
  'Se inf_viagem[i].tp_trecho = 3: enviar inf_viagem[i].dh_conexao.',
  'Se pag[i].t_pag = "99": enviar pag[i].x_pag.',
  'Preenchimentos automáticos da API: dh_emi (se omitido), inf_passagem.dh_emb (= dh_emi), dh_validade (+1 ano quando tp_bpe = 0).',
  'Usar client_uuid para idempotência e evitar emissão duplicada.',
  'App logado: POST /api/bpe/emissao com token de POST /api/auth/login.',
  'Integração B2B: POST /api/auth/token/integracao (com token de login) → token com ability bpe; usar em POST /api/v1/integracao/bpe/emissao; 403 se token sem escopo bpe.',
  'Nova geração de token de integração invalida o token anterior do mesmo usuário (integracao-bpe).'
];

const checklistFrontend = [
  'Enviar Authorization Bearer, Content-Type e Accept application/json nas rotas protegidas.',
  'App: emitir em /api/bpe/emissao com token de login.',
  'Integração: obter token em /api/auth/token/integracao e emitir em /api/v1/integracao/bpe/emissao.',
  'Tratar 401 (token ausente/inválido/expirado) e 403 (token sem ability bpe na rota de integração).',
  'Mapear erros 422 por path de campo nos formulários de emissão.',
  'Gerar e persistir client_uuid por tentativa; no retry, reaproveitar o mesmo UUID.',
  'Exibir feedback com codigoStatus, motivo, protocolo e chaveBpe quando autorizado.',
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
          <h1 class="section-title">BP-e</h1>
        </div>
      </div>

      <div class="pagina-bpe">
        <section class="cabecalho-bpe">
          <span class="selo">Documentação API</span>
          <div class="meta-endpoint">
            <span class="metodo" :class="classeMetodoHttp(endpointBpe.metodo)">
              {{ endpointBpe.metodo }}
            </span>
            <code class="doc-valor-tecnico">{{ endpointBpe.url }}</code>
            <span class="nome-interno doc-valor-tecnico">{{ endpointBpe.nomeInterno }}</span>
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
            <code>Content-Type: application/json</code> +
            <code>Accept: application/json</code>. Body de emissão e response 200 iguais nos dois endpoints de BP-e; muda só o tipo de token.
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
          <h2>Request válido completo (POST emissão)</h2>
          <div class="doc-scroll-wrap">
            <pre class="bloco-json">{{ requestExemplo }}</pre>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Responses da API</h2>
          <div class="respostas-grid">
            <div class="resposta-card sucesso">
              <h3>200 OK (login)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseLogin }}</pre>
              </div>
            </div>
            <div class="resposta-card sucesso">
              <h3>200 OK (token integração)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseTokenIntegracao }}</pre>
              </div>
            </div>
            <div class="resposta-card sucesso">
              <h3>200 OK (emissão)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseSucesso }}</pre>
              </div>
            </div>
            <div class="resposta-card erro">
              <h3>401 Unauthorized</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ response401 }}</pre>
              </div>
            </div>
            <div class="resposta-card erro">
              <h3>403 Forbidden (integração)</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ response403 }}</pre>
              </div>
            </div>
            <div class="resposta-card erro">
              <h3>422 Unprocessable Entity</h3>
              <div class="doc-scroll-wrap">
                <pre class="bloco-json">{{ responseErro }}</pre>
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
