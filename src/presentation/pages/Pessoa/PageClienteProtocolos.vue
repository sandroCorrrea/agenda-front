<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiEyeLine,
  RiFileList3Line,
  RiFilePdf2Line,
  RiFilter3Line,
  RiInboxLine,
  RiRefreshLine,
  RiSearchLine
} from "@remixicon/vue";
import type { Protocolo } from "@/domain/entities/Protocolo";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import ProtocolosListaSkeleton from "@/presentation/components/Cliente/ProtocolosListaSkeleton.vue";
import {
  type ErroListagemCliente,
  useProtocolosCliente
} from "@/presentation/composables/Protocolo/useProtocolosCliente";
import { formatarDataIsoPtBr } from "@/shared/utils/date.util";
import { cepMask } from "@/shared/utils/masks";
import { dispararDownloadBlob } from "@/shared/utils/downloadBlob";

const {
  filtros,
  protocolos,
  carregando,
  erro,
  listaVazia,
  totalRegistros,
  paginaAtual,
  porPagina,
  totalPaginas,
  aplicarFiltros,
  limparFiltros,
  irParaPagina,
  alterarPorPagina,
  tentarNovamente,
  buscarInicial
} = useProtocolosCliente();

let protocoloRepo: IProtocoloRepository;
{
  const inj = inject<IProtocoloRepository>("IProtocoloRepository");
  if (!inj) {
    throw new Error("IProtocoloRepository not provided");
  }
  protocoloRepo = inj;
}

const modalProtocolo = ref<Protocolo | null>(null);
const mostrarPdfNoModal = ref(false);
const pdfCarregando = ref(false);
const pdfErro = ref<string | null>(null);
const pdfBlobUrl = ref<string | null>(null);

function limparPreviewPdf() {
  if (pdfBlobUrl.value) {
    URL.revokeObjectURL(pdfBlobUrl.value);
    pdfBlobUrl.value = null;
  }
}

function abrirDetalhes(p: Protocolo, opts?: { abrirPdf?: boolean }) {
  limparPreviewPdf();
  modalProtocolo.value = p;
  mostrarPdfNoModal.value = false;
  pdfErro.value = null;
  if (opts?.abrirPdf) {
    void carregarPdfPreview();
  }
}

function fecharModal() {
  modalProtocolo.value = null;
  mostrarPdfNoModal.value = false;
  pdfErro.value = null;
  limparPreviewPdf();
}

async function carregarPdfPreview() {
  const p = modalProtocolo.value;
  if (!p) return;
  pdfCarregando.value = true;
  pdfErro.value = null;
  limparPreviewPdf();
  try {
    const { blob, filename } = await protocoloRepo.downloadPdf(p.id);
    pdfBlobUrl.value = URL.createObjectURL(blob);
    mostrarPdfNoModal.value = true;
    void filename;
  } catch (e: unknown) {
    pdfErro.value =
      e instanceof Error ? e.message : "Não foi possível carregar o PDF. Verifique sua permissão e tente novamente.";
  } finally {
    pdfCarregando.value = false;
  }
}

async function baixarPdf() {
  const p = modalProtocolo.value;
  if (!p) return;
  pdfCarregando.value = true;
  pdfErro.value = null;
  try {
    const { blob, filename } = await protocoloRepo.downloadPdf(p.id);
    dispararDownloadBlob(blob, filename);
  } catch (e: unknown) {
    pdfErro.value =
      e instanceof Error ? e.message : "Não foi possível baixar o PDF. Verifique sua permissão e tente novamente.";
  } finally {
    pdfCarregando.value = false;
  }
}

function formatarCepExibicao(cep: string) {
  const n = String(cep ?? "").replace(/\D/g, "").slice(0, 8);
  return n.length === 8 ? cepMask(n) : cep || "—";
}

onMounted(() => {
  void buscarInicial();
});

onUnmounted(() => {
  limparPreviewPdf();
});

function tituloCelula(p: Protocolo) {
  const t = p.titulo?.trim();
  return t && t.length > 0 ? t : "Sem título";
}

function tipoLabel(tipo: string) {
  return tipo === "fisica" ? "Física" : "Jurídica";
}

function mensagemErro(er: ErroListagemCliente): string {
  const base = er.message;
  if (er.kind === "422" && Object.keys(er.campos).length > 0) {
    const extras = Object.values(er.campos).filter(Boolean).join(" ");
    return extras ? `${base} ${extras}` : base;
  }
  return base;
}

function erroPainelClass(er: ErroListagemCliente): string {
  if (er.kind === "401" || er.kind === "403") return "cli-proto__err--alert";
  if (er.kind === "404") return "cli-proto__err--muted";
  if (er.kind === "422") return "cli-proto__err--warn";
  if (er.kind === "5xx" || er.kind === "rede") return "cli-proto__err--danger";
  return "cli-proto__err--muted";
}

const podeAnterior = computed(() => paginaAtual.value > 1 && !carregando.value);
const podeProxima = computed(
  () => paginaAtual.value < totalPaginas.value && !carregando.value
);
const resumoResultados = computed(() => {
  if (carregando.value) return "Carregando protocolos...";
  if (erro.value) return "Falha ao consultar protocolos";
  if (listaVazia.value) return "Nenhum protocolo encontrado";
  return `${totalRegistros.value} protocolo(s) encontrado(s)`;
});
const filtrosAtivos = computed(() => {
  return Boolean(filtros.titulo.trim());
});
</script>

<template>
  <article class="cli-proto">
    <header class="cli-proto__hero">
      <div class="cli-proto__hero-bg" aria-hidden="true" />
      <div class="cli-proto__hero-inner">
        <div class="cli-proto__hero-icon">
          <RiFileList3Line />
        </div>
        <div class="cli-proto__hero-text">
          <h1 class="cli-proto__title">Protocolos</h1>
          <p class="cli-proto__subtitle">
            Consulte e filtre os protocolos vinculados à sua conta.
          </p>
        </div>
      </div>
    </header>

    <section class="cli-proto__meta">
      <div class="cli-proto__meta-card">
        <span class="cli-proto__meta-kicker">Visão geral</span>
        <strong>{{ resumoResultados }}</strong>
      </div>
      <div class="cli-proto__meta-card" :class="{ 'cli-proto__meta-card--active': filtrosAtivos }">
        <span class="cli-proto__meta-kicker">Filtros</span>
        <strong>{{ filtrosAtivos ? "Ativos" : "Sem filtros" }}</strong>
      </div>
    </section>

    <section class="cli-proto__filters card border-0 shadow-sm">
      <div class="card-body p-3 p-lg-4">
        <div class="cli-proto__filters-head">
          <RiFilter3Line class="cli-proto__filters-ic" aria-hidden="true" />
          <span class="cli-proto__filters-label">Filtros</span>
        </div>
        <form class="row g-3 g-lg-4 align-items-end" @submit.prevent="aplicarFiltros">
          <div class="col-12 col-lg-8">
            <label class="form-label cli-proto__label" for="proto-titulo">Título</label>
            <div class="cli-proto__input-wrap">
              <RiSearchLine class="cli-proto__input-ic" aria-hidden="true" />
              <input
                id="proto-titulo"
                v-model="filtros.titulo"
                type="search"
                class="form-control cli-proto__input"
                maxlength="100"
                placeholder="Buscar por título (atualiza após pausar a digitação)"
                autocomplete="off"
              />
            </div>
          </div>
          <div class="col-12 col-lg-4 d-flex flex-wrap gap-2 justify-content-lg-end">
            <button type="submit" class="btn cli-proto__btn cli-proto__btn--primary">
              Aplicar filtros
            </button>
            <button type="button" class="btn cli-proto__btn cli-proto__btn--ghost" @click="limparFiltros">
              Limpar filtros
            </button>
          </div>
        </form>
      </div>
    </section>

    <section v-if="erro" class="cli-proto__panel cli-proto__err" :class="erroPainelClass(erro)">
      <div class="cli-proto__err-inner">
        <div class="cli-proto__err-icon" aria-hidden="true">
          <RiErrorWarningLine />
        </div>
        <div class="cli-proto__err-body">
          <h2 class="cli-proto__err-title">Não foi possível carregar</h2>
          <p class="cli-proto__err-msg">{{ mensagemErro(erro) }}</p>
          <button type="button" class="btn cli-proto__btn cli-proto__btn--primary" @click="tentarNovamente">
            <RiRefreshLine class="me-1" /> Tentar novamente
          </button>
        </div>
      </div>
    </section>

    <section v-else class="cli-proto__panel">
      <ProtocolosListaSkeleton v-if="carregando" />

      <div v-else-if="listaVazia" class="cli-proto__empty">
        <div class="cli-proto__empty-icon">
          <RiInboxLine />
        </div>
        <h2 class="cli-proto__empty-title">Nenhum protocolo encontrado</h2>
        <p class="cli-proto__empty-text">
          Quando houver protocolos em que você participa como destinatário ou administrador, eles aparecerão
          aqui. Ajuste o filtro de título ou tente novamente mais tarde.
        </p>
      </div>

      <template v-else>
        <div class="cli-proto__table-wrap d-none d-lg-block">
          <div class="table-responsive cli-proto__table-responsive">
            <table class="table table-hover align-middle cli-proto__table mb-0">
              <thead>
                <tr>
                  <th scope="col">Título</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Entrega</th>
                  <th scope="col">Cidade</th>
                  <th scope="col" class="text-end cli-proto__th-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in protocolos" :key="p.id">
                  <td>{{ tituloCelula(p) }}</td>
                  <td>
                    <span class="cli-proto__chip">{{ tipoLabel(p.destinatarioTipo) }}</span>
                  </td>
                  <td class="text-nowrap">{{ formatarDataIsoPtBr(p.dataParaEntrega) }}</td>
                  <td>{{ p.cidadeDestinatario || "—" }}</td>
                  <td class="text-end text-nowrap cli-proto__td-acoes">
                    <div class="cli-proto__acoes" role="group" aria-label="Ações do protocolo">
                      <button
                        type="button"
                        class="btn btn-sm cli-proto__icon-btn"
                        title="Ver detalhes"
                        @click="abrirDetalhes(p)"
                      >
                        <RiEyeLine aria-hidden="true" />
                        <span class="visually-hidden">Ver detalhes</span>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm cli-proto__icon-btn cli-proto__icon-btn--pdf"
                        title="Abrir detalhes e visualizar PDF"
                        @click="abrirDetalhes(p, { abrirPdf: true })"
                      >
                        <RiFilePdf2Line aria-hidden="true" />
                        <span class="visually-hidden">Visualizar PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ul class="cli-proto__cards d-lg-none list-unstyled mb-0">
          <li v-for="p in protocolos" :key="p.id" class="cli-proto__card">
            <div class="cli-proto__card-top">
              <span class="cli-proto__chip">{{ tipoLabel(p.destinatarioTipo) }}</span>
            </div>
            <h3 class="cli-proto__card-title">{{ tituloCelula(p) }}</h3>
            <dl class="cli-proto__card-dl">
              <div>
                <dt>Entrega</dt>
                <dd>{{ formatarDataIsoPtBr(p.dataParaEntrega) }}</dd>
              </div>
              <div>
                <dt>Cidade</dt>
                <dd>{{ p.cidadeDestinatario || "—" }}</dd>
              </div>
            </dl>
            <div class="cli-proto__card-acoes">
              <button type="button" class="btn btn-sm cli-proto__btn cli-proto__btn--primary" @click="abrirDetalhes(p)">
                <RiEyeLine class="me-1" aria-hidden="true" /> Detalhes
              </button>
              <button
                type="button"
                class="btn btn-sm cli-proto__btn cli-proto__btn--ghost"
                @click="abrirDetalhes(p, { abrirPdf: true })"
              >
                <RiFilePdf2Line class="me-1" aria-hidden="true" /> PDF
              </button>
            </div>
          </li>
        </ul>

        <footer class="cli-proto__pag">
          <div class="cli-proto__pag-toolbar">
            <p class="cli-proto__pag-meta">
              <span class="cli-proto__pag-meta-strong">{{ totalRegistros }}</span>
              <span class="cli-proto__pag-meta-text"> {{ totalRegistros === 1 ? "registro" : "registros" }}</span>
            </p>

            <nav class="cli-proto__pag-rail" aria-label="Navegar entre páginas">
              <button
                type="button"
                class="cli-proto__pag-arrow"
                :disabled="!podeAnterior"
                title="Página anterior"
                @click="irParaPagina(paginaAtual - 1)"
              >
                <RiArrowLeftSLine aria-hidden="true" />
                <span class="cli-proto__pag-arrow-text">Anterior</span>
              </button>

              <div class="cli-proto__pag-indicator" role="status">
                <span class="cli-proto__pag-indicator-label">Página</span>
                <span class="cli-proto__pag-indicator-num">{{ paginaAtual }}</span>
                <span class="cli-proto__pag-indicator-divider" aria-hidden="true">/</span>
                <span class="cli-proto__pag-indicator-total">{{ totalPaginas }}</span>
              </div>

              <button
                type="button"
                class="cli-proto__pag-arrow cli-proto__pag-arrow--next"
                :disabled="!podeProxima"
                title="Próxima página"
                @click="irParaPagina(paginaAtual + 1)"
              >
                <span class="cli-proto__pag-arrow-text">Próxima</span>
                <RiArrowRightSLine aria-hidden="true" />
              </button>
            </nav>

            <div class="cli-proto__pag-size">
              <label class="cli-proto__pag-size-label" for="cli-proto-per-page">Exibir</label>
              <div class="cli-proto__pag-select-wrap">
                <select
                  id="cli-proto-per-page"
                  class="form-select cli-proto__pag-select"
                  :value="porPagina"
                  :disabled="carregando"
                  @change="alterarPorPagina(Number(($event.target as HTMLSelectElement).value))"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>
              <span class="cli-proto__pag-size-suffix">por página</span>
            </div>
          </div>
        </footer>
      </template>
    </section>

    <Teleport to="body">
      <div
        v-if="modalProtocolo"
        class="cli-proto__modal-root"
        role="presentation"
        @click.self="fecharModal"
      >
        <div
          class="cli-proto__modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cli-proto-modal-titulo"
          @click.stop
        >
          <header class="cli-proto__modal-head">
            <div>
              <p class="cli-proto__modal-eyebrow">Protocolo</p>
              <h2 id="cli-proto-modal-titulo" class="cli-proto__modal-title">
                {{ tituloCelula(modalProtocolo) }}
              </h2>
            </div>
            <button type="button" class="btn cli-proto__modal-close" title="Fechar" @click="fecharModal">
              <RiCloseLine aria-hidden="true" />
              <span class="visually-hidden">Fechar</span>
            </button>
          </header>

          <div class="cli-proto__modal-body">
            <div class="cli-proto__modal-grid">
              <div class="cli-proto__modal-field">
                <span class="cli-proto__modal-label">Tipo de destinatário</span>
                <span class="cli-proto__modal-value">{{ tipoLabel(modalProtocolo.destinatarioTipo) }}</span>
              </div>
              <div class="cli-proto__modal-field">
                <span class="cli-proto__modal-label">Ano</span>
                <span class="cli-proto__modal-value">{{ modalProtocolo.ano }}</span>
              </div>
              <div class="cli-proto__modal-field cli-proto__modal-field--full">
                <span class="cli-proto__modal-label">Descrição</span>
                <p class="cli-proto__modal-desc">{{ modalProtocolo.descricao || "—" }}</p>
              </div>
              <div class="cli-proto__modal-field">
                <span class="cli-proto__modal-label">Data para entrega</span>
                <span class="cli-proto__modal-value">{{ formatarDataIsoPtBr(modalProtocolo.dataParaEntrega) }}</span>
              </div>
              <div class="cli-proto__modal-field">
                <span class="cli-proto__modal-label">CEP</span>
                <span class="cli-proto__modal-value">{{ formatarCepExibicao(modalProtocolo.cepDestinatario) }}</span>
              </div>
              <div class="cli-proto__modal-field cli-proto__modal-field--full">
                <span class="cli-proto__modal-label">Endereço</span>
                <span class="cli-proto__modal-value">
                  {{ modalProtocolo.ruaDestinatario || "—" }}
                </span>
              </div>
              <div class="cli-proto__modal-field">
                <span class="cli-proto__modal-label">Bairro</span>
                <span class="cli-proto__modal-value">{{ modalProtocolo.bairroDestinatario || "—" }}</span>
              </div>
              <div class="cli-proto__modal-field">
                <span class="cli-proto__modal-label">Cidade</span>
                <span class="cli-proto__modal-value">{{ modalProtocolo.cidadeDestinatario || "—" }}</span>
              </div>
            </div>

            <section class="cli-proto__modal-doc" aria-labelledby="cli-proto-doc-titulo">
              <div class="cli-proto__modal-doc-head">
                <h3 id="cli-proto-doc-titulo" class="cli-proto__modal-doc-title">
                  <RiFilePdf2Line class="me-2" aria-hidden="true" />
                  Documento PDF
                </h3>
                <div class="cli-proto__modal-doc-btns">
                  <button
                    type="button"
                    class="btn btn-sm cli-proto__btn cli-proto__btn--ghost"
                    :disabled="pdfCarregando"
                    @click="carregarPdfPreview"
                  >
                    {{ pdfCarregando ? "Carregando…" : mostrarPdfNoModal && pdfBlobUrl ? "Recarregar PDF" : "Visualizar PDF" }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm cli-proto__btn cli-proto__btn--primary"
                    :disabled="pdfCarregando"
                    @click="baixarPdf"
                  >
                    Baixar PDF
                  </button>
                </div>
              </div>
              <p v-if="pdfErro" class="cli-proto__modal-pdf-err">{{ pdfErro }}</p>
              <div v-if="pdfBlobUrl && mostrarPdfNoModal" class="cli-proto__modal-pdf-frame-wrap">
                <iframe
                  :src="pdfBlobUrl"
                  class="cli-proto__modal-pdf-frame"
                  title="Pré-visualização do PDF do protocolo"
                />
              </div>
              <p v-else-if="!pdfCarregando && !pdfErro" class="cli-proto__modal-pdf-hint text-muted small mb-0">
                Use “Visualizar PDF” para abrir o documento aqui ou “Baixar PDF” para salvar no seu dispositivo.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Teleport>
  </article>
</template>

<style scoped>
.cli-proto {
  --cli-accent: #5c6bc0;
  --cli-accent-2: #2da0a8;
  --cli-bg-soft: #f5f7ff;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0.5rem 0 2.5rem;
}

.cli-proto__hero {
  position: relative;
  border-radius: 22px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  padding: 1.35rem 1.25rem;
  background: linear-gradient(135deg, #1a2338 0%, #243554 48%, #1e2d4a 100%);
  box-shadow: 0 18px 40px rgba(15, 24, 48, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

@media (min-width: 768px) {
  .cli-proto__hero {
    padding: 1.75rem 1.85rem;
  }
}

.cli-proto__hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 100% 0%, rgba(92, 107, 192, 0.35), transparent 55%),
    radial-gradient(ellipse 60% 50% at 0% 100%, rgba(45, 160, 168, 0.25), transparent 50%);
  pointer-events: none;
}

.cli-proto__hero-inner {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  z-index: 1;
}

.cli-proto__hero-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  color: #e8ecff;
  font-size: 1.45rem;
}

.cli-proto__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

@media (min-width: 576px) {
  .cli-proto__title {
    font-size: 1.55rem;
  }
}

.cli-proto__subtitle {
  margin: 0.4rem 0 0;
  max-width: 36rem;
  font-size: 0.92rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
}

.cli-proto__meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

@media (min-width: 576px) {
  .cli-proto__meta {
    grid-template-columns: 1fr 1fr;
  }
}

.cli-proto__meta-card {
  border-radius: 14px;
  border: 1px solid rgba(20, 30, 40, 0.08);
  background: #fff;
  padding: 0.75rem 0.9rem;
  box-shadow: 0 8px 22px rgba(20, 30, 40, 0.05);
}

.cli-proto__meta-card strong {
  color: #243b67;
  font-size: 0.95rem;
}

.cli-proto__meta-kicker {
  display: block;
  margin-bottom: 0.1rem;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7a8aa8;
}

.cli-proto__meta-card--active {
  background: linear-gradient(135deg, rgba(92, 107, 192, 0.12), rgba(45, 160, 168, 0.12));
  border-color: rgba(92, 107, 192, 0.25);
}

.cli-proto__filters {
  border-radius: 18px !important;
  border: 1px solid rgba(20, 30, 40, 0.06) !important;
  margin-bottom: 1.25rem;
  background: linear-gradient(180deg, #ffffff 0%, var(--cli-bg-soft) 100%);
}

.cli-proto__filters-head {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 1rem;
}

.cli-proto__filters-ic {
  font-size: 1.15rem;
  color: var(--cli-accent);
}

.cli-proto__filters-label {
  font-weight: 800;
  color: #1e2d58;
  font-size: 0.98rem;
}

.cli-proto__label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #4a5b78;
  margin-bottom: 0.35rem;
}

.cli-proto__input-wrap {
  position: relative;
}

.cli-proto__input-ic {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #8b9bb8;
  pointer-events: none;
}

.cli-proto__input {
  border-radius: 12px !important;
  border: 1px solid rgba(20, 30, 40, 0.1);
  padding: 0.55rem 0.85rem;
}

.cli-proto__input-wrap .cli-proto__input {
  padding-left: 2.5rem;
}

.cli-proto__btn {
  border-radius: 12px !important;
  font-weight: 700;
  padding: 0.55rem 1rem;
}

.cli-proto__btn--primary {
  background: linear-gradient(90deg, var(--cli-accent) 0%, var(--cli-accent-2) 100%) !important;
  border: none !important;
  color: #fff !important;
}

.cli-proto__btn--ghost {
  background: #f0f4ff !important;
  color: #2a3f66 !important;
  border: 1px solid rgba(92, 107, 192, 0.25) !important;
}

.cli-proto__panel {
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(20, 30, 40, 0.06);
  box-shadow: 0 10px 28px rgba(20, 30, 40, 0.06);
  overflow: hidden;
  min-height: 200px;
}

.cli-proto__table-responsive {
  border-radius: 18px;
}

.cli-proto__table {
  font-size: 0.88rem;
}

.cli-proto__table thead th {
  background: #f4f8ff;
  color: #1f3366;
  font-weight: 800;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid rgba(20, 30, 40, 0.08);
  white-space: nowrap;
}

.cli-proto__table tbody td {
  border-color: rgba(20, 30, 40, 0.06);
  vertical-align: middle;
}

.cli-proto__table tbody tr {
  transition: transform 0.18s ease, background-color 0.18s ease;
}

.cli-proto__table tbody tr:hover {
  background: rgba(92, 107, 192, 0.05);
}

.cli-proto__chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(92, 107, 192, 0.12);
  color: #3d4b8c;
}

.cli-proto__cards {
  padding: 0.35rem 0.65rem 0.85rem;
}

.cli-proto__card {
  padding: 1.1rem 1rem;
  border-bottom: 1px solid rgba(20, 30, 40, 0.08);
  transition: background-color 0.2s ease;
}

.cli-proto__card:last-child {
  border-bottom: none;
}

.cli-proto__card:hover {
  background: rgba(92, 107, 192, 0.04);
}

.cli-proto__card-top {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0.45rem;
}

.cli-proto__card-title {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #16254e;
  line-height: 1.3;
}

.cli-proto__card-dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 0.75rem;
  margin: 0;
}

.cli-proto__card-dl dt {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8b9bb8;
  font-weight: 700;
}

.cli-proto__card-dl dd {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 600;
  color: #2a3f66;
}

.cli-proto__pag {
  padding: 1rem 1rem 1.15rem;
  border-top: 1px solid rgba(20, 30, 40, 0.06);
  background: linear-gradient(180deg, #fff 0%, #f8faff 100%);
}

.cli-proto__pag-toolbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1rem;
}

@media (min-width: 768px) {
  .cli-proto__pag-toolbar {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem 1rem;
  }
}

.cli-proto__pag-meta {
  margin: 0;
  font-size: 0.88rem;
  color: #6c7a94;
  text-align: center;
}

@media (min-width: 768px) {
  .cli-proto__pag-meta {
    text-align: left;
    min-width: 8rem;
  }
}

.cli-proto__pag-meta-strong {
  font-weight: 800;
  color: #243b67;
  font-variant-numeric: tabular-nums;
}

.cli-proto__pag-meta-text {
  font-weight: 600;
}

.cli-proto__pag-rail {
  display: flex;
  align-items: stretch;
  justify-content: center;
  align-self: center;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  border-radius: 14px;
  border: 1px solid rgba(92, 107, 192, 0.22);
  background: #fff;
  box-shadow: 0 6px 20px rgba(20, 30, 40, 0.06);
  overflow: hidden;
}

@media (min-width: 768px) {
  .cli-proto__pag-rail {
    width: auto;
    margin: 0;
    flex: 1 1 auto;
    justify-content: center;
    max-width: min(420px, 100%);
  }
}

.cli-proto__pag-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex: 1 1 0;
  min-width: 0;
  padding: 0.65rem 0.75rem;
  border: none;
  background: linear-gradient(180deg, #f4f7ff 0%, #eef3fb 100%);
  color: #2a3f66;
  font-size: 0.82rem;
  font-weight: 750;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.cli-proto__pag-arrow:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(92, 107, 192, 0.14) 0%, rgba(45, 160, 168, 0.1) 100%);
  color: #1e2d58;
}

.cli-proto__pag-arrow:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.cli-proto__pag-arrow svg {
  flex-shrink: 0;
  font-size: 1.05rem;
}

.cli-proto__pag-arrow-text {
  white-space: nowrap;
}

@media (max-width: 399.98px) {
  .cli-proto__pag-arrow-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .cli-proto__pag-arrow {
    position: relative;
    flex: 0 0 3.25rem;
  }
}

.cli-proto__pag-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex: 0 0 auto;
  padding: 0.55rem 0.85rem;
  min-width: 6.5rem;
  border-left: 1px solid rgba(92, 107, 192, 0.18);
  border-right: 1px solid rgba(92, 107, 192, 0.18);
  background: linear-gradient(135deg, rgba(92, 107, 192, 0.12), rgba(45, 160, 168, 0.1));
}

.cli-proto__pag-indicator-label {
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5c6b8c;
}

.cli-proto__pag-indicator-num,
.cli-proto__pag-indicator-total {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e2d58;
  font-variant-numeric: tabular-nums;
}

.cli-proto__pag-indicator-divider {
  font-size: 0.95rem;
  font-weight: 700;
  color: #9aa8c4;
}

.cli-proto__pag-size {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.45rem 0.5rem;
}

@media (min-width: 768px) {
  .cli-proto__pag-size {
    justify-content: flex-end;
    margin-left: auto;
  }
}

.cli-proto__pag-size-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #7a8aa8;
}

.cli-proto__pag-size-suffix {
  font-size: 0.82rem;
  color: #6c7a94;
  font-weight: 600;
}

.cli-proto__pag-select-wrap {
  position: relative;
}

.cli-proto__pag-select-wrap::after {
  content: "";
  position: absolute;
  right: 0.55rem;
  top: 50%;
  width: 0.45rem;
  height: 0.45rem;
  border-right: 2px solid #5c6bc0;
  border-bottom: 2px solid #5c6bc0;
  transform: translateY(-50%) rotate(45deg);
  pointer-events: none;
  opacity: 0.55;
}

.cli-proto__pag-select {
  appearance: none;
  min-width: 4.75rem;
  padding: 0.42rem 1.75rem 0.42rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(92, 107, 192, 0.28);
  background: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  color: #243b67;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.cli-proto__pag-select:hover:not(:disabled) {
  border-color: rgba(92, 107, 192, 0.45);
  box-shadow: 0 2px 10px rgba(92, 107, 192, 0.12);
}

.cli-proto__pag-select:focus {
  outline: none;
  border-color: var(--cli-accent);
  box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.2);
}

.cli-proto__pag-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.cli-proto__empty {
  padding: 2.5rem 1.25rem;
  text-align: center;
}

.cli-proto__empty-icon {
  font-size: 2.75rem;
  color: #c5d0e8;
  margin-bottom: 0.75rem;
}

.cli-proto__empty-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e2d58;
  margin: 0 0 0.5rem;
}

.cli-proto__empty-text {
  margin: 0 auto;
  max-width: 420px;
  color: #6c7a94;
  font-size: 0.92rem;
  line-height: 1.55;
}

.cli-proto__err {
  padding: 0;
  border: 1px solid rgba(220, 53, 69, 0.2);
  background: linear-gradient(180deg, #fff8f8 0%, #fff 100%);
}

.cli-proto__err-inner {
  display: flex;
  gap: 1rem;
  padding: 1.35rem 1.25rem;
  align-items: flex-start;
}

.cli-proto__err-icon {
  flex-shrink: 0;
  font-size: 1.75rem;
  color: #d33f49;
}

.cli-proto__err-title {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #16254e;
}

.cli-proto__err-msg {
  margin: 0 0 1rem;
  color: #5a6b86;
  font-size: 0.92rem;
  line-height: 1.5;
}

.cli-proto__err--alert .cli-proto__err-icon {
  color: #b45309;
}

.cli-proto__err--warn .cli-proto__err-icon {
  color: #b45309;
}

.cli-proto__err--muted .cli-proto__err-icon {
  color: #6c7a94;
}

.cli-proto__err--warn {
  border-color: rgba(180, 83, 9, 0.25);
  background: linear-gradient(180deg, #fffbf5 0%, #fff 100%);
}

.cli-proto__err--danger .cli-proto__err-icon {
  color: #c0262d;
}

.cli-proto__th-acoes {
  width: 1%;
  white-space: nowrap;
}

.cli-proto__td-acoes {
  vertical-align: middle;
}

.cli-proto__acoes {
  display: inline-flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

.cli-proto__icon-btn {
  border-radius: 11px !important;
  padding: 0.38rem 0.5rem !important;
  line-height: 1 !important;
  border: 1px solid rgba(20, 30, 40, 0.12) !important;
  background: #fff !important;
  color: #3d4b8c !important;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.cli-proto__icon-btn:hover {
  background: rgba(92, 107, 192, 0.1) !important;
  border-color: rgba(92, 107, 192, 0.35) !important;
  color: #243b67 !important;
}

.cli-proto__icon-btn--pdf {
  color: #b4232c !important;
}

.cli-proto__icon-btn--pdf:hover {
  background: rgba(180, 35, 44, 0.08) !important;
  border-color: rgba(180, 35, 44, 0.25) !important;
}

.cli-proto__card-acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(20, 30, 40, 0.06);
}

.cli-proto__modal-root {
  position: fixed;
  inset: 0;
  z-index: 3200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(10, 14, 26, 0.52);
  backdrop-filter: blur(5px);
  overflow-y: auto;
}

.cli-proto__modal {
  width: min(760px, 100%);
  max-height: min(92vh, 920px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(20, 30, 40, 0.08);
  box-shadow: 0 28px 60px rgba(12, 18, 32, 0.35);
  overflow: hidden;
}

.cli-proto__modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.15rem;
  border-bottom: 1px solid rgba(20, 30, 40, 0.08);
  background: linear-gradient(180deg, #fff 0%, #f8faff 100%);
}

.cli-proto__modal-eyebrow {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7a8aa8;
}

.cli-proto__modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #16254e;
  line-height: 1.3;
}

.cli-proto__modal-close {
  flex-shrink: 0;
  border: none !important;
  border-radius: 12px !important;
  padding: 0.4rem !important;
  line-height: 1 !important;
  background: rgba(20, 30, 40, 0.06) !important;
  color: #243b67 !important;
}

.cli-proto__modal-close:hover {
  background: rgba(92, 107, 192, 0.15) !important;
}

.cli-proto__modal-body {
  padding: 1rem 1.15rem 1.25rem;
  overflow-y: auto;
}

.cli-proto__modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
}

@media (max-width: 575.98px) {
  .cli-proto__modal-grid {
    grid-template-columns: 1fr;
  }
}

.cli-proto__modal-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.cli-proto__modal-field--full {
  grid-column: 1 / -1;
}

.cli-proto__modal-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #7a8aa8;
}

.cli-proto__modal-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2a3f66;
}

.cli-proto__modal-desc {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: #4a5b78;
  white-space: pre-wrap;
}

.cli-proto__modal-doc {
  margin-top: 1.1rem;
  padding-top: 1.1rem;
  border-top: 1px solid rgba(20, 30, 40, 0.08);
}

.cli-proto__modal-doc-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0.65rem;
}

.cli-proto__modal-doc-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #16254e;
  display: flex;
  align-items: center;
}

.cli-proto__modal-doc-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.cli-proto__modal-pdf-err {
  margin: 0 0 0.65rem;
  color: #b4232c;
  font-size: 0.88rem;
  font-weight: 600;
}

.cli-proto__modal-pdf-frame-wrap {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(20, 30, 40, 0.1);
  background: #eef1f8;
}

.cli-proto__modal-pdf-frame {
  display: block;
  width: 100%;
  min-height: 280px;
  height: min(52vh, 420px);
  border: 0;
  background: #fff;
}

.cli-proto__modal-pdf-hint {
  margin: 0;
}
</style>
