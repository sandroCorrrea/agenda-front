<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiFilePdf2Line,
  RiPencilLine,
  RiSearchLine,
  RiShieldCheckLine,
  RiTimeLine
} from "@remixicon/vue";
import type { Protocolo } from "@/domain/entities/Protocolo";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useProtocolosAdmin } from "@/presentation/composables/Protocolo/useProtocolosAdmin";
import { formatarDataIsoPtBr } from "@/shared/utils/date.util";
import { cpfMask } from "@/shared/utils/masks";

const route = useRoute();
const router = useRouter();
const {
  filtros,
  protocolos,
  carregandoLista,
  carregandoDetalhe,
  excluindoId,
  paginaAtual,
  totalRegistros,
  erro,
  sucesso,
  modalExcluirId,
  protocoloExclusaoNome,
  modalDetalheId,
  protocoloDetalhe,
  carregar,
  carregarDetalhe,
  fecharDetalhe,
  abrirModalExcluir,
  fecharModalExcluir,
  confirmarExclusao,
  totalPaginas,
  irParaPagina,
  baixandoPdfId,
  baixarPdf
} = useProtocolosAdmin();

const criadoMsg = ref(false);

onMounted(async () => {
  if (route.query.criado === "1") {
    criadoMsg.value = true;
    void router.replace({ query: {} });
  }
  await carregar(1);
});

function aplicarFiltros() {
  void carregar(1);
}

function chipTipo(tipo: string) {
  return tipo === "fisica" ? "Física" : "Jurídica";
}

function destinatarioNomeDisplay(item: Pick<Protocolo, "destinatarioNome">) {
  const nome = item.destinatarioNome?.trim();
  return nome && nome.length > 0 ? nome : "—";
}

function protocoloEntregue(item: Protocolo) {
  return item.entregue;
}

function tooltipAssinatura(item: Protocolo) {
  if (!item.entrega) {
    return item.entregue
      ? "Protocolo entregue"
      : "Aguardando assinatura do recebimento";
  }
  const nome = item.entrega.nomeResponsavelRecebimento || "—";
  const cpf = item.entrega.cpfResponsavelRecebimento
    ? cpfMask(item.entrega.cpfResponsavelRecebimento)
    : "—";
  return `Assinado por ${nome} · CPF ${cpf}`;
}
</script>

<template>
  <article class="admin-list-page min-vh-100 py-4">
    <div class="container">
      <AdminPageHero
        title="Protocolos"
        subtitle="Central de controle para criação, acompanhamento e entrega de protocolos."
      >
        <template #icon><RiShieldCheckLine /></template>
        <template #actions>
          <RouterLink :to="{ name: 'AdministradorProtocoloCadastro' }" class="btn">
            <RiAddLine class="me-1" /> Novo protocolo
          </RouterLink>
        </template>
      </AdminPageHero>

      <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
      <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>
      <div v-if="criadoMsg" class="admin-alert admin-alert--ok mb-3">Protocolo criado com sucesso.</div>

      <section class="card border-0 shadow-sm proto-filters mb-4">
        <div class="card-body p-3 p-md-4">
          <form class="row g-3" @submit.prevent="aplicarFiltros">
            <div class="col-12 col-md-5">
              <label class="form-label">Título</label>
              <div class="proto-input-wrap">
                <RiSearchLine class="proto-input-wrap__icon" />
                <input v-model="filtros.titulo" type="text" class="form-control" placeholder="Ex.: Contrato" />
              </div>
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label">Ano</label>
              <input v-model="filtros.ano" type="number" min="2000" max="9999" class="form-control" />
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label">Tipo</label>
              <select v-model="filtros.destinatario_tipo" class="form-select">
                <option value="">Todos</option>
                <option value="fisica">Física</option>
                <option value="juridica">Jurídica</option>
              </select>
            </div>
            <div class="col-12 col-md-1 d-grid align-items-end">
              <button class="btn proto-filter-btn" type="submit">Filtrar</button>
            </div>
          </form>
        </div>
      </section>

      <section class="card border-0 shadow-sm">
        <div class="card-body p-4 p-md-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="proto-subtitle mb-0">Listagem</h2>
            <small class="text-muted">{{ totalRegistros }} registro(s)</small>
          </div>

          <div v-if="carregandoLista" class="text-muted py-4">Carregando protocolos...</div>
          <div v-else-if="protocolos.length === 0" class="text-center py-5 text-muted">Nenhum protocolo encontrado.</div>
          <div v-else class="proto-list">
            <div class="table-responsive d-none d-lg-block">
              <table class="table align-middle proto-table mb-0">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Destinatário</th>
                  <th>Entrega</th>
                  <th class="proto-actions-head">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in protocolos" :key="`tbl-${item.id}`">
                  <td class="proto-table__titulo">{{ item.titulo || "Sem título" }}</td>
                  <td><span class="proto-chip">{{ chipTipo(item.destinatarioTipo) }}</span></td>
                  <td class="proto-table__destinatario">{{ destinatarioNomeDisplay(item) }}</td>
                  <td class="text-nowrap">{{ formatarDataIsoPtBr(item.dataParaEntrega) }}</td>
                  <td class="proto-actions-cell">
                    <div
                      class="proto-actions"
                      role="group"
                      :aria-label="`Ações do protocolo ${item.titulo || item.id}`"
                    >
                      <button
                        type="button"
                        class="proto-action-btn proto-action-btn--view"
                        title="Ver detalhes"
                        aria-label="Ver detalhes"
                        @click="carregarDetalhe(item.id)"
                      >
                        <RiEyeLine />
                      </button>
                      <button
                        type="button"
                        class="proto-action-btn proto-action-btn--pdf"
                        :disabled="baixandoPdfId !== null"
                        :aria-busy="baixandoPdfId === item.id"
                        title="Baixar PDF"
                        aria-label="Baixar PDF"
                        @click="baixarPdf(item.id)"
                      >
                        <RiFilePdf2Line />
                      </button>
                      <template v-if="!protocoloEntregue(item)">
                        <RouterLink
                          class="proto-action-btn proto-action-btn--edit"
                          :to="{ name: 'AdministradorProtocoloEditar', params: { id: item.id } }"
                          title="Editar"
                          aria-label="Editar"
                        >
                          <RiPencilLine />
                        </RouterLink>
                        <button
                          type="button"
                          class="proto-action-btn proto-action-btn--delete"
                          :disabled="excluindoId !== null"
                          :aria-busy="excluindoId === item.id"
                          title="Excluir"
                          aria-label="Excluir"
                          @click="abrirModalExcluir(item.id)"
                        >
                          <RiDeleteBinLine />
                        </button>
                      </template>
                      <span
                        v-else
                        class="proto-action-btn proto-action-btn--entregue proto-entregue-check"
                        tabindex="0"
                        role="img"
                        :aria-label="tooltipAssinatura(item)"
                      >
                        <RiCheckboxCircleFill />
                        <span class="proto-entregue-check__tip" role="tooltip">
                          <strong>Recebimento assinado</strong>
                          <template v-if="item.entrega">
                            <span>{{ item.entrega.nomeResponsavelRecebimento }}</span>
                            <span>CPF {{ cpfMask(item.entrega.cpfResponsavelRecebimento) }}</span>
                          </template>
                          <span v-else class="proto-entregue-check__tip-muted">
                            Dados da assinatura não retornados pela API
                          </span>
                        </span>
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
              </table>
            </div>

            <ul class="proto-cards d-lg-none list-unstyled mb-0">
              <li v-for="item in protocolos" :key="`card-${item.id}`" class="proto-card">
                <div class="proto-card__head">
                  <h3 class="proto-card__titulo">{{ item.titulo || "Sem título" }}</h3>
                  <span class="proto-chip">{{ chipTipo(item.destinatarioTipo) }}</span>
                </div>
                <dl class="proto-card__meta">
                  <div class="proto-card__meta--full"><dt>Destinatário</dt><dd>{{ destinatarioNomeDisplay(item) }}</dd></div>
                  <div><dt>Ano</dt><dd>{{ item.ano }}</dd></div>
                  <div><dt>Entrega</dt><dd>{{ formatarDataIsoPtBr(item.dataParaEntrega) }}</dd></div>
                </dl>
                <div
                  class="proto-actions proto-actions--card"
                  role="group"
                  :aria-label="`Ações do protocolo ${item.titulo || item.id}`"
                >
                  <button
                    type="button"
                    class="proto-action-btn proto-action-btn--view"
                    title="Ver detalhes"
                    aria-label="Ver detalhes"
                    @click="carregarDetalhe(item.id)"
                  >
                    <RiEyeLine />
                    <span class="proto-action-btn__label">Detalhes</span>
                  </button>
                  <button
                    type="button"
                    class="proto-action-btn proto-action-btn--pdf"
                    :disabled="baixandoPdfId !== null"
                    :aria-busy="baixandoPdfId === item.id"
                    title="Baixar PDF"
                    aria-label="Baixar PDF"
                    @click="baixarPdf(item.id)"
                  >
                    <RiFilePdf2Line />
                    <span class="proto-action-btn__label">PDF</span>
                  </button>
                  <template v-if="!protocoloEntregue(item)">
                    <RouterLink
                      class="proto-action-btn proto-action-btn--edit"
                      :to="{ name: 'AdministradorProtocoloEditar', params: { id: item.id } }"
                      title="Editar"
                      aria-label="Editar"
                    >
                      <RiPencilLine />
                      <span class="proto-action-btn__label">Editar</span>
                    </RouterLink>
                    <button
                      type="button"
                      class="proto-action-btn proto-action-btn--delete"
                      :disabled="excluindoId !== null"
                      :aria-busy="excluindoId === item.id"
                      title="Excluir"
                      aria-label="Excluir"
                      @click="abrirModalExcluir(item.id)"
                    >
                      <RiDeleteBinLine />
                      <span class="proto-action-btn__label">Excluir</span>
                    </button>
                  </template>
                  <span
                    v-else
                    class="proto-action-btn proto-action-btn--entregue proto-entregue-check proto-entregue-check--card"
                    tabindex="0"
                    role="img"
                    :aria-label="tooltipAssinatura(item)"
                  >
                    <RiCheckboxCircleFill />
                    <span class="proto-action-btn__label">Entregue</span>
                    <span class="proto-entregue-check__tip" role="tooltip">
                      <strong>Recebimento assinado</strong>
                      <template v-if="item.entrega">
                        <span>{{ item.entrega.nomeResponsavelRecebimento }}</span>
                        <span>CPF {{ cpfMask(item.entrega.cpfResponsavelRecebimento) }}</span>
                      </template>
                      <span v-else class="proto-entregue-check__tip-muted">
                        Dados da assinatura não retornados pela API
                      </span>
                    </span>
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="protocolos.length > 0" class="proto-pag mt-3">
            <button class="btn proto-pag__nav" :disabled="paginaAtual<=1" @click="irParaPagina(paginaAtual-1)"><RiArrowLeftSLine /></button>
            <span>Página {{ paginaAtual }} de {{ totalPaginas() }}</span>
            <button class="btn proto-pag__nav" :disabled="paginaAtual>=totalPaginas()" @click="irParaPagina(paginaAtual+1)"><RiArrowRightSLine /></button>
          </div>
        </div>
      </section>
    </div>
  </article>

  <Teleport to="body">
    <div v-if="modalDetalheId!==null" class="proto-modal__portal">
      <div class="proto-modal__backdrop" @click="fecharDetalhe" />
      <div class="proto-modal__wrap" @click.self="fecharDetalhe">
        <div class="proto-modal__panel">
          <button class="proto-modal__close" @click="fecharDetalhe"><RiCloseLine /></button>
          <h3 class="mb-3">Detalhes do protocolo</h3>
          <div v-if="carregandoDetalhe" class="text-muted">Carregando...</div>
          <div v-else-if="protocoloDetalhe" class="proto-detail">
            <p><strong>Título:</strong> {{ protocoloDetalhe.titulo || "Sem título" }}</p>
            <p><strong>Descrição:</strong> {{ protocoloDetalhe.descricao }}</p>
            <p><strong>Tipo:</strong> {{ chipTipo(protocoloDetalhe.destinatarioTipo) }}</p>
            <p><strong>Destinatário:</strong> {{ destinatarioNomeDisplay(protocoloDetalhe) }}</p>
            <p><strong>Ano:</strong> {{ protocoloDetalhe.ano }}</p>
            <p><strong>Data para entrega:</strong> {{ formatarDataIsoPtBr(protocoloDetalhe.dataParaEntrega) }}</p>
            <p><strong>CEP:</strong> {{ protocoloDetalhe.cepDestinatario }}</p>
            <p><strong>Rua:</strong> {{ protocoloDetalhe.ruaDestinatario }}</p>
            <p><strong>Bairro:</strong> {{ protocoloDetalhe.bairroDestinatario }}</p>
            <p><strong>Cidade:</strong> {{ protocoloDetalhe.cidadeDestinatario }}</p>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                class="btn proto-pdf-btn"
                :disabled="baixandoPdfId !== null"
                @click="baixarPdf(protocoloDetalhe.id)"
              >
                <RiFilePdf2Line class="me-1" />
                {{ baixandoPdfId === protocoloDetalhe.id ? "Gerando..." : "Baixar PDF" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div v-if="modalExcluirId!==null" class="proto-modal__portal">
      <div class="proto-modal__backdrop" @click="fecharModalExcluir" />
      <div class="proto-modal__wrap" @click.self="fecharModalExcluir">
        <div class="proto-modal__panel">
          <button class="proto-modal__close" @click="fecharModalExcluir"><RiCloseLine /></button>
          <h3>Excluir protocolo?</h3>
          <p>Esta ação é irreversível.</p>
          <p><strong>{{ protocoloExclusaoNome }}</strong></p>
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button class="btn btn-outline-secondary" @click="fecharModalExcluir">Cancelar</button>
            <button class="btn btn-danger" :disabled="excluindoId!==null" @click="confirmarExclusao">
              <RiTimeLine class="me-1" /> {{ excluindoId!==null ? "Excluindo..." : "Excluir" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.proto-subtitle{font-size:1.2rem;font-weight:800;color:#16254e}
.proto-input-wrap{position:relative}.proto-input-wrap__icon{position:absolute;left:.85rem;top:.7rem;color:#6b7d9c}.proto-input-wrap input{padding-left:2.4rem}
.proto-filter-btn{border:none;background:linear-gradient(90deg,#5c6bc0,#2da0a8);color:#fff;border-radius:10px;font-weight:700}
.proto-pdf-btn{border:none!important;background:linear-gradient(90deg,#5c6bc0,#2da0a8)!important;color:#fff!important;border-radius:10px!important;font-weight:700!important}
.proto-pdf-btn:disabled{opacity:.65}
.proto-chip{font-size:.74rem;background:#eef3ff;color:#2d4d8f;border:1px solid #d8e2ff;border-radius:999px;padding:.15rem .5rem;font-weight:700}
.proto-table__titulo{max-width:14rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.proto-table__destinatario{max-width:12rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.proto-card__meta--full{grid-column:1/-1}
.proto-actions-head,.proto-actions-cell{width:1%;white-space:nowrap;text-align:right;vertical-align:middle}
.proto-actions{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:.15rem;padding:.2rem;background:#f4f7fb;border:1px solid #e8edf4;border-radius:10px}
.proto-action-btn{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;padding:0;border-radius:8px;border:1px solid transparent;background:#fff;color:#3f5284;text-decoration:none;transition:background .15s ease,border-color .15s ease,color .15s ease}
.proto-action-btn svg{width:1.05rem;height:1.05rem}
.proto-action-btn:hover:not(:disabled){background:#eef3ff;border-color:#d8e2ff;color:#2d4d8f}
.proto-action-btn:disabled{opacity:.55;cursor:not-allowed}
.proto-action-btn--view{color:#5c6b8a}
.proto-action-btn--pdf{color:#2d4d8f}
.proto-action-btn--edit{color:#2d6a9f}
.proto-action-btn--delete{color:#a32d2d}
.proto-action-btn--delete:hover:not(:disabled){background:#fff3f3;border-color:#f1b4b4;color:#8b2222}
.proto-action-btn--entregue{color:#1d6d3f;background:#eefaf3;border-color:#b7e3c7;cursor:help}
.proto-action-btn--entregue:hover{background:#e0f5ea;border-color:#9fd4b8;color:#145a32}
.proto-entregue-check{position:relative}
.proto-entregue-check__tip{position:absolute;bottom:calc(100% + .45rem);right:0;min-width:11rem;max-width:16rem;padding:.55rem .7rem;border-radius:10px;background:#16254e;color:#fff;font-size:.78rem;font-weight:600;line-height:1.35;text-align:left;box-shadow:0 10px 24px rgba(22,37,78,.22);opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .15s ease,transform .15s ease,visibility .15s;z-index:30;pointer-events:none;display:flex;flex-direction:column;gap:.2rem}
.proto-entregue-check__tip strong{font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:#9ec9ff;font-weight:700}
.proto-entregue-check__tip-muted{opacity:.85;font-weight:500}
.proto-entregue-check:hover .proto-entregue-check__tip,.proto-entregue-check:focus-visible .proto-entregue-check__tip{opacity:1;visibility:visible;transform:translateY(0)}
.proto-entregue-check--card .proto-entregue-check__tip{right:auto;left:50%;transform:translateX(-50%) translateY(4px)}
.proto-entregue-check--card:hover .proto-entregue-check__tip,.proto-entregue-check--card:focus-visible .proto-entregue-check__tip{transform:translateX(-50%) translateY(0)}
.proto-action-btn__label{display:none}
.proto-cards{display:flex;flex-direction:column;gap:.85rem}
.proto-card{border:1px solid #e8edf4;border-radius:14px;padding:1rem 1.05rem;background:linear-gradient(180deg,#fff 0%,#fbfdff 100%)}
.proto-card__head{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;margin-bottom:.75rem}
.proto-card__titulo{font-size:1rem;font-weight:700;color:#16254e;margin:0;line-height:1.35}
.proto-card__meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem .85rem;margin:0 0 .85rem}
.proto-card__meta dt{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:#6b7d9c;margin:0}
.proto-card__meta dd{font-size:.9rem;font-weight:600;color:#16254e;margin:.1rem 0 0}
.proto-actions--card{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem;width:100%;padding:.35rem}
.proto-actions--card .proto-action-btn{width:auto;height:auto;min-height:2.35rem;padding:.4rem .65rem;gap:.35rem;font-size:.82rem;font-weight:600}
.proto-actions--card .proto-action-btn__label{display:inline}
.proto-pag{display:flex;justify-content:center;align-items:center;gap:.8rem}.proto-pag__nav{border:1px solid rgba(92,107,192,.3);border-radius:10px}
.proto-modal__portal{position:fixed;inset:0;z-index:4000}.proto-modal__backdrop{position:absolute;inset:0;background:rgba(22,37,78,.45)}.proto-modal__wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:1rem}.proto-modal__panel{position:relative;width:100%;max-width:560px;background:#fff;border-radius:16px;padding:1.25rem 1.25rem 1rem}.proto-modal__close{position:absolute;right:.7rem;top:.7rem;border:none;background:transparent}
.admin-alert{border-radius:10px;padding:.75rem .9rem;font-size:.92rem}.admin-alert--erro{background:#fff3f3;border:1px solid #f1b4b4;color:#9e2b2b}.admin-alert--ok{background:#eefaf3;border:1px solid #b7e3c7;color:#1d6d3f}
</style>
