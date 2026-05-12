<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
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

function destinatarioDisplay(item: Pick<Protocolo, "destinatarioTipo">) {
  return item.destinatarioTipo === "fisica" ? "Pessoa física" : "Pessoa jurídica";
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
          <div v-else class="table-responsive">
            <table class="table align-middle proto-table">
              <thead>
                <tr>
                  <th>Título</th><th>Tipo</th><th>Destinatário</th><th>Ano</th><th>Entrega</th><th>Cidade</th><th class="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in protocolos" :key="item.id">
                  <td>{{ item.titulo || "Sem título" }}</td>
                  <td><span class="proto-chip">{{ chipTipo(item.destinatarioTipo) }}</span></td>
                  <td>{{ destinatarioDisplay(item) }}</td>
                  <td>{{ item.ano }}</td>
                  <td>{{ formatarDataIsoPtBr(item.dataParaEntrega) }}</td>
                  <td>{{ item.cidadeDestinatario }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary me-1" @click="carregarDetalhe(item.id)"><RiEyeLine /></button>
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-dark me-1"
                      :disabled="baixandoPdfId !== null"
                      title="Baixar PDF"
                      @click="baixarPdf(item.id)"
                    >
                      <RiFilePdf2Line />
                    </button>
                    <RouterLink class="btn btn-sm btn-outline-primary me-1" :to="{ name: 'AdministradorProtocoloEditar', params: { id: item.id } }"><RiPencilLine /></RouterLink>
                    <button class="btn btn-sm btn-outline-danger" :disabled="excluindoId!==null" @click="abrirModalExcluir(item.id)"><RiDeleteBinLine /></button>
                  </td>
                </tr>
              </tbody>
            </table>
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
            <p><strong>Destinatário:</strong> {{ destinatarioDisplay(protocoloDetalhe) }}</p>
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
.proto-pag{display:flex;justify-content:center;align-items:center;gap:.8rem}.proto-pag__nav{border:1px solid rgba(92,107,192,.3);border-radius:10px}
.proto-modal__portal{position:fixed;inset:0;z-index:4000}.proto-modal__backdrop{position:absolute;inset:0;background:rgba(22,37,78,.45)}.proto-modal__wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:1rem}.proto-modal__panel{position:relative;width:100%;max-width:560px;background:#fff;border-radius:16px;padding:1.25rem 1.25rem 1rem}.proto-modal__close{position:absolute;right:.7rem;top:.7rem;border:none;background:transparent}
.admin-alert{border-radius:10px;padding:.75rem .9rem;font-size:.92rem}.admin-alert--erro{background:#fff3f3;border:1px solid #f1b4b4;color:#9e2b2b}.admin-alert--ok{background:#eefaf3;border:1px solid #b7e3c7;color:#1d6d3f}
</style>
