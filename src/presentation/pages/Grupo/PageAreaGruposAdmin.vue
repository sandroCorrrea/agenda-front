<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import {
    RiAddLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCloseLine,
    RiDeleteBinLine,
    RiKey2Line,
    RiPencilLine,
    RiShieldCheckLine,
    RiTeamLine,
    RiUserLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useGruposAdmin } from "@/presentation/composables/Grupo/useGruposAdmin";
import type { GrupoListagemItemDTO } from "@/application/dto/Grupo/GrupoAcessoDTO";

const {
    lista,
    carregandoLista,
    salvando,
    erro,
    sucesso,
    paginaAtual,
    totalRegistros,
    ultimaPagina,
    carregarLista,
    excluir
} = useGruposAdmin();

const excluindoId = ref<number | null>(null);
const modalExcluir = ref<GrupoListagemItemDTO | null>(null);

const totalAtivos = computed(() => lista.value.filter((g) => g.ativo).length);
const totalMembros = computed(() =>
    lista.value.reduce((acc, g) => acc + (g.total_membros || 0), 0)
);

onMounted(() => {
    void carregarLista(1);
    document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
    document.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = "";
});

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && modalExcluir.value) fecharModalExcluir();
}

function labelEscopo(escopo: string | null | undefined): string {
    if (escopo === "admin") return "Administrativo";
    if (escopo === "cliente") return "Portal cliente";
    return "A definir";
}

function abrirModalExcluir(item: GrupoListagemItemDTO) {
    modalExcluir.value = item;
    document.body.style.overflow = "hidden";
}

function fecharModalExcluir() {
    if (excluindoId.value != null) return;
    modalExcluir.value = null;
    document.body.style.overflow = "";
}

async function confirmarExcluir() {
    const item = modalExcluir.value;
    if (!item) return;
    if (item.total_membros > 0) return;
    excluindoId.value = item.id;
    try {
        await excluir(item.id);
        fecharModalExcluir();
    } catch {
        return;
    } finally {
        excluindoId.value = null;
    }
}
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Grupos de acesso"
                subtitle="Organize quem vê o quê no sistema. Cada grupo define menus e ações (visualizar, inserir, atualizar e excluir) para clientes ou prefeitura."
            >
                <template #icon><RiTeamLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'AdministradorGrupoCadastro' }" class="btn">
                        <RiAddLine class="me-1" />
                        Novo grupo
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <section class="grp-stats mb-4" aria-label="Resumo dos grupos">
                <div class="grp-stat">
                    <span class="grp-stat__icon grp-stat__icon--blue"><RiTeamLine /></span>
                    <div>
                        <strong>{{ totalRegistros }}</strong>
                        <span>grupos</span>
                    </div>
                </div>
                <div class="grp-stat">
                    <span class="grp-stat__icon grp-stat__icon--teal"><RiShieldCheckLine /></span>
                    <div>
                        <strong>{{ totalAtivos }}</strong>
                        <span>ativos nesta página</span>
                    </div>
                </div>
                <div class="grp-stat">
                    <span class="grp-stat__icon grp-stat__icon--amber"><RiUserLine /></span>
                    <div>
                        <strong>{{ totalMembros }}</strong>
                        <span>membros nesta página</span>
                    </div>
                </div>
            </section>

            <section class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
                        <h2 class="admin-subtitle mb-0">Grupos cadastrados</h2>
                        <small class="text-muted">{{ totalRegistros }} registro(s)</small>
                    </div>
                    <p class="grp-hint mb-3">
                        Dica: configure primeiro as <strong>permissões</strong> e depois adicione
                        <strong>membros</strong>. Um usuário só pode pertencer a um grupo.
                    </p>

                    <div v-if="carregandoLista" class="grp-loading">Carregando grupos...</div>

                    <div v-else-if="lista.length === 0" class="grp-empty">
                        <div class="grp-empty__icon" aria-hidden="true"><RiTeamLine /></div>
                        <h3>Nenhum grupo ainda</h3>
                        <p>
                            Crie o primeiro grupo para liberar menus personalizados a clientes
                            ou administradores da prefeitura.
                        </p>
                        <RouterLink :to="{ name: 'AdministradorGrupoCadastro' }" class="btn grp-btn-primary">
                            <RiAddLine class="me-1" />
                            Criar primeiro grupo
                        </RouterLink>
                    </div>

                    <div v-else class="grp-grid">
                        <article
                            v-for="item in lista"
                            :key="item.id"
                            class="grp-card"
                            :class="{ 'grp-card--inativo': !item.ativo }"
                        >
                            <header class="grp-card__head">
                                <div class="grp-card__title-wrap">
                                    <h3 class="grp-card__title">{{ item.nome }}</h3>
                                    <span
                                        class="grp-pill"
                                        :class="item.ativo ? 'grp-pill--ok' : 'grp-pill--off'"
                                    >
                                        {{ item.ativo ? "Ativo" : "Inativo" }}
                                    </span>
                                </div>
                                <span
                                    class="grp-scope"
                                    :class="
                                        item.escopo === 'admin'
                                            ? 'grp-scope--admin'
                                            : item.escopo === 'cliente'
                                              ? 'grp-scope--cliente'
                                              : 'grp-scope--none'
                                    "
                                >
                                    {{ labelEscopo(item.escopo) }}
                                </span>
                            </header>

                            <p class="grp-card__desc">
                                {{ item.descricao?.trim() || "Sem descrição cadastrada." }}
                            </p>

                            <div class="grp-card__meta">
                                <div class="grp-meta">
                                    <RiUserLine />
                                    <span>{{ item.total_membros }} membro(s)</span>
                                </div>
                                <div class="grp-meta">
                                    <RiKey2Line />
                                    <span>{{ item.total_permissoes }} permissão(ões)</span>
                                </div>
                            </div>

                            <footer class="grp-card__actions">
                                <RouterLink
                                    class="btn grp-btn-edit"
                                    :to="{
                                        name: 'AdministradorGrupoEditar',
                                        params: { id: item.id }
                                    }"
                                >
                                    <RiPencilLine />
                                    Configurar
                                </RouterLink>
                                <button
                                    type="button"
                                    class="btn grp-btn-del"
                                    :disabled="salvando || excluindoId === item.id"
                                    :title="
                                        item.total_membros > 0
                                            ? 'Remova os membros antes de excluir'
                                            : 'Excluir grupo'
                                    "
                                    @click="abrirModalExcluir(item)"
                                >
                                    <RiDeleteBinLine />
                                </button>
                            </footer>
                        </article>
                    </div>

                    <div
                        v-if="lista.length > 0 && ultimaPagina > 1"
                        class="grp-pag mt-4"
                    >
                        <button
                            type="button"
                            class="btn grp-pag__nav"
                            :disabled="paginaAtual <= 1"
                            @click="carregarLista(paginaAtual - 1)"
                        >
                            <RiArrowLeftSLine />
                        </button>
                        <span class="grp-pag__info">
                            Página {{ paginaAtual }} de {{ ultimaPagina }}
                        </span>
                        <button
                            type="button"
                            class="btn grp-pag__nav"
                            :disabled="paginaAtual >= ultimaPagina"
                            @click="carregarLista(paginaAtual + 1)"
                        >
                            <RiArrowRightSLine />
                        </button>
                    </div>
                </div>
            </section>
        </div>

        <Teleport to="body">
            <div
                v-if="modalExcluir"
                class="grp-modal"
                @click.self="fecharModalExcluir"
            >
                <div class="grp-modal__panel" role="dialog" aria-modal="true" aria-labelledby="grp-del-title">
                    <button
                        type="button"
                        class="grp-modal__close"
                        :disabled="excluindoId !== null"
                        @click="fecharModalExcluir"
                    >
                        <RiCloseLine />
                    </button>
                    <h2 id="grp-del-title">Excluir grupo</h2>
                    <p v-if="modalExcluir.total_membros > 0" class="grp-modal__warn">
                        O grupo <strong>{{ modalExcluir.nome }}</strong> ainda possui
                        {{ modalExcluir.total_membros }} membro(s). Remova todos os membros
                        antes de excluir.
                    </p>
                    <p v-else>
                        Tem certeza que deseja excluir
                        <strong>{{ modalExcluir.nome }}</strong>? Esta ação não pode ser desfeita.
                    </p>
                    <div class="grp-modal__acoes">
                        <button
                            type="button"
                            class="btn grp-modal__btn grp-modal__btn--ghost"
                            :disabled="excluindoId !== null"
                            @click="fecharModalExcluir"
                        >
                            Cancelar
                        </button>
                        <button
                            v-if="modalExcluir.total_membros === 0"
                            type="button"
                            class="btn grp-modal__btn grp-modal__btn--danger"
                            :disabled="excluindoId !== null"
                            @click="confirmarExcluir"
                        >
                            {{ excluindoId !== null ? "Excluindo..." : "Excluir definitivamente" }}
                        </button>
                        <RouterLink
                            v-else
                            class="btn grp-modal__btn grp-modal__btn--primary"
                            :to="{
                                name: 'AdministradorGrupoEditar',
                                params: { id: modalExcluir.id },
                                query: { aba: 'membros' }
                            }"
                            @click="fecharModalExcluir"
                        >
                            Ir para membros
                        </RouterLink>
                    </div>
                </div>
            </div>
        </Teleport>
    </article>
</template>

<style scoped>
.admin-subtitle {
    font-size: 1.15rem;
    font-weight: 800;
    color: #1c3359;
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

.grp-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
}

.grp-stat {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem 1.1rem;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(31, 46, 84, 0.08);
    box-shadow: 0 8px 22px rgba(28, 51, 89, 0.06);
}

.grp-stat strong {
    display: block;
    font-size: 1.35rem;
    font-weight: 800;
    color: #1c3359;
    line-height: 1.1;
}

.grp-stat span:last-child {
    display: block;
    font-size: 0.78rem;
    color: #6b7c99;
    font-weight: 600;
}

.grp-stat__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}

.grp-stat__icon--blue {
    background: rgba(45, 74, 132, 0.12);
    color: #2d4a84;
}

.grp-stat__icon--teal {
    background: rgba(45, 160, 168, 0.14);
    color: #1f7f86;
}

.grp-stat__icon--amber {
    background: rgba(232, 163, 23, 0.16);
    color: #b57900;
}

.grp-hint {
    color: #62708a;
    font-size: 0.9rem;
    margin: 0;
}

.grp-loading {
    padding: 2rem 0;
    color: #6b7c99;
}

.grp-empty {
    text-align: center;
    padding: 2.5rem 1rem;
}

.grp-empty__icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(45, 74, 132, 0.12), rgba(45, 160, 168, 0.14));
    color: #2d4a84;
    font-size: 1.6rem;
}

.grp-empty h3 {
    margin: 0 0 0.4rem;
    color: #1c3359;
    font-weight: 800;
}

.grp-empty p {
    max-width: 420px;
    margin: 0 auto 1.2rem;
    color: #6b7c99;
}

.grp-btn-primary {
    background: linear-gradient(120deg, #2d4a84, #2da0a8) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    padding: 0.65rem 1.1rem !important;
}

.grp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.grp-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.15rem 1.2rem;
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
    border: 1px solid rgba(31, 46, 84, 0.1);
    box-shadow: 0 10px 24px rgba(28, 51, 89, 0.05);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.grp-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px rgba(28, 51, 89, 0.1);
}

.grp-card--inativo {
    opacity: 0.78;
}

.grp-card__head {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
}

.grp-card__title-wrap {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
}

.grp-card__title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: #1c3359;
    line-height: 1.25;
}

.grp-card__desc {
    margin: 0;
    color: #5d6d88;
    font-size: 0.9rem;
    line-height: 1.45;
    min-height: 2.7em;
}

.grp-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    white-space: nowrap;
}

.grp-pill--ok {
    background: rgba(34, 160, 120, 0.14);
    color: #0f7a55;
}

.grp-pill--off {
    background: rgba(100, 116, 139, 0.14);
    color: #64748b;
}

.grp-scope {
    align-self: flex-start;
    border-radius: 10px;
    padding: 0.28rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
}

.grp-scope--admin {
    background: rgba(45, 74, 132, 0.12);
    color: #2d4a84;
}

.grp-scope--cliente {
    background: rgba(45, 160, 168, 0.14);
    color: #1a7a80;
}

.grp-scope--none {
    background: rgba(148, 163, 184, 0.16);
    color: #64748b;
}

.grp-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.grp-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: #4b5d7a;
    font-size: 0.84rem;
    font-weight: 600;
}

.grp-card__actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.35rem;
}

.grp-btn-edit {
    flex: 1;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border-radius: 11px !important;
    font-weight: 700 !important;
    background: rgba(45, 74, 132, 0.1) !important;
    color: #2d4a84 !important;
    border: 1px solid rgba(45, 74, 132, 0.18) !important;
}

.grp-btn-edit:hover {
    background: rgba(45, 74, 132, 0.16) !important;
}

.grp-btn-del {
    width: 42px;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    border-radius: 11px !important;
    border: 1px solid rgba(180, 50, 50, 0.28) !important;
    color: #a32d2d !important;
    background: #fff !important;
}

.grp-btn-del:hover:not(:disabled) {
    background: rgba(180, 50, 50, 0.08) !important;
}

.grp-pag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
}

.grp-pag__nav {
    width: 38px;
    height: 38px;
    border-radius: 10px !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(31, 46, 84, 0.15) !important;
    background: #fff !important;
    color: #1c3359 !important;
}

.grp-pag__nav:disabled {
    opacity: 0.45;
}

.grp-pag__info {
    font-size: 0.88rem;
    color: #62708a;
    font-weight: 600;
}

.grp-modal {
    position: fixed;
    inset: 0;
    z-index: 4000;
    background: rgba(8, 12, 22, 0.55);
    display: grid;
    place-items: center;
    padding: 1rem;
}

.grp-modal__panel {
    position: relative;
    width: min(440px, 100%);
    background: #fff;
    border-radius: 16px;
    padding: 1.35rem 1.3rem;
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.28);
}

.grp-modal__panel h2 {
    margin: 0 0 0.55rem;
    font-size: 1.2rem;
    color: #1c3359;
    font-weight: 800;
}

.grp-modal__panel p {
    margin: 0;
    color: #4f5f7c;
    line-height: 1.5;
}

.grp-modal__warn {
    color: #9a3412 !important;
    background: #fff7ed;
    border-radius: 10px;
    padding: 0.75rem 0.85rem;
}

.grp-modal__close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    border: 0;
    background: transparent;
    color: #64748b;
}

.grp-modal__acoes {
    display: flex;
    justify-content: flex-end;
    gap: 0.55rem;
    margin-top: 1.15rem;
    flex-wrap: wrap;
}

.grp-modal__btn {
    border-radius: 11px !important;
    font-weight: 700 !important;
    padding: 0.55rem 0.95rem !important;
}

.grp-modal__btn--ghost {
    background: #edf2fb !important;
    color: #233b6a !important;
}

.grp-modal__btn--danger {
    background: linear-gradient(90deg, #f26b6b, #d33f49) !important;
    color: #fff !important;
    border: none !important;
}

.grp-modal__btn--primary {
    background: linear-gradient(120deg, #2d4a84, #2da0a8) !important;
    color: #fff !important;
    border: none !important;
}

@media (max-width: 767.98px) {
    .grp-stats {
        grid-template-columns: 1fr;
    }
}
</style>
