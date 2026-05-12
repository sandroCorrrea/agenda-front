<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
    RiAddLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiArticleLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiPencilLine
} from "@remixicon/vue";
import { ref } from "vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { usePostagensAdmin } from "@/presentation/composables/BlogPostagem/usePostagensAdmin";
import { nomeAutorPostagem } from "@/shared/utils/blogPostagemAutor";

const {
    postagens,
    carregandoLista,
    excluindoId,
    modalExcluirId,
    postagemExclusaoNome,
    erro,
    sucesso,
    paginaAtual,
    totalRegistros,
    carregar,
    totalPaginas,
    irParaPagina,
    abrirModalExcluir,
    fecharModalExcluir,
    confirmarExclusao
} = usePostagensAdmin();

const route = useRoute();
const router = useRouter();
const mostrarMsgCriado = ref(false);
const mostrarMsgAtualizado = ref(false);
const mostrarMsgErroNaoEncontrado = ref(false);

function formatarData(valor: Date | null): string {
    if (!valor) return "—";
    return new Date(valor).toLocaleString("pt-BR");
}

onMounted(async () => {
    if (route.query.criado === "1") {
        mostrarMsgCriado.value = true;
        void router.replace({ query: {} });
    }
    if (route.query.atualizado === "1") {
        mostrarMsgAtualizado.value = true;
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
                title="Postagens do blog"
                subtitle="Gerencie os artigos do blog com imagem e arquivo opcional."
            >
                <template #icon><RiArticleLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'BlogPostagemCadastro' }" class="btn">
                        <RiAddLine class="me-1" />
                        Nova postagem
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>
            <div v-if="mostrarMsgCriado" class="admin-alert admin-alert--ok mb-3">
                Postagem cadastrada com sucesso.
            </div>
            <div v-if="mostrarMsgAtualizado" class="admin-alert admin-alert--ok mb-3">
                Postagem atualizada com sucesso.
            </div>
            <div v-if="mostrarMsgErroNaoEncontrado" class="admin-alert admin-alert--erro mb-3">
                Postagem não encontrada.
            </div>

            <section class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h2 class="admin-subtitle mb-0">Postagens cadastradas</h2>
                        <small class="text-muted">{{ totalRegistros }} registros</small>
                    </div>

                    <div v-if="carregandoLista" class="text-muted mt-3">Carregando postagens...</div>
                    <div v-else class="row g-3 mt-1">
                        <div v-for="item in postagens" :key="item.id" class="col-12 col-md-6 col-xl-4">
                            <div class="post-card">
                                <h3 class="post-card__nome">{{ item.nome }}</h3>
                                <p class="post-card__desc">{{ item.descricao }}</p>
                                <p class="post-card__line">
                                    <span>Categoria</span>
                                    <span class="post-card__value">{{ item.categoria?.nome ?? "—" }}</span>
                                </p>
                                <p class="post-card__line">
                                    <span>Status</span>
                                    <span class="post-card__value">{{ item.status ?? "—" }}</span>
                                </p>
                                <p class="post-card__line">
                                    <span>Autor</span>
                                    <span class="post-card__value post-card__value--autor">
                                        <span>{{ nomeAutorPostagem(item) }}</span>
                                        <small
                                            v-if="item.usuario?.pessoa?.email"
                                            class="d-block text-muted post-card__autor-email"
                                        >
                                            {{ item.usuario.pessoa.email }}
                                        </small>
                                    </span>
                                </p>
                                <p class="post-card__line">
                                    <span>Criado em</span>
                                    <span class="post-card__value">{{ formatarData(item.dataCriacao) }}</span>
                                </p>
                                <div class="post-card__actions">
                                    <RouterLink
                                        class="btn post-card__btn"
                                        :to="{ name: 'BlogPostagemEditar', params: { id: item.id } }"
                                    >
                                        <RiPencilLine />
                                        Editar
                                    </RouterLink>
                                    <button
                                        type="button"
                                        class="btn post-card__btn-delete"
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
                                            excluindoId === item.id ? "Excluindo..." : "Excluir"
                                        }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-if="postagens.length === 0" class="col-12">
                            <div class="post-empty text-center py-5 px-3">
                                <div class="post-empty__icon mb-3" aria-hidden="true">
                                    <RiArticleLine />
                                </div>
                                <p class="mb-2 text-muted">Nenhuma postagem cadastrada até o momento.</p>
                                <RouterLink
                                    :to="{ name: 'BlogPostagemCadastro' }"
                                    class="btn btn-primary btn-admin"
                                >
                                    <RiAddLine class="me-1" />
                                    Cadastrar primeira postagem
                                </RouterLink>
                            </div>
                        </div>
                    </div>

                    <div class="post-pag mt-4" v-if="postagens.length > 0">
                        <button
                            type="button"
                            class="btn post-pag__nav"
                            :disabled="paginaAtual <= 1"
                            @click="irParaPagina(paginaAtual - 1)"
                        >
                            <RiArrowLeftSLine />
                        </button>
                        <span class="post-pag__info">
                            Pagina {{ paginaAtual }} de {{ totalPaginas() }}
                        </span>
                        <button
                            type="button"
                            class="btn post-pag__nav"
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
            class="post-excluir-modal__portal"
            role="presentation"
        >
            <div
                class="post-excluir-modal__backdrop"
                aria-hidden="true"
                @click="fecharModalExcluir"
            />
            <div
                class="post-excluir-modal__wrap"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="post-excluir-modal-titulo"
                @click.self="fecharModalExcluir"
            >
                <div class="post-excluir-modal__panel" @click.stop>
                    <button
                        type="button"
                        class="post-excluir-modal__fechar"
                        aria-label="Fechar"
                        :disabled="excluindoId !== null"
                        @click="fecharModalExcluir"
                    >
                        <RiCloseLine />
                    </button>
                    <h2 id="post-excluir-modal-titulo" class="post-excluir-modal__titulo">
                        Excluir postagem
                    </h2>
                    <p class="post-excluir-modal__texto">
                        Tem certeza que deseja excluir esta postagem?
                    </p>
                    <p v-if="postagemExclusaoNome" class="post-excluir-modal__nome">
                        <strong>{{ postagemExclusaoNome }}</strong>
                    </p>
                    <div class="post-excluir-modal__acoes">
                        <button
                            type="button"
                            class="btn post-excluir-modal__btn post-excluir-modal__btn--outline"
                            :disabled="excluindoId !== null"
                            @click="fecharModalExcluir"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            class="btn post-excluir-modal__btn post-excluir-modal__btn--danger"
                            :disabled="excluindoId !== null"
                            @click="confirmarExclusao"
                        >
                            <span
                                v-if="excluindoId !== null"
                                class="post-excluir-modal__spinner"
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
.admin-card { border-radius: 18px; }
.admin-subtitle { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; color: #16254e; }
.admin-alert { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.92rem; }
.admin-alert--erro { background: #fff3f3; border: 1px solid #f1b4b4; color: #9e2b2b; }
.admin-alert--ok { background: #eefaf3; border: 1px solid #b7e3c7; color: #1d6d3f; }
.btn-admin { border: none !important; border-radius: 12px !important; padding: 10px 18px !important; font-weight: 700 !important; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important; }
.post-card { border: 1px solid rgba(20, 30, 40, 0.08); border-radius: 14px; padding: 0.95rem 1rem; background: #fff; height: 100%; }
.post-card__nome { margin: 0 0 0.4rem; font-size: 1rem; font-weight: 800; color: #223862; }
.post-card__desc { margin: 0 0 0.7rem; color: #486084; font-size: 0.9rem; overflow-wrap: anywhere; word-break: break-word; min-height: 60px; }
.post-card__line { margin: 0.3rem 0; display: flex; justify-content: space-between; gap: 0.75rem; color: #304867; font-size: 0.9rem; }
.post-card__line > span:first-child { color: #6b7d9c; font-weight: 600; flex-shrink: 0; }
.post-card__value { color: #304867; text-align: right; min-width: 0; overflow-wrap: anywhere; }
.post-card__value--autor { text-align: right; }
.post-card__autor-email { font-size: 0.78rem; margin-top: 0.15rem; }
.post-card__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; }
.post-card__btn { border: 1px solid rgba(92, 107, 192, 0.3); border-radius: 10px; color: #3f5284; font-weight: 700; display: inline-flex; align-items: center; gap: 0.35rem; }
.post-card__btn-delete {
    border: 1px solid rgba(196, 80, 80, 0.45);
    border-radius: 10px;
    color: #a32d2d;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(196, 80, 80, 0.06);
}
.post-card__btn-delete:hover:not(:disabled) {
    background: rgba(196, 80, 80, 0.12);
    color: #8a2525;
}
.post-card__btn-delete:disabled { opacity: 0.65; cursor: not-allowed; }
.post-empty__icon { width: 56px; height: 56px; margin: 0 auto; border-radius: 16px; display: grid; place-items: center; background: rgba(92, 107, 192, 0.1); color: #4054b8; font-size: 1.5rem; }
.post-pag { display: flex; align-items: center; justify-content: center; gap: 0.9rem; }
.post-pag__nav { width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(92, 107, 192, 0.28); color: #40528b; display: inline-flex; align-items: center; justify-content: center; }
.post-pag__info { font-size: 0.9rem; color: #4a5c82; }

.post-excluir-modal__portal {
    position: fixed;
    inset: 0;
    z-index: 4000;
}
.post-excluir-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(22, 37, 78, 0.45);
    backdrop-filter: blur(4px);
}
.post-excluir-modal__wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
}
.post-excluir-modal__panel {
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
.post-excluir-modal__fechar {
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
.post-excluir-modal__fechar:hover:not(:disabled) {
    background: rgba(92, 107, 192, 0.15);
    color: #16254e;
}
.post-excluir-modal__fechar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.post-excluir-modal__fechar svg {
    width: 1.25rem;
    height: 1.25rem;
}
.post-excluir-modal__titulo {
    margin: 0 2.25rem 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #16254e;
    line-height: 1.3;
}
.post-excluir-modal__texto {
    margin: 0 0 0.5rem;
    font-size: 0.938rem;
    line-height: 1.55;
    color: #4a5b78;
}
.post-excluir-modal__nome {
    margin: 0 0 1.25rem;
    font-size: 0.938rem;
    line-height: 1.45;
    color: #304867;
    overflow-wrap: anywhere;
}
.post-excluir-modal__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    justify-content: flex-end;
}
.post-excluir-modal__btn {
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
.post-excluir-modal__btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
    transform: none;
}
.post-excluir-modal__btn--outline {
    border: 2px solid #5c6bc0;
    background: transparent;
    color: #5c6bc0;
}
.post-excluir-modal__btn--outline:hover:not(:disabled) {
    background: rgba(92, 107, 192, 0.06);
}
.post-excluir-modal__btn--danger {
    border: none;
    background: linear-gradient(90deg, #c45050 0%, #a32d2d 100%);
    color: #fff;
    box-shadow: 0 10px 24px rgba(163, 45, 45, 0.2);
}
.post-excluir-modal__btn--danger:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(163, 45, 45, 0.25);
}
.post-excluir-modal__spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: post-excluir-modal-spin 0.65s linear infinite;
}
@keyframes post-excluir-modal-spin {
    to { transform: rotate(360deg); }
}
@media (max-width: 400px) {
    .post-excluir-modal__acoes { flex-direction: column-reverse; }
    .post-excluir-modal__btn { width: 100%; }
}
</style>
