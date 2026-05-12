<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
    RiAddLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiChatHistoryLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiPencilLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useAvisosAdmin } from "@/presentation/composables/Aviso/useAvisosAdmin";

const {
    avisos,
    carregandoLista,
    excluindoId,
    modalExcluirId,
    avisoExclusaoNome,
    erro,
    sucesso,
    paginaAtual,
    totalRegistros,
    carregar,
    abrirModalExcluir,
    fecharModalExcluir,
    confirmarExclusao,
    totalPaginas,
    irParaPagina
} = useAvisosAdmin();

const route = useRoute();
const router = useRouter();
const mostrarMsgCriado = ref(false);
const mostrarMsgErroNaoEncontrado = ref(false);

function formatarData(valor: string): string {
    if (!valor) return "—";
    const d = new Date(valor.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return valor;
    return d.toLocaleString("pt-BR");
}

onMounted(async () => {
    if (route.query.criado === "1") {
        mostrarMsgCriado.value = true;
        void router.replace({ query: {} });
    }
    if (route.query.erro === "nao_encontrado") {
        mostrarMsgErroNaoEncontrado.value = true;
        void router.replace({ query: {} });
    }
    try {
        await carregar(1);
    } catch {
        return;
    }
});
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Avisos"
                subtitle="Gerencie os comunicados exibidos aos clientes na página pública /aviso. Para incluir um novo registro, use o cadastro dedicado."
            >
                <template #icon><RiChatHistoryLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'AdministradorAvisoCadastro' }" class="btn">
                        <RiAddLine class="me-1" />
                        Novo aviso
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>
            <div v-if="mostrarMsgCriado" class="admin-alert admin-alert--ok mb-3">
                Aviso cadastrado com sucesso.
            </div>
            <div v-if="mostrarMsgErroNaoEncontrado" class="admin-alert admin-alert--erro mb-3">
                Aviso não encontrado ou expirado.
            </div>

            <section class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h2 class="admin-subtitle mb-0">Avisos cadastrados</h2>
                        <small class="text-muted">{{ totalRegistros }} registros</small>
                    </div>

                    <div v-if="carregandoLista" class="text-muted mt-3">Carregando avisos...</div>
                    <div v-else class="row g-3 mt-1">
                        <div v-for="item in avisos" :key="item.id" class="col-12 col-md-6 col-xl-4">
                            <div class="aviso-card">
                                <h3 class="aviso-card__nome">{{ item.nome }}</h3>
                                <p class="aviso-card__desc">{{ item.descricao }}</p>
                                <p class="aviso-card__line">
                                    <span>Expira em</span>
                                    <span class="aviso-card__value">{{ formatarData(item.expiracao) }}</span>
                                </p>
                                <p class="aviso-card__line">
                                    <span>Autor</span>
                                    <span class="aviso-card__value">
                                        {{ item.usuario?.tipo_usuario ?? "—" }}
                                    </span>
                                </p>
                                <p class="aviso-card__line">
                                    <span>Status</span>
                                    <span class="aviso-card__value">
                                        {{ item.usuario?.status ?? "—" }}
                                    </span>
                                </p>
                                <div class="aviso-card__actions">
                                    <RouterLink
                                        class="btn aviso-card__btn-edit"
                                        :to="{
                                            name: 'AdministradorAvisoEditar',
                                            params: { id: item.id }
                                        }"
                                    >
                                        <RiPencilLine />
                                        Editar
                                    </RouterLink>
                                    <button
                                        type="button"
                                        class="btn aviso-card__btn-delete"
                                        :disabled="excluindoId !== null"
                                        :aria-busy="excluindoId === item.id"
                                        @click="abrirModalExcluir(item.id)"
                                    >
                                        <RiDeleteBinLine
                                            v-if="excluindoId !== item.id"
                                        />
                                        <span
                                            v-else
                                            class="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        {{
                                            excluindoId === item.id
                                                ? "Excluindo..."
                                                : "Excluir"
                                        }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-if="avisos.length === 0" class="col-12">
                            <div class="aviso-empty text-center py-5 px-3">
                                <div class="aviso-empty__icon mb-3" aria-hidden="true">
                                    <RiChatHistoryLine />
                                </div>
                                <p class="mb-2 text-muted">Nenhum aviso cadastrado até o momento.</p>
                                <RouterLink
                                    :to="{ name: 'AdministradorAvisoCadastro' }"
                                    class="btn btn-primary btn-admin"
                                >
                                    <RiAddLine class="me-1" />
                                    Cadastrar primeiro aviso
                                </RouterLink>
                            </div>
                        </div>
                    </div>

                    <div class="avisos-pag mt-4" v-if="avisos.length > 0">
                        <button
                            type="button"
                            class="btn avisos-pag__nav"
                            :disabled="paginaAtual <= 1"
                            @click="irParaPagina(paginaAtual - 1)"
                        >
                            <RiArrowLeftSLine />
                        </button>
                        <span class="avisos-pag__info">
                            Pagina {{ paginaAtual }} de {{ totalPaginas() }}
                        </span>
                        <button
                            type="button"
                            class="btn avisos-pag__nav"
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
            class="aviso-excluir-modal__portal"
            role="presentation"
        >
            <div
                class="aviso-excluir-modal__backdrop"
                aria-hidden="true"
                @click="fecharModalExcluir"
            />
            <div
                class="aviso-excluir-modal__wrap"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="aviso-excluir-modal-titulo"
                @click.self="fecharModalExcluir"
            >
                <div class="aviso-excluir-modal__panel" @click.stop>
                    <button
                        type="button"
                        class="aviso-excluir-modal__fechar"
                        aria-label="Fechar"
                        :disabled="excluindoId !== null"
                        @click="fecharModalExcluir"
                    >
                        <RiCloseLine />
                    </button>
                    <h2 id="aviso-excluir-modal-titulo" class="aviso-excluir-modal__titulo">
                        Excluir aviso
                    </h2>
                    <p class="aviso-excluir-modal__texto">
                        Tem certeza que deseja excluir este aviso?
                    </p>
                    <p
                        v-if="avisoExclusaoNome"
                        class="aviso-excluir-modal__nome"
                    >
                        <strong>{{ avisoExclusaoNome }}</strong>
                    </p>
                    <div class="aviso-excluir-modal__acoes">
                        <button
                            type="button"
                            class="btn aviso-excluir-modal__btn aviso-excluir-modal__btn--outline"
                            :disabled="excluindoId !== null"
                            @click="fecharModalExcluir"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            class="btn aviso-excluir-modal__btn aviso-excluir-modal__btn--danger"
                            :disabled="excluindoId !== null"
                            @click="confirmarExclusao"
                        >
                            <span
                                v-if="excluindoId !== null"
                                class="aviso-excluir-modal__spinner"
                                role="status"
                                aria-hidden="true"
                            />
                            {{
                                excluindoId !== null
                                    ? "Excluindo…"
                                    : "Excluir"
                            }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.admin-card {
    border-radius: 18px;
}

.admin-subtitle {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: #16254e;
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

.btn-admin {
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 18px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
}

.aviso-card {
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 14px;
    padding: 0.95rem 1rem;
    background: #fff;
    height: 100%;
}

.aviso-card__nome {
    margin: 0 0 0.4rem;
    font-size: 1rem;
    font-weight: 800;
    color: #223862;
}

.aviso-card__desc {
    margin: 0 0 0.7rem;
    color: #486084;
    font-size: 0.9rem;
    overflow-wrap: anywhere;
    word-break: break-word;
}

.aviso-card__line {
    margin: 0.3rem 0;
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    color: #304867;
    font-size: 0.9rem;
}

.aviso-card__line > span:first-child {
    color: #6b7d9c;
    font-weight: 600;
    flex-shrink: 0;
}

.aviso-card__value {
    color: #304867;
    text-align: right;
    min-width: 0;
    overflow-wrap: anywhere;
}

.aviso-card__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.aviso-card__btn-edit {
    border: 1px solid rgba(92, 107, 192, 0.3);
    border-radius: 10px;
    color: #3f5284;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.aviso-card__btn-edit:hover {
    border-color: #5c6bc0;
    color: #2f4578;
    background: #f4f7ff;
}

.aviso-card__btn-delete {
    border: 1px solid rgba(200, 80, 80, 0.45);
    border-radius: 10px;
    color: #a32d2d;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: #fff;
}

.aviso-card__btn-delete:hover:not(:disabled) {
    border-color: #c45050;
    color: #7a1f1f;
    background: #fff8f8;
}

.aviso-card__btn-delete:disabled {
    opacity: 0.75;
    cursor: not-allowed;
}

.aviso-empty__icon {
    width: 56px;
    height: 56px;
    margin: 0 auto;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: rgba(92, 107, 192, 0.1);
    color: #4054b8;
    font-size: 1.5rem;
}

.avisos-pag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
}

.avisos-pag__nav {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(92, 107, 192, 0.28);
    color: #40528b;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.avisos-pag__info {
    font-size: 0.9rem;
    color: #4a5c82;
}

.aviso-excluir-modal__portal {
    position: fixed;
    inset: 0;
    z-index: 4000;
}

.aviso-excluir-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(22, 37, 78, 0.45);
    backdrop-filter: blur(4px);
}

.aviso-excluir-modal__wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
}

.aviso-excluir-modal__panel {
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 1.75rem 1.75rem 1.5rem;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 18px;
    box-shadow:
        0 12px 40px rgba(20, 30, 40, 0.12),
        0 4px 12px rgba(20, 30, 40, 0.06);
    font-family: var(--body-font, "Montserrat", sans-serif);
}

.aviso-excluir-modal__fechar {
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
    transition: background 0.2s ease, color 0.2s ease;
}

.aviso-excluir-modal__fechar:hover:not(:disabled) {
    background: rgba(92, 107, 192, 0.15);
    color: #16254e;
}

.aviso-excluir-modal__fechar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.aviso-excluir-modal__fechar svg {
    width: 1.25rem;
    height: 1.25rem;
}

.aviso-excluir-modal__titulo {
    margin: 0 2.25rem 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #16254e;
    line-height: 1.3;
}

.aviso-excluir-modal__texto {
    margin: 0 0 0.5rem;
    font-size: 0.938rem;
    line-height: 1.55;
    color: #4a5b78;
}

.aviso-excluir-modal__nome {
    margin: 0 0 1.25rem;
    font-size: 0.938rem;
    line-height: 1.45;
    color: #304867;
    overflow-wrap: anywhere;
}

.aviso-excluir-modal__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    justify-content: flex-end;
}

.aviso-excluir-modal__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 10px 18px;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.938rem;
    font-weight: 700;
    cursor: pointer;
    transition:
        transform 0.18s ease,
        box-shadow 0.18s ease,
        opacity 0.18s ease;
}

.aviso-excluir-modal__btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
    transform: none;
}

.aviso-excluir-modal__btn--outline {
    border: 2px solid #5c6bc0;
    background: transparent;
    color: #5c6bc0;
}

.aviso-excluir-modal__btn--outline:hover:not(:disabled) {
    background: rgba(92, 107, 192, 0.06);
}

.aviso-excluir-modal__btn--danger {
    border: none;
    background: linear-gradient(90deg, #c45050 0%, #a32d2d 100%);
    color: #fff;
    box-shadow: 0 10px 24px rgba(163, 45, 45, 0.2);
}

.aviso-excluir-modal__btn--danger:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(163, 45, 45, 0.25);
}

.aviso-excluir-modal__spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: aviso-excluir-modal-spin 0.65s linear infinite;
}

@keyframes aviso-excluir-modal-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 400px) {
    .aviso-excluir-modal__acoes {
        flex-direction: column-reverse;
    }

    .aviso-excluir-modal__btn {
        width: 100%;
    }
}
</style>
