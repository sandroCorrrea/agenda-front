<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCheckLine,
    RiCloseLine,
    RiLinkM
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import VinculoStatusBadge from "@/presentation/components/Cliente/VinculoStatusBadge.vue";
import { useVinculosAdmin } from "@/presentation/composables/Empresa/useVinculosAdmin";
import { useVinculosPendentesAdmin } from "@/presentation/composables/Empresa/useVinculosPendentesAdmin";
import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";
import { formatarDataIsoPtBr } from "@/shared/utils/date.util";
import { cnpjMask } from "@/shared/utils/masks";

const {
    vinculos,
    carregando,
    processandoId,
    erro,
    sucesso,
    paginaAtual,
    totalRegistros,
    filtroStatus,
    totalPaginas,
    modalRejeitarId,
    justificativaRejeicao,
    erroJustificativa,
    vinculoRejeicao,
    carregar,
    aplicarFiltroStatus,
    irParaPagina,
    aprovar,
    abrirModalRejeitar,
    fecharModalRejeitar,
    confirmarRejeicao
} = useVinculosAdmin();

const { atualizarPendentes } = useVinculosPendentesAdmin();

const filtros: { valor: "" | EmpresaVinculoStatus; rotulo: string }[] = [
    { valor: "pendente", rotulo: "Pendentes" },
    { valor: "aprovado", rotulo: "Aprovadas" },
    { valor: "rejeitado", rotulo: "Rejeitadas" },
    { valor: "", rotulo: "Todas" }
];

function onKeydownModal(e: KeyboardEvent) {
    if (e.key === "Escape" && modalRejeitarId.value != null) {
        fecharModalRejeitar();
    }
}

watch(modalRejeitarId, (id) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = id != null ? "hidden" : "";
});

onMounted(async () => {
    document.addEventListener("keydown", onKeydownModal);
    await carregar(1);
});

onUnmounted(() => {
    document.removeEventListener("keydown", onKeydownModal);
    if (typeof document !== "undefined") {
        document.body.style.overflow = "";
    }
});

async function aoAprovar(id: number) {
    await aprovar(id);
    await atualizarPendentes();
}

async function aoConfirmarRejeicao() {
    await confirmarRejeicao();
    await atualizarPendentes();
}
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Vinculações"
                subtitle="Analise solicitações de clientes que desejam vincular-se a empresas cadastradas."
            >
                <template #icon><RiLinkM /></template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <section class="card border-0 shadow-sm mb-4">
                <div class="card-body p-3 p-md-4">
                    <div class="vinc-filtros">
                        <span class="vinc-filtros__label">Filtrar por status</span>
                        <div class="vinc-filtros__tabs" role="tablist">
                            <button
                                v-for="f in filtros"
                                :key="f.valor || 'todas'"
                                type="button"
                                role="tab"
                                class="vinc-filtros__tab"
                                :class="{ 'vinc-filtros__tab--active': filtroStatus === f.valor }"
                                :aria-selected="filtroStatus === f.valor"
                                @click="aplicarFiltroStatus(f.valor)"
                            >
                                {{ f.rotulo }}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h2 class="vinc-subtitle mb-0">Solicitações</h2>
                        <small class="text-muted">{{ totalRegistros }} registro(s)</small>
                    </div>

                    <div v-if="carregando" class="text-muted py-4">
                        Carregando solicitações...
                    </div>

                    <div v-else-if="vinculos.length === 0" class="text-center py-5 text-muted">
                        Nenhuma solicitação encontrada para o filtro selecionado.
                    </div>

                    <template v-else>
                        <div class="table-responsive d-none d-lg-block">
                            <table class="table align-middle vinc-table mb-0">
                                <thead>
                                    <tr>
                                        <th>Cliente</th>
                                        <th>Empresa</th>
                                        <th>CNPJ</th>
                                        <th>Status</th>
                                        <th>Solicitado em</th>
                                        <th class="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="v in vinculos" :key="v.id">
                                        <td>
                                            <strong class="vinc-table__nome">{{
                                                v.usuario.nome
                                            }}</strong>
                                            <small class="d-block text-muted">{{
                                                v.usuario.email
                                            }}</small>
                                        </td>
                                        <td>
                                            <strong>{{ v.empresa.nome }}</strong>
                                            <small
                                                v-if="v.empresa.apelido"
                                                class="d-block text-muted"
                                            >
                                                {{ v.empresa.apelido }}
                                            </small>
                                        </td>
                                        <td class="text-nowrap">
                                            {{ cnpjMask(v.empresa.cnpj) }}
                                        </td>
                                        <td>
                                            <VinculoStatusBadge :status="v.status" />
                                        </td>
                                        <td class="text-nowrap">
                                            {{ formatarDataIsoPtBr(v.created_at) }}
                                        </td>
                                        <td class="text-end">
                                            <div
                                                v-if="v.status === 'pendente'"
                                                class="vinc-acoes"
                                            >
                                                <button
                                                    type="button"
                                                    class="btn btn-sm vinc-btn vinc-btn--ok"
                                                    :disabled="processandoId === v.id"
                                                    @click="aoAprovar(v.id)"
                                                >
                                                    <RiCheckLine />
                                                    {{
                                                        processandoId === v.id
                                                            ? "..."
                                                            : "Aprovar"
                                                    }}
                                                </button>
                                                <button
                                                    type="button"
                                                    class="btn btn-sm vinc-btn vinc-btn--no"
                                                    :disabled="processandoId === v.id"
                                                    @click="abrirModalRejeitar(v.id)"
                                                >
                                                    <RiCloseLine /> Rejeitar
                                                </button>
                                            </div>
                                            <span v-else class="text-muted small">
                                                —
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="d-lg-none vinc-cards">
                            <article
                                v-for="v in vinculos"
                                :key="`card-${v.id}`"
                                class="vinc-card"
                            >
                                <div class="vinc-card__top">
                                    <div>
                                        <strong>{{ v.usuario.nome }}</strong>
                                        <small>{{ v.usuario.email }}</small>
                                    </div>
                                    <VinculoStatusBadge :status="v.status" />
                                </div>
                                <p class="vinc-card__empresa mb-1">
                                    {{ v.empresa.nome }}
                                </p>
                                <p class="vinc-card__meta mb-0">
                                    {{ cnpjMask(v.empresa.cnpj) }} ·
                                    {{ formatarDataIsoPtBr(v.created_at) }}
                                </p>
                                <div
                                    v-if="v.status === 'pendente'"
                                    class="vinc-acoes mt-3"
                                >
                                    <button
                                        type="button"
                                        class="btn btn-sm vinc-btn vinc-btn--ok"
                                        :disabled="processandoId === v.id"
                                        @click="aoAprovar(v.id)"
                                    >
                                        <RiCheckLine /> Aprovar
                                    </button>
                                    <button
                                        type="button"
                                        class="btn btn-sm vinc-btn vinc-btn--no"
                                        :disabled="processandoId === v.id"
                                        @click="abrirModalRejeitar(v.id)"
                                    >
                                        <RiCloseLine /> Rejeitar
                                    </button>
                                </div>
                            </article>
                        </div>

                        <nav
                            v-if="totalPaginas > 1"
                            class="vinc-pag"
                            aria-label="Paginação"
                        >
                            <button
                                type="button"
                                class="vinc-pag__btn"
                                :disabled="paginaAtual <= 1 || carregando"
                                @click="irParaPagina(paginaAtual - 1)"
                            >
                                <RiArrowLeftSLine />
                            </button>
                            <span>
                                Página <strong>{{ paginaAtual }}</strong> de
                                <strong>{{ totalPaginas }}</strong>
                            </span>
                            <button
                                type="button"
                                class="vinc-pag__btn"
                                :disabled="paginaAtual >= totalPaginas || carregando"
                                @click="irParaPagina(paginaAtual + 1)"
                            >
                                <RiArrowRightSLine />
                            </button>
                        </nav>
                    </template>
                </div>
            </section>
        </div>

        <Teleport to="body">
            <div
                v-if="modalRejeitarId != null"
                class="vinc-modal"
                @click.self="fecharModalRejeitar"
            >
                <div class="vinc-modal__card" role="dialog" aria-modal="true">
                    <h3>Rejeitar vinculação</h3>
                    <p v-if="vinculoRejeicao" class="vinc-modal__sub">
                        {{ vinculoRejeicao.usuario.nome }} ·
                        {{ vinculoRejeicao.empresa.nome }}
                    </p>
                    <label class="form-label" for="vinc-justificativa">
                        Justificativa (obrigatória)
                    </label>
                    <textarea
                        id="vinc-justificativa"
                        v-model="justificativaRejeicao"
                        class="form-control"
                        rows="5"
                        maxlength="1000"
                        placeholder="Informe o motivo da rejeição. O cliente verá esta mensagem."
                    />
                    <small class="text-muted d-block text-end mt-1">
                        {{ justificativaRejeicao.length }}/1000
                    </small>
                    <p v-if="erroJustificativa" class="text-danger small mt-2 mb-0">
                        {{ erroJustificativa }}
                    </p>
                    <div class="vinc-modal__acoes">
                        <button
                            type="button"
                            class="btn btn-light"
                            :disabled="processandoId != null"
                            @click="fecharModalRejeitar"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            class="btn btn-danger"
                            :disabled="processandoId != null"
                            @click="aoConfirmarRejeicao"
                        >
                            {{
                                processandoId != null
                                    ? "Enviando..."
                                    : "Confirmar rejeição"
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </article>
</template>

<style scoped>
.admin-alert {
    border-radius: 12px;
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
}

.admin-alert--erro {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.25);
    color: #a52834;
}

.admin-alert--ok {
    background: rgba(45, 160, 168, 0.1);
    border: 1px solid rgba(45, 160, 168, 0.35);
    color: #1a6b72;
}

.vinc-filtros__label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #6c7a94;
    margin-bottom: 0.65rem;
}

.vinc-filtros__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
}

.vinc-filtros__tab {
    border: 1px solid rgba(92, 107, 192, 0.3);
    background: #fff;
    color: #5c6bc0;
    border-radius: 999px;
    padding: 0.4rem 0.95rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
}

.vinc-filtros__tab--active {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border-color: transparent;
    color: #fff;
}

.vinc-subtitle {
    font-size: 1.15rem;
    font-weight: 800;
    color: #16254e;
}

.vinc-table__nome {
    color: #16254e;
}

.vinc-table thead th {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6c7a94;
    border-bottom-width: 1px;
}

.vinc-acoes {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: flex-end;
}

.vinc-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    border-radius: 10px !important;
    font-weight: 700 !important;
}

.vinc-btn :deep(svg) {
    width: 16px;
    height: 16px;
}

.vinc-btn--ok {
    background: rgba(45, 160, 168, 0.12) !important;
    border: 1px solid rgba(45, 160, 168, 0.4) !important;
    color: #1a6b72 !important;
}

.vinc-btn--no {
    background: rgba(220, 53, 69, 0.08) !important;
    border: 1px solid rgba(220, 53, 69, 0.3) !important;
    color: #a52834 !important;
}

.vinc-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.vinc-card {
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 14px;
    padding: 1rem;
    background: #fafcff;
}

.vinc-card__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.vinc-card__top strong {
    display: block;
    color: #16254e;
}

.vinc-card__top small {
    color: #6c7a94;
}

.vinc-card__empresa {
    font-weight: 700;
    color: #16254e;
}

.vinc-card__meta {
    font-size: 0.82rem;
    color: #6c7a94;
}

.vinc-pag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.25rem;
    font-size: 0.88rem;
    color: #6c7a94;
}

.vinc-pag__btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid rgba(92, 107, 192, 0.3);
    background: #fff;
    color: #5c6bc0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vinc-pag__btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.vinc-modal {
    position: fixed;
    inset: 0;
    z-index: 2400;
    background: rgba(15, 22, 38, 0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.vinc-modal__card {
    width: 100%;
    max-width: 500px;
    background: #fff;
    border-radius: 16px;
    padding: 1.35rem;
    box-shadow: 0 20px 50px rgba(20, 30, 40, 0.2);
}

.vinc-modal__card h3 {
    margin: 0 0 0.35rem;
    font-size: 1.15rem;
    font-weight: 800;
    color: #16254e;
}

.vinc-modal__sub {
    margin: 0 0 1rem;
    font-size: 0.88rem;
    color: #6c7a94;
}

.vinc-modal__acoes {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
}
</style>
