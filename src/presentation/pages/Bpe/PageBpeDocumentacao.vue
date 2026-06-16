<script setup lang="ts">
import '@/presentation/assets/styles/api-documentacao.css';

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

const endpointBpe = {
  metodo: 'POST',
  url: '/api/bpe/emissao',
  objetivo: 'Emitir BP-e na SEFAZ com payload validado no backend Laravel',
  nomeInterno: 'bpe.emissao.store'
};

const gruposCampos: GrupoCampos[] = [
  {
    titulo: 'Raiz',
    descricao: 'Campos de controle global do request',
    campos: [
      {
        caminho: 'client_uuid',
        tipo: 'string (UUID)',
        obrigatorio: 'Não',
        regras: 'Recomendado para idempotência',
        valores: '-',
        exemplo: '8c0e8477-7a25-4235-b5c8-f5244f6252e6'
      }
    ]
  },
  {
    titulo: 'ide',
    descricao: 'Identificação principal da emissão',
    campos: [
      { caminho: 'ide.c_uf', tipo: 'integer', obrigatorio: 'Sim', regras: 'UF emissora', valores: '[31]', exemplo: '31' },
      { caminho: 'ide.tp_amb', tipo: 'integer', obrigatorio: 'Sim', regras: 'Ambiente', valores: '[1,2]', exemplo: '2' },
      { caminho: 'ide.mod', tipo: 'integer', obrigatorio: 'Sim', regras: 'Modelo', valores: '[63]', exemplo: '63' },
      { caminho: 'ide.serie', tipo: 'integer', obrigatorio: 'Sim', regras: '0 a 999', valores: '-', exemplo: '1' },
      { caminho: 'ide.n_bp', tipo: 'integer', obrigatorio: 'Sim', regras: '1 a 999999999', valores: '-', exemplo: '12345' },
      { caminho: 'ide.modal', tipo: 'integer', obrigatorio: 'Sim', regras: 'Modal', valores: '[1,3,4]', exemplo: '1' },
      {
        caminho: 'ide.dh_emi',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Sim (backend preenche se ausente)',
        regras: 'Recomendado enviar explicitamente',
        valores: 'regex datetime',
        exemplo: '2026-03-23T14:30:00-03:00'
      },
      { caminho: 'ide.tp_emis', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo emissão', valores: '[1,2]', exemplo: '2' },
      { caminho: 'ide.ver_proc', tipo: 'string', obrigatorio: 'Sim', regras: '1 a 20 chars', valores: '-', exemplo: 'agenda-front-1.0.0' },
      { caminho: 'ide.tp_bpe', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo BP-e', valores: '[0,3]', exemplo: '3' },
      { caminho: 'ide.ind_pres', tipo: 'integer', obrigatorio: 'Sim', regras: 'Indicador presença', valores: '[1,2,3,4,5,9]', exemplo: '1' },
      { caminho: 'ide.uf_ini', tipo: 'string', obrigatorio: 'Sim', regras: 'Tamanho 2', valores: '-', exemplo: 'MG' },
      { caminho: 'ide.c_mun_ini', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3106200' },
      { caminho: 'ide.uf_fim', tipo: 'string', obrigatorio: 'Sim', regras: 'Tamanho 2', valores: '-', exemplo: 'SP' },
      { caminho: 'ide.c_mun_fim', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3550308' },
      {
        caminho: 'ide.dh_cont',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Condicional',
        regras: 'Obrigatório se ide.tp_emis = 2',
        valores: 'regex datetime',
        exemplo: '2026-03-23T14:35:00-03:00'
      },
      {
        caminho: 'ide.x_just',
        tipo: 'string',
        obrigatorio: 'Condicional',
        regras: '15 a 256 chars, obrigatório se ide.tp_emis = 2',
        valores: '-',
        exemplo: 'Falha de comunicação principal, emissão em contingência'
      }
    ]
  },
  {
    titulo: 'inf_passagem',
    descricao: 'Informações de origem, destino e validade da passagem',
    campos: [
      { caminho: 'inf_passagem.c_loc_orig', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3106200' },
      { caminho: 'inf_passagem.x_loc_orig', tipo: 'string', obrigatorio: 'Sim', regras: '2 a 60 chars', valores: '-', exemplo: 'Belo Horizonte' },
      { caminho: 'inf_passagem.c_loc_dest', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3550308' },
      { caminho: 'inf_passagem.x_loc_dest', tipo: 'string', obrigatorio: 'Sim', regras: '2 a 60 chars', valores: '-', exemplo: 'São Paulo' },
      {
        caminho: 'inf_passagem.dh_emb',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Sim',
        regras: 'Backend deriva de ide.dh_emi',
        valores: 'regex datetime',
        exemplo: '2026-03-23T14:30:00-03:00'
      },
      {
        caminho: 'inf_passagem.dh_validade',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Sim',
        regras: 'Quando tp_bpe=0 backend define automaticamente; para tp_bpe=3 enviar',
        valores: 'regex datetime',
        exemplo: '2026-03-23T18:30:00-03:00'
      }
    ]
  },
  {
    titulo: 'inf_viagem[]',
    descricao: 'Trechos da viagem (mínimo 1 item)',
    campos: [
      { caminho: 'inf_viagem[].c_percurso', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3106200' },
      { caminho: 'inf_viagem[].x_percurso', tipo: 'string', obrigatorio: 'Sim', regras: '2 a 100 chars', valores: '-', exemplo: 'Belo Horizonte -> São Paulo' },
      { caminho: 'inf_viagem[].tp_viagem', tipo: 'string', obrigatorio: 'Sim', regras: 'Tipo viagem', valores: '["00","01"]', exemplo: '"00"' },
      { caminho: 'inf_viagem[].tp_serv', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo serviço', valores: '[1,2,3,4,5,6,7,8,9]', exemplo: '1' },
      { caminho: 'inf_viagem[].tp_acomodacao', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo acomodação', valores: '[1,2,3,4,5]', exemplo: '2' },
      { caminho: 'inf_viagem[].tp_trecho', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo trecho', valores: '[1,2,3]', exemplo: '3' },
      { caminho: 'inf_viagem[].dh_viagem', tipo: 'string datetime ISO 8601', obrigatorio: 'Sim', regras: 'Data da viagem', valores: 'regex datetime', exemplo: '2026-03-23T16:00:00-03:00' },
      {
        caminho: 'inf_viagem[].dh_conexao',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Condicional',
        regras: 'Obrigatório quando tp_trecho = 3',
        valores: 'regex datetime',
        exemplo: '2026-03-23T17:30:00-03:00'
      },
      { caminho: 'inf_viagem[].prefixo', tipo: 'string', obrigatorio: 'Não', regras: 'Max 20 chars', valores: '-', exemplo: 'LINHA-EXP-01' },
      { caminho: 'inf_viagem[].poltrona', tipo: 'string', obrigatorio: 'Não', regras: 'Max 3 chars', valores: '-', exemplo: '12A' }
    ]
  },
  {
    titulo: 'inf_valor_b_pe',
    descricao: 'Composição de valores e componentes de preço',
    campos: [
      { caminho: 'inf_valor_b_pe.v_bp', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"150.00"' },
      { caminho: 'inf_valor_b_pe.v_desconto', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"10.00"' },
      { caminho: 'inf_valor_b_pe.v_pgto', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"140.00"' },
      { caminho: 'inf_valor_b_pe.v_troco', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"0.00"' },
      { caminho: 'inf_valor_b_pe.tp_desconto', tipo: 'string', obrigatorio: 'Não', regras: 'Tipo desconto', valores: '["01","02","03","04","05","06","07","08","09","10","99"]', exemplo: '"01"' },
      { caminho: 'inf_valor_b_pe.x_desconto', tipo: 'string', obrigatorio: 'Não', regras: '2 a 100 chars', valores: '-', exemplo: 'Campanha promocional' },
      { caminho: 'inf_valor_b_pe.c_desconto', tipo: 'string', obrigatorio: 'Não', regras: 'Max 20 chars', valores: '-', exemplo: 'PROMO-2026' },
      { caminho: 'inf_valor_b_pe.comps[]', tipo: 'array', obrigatorio: 'Sim', regras: 'Mínimo 1 item', valores: '-', exemplo: '-' },
      { caminho: 'inf_valor_b_pe.comps[].tp_comp', tipo: 'string', obrigatorio: 'Sim', regras: 'Tipo componente', valores: '["01","02","03","04","05","06","99"]', exemplo: '"01"' },
      { caminho: 'inf_valor_b_pe.comps[].v_comp', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"130.00"' }
    ]
  },
  {
    titulo: 'imp.icms00',
    descricao: 'Informações de tributação ICMS',
    campos: [
      { caminho: 'imp.icms00.cst', tipo: 'string', obrigatorio: 'Sim', regras: 'Max 2 chars', valores: '-', exemplo: '"00"' },
      { caminho: 'imp.icms00.v_bc', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"150.00"' },
      { caminho: 'imp.icms00.p_icms', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"12.00"' },
      { caminho: 'imp.icms00.v_icms', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"18.00"' }
    ]
  },
  {
    titulo: 'pag[]',
    descricao: 'Formas de pagamento (min 1, max 10 itens)',
    campos: [
      { caminho: 'pag[].t_pag', tipo: 'string', obrigatorio: 'Sim', regras: 'Tipo pagamento', valores: '["01","02","03","04","05","06","99"]', exemplo: '"99"' },
      { caminho: 'pag[].x_pag', tipo: 'string', obrigatorio: 'Condicional', regras: '2 a 100 chars, obrigatório quando t_pag = "99"', valores: '-', exemplo: 'PIX QR Code' },
      { caminho: 'pag[].v_pag', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Até 2 casas', valores: '-', exemplo: '"140.00"' }
    ]
  }
];

const requestExemplo = `{
  "client_uuid": "8c0e8477-7a25-4235-b5c8-f5244f6252e6",
  "ide": {
    "c_uf": 31,
    "tp_amb": 2,
    "mod": 63,
    "serie": 1,
    "n_bp": 12345,
    "modal": 1,
    "dh_emi": "2026-03-23T14:30:00-03:00",
    "tp_emis": 2,
    "ver_proc": "agenda-front-1.0.0",
    "tp_bpe": 3,
    "ind_pres": 1,
    "uf_ini": "MG",
    "c_mun_ini": "3106200",
    "uf_fim": "SP",
    "c_mun_fim": "3550308",
    "dh_cont": "2026-03-23T14:35:00-03:00",
    "x_just": "Falha de comunicação principal, emissão em contingência"
  },
  "inf_passagem": {
    "c_loc_orig": "3106200",
    "x_loc_orig": "Belo Horizonte",
    "c_loc_dest": "3550308",
    "x_loc_dest": "São Paulo",
    "dh_emb": "2026-03-23T14:30:00-03:00",
    "dh_validade": "2026-03-23T18:30:00-03:00"
  },
  "inf_viagem": [
    {
      "c_percurso": "3106200",
      "x_percurso": "Belo Horizonte -> São Paulo",
      "tp_viagem": "00",
      "tp_serv": 1,
      "tp_acomodacao": 2,
      "tp_trecho": 3,
      "dh_viagem": "2026-03-23T16:00:00-03:00",
      "dh_conexao": "2026-03-23T17:30:00-03:00",
      "prefixo": "LINHA-EXP-01",
      "poltrona": "12A"
    }
  ],
  "inf_valor_b_pe": {
    "v_bp": "150.00",
    "v_desconto": "10.00",
    "v_pgto": "140.00",
    "v_troco": "0.00",
    "tp_desconto": "01",
    "x_desconto": "Campanha promocional",
    "c_desconto": "PROMO-2026",
    "comps": [
      { "tp_comp": "01", "v_comp": "130.00" },
      { "tp_comp": "02", "v_comp": "20.00" }
    ]
  },
  "imp": {
    "icms00": {
      "cst": "00",
      "v_bc": "150.00",
      "p_icms": "12.00",
      "v_icms": "18.00"
    }
  },
  "pag": [
    {
      "t_pag": "99",
      "x_pag": "PIX QR Code",
      "v_pag": "140.00"
    }
  ]
}`;

const responseSucesso = `{
  "ambiente": 2,
  "codigoUf": 31,
  "versaoAplicativo": "1.0.0",
  "codigoStatus": 100,
  "motivo": "Autorizado o uso do BP-e",
  "chaveBpe": "31260312345678000123570010000123451000012345",
  "protocolo": "131260000123456",
  "dataRecebimento": "2026-03-23T14:31:11-03:00",
  "numeroRecibo": "231000000987654",
  "xmlResponse": "<bpeProc>...</bpeProc>"
}`;

const responseErro = `{
  "message": "Dados inválidos",
  "errors": {
    "ide.tp_emis": ["O campo ide.tp_emis é obrigatório."],
    "pag.0.x_pag": ["O campo x_pag é obrigatório quando t_pag for 99."]
  }
}`;

const validacoesCondicionais = [
  'Se ide.tp_emis = 2, enviar obrigatoriamente ide.dh_cont e ide.x_just.',
  'Se inf_viagem[i].tp_trecho = 3, enviar inf_viagem[i].dh_conexao.',
  'Se pag[i].t_pag = "99", enviar pag[i].x_pag.',
  'Usar client_uuid para idempotência e evitar emissão duplicada.',
  'ide.dh_emi pode ser omitido, mas a recomendação é enviar explicitamente.',
  'inf_passagem.dh_emb é derivado de ide.dh_emi no backend.'
];

const checklistFrontend = [
  'Implementar validação client-side por grupo (ide, inf_passagem, inf_viagem, valores, impostos, pagamento).',
  'Criar formatadores para datetime ISO 8601 com timezone e decimal com 2 casas.',
  'Gerar e persistir client_uuid por tentativa de emissão para idempotência.',
  'Mapear erros 422 por path de campo e exibir mensagens no formulário.',
  'No retry, reaproveitar o mesmo client_uuid para evitar duplicação de BP-e.',
  'Exibir feedback de status com motivo, protocolo e chaveBpe quando autorizado.'
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
            <span class="metodo metodo--post">{{ endpointBpe.metodo }}</span>
            <code class="doc-valor-tecnico">{{ endpointBpe.url }}</code>
            <span class="nome-interno doc-valor-tecnico">{{ endpointBpe.nomeInterno }}</span>
          </div>
          <p class="nota cabecalho-objetivo">{{ endpointBpe.objetivo }}</p>
        </section>

        <section class="bloco-doc resumo-endpoint-unico">
          <h2>Resumo do endpoint</h2>
          <div class="tabela-wrap">
            <table class="tabela-doc">
              <thead>
                <tr>
                  <th>Método</th>
                  <th>URL</th>
                  <th>Objetivo</th>
                  <th>Nome interno sugerido</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Método">
                    <span class="metodo metodo--post">{{ endpointBpe.metodo }}</span>
                  </td>
                  <td data-label="URL"><code class="doc-valor-tecnico">{{ endpointBpe.url }}</code></td>
                  <td data-label="Objetivo"><span class="doc-valor-texto">{{ endpointBpe.objetivo }}</span></td>
                  <td data-label="Nome interno"><code class="doc-valor-tecnico">{{ endpointBpe.nomeInterno }}</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="nota">
            Content-Type: <code>application/json</code>. Autenticação não documentada explicitamente para este endpoint.
          </p>
        </section>

        <section class="bloco-doc bloco-doc--nota-mobile">
          <p class="nota mb-0">
            Content-Type: <code>application/json</code>. Autenticação não documentada explicitamente para este endpoint.
          </p>
        </section>

        <section class="bloco-doc">
          <h2>Formato de datetime aceito</h2>
          <p>Exemplo válido:</p>
          <code class="doc-code-inline">2026-03-23T14:30:00-03:00</code>
          <p class="mt-2 mb-1">Regex:</p>
          <div class="doc-scroll-wrap">
            <pre class="bloco-json bloco-json--compact">^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})$</pre>
          </div>
        </section>

        <section class="bloco-doc bloco-doc--intro-campos">
          <h2>Campos do request</h2>
          <p class="nota mb-0">
            Payload dividido por grupo. Cada bloco abaixo descreve um conjunto de campos da emissão.
          </p>
        </section>

        <section
          v-for="grupo in gruposCampos"
          :key="grupo.titulo"
          class="bloco-doc grupo-campos-bloco"
        >
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
                <tr v-for="campo in grupo.campos" :key="campo.caminho">
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
        </section>

        <section class="bloco-doc">
          <h2>Validações condicionais</h2>
          <ul class="lista-check">
            <li v-for="item in validacoesCondicionais" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="bloco-doc">
          <h2>Request válido completo</h2>
          <div class="doc-scroll-wrap">
            <pre class="bloco-json">{{ requestExemplo }}</pre>
          </div>
        </section>

        <section class="bloco-doc">
          <h2>Responses da API</h2>
          <div class="respostas-grid">
            <div class="resposta-card sucesso">
              <h3>200 OK</h3>
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
