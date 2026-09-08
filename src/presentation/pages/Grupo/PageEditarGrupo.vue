<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
    RiArrowLeftLine,
    RiCheckLine,
    RiKey2Line,
    RiSaveLine,
    RiSearchLine,
    RiShieldUserLine,
    RiTeamLine,
    RiUserAddLine,
    RiUserLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useGruposAdmin } from "@/presentation/composables/Grupo/useGruposAdmin";
import type { GrupoPermissaoSyncItemDTO } from "@/application/dto/Grupo/GrupoAcessoDTO";
import type { MenuOpcaoCatalogoDTO } from "@/application/dto/Menu/MenuSessaoDTO";

const route = useRoute();
const grupoId = computed(() => Number(route.params.id));

const {
    detalhe,
    catalogo,
    elegiveis,
    elegiveisMeta,
    carregandoDetalhe,
    salvando,
    erro,
    sucesso,
    carregarDetalhe,
    carregarCatalogo,
    atualizar,
    salvarPermissoes,
    carregarElegiveis,
    adicionarMembros,
    removerMembro
} = useGruposAdmin();

type Aba = "dados" | "permissoes" | "membros";
const aba = ref<Aba>("dados");
const form = reactive({
    nome: "",
    descricao: "",
    ativo: true
});

type FlagState = {
    menu_opcao_id: number;
    pode_visualizar: boolean;
    pode_inserir: boolean;
    pode_atualizar: boolean;
    pode_excluir: boolean;
};

const flags = ref<Record<number, FlagState>>({});
const selecionados = ref<number[]>([]);
const bannerNovo = ref(false);

const escopoGrupo = computed(() => detalhe.value?.escopo ?? null);

const progresso = computed(() => {
    const temDados = Boolean(detalhe.value?.nome);
    const temPerm = (detalhe.value?.permissoes?.length ?? 0) > 0;
    const temMembros = (detalhe.value?.membros?.length ?? 0) > 0;
    return { temDados, temPerm, temMembros };
});

const catalogoFiltrado = computed(() => {
    const escopo = escopoGrupo.value;
    return catalogo.value
        .map((mod) => ({
            ...mod,
            opcoes: mod.opcoes.filter((op) => {
                if (!op.atribuivel) return false;
                if (!escopo) return op.escopo === "cliente" || op.escopo === "admin";
                return op.escopo === escopo;
            })
        }))
        .filter((mod) => mod.opcoes.length > 0);
});

const totalFlagsMarcadas = computed(() =>
    Object.values(flags.value).filter(
        (f) =>
            f.pode_visualizar ||
            f.pode_inserir ||
            f.pode_atualizar ||
            f.pode_excluir
    ).length
);

function initFlagsFromDetalhe() {
    const map: Record<number, FlagState> = {};
    for (const mod of catalogo.value) {
        for (const op of mod.opcoes) {
            const atual = detalhe.value?.permissoes.find(
                (p) => p.menu_opcao_id === op.id
            );
            map[op.id] = {
                menu_opcao_id: op.id,
                pode_visualizar: Boolean(atual?.pode_visualizar),
                pode_inserir: Boolean(atual?.pode_inserir),
                pode_atualizar: Boolean(atual?.pode_atualizar),
                pode_excluir: Boolean(atual?.pode_excluir)
            };
        }
    }
    flags.value = map;
}

function aoMarcarVisualizar(op: MenuOpcaoCatalogoDTO, checked: boolean) {
    const f = flags.value[op.id];
    if (!f) return;
    f.pode_visualizar = checked;
    if (!checked) {
        f.pode_inserir = false;
        f.pode_atualizar = false;
        f.pode_excluir = false;
    }
}

function aoMarcarAcao(
    op: MenuOpcaoCatalogoDTO,
    campo: "pode_inserir" | "pode_atualizar" | "pode_excluir",
    checked: boolean
) {
    const f = flags.value[op.id];
    if (!f) return;
    f[campo] = checked;
    if (checked) f.pode_visualizar = true;
}

function irParaAba(proxima: Aba) {
    aba.value = proxima;
}

onMounted(async () => {
    const q = route.query.aba;
    if (q === "permissoes" || q === "membros" || q === "dados") {
        aba.value = q;
    }
    bannerNovo.value = route.query.novo === "1";

    try {
        await Promise.all([carregarCatalogo(), carregarDetalhe(grupoId.value)]);
        if (detalhe.value) {
            form.nome = detalhe.value.nome;
            form.descricao = detalhe.value.descricao ?? "";
            form.ativo = detalhe.value.ativo;
        }
        initFlagsFromDetalhe();
        await carregarElegiveis(1);
    } catch {
        return;
    }
});

watch(
    () => detalhe.value?.permissoes,
    () => initFlagsFromDetalhe()
);

async function salvarDados(e: Event) {
    e.preventDefault();
    try {
        await atualizar(grupoId.value, {
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            ativo: form.ativo
        });
        if (!progresso.value.temPerm) {
            aba.value = "permissoes";
        }
    } catch {
        return;
    }
}

async function salvarFlags() {
    const payload: GrupoPermissaoSyncItemDTO[] = Object.values(flags.value).filter(
        (f) =>
            f.pode_visualizar ||
            f.pode_inserir ||
            f.pode_atualizar ||
            f.pode_excluir
    );
    try {
        await salvarPermissoes(grupoId.value, payload);
        await carregarDetalhe(grupoId.value);
        if (!progresso.value.temMembros) {
            aba.value = "membros";
        }
    } catch {
        return;
    }
}

async function buscarElegiveis() {
    try {
        await carregarElegiveis(1);
    } catch {
        return;
    }
}

async function adicionarSelecionados() {
    if (selecionados.value.length === 0) return;
    try {
        await adicionarMembros(grupoId.value, [...selecionados.value]);
        selecionados.value = [];
        await carregarElegiveis(1);
    } catch {
        return;
    }
}

async function remover(usuarioId: number) {
    if (!window.confirm("Remover este membro do grupo?")) return;
    try {
        await removerMembro(grupoId.value, usuarioId);
        await carregarElegiveis(1);
    } catch {
        return;
    }
}

function toggleSelecionado(id: number, checked: boolean) {
    if (checked) {
        if (!selecionados.value.includes(id)) selecionados.value.push(id);
    } else {
        selecionados.value = selecionados.value.filter((x) => x !== id);
    }
}

function labelEscopo(escopo: string | null | undefined): string {
    if (escopo === "admin") return "Administrativo (prefeitura)";
    if (escopo === "cliente") return "Portal do cliente";
    return "Ainda não definido — escolha permissões de um único escopo";
}
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                :title="detalhe?.nome || 'Configurar grupo'"
                subtitle="Siga as etapas: dados básicos → permissões de menu → membros. O escopo do grupo fica travado após a primeira permissão ou membro."
            >
                <template #icon><RiTeamLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'AdministradorGrupos' }" class="btn">
                        <RiArrowLeftLine class="me-1" />
                        Voltar à lista
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="bannerNovo" class="admin-alert admin-alert--ok mb-3">
                Grupo criado. Agora libere as permissões e, em seguida, adicione os membros.
            </div>
            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <div v-if="carregandoDetalhe" class="grp-loading">Carregando grupo...</div>

            <template v-else-if="detalhe">
                <div class="grp-summary mb-3">
                    <div class="grp-summary__item">
                        <span class="grp-summary__label">Escopo</span>
                        <strong>{{ labelEscopo(escopoGrupo) }}</strong>
                    </div>
                    <div class="grp-summary__item">
                        <span class="grp-summary__label">Status</span>
                        <strong :class="detalhe.ativo ? 'text-success' : 'text-muted'">
                            {{ detalhe.ativo ? "Ativo" : "Inativo" }}
                        </strong>
                    </div>
                    <div class="grp-summary__item">
                        <span class="grp-summary__label">Permissões</span>
                        <strong>{{ detalhe.permissoes.length }}</strong>
                    </div>
                    <div class="grp-summary__item">
                        <span class="grp-summary__label">Membros</span>
                        <strong>{{ detalhe.membros.length }}</strong>
                    </div>
                </div>

                <nav class="grp-tabs mb-3" role="tablist" aria-label="Etapas do grupo">
                    <button
                        type="button"
                        role="tab"
                        class="grp-tab"
                        :class="{ 'grp-tab--active': aba === 'dados' }"
                        :aria-selected="aba === 'dados'"
                        @click="irParaAba('dados')"
                    >
                        <span class="grp-tab__check" :class="{ 'grp-tab__check--on': progresso.temDados }">
                            <RiCheckLine v-if="progresso.temDados" />
                            <span v-else>1</span>
                        </span>
                        Dados
                    </button>
                    <button
                        type="button"
                        role="tab"
                        class="grp-tab"
                        :class="{ 'grp-tab--active': aba === 'permissoes' }"
                        :aria-selected="aba === 'permissoes'"
                        @click="irParaAba('permissoes')"
                    >
                        <span class="grp-tab__check" :class="{ 'grp-tab__check--on': progresso.temPerm }">
                            <RiCheckLine v-if="progresso.temPerm" />
                            <span v-else>2</span>
                        </span>
                        Permissões
                    </button>
                    <button
                        type="button"
                        role="tab"
                        class="grp-tab"
                        :class="{ 'grp-tab--active': aba === 'membros' }"
                        :aria-selected="aba === 'membros'"
                        @click="irParaAba('membros')"
                    >
                        <span class="grp-tab__check" :class="{ 'grp-tab__check--on': progresso.temMembros }">
                            <RiCheckLine v-if="progresso.temMembros" />
                            <span v-else>3</span>
                        </span>
                        Membros
                        <em v-if="detalhe.membros.length">{{ detalhe.membros.length }}</em>
                    </button>
                </nav>

                <section v-if="aba === 'dados'" class="card admin-card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <h2 class="grp-section-title">
                            <RiShieldUserLine />
                            Dados do grupo
                        </h2>
                        <form @submit="salvarDados">
                            <div class="mb-3">
                                <label class="form-label fw-bold" for="edit-nome">Nome</label>
                                <input
                                    id="edit-nome"
                                    v-model="form.nome"
                                    type="text"
                                    class="form-control form-control-lg"
                                    required
                                />
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold" for="edit-desc">Descrição</label>
                                <textarea
                                    id="edit-desc"
                                    v-model="form.descricao"
                                    class="form-control"
                                    rows="3"
                                />
                            </div>
                            <div class="grp-switch mb-4">
                                <div>
                                    <strong>Grupo ativo</strong>
                                    <p class="mb-0">Desative para suspender o acesso sem excluir o grupo.</p>
                                </div>
                                <label class="grp-switch__control">
                                    <input id="edit-ativo" v-model="form.ativo" type="checkbox" />
                                    <span>{{ form.ativo ? "Ativo" : "Inativo" }}</span>
                                </label>
                            </div>
                            <div class="d-flex justify-content-end gap-2 flex-wrap">
                                <button
                                    type="button"
                                    class="btn grp-btn-ghost"
                                    @click="irParaAba('permissoes')"
                                >
                                    Ir para permissões
                                </button>
                                <button type="submit" class="btn grp-btn-primary" :disabled="salvando">
                                    <RiSaveLine class="me-1" />
                                    Salvar dados
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <section v-else-if="aba === 'permissoes'" class="card admin-card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                            <h2 class="grp-section-title mb-0">
                                <RiKey2Line />
                                Permissões de menu
                            </h2>
                            <span class="grp-chip">{{ totalFlagsMarcadas }} selecionada(s)</span>
                        </div>

                        <div class="grp-legend mb-3">
                            <span><strong>Ver</strong> — aparece no menu</span>
                            <span><strong>Inserir</strong> — criar registros</span>
                            <span><strong>Atualizar</strong> — editar</span>
                            <span><strong>Excluir</strong> — remover</span>
                        </div>

                        <p v-if="!escopoGrupo" class="grp-callout mb-3">
                            Ao marcar a primeira opção, o escopo do grupo será definido
                            (cliente ou administrativo). Depois disso, só opções do mesmo
                            escopo ficarão disponíveis.
                        </p>

                        <div
                            v-for="mod in catalogoFiltrado"
                            :key="mod.codigo"
                            class="grp-mod mb-3"
                        >
                            <header class="grp-mod__head">
                                <h3>{{ mod.label || mod.codigo }}</h3>
                                <span class="grp-scope-tag">{{ mod.escopo }}</span>
                            </header>

                            <div class="grp-perm-list">
                                <article
                                    v-for="op in mod.opcoes"
                                    :key="op.id"
                                    class="grp-perm"
                                    :class="{ 'grp-perm--on': flags[op.id]?.pode_visualizar }"
                                >
                                    <div class="grp-perm__info">
                                        <strong>{{ op.label }}</strong>
                                        <small>{{ op.path }}</small>
                                    </div>
                                    <div class="grp-perm__flags" role="group" :aria-label="`Ações de ${op.label}`">
                                        <label class="grp-flag">
                                            <input
                                                type="checkbox"
                                                :checked="flags[op.id]?.pode_visualizar"
                                                @change="aoMarcarVisualizar(op, ($event.target as HTMLInputElement).checked)"
                                            />
                                            <span>Ver</span>
                                        </label>
                                        <label class="grp-flag" :class="{ 'grp-flag--disabled': !op.suporta_inserir }">
                                            <input
                                                type="checkbox"
                                                :disabled="!op.suporta_inserir"
                                                :checked="flags[op.id]?.pode_inserir"
                                                @change="aoMarcarAcao(op, 'pode_inserir', ($event.target as HTMLInputElement).checked)"
                                            />
                                            <span>Inserir</span>
                                        </label>
                                        <label class="grp-flag" :class="{ 'grp-flag--disabled': !op.suporta_atualizar }">
                                            <input
                                                type="checkbox"
                                                :disabled="!op.suporta_atualizar"
                                                :checked="flags[op.id]?.pode_atualizar"
                                                @change="aoMarcarAcao(op, 'pode_atualizar', ($event.target as HTMLInputElement).checked)"
                                            />
                                            <span>Atualizar</span>
                                        </label>
                                        <label class="grp-flag" :class="{ 'grp-flag--disabled': !op.suporta_excluir }">
                                            <input
                                                type="checkbox"
                                                :disabled="!op.suporta_excluir"
                                                :checked="flags[op.id]?.pode_excluir"
                                                @change="aoMarcarAcao(op, 'pode_excluir', ($event.target as HTMLInputElement).checked)"
                                            />
                                            <span>Excluir</span>
                                        </label>
                                    </div>
                                </article>
                            </div>
                        </div>

                        <div v-if="catalogoFiltrado.length === 0" class="text-muted py-3">
                            Nenhuma opção disponível para o escopo atual.
                        </div>

                        <div class="d-flex justify-content-end gap-2 flex-wrap mt-3">
                            <button type="button" class="btn grp-btn-ghost" @click="irParaAba('membros')">
                                Ir para membros
                            </button>
                            <button
                                type="button"
                                class="btn grp-btn-primary"
                                :disabled="salvando"
                                @click="salvarFlags"
                            >
                                <RiSaveLine class="me-1" />
                                Salvar permissões
                            </button>
                        </div>
                    </div>
                </section>

                <section v-else class="card admin-card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <h2 class="grp-section-title">
                            <RiUserLine />
                            Membros do grupo
                        </h2>

                        <div class="grp-membros mb-4">
                            <article
                                v-for="m in detalhe.membros"
                                :key="m.usuario_id"
                                class="grp-membro"
                            >
                                <div class="grp-membro__avatar" aria-hidden="true">
                                    {{ (m.nome || "?").charAt(0).toUpperCase() }}
                                </div>
                                <div class="grp-membro__info">
                                    <strong>{{ m.nome }}</strong>
                                    <small>
                                        {{ m.tipo_usuario }}
                                        <template v-if="m.perfil_administrador">
                                            · {{ m.perfil_administrador }}
                                        </template>
                                        <template v-if="m.email"> · {{ m.email }}</template>
                                    </small>
                                </div>
                                <button
                                    type="button"
                                    class="btn grp-btn-remove"
                                    :disabled="salvando"
                                    @click="remover(m.usuario_id)"
                                >
                                    Remover
                                </button>
                            </article>
                            <div v-if="detalhe.membros.length === 0" class="grp-membros__empty">
                                Nenhum membro ainda. Busque usuários elegíveis abaixo.
                            </div>
                        </div>

                        <div class="grp-add">
                            <h3 class="h6 mb-3">
                                <RiUserAddLine class="me-1" />
                                Adicionar membros
                            </h3>
                            <div class="row g-2 mb-3">
                                <div class="col-md-5">
                                    <div class="input-group">
                                        <span class="input-group-text"><RiSearchLine /></span>
                                        <input
                                            v-model="elegiveisMeta.q"
                                            type="search"
                                            class="form-control"
                                            placeholder="Nome, CPF ou e-mail"
                                            @keyup.enter="buscarElegiveis"
                                        />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select
                                        v-model="elegiveisMeta.tipo"
                                        class="form-select"
                                        @change="buscarElegiveis"
                                    >
                                        <option value="todos">Todos elegíveis</option>
                                        <option value="cliente">Somente clientes</option>
                                        <option value="prefeitura">Somente prefeitura</option>
                                    </select>
                                </div>
                                <div class="col-md-4 d-flex gap-2 flex-wrap">
                                    <button type="button" class="btn grp-btn-ghost" @click="buscarElegiveis">
                                        Buscar
                                    </button>
                                    <button
                                        type="button"
                                        class="btn grp-btn-primary"
                                        :disabled="salvando || selecionados.length === 0"
                                        @click="adicionarSelecionados"
                                    >
                                        Adicionar ({{ selecionados.length }})
                                    </button>
                                </div>
                            </div>

                            <div class="grp-elegiveis">
                                <label
                                    v-for="u in elegiveis"
                                    :key="u.usuario_id"
                                    class="grp-elegivel"
                                >
                                    <input
                                        type="checkbox"
                                        :checked="selecionados.includes(u.usuario_id)"
                                        @change="toggleSelecionado(u.usuario_id, ($event.target as HTMLInputElement).checked)"
                                    />
                                    <div>
                                        <strong>{{ u.nome }}</strong>
                                        <small>
                                            {{ u.tipo_usuario }}
                                            <template v-if="u.perfil_administrador">
                                                · {{ u.perfil_administrador }}
                                            </template>
                                            · {{ u.email || u.cpf }}
                                        </small>
                                    </div>
                                </label>
                                <p v-if="elegiveis.length === 0" class="text-muted mb-0 py-3 text-center">
                                    Nenhum usuário elegível encontrado (sem grupo e não-contabilidade).
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </template>
        </div>
    </article>
</template>

<style scoped>
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

.grp-loading {
    padding: 2rem 0;
    color: #6b7c99;
}

.grp-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
}

.grp-summary__item {
    background: #fff;
    border-radius: 14px;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(31, 46, 84, 0.08);
    box-shadow: 0 6px 16px rgba(28, 51, 89, 0.04);
}

.grp-summary__label {
    display: block;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7c99;
    font-weight: 700;
    margin-bottom: 0.2rem;
}

.grp-summary__item strong {
    color: #1c3359;
    font-size: 0.95rem;
}

.grp-tabs {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    padding: 0.4rem;
    border-radius: 14px;
    background: #fff;
    border: 1px solid rgba(31, 46, 84, 0.08);
}

.grp-tab {
    flex: 1;
    min-width: 140px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    border: 0;
    background: transparent;
    border-radius: 11px;
    padding: 0.7rem 0.85rem;
    font-weight: 700;
    color: #4b5d7a;
}

.grp-tab--active {
    background: linear-gradient(120deg, #1f2e54, #2d4a84 55%, #2da0a8);
    color: #fff;
}

.grp-tab__check {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 0.72rem;
    background: rgba(255, 255, 255, 0.18);
}

.grp-tab:not(.grp-tab--active) .grp-tab__check {
    background: rgba(45, 74, 132, 0.1);
    color: #2d4a84;
}

.grp-tab__check--on {
    background: rgba(34, 197, 94, 0.2) !important;
    color: #15803d !important;
}

.grp-tab--active .grp-tab__check--on {
    background: rgba(255, 255, 255, 0.25) !important;
    color: #fff !important;
}

.grp-tab em {
    font-style: normal;
    font-size: 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    padding: 0.1rem 0.4rem;
}

.grp-section-title {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 1.15rem;
    font-weight: 800;
    color: #1c3359;
    margin-bottom: 1rem;
}

.grp-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 14px;
    background: #f4f7fc;
    border: 1px solid rgba(31, 46, 84, 0.08);
}

.grp-switch strong {
    color: #1c3359;
}

.grp-switch p {
    color: #6b7c99;
    font-size: 0.86rem;
}

.grp-switch__control {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 700;
    color: #2d4a84;
    margin: 0;
}

.grp-chip {
    background: rgba(45, 160, 168, 0.14);
    color: #1a7a80;
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-size: 0.78rem;
    font-weight: 800;
}

.grp-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem 1rem;
    font-size: 0.82rem;
    color: #5d6d88;
    padding: 0.75rem 0.9rem;
    border-radius: 12px;
    background: #f7faff;
}

.grp-callout {
    margin: 0;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: rgba(45, 160, 168, 0.1);
    color: #1a5f64;
    font-size: 0.9rem;
}

.grp-mod {
    border: 1px solid rgba(31, 46, 84, 0.1);
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
}

.grp-mod__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(90deg, rgba(31, 46, 84, 0.06), rgba(45, 160, 168, 0.08));
}

.grp-mod__head h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #1c3359;
}

.grp-scope-tag {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #2d4a84;
    background: rgba(45, 74, 132, 0.1);
    border-radius: 8px;
    padding: 0.2rem 0.45rem;
}

.grp-perm-list {
    display: grid;
    gap: 0;
}

.grp-perm {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 1rem;
    border-top: 1px solid rgba(31, 46, 84, 0.06);
}

.grp-perm--on {
    background: rgba(45, 160, 168, 0.04);
}

.grp-perm__info strong {
    display: block;
    color: #1c3359;
    font-size: 0.92rem;
}

.grp-perm__info small {
    color: #7a879e;
    font-size: 0.75rem;
}

.grp-perm__flags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    justify-content: flex-end;
}

.grp-flag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin: 0;
    padding: 0.28rem 0.5rem;
    border-radius: 999px;
    background: #f1f5f9;
    font-size: 0.75rem;
    font-weight: 700;
    color: #334155;
    cursor: pointer;
    user-select: none;
}

.grp-flag:has(input:checked) {
    background: rgba(45, 74, 132, 0.14);
    color: #2d4a84;
}

.grp-flag--disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.grp-membros {
    display: grid;
    gap: 0.55rem;
}

.grp-membro {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0.9rem;
    border-radius: 12px;
    background: #f7faff;
    border: 1px solid rgba(31, 46, 84, 0.08);
}

.grp-membro__avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, #2d4a84, #2da0a8);
    color: #fff;
    font-weight: 800;
    flex-shrink: 0;
}

.grp-membro__info {
    flex: 1;
    min-width: 0;
}

.grp-membro__info strong {
    display: block;
    color: #1c3359;
}

.grp-membro__info small {
    color: #6b7c99;
}

.grp-membros__empty {
    text-align: center;
    padding: 1.25rem;
    color: #6b7c99;
    border: 1px dashed rgba(31, 46, 84, 0.18);
    border-radius: 12px;
}

.grp-btn-remove {
    border-radius: 10px !important;
    font-weight: 700 !important;
    font-size: 0.82rem !important;
    border: 1px solid rgba(180, 50, 50, 0.25) !important;
    color: #a32d2d !important;
    background: #fff !important;
}

.grp-add {
    padding: 1.1rem;
    border-radius: 14px;
    background: #fff;
    border: 1px solid rgba(31, 46, 84, 0.1);
}

.grp-elegiveis {
    display: grid;
    gap: 0.45rem;
    max-height: 360px;
    overflow: auto;
}

.grp-elegivel {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    margin: 0;
    padding: 0.7rem 0.8rem;
    border-radius: 11px;
    border: 1px solid rgba(31, 46, 84, 0.08);
    cursor: pointer;
}

.grp-elegivel:hover {
    background: #f7faff;
}

.grp-elegivel strong {
    display: block;
    color: #1c3359;
}

.grp-elegivel small {
    color: #6b7c99;
}

.grp-btn-primary {
    display: inline-flex !important;
    align-items: center;
    gap: 0.3rem;
    background: linear-gradient(120deg, #2d4a84, #2da0a8) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    padding: 0.6rem 1.05rem !important;
}

.grp-btn-ghost {
    border-radius: 12px !important;
    font-weight: 700 !important;
    background: #edf2fb !important;
    color: #233b6a !important;
    border: none !important;
}

@media (max-width: 991.98px) {
    .grp-summary {
        grid-template-columns: 1fr 1fr;
    }

    .grp-perm {
        grid-template-columns: 1fr;
    }

    .grp-perm__flags {
        justify-content: flex-start;
    }
}

@media (max-width: 575.98px) {
    .grp-summary {
        grid-template-columns: 1fr;
    }

    .grp-switch {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
