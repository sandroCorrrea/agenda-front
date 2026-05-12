<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiAddLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiPencilLine,
    RiSearchLine,
    RiStackLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useServicosAdmin } from "@/presentation/composables/Servico/useServicosAdmin";

const router = useRouter();
const {
    servicos,
    carregandoLista,
    excluindoId,
    modalExcluirId,
    servicoExclusaoNome,
    nomeFiltro,
    erro,
    sucesso,
    paginaAtual,
    totalRegistros,
    carregar,
    aplicarFiltro,
    totalPaginas,
    irParaPagina,
    abrirModalExcluir,
    fecharModalExcluir,
    confirmarExclusao
} = useServicosAdmin();

const mostrarMsgCriado = ref(false);

onMounted(async () => {
    if (router.currentRoute.value.query.criado === "1") {
        mostrarMsgCriado.value = true;
        void router.replace({ query: {} });
    }
    try {
        await carregar(1);
    } catch {
        return;
    }
});

function aoBuscar(ev: Event) {
    ev.preventDefault();
    aplicarFiltro();
}
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Serviços"
                subtitle="Crie, edite e organize o que os visitantes veem na página pública de serviços. Apenas itens ativos entram na listagem do site."
            >
                <template #icon><RiStackLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'AdministradorServicoCadastro' }" class="btn">
                        <RiAddLine class="me-1" />
                        Novo serviço
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>
            <div v-if="mostrarMsgCriado" class="admin-alert admin-alert--ok mb-3">
                Serviço cadastrado com sucesso.
            </div>

            <form class="svc-admin__search mb-4" @submit="aoBuscar">
                <div class="svc-admin__search-field">
                    <RiSearchLine class="svc-admin__search-icon" aria-hidden="true" />
                    <input
                        v-model="nomeFiltro"
                        type="search"
                        class="form-control svc-admin__search-input"
                        placeholder="Filtrar por nome..."
                        autocomplete="off"
                        aria-label="Filtrar serviços por nome"
                    />
                </div>
                <button type="submit" class="btn svc-admin__search-btn">Filtrar</button>
            </form>

            <section class="svc-admin__panel card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <h2 class="svc-admin__subtitle mb-0">Cadastrados</h2>
                        <small class="text-muted">{{ totalRegistros }} registro(s)</small>
                    </div>

                    <div v-if="carregandoLista" class="text-muted py-4">Carregando serviços…</div>
                    <div v-else class="row g-4">
                        <div
                            v-for="item in servicos"
                            :key="item.id"
                            class="col-12 col-md-6 col-xl-4"
                        >
                            <div class="svc-card">
                                <div class="svc-card__accent" />
                                <div class="svc-card__body">
                                    <div class="svc-card__top">
                                        <h3 class="svc-card__nome">{{ item.nome }}</h3>
                                        <span
                                            class="svc-card__badge"
                                            :class="
                                                item.status === 'ativo'
                                                    ? 'svc-card__badge--on'
                                                    : 'svc-card__badge--off'
                                            "
                                        >
                                            {{ item.status === "ativo" ? "Ativo" : "Inativo" }}
                                        </span>
                                    </div>
                                    <p class="svc-card__desc">
                                        {{ item.descricao?.trim() || "Sem descrição." }}
                                    </p>
                                    <div class="svc-card__actions">
                                        <RouterLink
                                            class="btn svc-card__btn svc-card__btn--edit"
                                            :to="{ name: 'AdministradorServicoEditar', params: { id: item.id } }"
                                        >
                                            <RiPencilLine />
                                            Editar
                                        </RouterLink>
                                        <button
                                            type="button"
                                            class="btn svc-card__btn svc-card__btn--del"
                                            :disabled="excluindoId !== null"
                                            :aria-busy="excluindoId === item.id"
                                            @click="abrirModalExcluir(item.id)"
                                        >
                                            <RiDeleteBinLine v-if="excluindoId !== item.id" />
                                            <span
                                                v-else
                                                class="spinner-border spinner-border-sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            {{
                                                excluindoId === item.id ? "Excluindo…" : "Excluir"
                                            }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="servicos.length === 0" class="col-12">
                            <div class="svc-admin__empty text-center py-5 px-3">
                                <RiStackLine class="svc-admin__empty-icon mb-3" aria-hidden="true" />
                                <p class="mb-2 text-muted">Nenhum serviço encontrado com os filtros atuais.</p>
                                <RouterLink
                                    :to="{ name: 'AdministradorServicoCadastro' }"
                                    class="btn svc-admin__btn-nova btn-sm"
                                >
                                    <RiAddLine class="me-1" />
                                    Cadastrar serviço
                                </RouterLink>
                            </div>
                        </div>
                    </div>

                    <div v-if="servicos.length > 0" class="svc-admin__pag mt-4">
                        <button
                            type="button"
                            class="btn svc-admin__pag-nav"
                            :disabled="paginaAtual <= 1"
                            @click="irParaPagina(paginaAtual - 1)"
                        >
                            <RiArrowLeftSLine />
                        </button>
                        <span class="svc-admin__pag-info">
                            Página {{ paginaAtual }} de {{ totalPaginas() }}
                        </span>
                        <button
                            type="button"
                            class="btn svc-admin__pag-nav"
                            :disabled="paginaAtual >= totalPaginas()"
                            @click="irParaPagina(paginaAtual + 1)"
                        >
                            <RiArrowRightSLine />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </article>

    <Teleport to="body">
        <div
            v-if="modalExcluirId !== null"
            class="svc-modal__portal"
            role="presentation"
        >
            <div class="svc-modal__backdrop" aria-hidden="true" @click="fecharModalExcluir" />
            <div
                class="svc-modal__wrap"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="svc-modal-titulo"
                @click.self="fecharModalExcluir"
            >
                <div class="svc-modal__panel" @click.stop>
                    <button
                        type="button"
                        class="svc-modal__fechar"
                        aria-label="Fechar"
                        :disabled="excluindoId !== null"
                        @click="fecharModalExcluir"
                    >
                        <RiCloseLine />
                    </button>
                    <h2 id="svc-modal-titulo" class="svc-modal__titulo">Excluir serviço</h2>
                    <p class="svc-modal__texto">Tem certeza que deseja excluir este serviço?</p>
                    <p v-if="servicoExclusaoNome" class="svc-modal__nome">
                        <strong>{{ servicoExclusaoNome }}</strong>
                    </p>
                    <div class="svc-modal__acoes">
                        <button
                            type="button"
                            class="btn svc-modal__btn svc-modal__btn--outline"
                            :disabled="excluindoId !== null"
                            @click="fecharModalExcluir"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            class="btn svc-modal__btn svc-modal__btn--danger"
                            :disabled="excluindoId !== null"
                            @click="confirmarExclusao"
                        >
                            <span
                                v-if="excluindoId !== null"
                                class="svc-modal__spinner"
                                role="status"
                                aria-hidden="true"
                            />
                            {{ excluindoId !== null ? "Excluindo…" : "Excluir" }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.svc-admin__btn-nova {
    margin-left: auto;
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 18px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #fff 0%, #e8f4ff 100%) !important;
    color: #1e3a5f !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
}

.svc-admin__btn-nova:hover {
    filter: brightness(1.05);
}

.svc-admin__search {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: stretch;
}

.svc-admin__search-field {
    flex: 1;
    min-width: 200px;
    position: relative;
}

.svc-admin__search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.2rem;
    color: #6b7d9c;
    pointer-events: none;
}

.svc-admin__search-input {
    padding-left: 2.75rem;
    border-radius: 12px;
    border: 1px solid rgba(92, 107, 192, 0.22);
    min-height: 46px;
}

.svc-admin__search-btn {
    border-radius: 12px;
    font-weight: 700;
    padding: 10px 20px;
    border: none;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff;
}

.svc-admin__subtitle {
    font-size: 1.2rem;
    font-weight: 800;
    color: #16254e;
}

.svc-admin__panel {
    border-radius: 18px !important;
}

.svc-card {
    position: relative;
    height: 100%;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.06);
    box-shadow: 0 8px 28px rgba(22, 37, 78, 0.06);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.svc-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(22, 37, 78, 0.1);
}

.svc-card__accent {
    height: 4px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.svc-card__body {
    padding: 1.1rem 1.15rem 1.15rem;
}

.svc-card__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.svc-card__nome {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: #1a2d4e;
    line-height: 1.3;
    word-break: break-word;
}

.svc-card__badge {
    flex-shrink: 0;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.25rem 0.55rem;
    border-radius: 999px;
}

.svc-card__badge--on {
    background: rgba(45, 160, 168, 0.15);
    color: #1a6b72;
}

.svc-card__badge--off {
    background: rgba(120, 130, 150, 0.2);
    color: #5a6578;
}

.svc-card__desc {
    margin: 0 0 1rem;
    font-size: 0.88rem;
    color: #4a5c78;
    line-height: 1.45;
    min-height: 2.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.svc-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-end;
}

.svc-card__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.85rem;
    padding: 0.45rem 0.75rem;
}

.svc-card__btn--edit {
    border: 1px solid rgba(92, 107, 192, 0.35);
    color: #3f5284;
    background: rgba(92, 107, 192, 0.06);
}

.svc-card__btn--del {
    border: 1px solid rgba(196, 80, 80, 0.45);
    color: #a32d2d;
    background: rgba(196, 80, 80, 0.06);
}

.svc-card__btn--del:disabled {
    opacity: 0.65;
}

.svc-admin__empty-icon {
    font-size: 2.5rem;
    color: rgba(92, 107, 192, 0.35);
}

.svc-admin__pag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
}

.svc-admin__pag-nav {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid rgba(92, 107, 192, 0.28);
    color: #40528b;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.svc-admin__pag-info {
    font-size: 0.9rem;
    color: #4a5c82;
}

.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
}
.admin-alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}
.admin-alert--ok {
    background: #eefaf3;
    border: 1px solid #b7e3c7;
    color: #1d6d3f;
}

.svc-modal__portal {
    position: fixed;
    inset: 0;
    z-index: 4000;
}
.svc-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(22, 37, 78, 0.45);
    backdrop-filter: blur(4px);
}
.svc-modal__wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
}
.svc-modal__panel {
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 1.75rem 1.75rem 1.5rem;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 18px;
    box-shadow: 0 12px 40px rgba(20, 30, 40, 0.12);
}
.svc-modal__fechar {
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: rgba(92, 107, 192, 0.08);
    color: #4a5b78;
    cursor: pointer;
}
.svc-modal__fechar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.svc-modal__titulo {
    margin: 0 2.25rem 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #16254e;
}
.svc-modal__texto {
    margin: 0 0 0.5rem;
    font-size: 0.938rem;
    color: #4a5b78;
}
.svc-modal__nome {
    margin: 0 0 1.25rem;
    font-size: 0.938rem;
    color: #304867;
    overflow-wrap: anywhere;
}
.svc-modal__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    justify-content: flex-end;
}
.svc-modal__btn {
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
}
.svc-modal__btn--outline {
    border: 2px solid #5c6bc0;
    background: transparent;
    color: #5c6bc0;
}
.svc-modal__btn--danger {
    border: none;
    background: linear-gradient(90deg, #c45050 0%, #a32d2d 100%);
    color: #fff;
}
.svc-modal__spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    display: inline-block;
    animation: svc-spin 0.65s linear infinite;
}
@keyframes svc-spin {
    to {
        transform: rotate(360deg);
    }
}
@media (max-width: 400px) {
    .svc-modal__acoes {
        flex-direction: column-reverse;
    }
    .svc-modal__btn {
        width: 100%;
    }
}
</style>
