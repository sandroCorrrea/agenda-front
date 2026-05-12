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
        obrigatorio: 'Nao',
        regras: 'Recomendado para idempotencia',
        valores: '-',
        exemplo: '8c0e8477-7a25-4235-b5c8-f5244f6252e6'
      }
    ]
  },
  {
    titulo: 'ide',
    descricao: 'Identificacao principal da emissao',
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
      { caminho: 'ide.tp_emis', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo emissao', valores: '[1,2]', exemplo: '2' },
      { caminho: 'ide.ver_proc', tipo: 'string', obrigatorio: 'Sim', regras: '1 a 20 chars', valores: '-', exemplo: 'agenda-front-1.0.0' },
      { caminho: 'ide.tp_bpe', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo BP-e', valores: '[0,3]', exemplo: '3' },
      { caminho: 'ide.ind_pres', tipo: 'integer', obrigatorio: 'Sim', regras: 'Indicador presenca', valores: '[1,2,3,4,5,9]', exemplo: '1' },
      { caminho: 'ide.uf_ini', tipo: 'string', obrigatorio: 'Sim', regras: 'Tamanho 2', valores: '-', exemplo: 'MG' },
      { caminho: 'ide.c_mun_ini', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3106200' },
      { caminho: 'ide.uf_fim', tipo: 'string', obrigatorio: 'Sim', regras: 'Tamanho 2', valores: '-', exemplo: 'SP' },
      { caminho: 'ide.c_mun_fim', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3550308' },
      {
        caminho: 'ide.dh_cont',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Condicional',
        regras: 'Obrigatorio se ide.tp_emis = 2',
        valores: 'regex datetime',
        exemplo: '2026-03-23T14:35:00-03:00'
      },
      {
        caminho: 'ide.x_just',
        tipo: 'string',
        obrigatorio: 'Condicional',
        regras: '15 a 256 chars, obrigatorio se ide.tp_emis = 2',
        valores: '-',
        exemplo: 'Falha de comunicacao principal, emissao em contingencia'
      }
    ]
  },
  {
    titulo: 'inf_passagem',
    descricao: 'Informacoes de origem, destino e validade da passagem',
    campos: [
      { caminho: 'inf_passagem.c_loc_orig', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3106200' },
      { caminho: 'inf_passagem.x_loc_orig', tipo: 'string', obrigatorio: 'Sim', regras: '2 a 60 chars', valores: '-', exemplo: 'Belo Horizonte' },
      { caminho: 'inf_passagem.c_loc_dest', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3550308' },
      { caminho: 'inf_passagem.x_loc_dest', tipo: 'string', obrigatorio: 'Sim', regras: '2 a 60 chars', valores: '-', exemplo: 'Sao Paulo' },
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
    descricao: 'Trechos da viagem (minimo 1 item)',
    campos: [
      { caminho: 'inf_viagem[].c_percurso', tipo: 'string', obrigatorio: 'Sim', regras: 'Regex ^\\d{7}$', valores: '-', exemplo: '3106200' },
      { caminho: 'inf_viagem[].x_percurso', tipo: 'string', obrigatorio: 'Sim', regras: '2 a 100 chars', valores: '-', exemplo: 'Belo Horizonte -> Sao Paulo' },
      { caminho: 'inf_viagem[].tp_viagem', tipo: 'string', obrigatorio: 'Sim', regras: 'Tipo viagem', valores: '["00","01"]', exemplo: '"00"' },
      { caminho: 'inf_viagem[].tp_serv', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo servico', valores: '[1,2,3,4,5,6,7,8,9]', exemplo: '1' },
      { caminho: 'inf_viagem[].tp_acomodacao', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo acomodacao', valores: '[1,2,3,4,5]', exemplo: '2' },
      { caminho: 'inf_viagem[].tp_trecho', tipo: 'integer', obrigatorio: 'Sim', regras: 'Tipo trecho', valores: '[1,2,3]', exemplo: '3' },
      { caminho: 'inf_viagem[].dh_viagem', tipo: 'string datetime ISO 8601', obrigatorio: 'Sim', regras: 'Data da viagem', valores: 'regex datetime', exemplo: '2026-03-23T16:00:00-03:00' },
      {
        caminho: 'inf_viagem[].dh_conexao',
        tipo: 'string datetime ISO 8601',
        obrigatorio: 'Condicional',
        regras: 'Obrigatorio quando tp_trecho = 3',
        valores: 'regex datetime',
        exemplo: '2026-03-23T17:30:00-03:00'
      },
      { caminho: 'inf_viagem[].prefixo', tipo: 'string', obrigatorio: 'Nao', regras: 'Max 20 chars', valores: '-', exemplo: 'LINHA-EXP-01' },
      { caminho: 'inf_viagem[].poltrona', tipo: 'string', obrigatorio: 'Nao', regras: 'Max 3 chars', valores: '-', exemplo: '12A' }
    ]
  },
  {
    titulo: 'inf_valor_b_pe',
    descricao: 'Composicao de valores e componentes de preco',
    campos: [
      { caminho: 'inf_valor_b_pe.v_bp', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"150.00"' },
      { caminho: 'inf_valor_b_pe.v_desconto', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"10.00"' },
      { caminho: 'inf_valor_b_pe.v_pgto', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"140.00"' },
      { caminho: 'inf_valor_b_pe.v_troco', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"0.00"' },
      { caminho: 'inf_valor_b_pe.tp_desconto', tipo: 'string', obrigatorio: 'Nao', regras: 'Tipo desconto', valores: '["01","02","03","04","05","06","07","08","09","10","99"]', exemplo: '"01"' },
      { caminho: 'inf_valor_b_pe.x_desconto', tipo: 'string', obrigatorio: 'Nao', regras: '2 a 100 chars', valores: '-', exemplo: 'Campanha promocional' },
      { caminho: 'inf_valor_b_pe.c_desconto', tipo: 'string', obrigatorio: 'Nao', regras: 'Max 20 chars', valores: '-', exemplo: 'PROMO-2026' },
      { caminho: 'inf_valor_b_pe.comps[]', tipo: 'array', obrigatorio: 'Sim', regras: 'Minimo 1 item', valores: '-', exemplo: '-' },
      { caminho: 'inf_valor_b_pe.comps[].tp_comp', tipo: 'string', obrigatorio: 'Sim', regras: 'Tipo componente', valores: '["01","02","03","04","05","06","99"]', exemplo: '"01"' },
      { caminho: 'inf_valor_b_pe.comps[].v_comp', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"130.00"' }
    ]
  },
  {
    titulo: 'imp.icms00',
    descricao: 'Informacoes de tributacao ICMS',
    campos: [
      { caminho: 'imp.icms00.cst', tipo: 'string', obrigatorio: 'Sim', regras: 'Max 2 chars', valores: '-', exemplo: '"00"' },
      { caminho: 'imp.icms00.v_bc', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"150.00"' },
      { caminho: 'imp.icms00.p_icms', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"12.00"' },
      { caminho: 'imp.icms00.v_icms', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"18.00"' }
    ]
  },
  {
    titulo: 'pag[]',
    descricao: 'Formas de pagamento (min 1, max 10 itens)',
    campos: [
      { caminho: 'pag[].t_pag', tipo: 'string', obrigatorio: 'Sim', regras: 'Tipo pagamento', valores: '["01","02","03","04","05","06","99"]', exemplo: '"99"' },
      { caminho: 'pag[].x_pag', tipo: 'string', obrigatorio: 'Condicional', regras: '2 a 100 chars, obrigatorio quando t_pag = "99"', valores: '-', exemplo: 'PIX QR Code' },
      { caminho: 'pag[].v_pag', tipo: 'string decimal', obrigatorio: 'Sim', regras: 'Ate 2 casas', valores: '-', exemplo: '"140.00"' }
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
    "x_just": "Falha de comunicacao principal, emissao em contingencia"
  },
  "inf_passagem": {
    "c_loc_orig": "3106200",
    "x_loc_orig": "Belo Horizonte",
    "c_loc_dest": "3550308",
    "x_loc_dest": "Sao Paulo",
    "dh_emb": "2026-03-23T14:30:00-03:00",
    "dh_validade": "2026-03-23T18:30:00-03:00"
  },
  "inf_viagem": [
    {
      "c_percurso": "3106200",
      "x_percurso": "Belo Horizonte -> Sao Paulo",
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
  "message": "Dados invalidos",
  "errors": {
    "ide.tp_emis": ["O campo ide.tp_emis e obrigatorio."],
    "pag.0.x_pag": ["O campo x_pag e obrigatorio quando t_pag for 99."]
  }
}`;

const validacoesCondicionais = [
  'Se ide.tp_emis = 2, enviar obrigatoriamente ide.dh_cont e ide.x_just.',
  'Se inf_viagem[i].tp_trecho = 3, enviar inf_viagem[i].dh_conexao.',
  'Se pag[i].t_pag = "99", enviar pag[i].x_pag.',
  'Usar client_uuid para idempotencia e evitar emissao duplicada.',
  'ide.dh_emi pode ser omitido, mas a recomendacao e enviar explicitamente.',
  'inf_passagem.dh_emb e derivado de ide.dh_emi no backend.'
];

const checklistFrontend = [
  'Implementar validacao client-side por grupo (ide, inf_passagem, inf_viagem, valores, impostos, pagamento).',
  'Criar formatadores para datetime ISO 8601 com timezone e decimal com 2 casas.',
  'Gerar e persistir client_uuid por tentativa de emissao para idempotencia.',
  'Mapear erros 422 por path de campo e exibir mensagens no formulario.',
  'No retry, reaproveitar o mesmo client_uuid para evitar duplicacao de BP-e.',
  'Exibir feedback de status com motivo, protocolo e chaveBpe quando autorizado.'
];
</script>

<template>
  <article class="page-servicos d-flex align-items-start min-vh-100 py-4">
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
      <span class="selo">Documentacao API fiscal</span>
      <div class="meta-endpoint">
        <span class="metodo">{{ endpointBpe.metodo }}</span>
        <code>{{ endpointBpe.url }}</code>
        <span class="nome-interno">{{ endpointBpe.nomeInterno }}</span>
      </div>
    </section>

    <section class="bloco-doc">
      <h2>Resumo do endpoint</h2>
      <div class="tabela-wrap">
        <table class="tabela-doc">
          <thead>
            <tr>
              <th>Metodo</th>
              <th>URL</th>
              <th>Objetivo</th>
              <th>Nome interno sugerido</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ endpointBpe.metodo }}</td>
              <td><code>{{ endpointBpe.url }}</code></td>
              <td>{{ endpointBpe.objetivo }}</td>
              <td><code>{{ endpointBpe.nomeInterno }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="nota">
        Content-Type: <code>application/json</code>. Autenticacao nao documentada explicitamente para este endpoint.
      </p>
    </section>

    <section class="bloco-doc">
      <h2>Formato de datetime aceito</h2>
      <p>Regex: <code>^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}([+-]\\d{2}:\\d{2})$</code></p>
      <p>Exemplo valido: <code>2026-03-23T14:30:00-03:00</code></p>
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
              <tr v-for="campo in grupo.campos" :key="campo.caminho">
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
      <h2>Request valido completo</h2>
      <pre class="bloco-json">{{ requestExemplo }}</pre>
    </section>

    <section class="bloco-doc">
      <h2>Responses da API</h2>
      <div class="respostas-grid">
        <div class="resposta-card sucesso">
          <h3>200 OK</h3>
          <pre class="bloco-json">{{ responseSucesso }}</pre>
        </div>
        <div class="resposta-card erro">
          <h3>422 Unprocessable Entity</h3>
          <pre class="bloco-json">{{ responseErro }}</pre>
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
