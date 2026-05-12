<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { RiArrowLeftLine, RiPencilLine, RiSave3Line, RiStackLine } from "@remixicon/vue";
import { useEditarServico } from "@/presentation/composables/Servico/useEditarServico";

const route = useRoute();
const router = useRouter();
const {
    servicoAtual,
    carregando,
    salvando,
    erro,
    sucesso,
    naoEncontrado,
    erroCampos,
    carregar,
    salvar
} = useEditarServico();

const servicoId = computed(() => Number(route.params.id));

const form = reactive({
    nome: "",
    descricao: "",
    status: "ativo" as "ativo" | "inativo"
});

const erros = reactive({
    nome: "",
    descricao: ""
});

watch(
    () => servicoAtual.value,
    (s) => {
        if (!s) return;
        form.nome = s.nome ?? "";
        form.descricao = s.descricao ?? "";
        const st = String(s.status ?? "").toLowerCase();
        form.status = st === "inativo" ? "inativo" : "ativo";
    },
    { immediate: true }
);

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome é obrigatório.";
    if (!erros.nome && form.nome.trim().length > 120) {
        erros.nome = "Nome deve ter no máximo 120 caracteres.";
    }
    return !erros.nome;
}

async function aoSalvar() {
    if (!validar()) return;
    const id = servicoId.value;
    if (!id || Number.isNaN(id)) return;
    try {
        await salvar(id, {
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            status: form.status
        });
    } catch {
        if (naoEncontrado.value) {
            await router.push({ name: "AdministradorServicos", query: { erro: "nao_encontrado" } });
        }
    }
}

onMounted(async () => {
    const id = servicoId.value;
    if (!id || Number.isNaN(id)) {
        await router.replace({ name: "AdministradorServicos" });
        return;
    }
    try {
        await carregar(id);
    } catch {
        if (naoEncontrado.value) {
            await router.push({ name: "AdministradorServicos", query: { erro: "nao_encontrado" } });
        }
    }
});
</script>

<template>
    <article class="svc-form-page min-vh-100 py-4">
        <div class="container" style="max-width: 720px">
            <nav class="mb-3" aria-label="Navegação">
                <RouterLink
                    :to="{ name: 'AdministradorServicos' }"
                    class="svc-form-page__crumb d-inline-flex align-items-center gap-1 text-decoration-none"
                >
                    <RiArrowLeftLine />
                    Voltar para serviços
                </RouterLink>
            </nav>

            <div v-if="carregando" class="text-muted py-4">Carregando serviço…</div>

            <template v-else>
                <div class="mb-4 d-flex align-items-start gap-3">
                    <div class="svc-form-page__icon" aria-hidden="true">
                        <RiPencilLine />
                    </div>
                    <div>
                        <h1 class="svc-form-page__title">Editar serviço</h1>
                        <p class="svc-form-page__sub">
                            Altere nome, descrição ou status. Serviços inativos não aparecem na listagem
                            pública, mas continuam acessíveis por aqui.
                        </p>
                    </div>
                </div>

                <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
                <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

                <div class="card svc-form-page__card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <h2 class="svc-form-page__h2">
                            <RiStackLine class="me-2" aria-hidden="true" />
                            Dados
                        </h2>
                        <form class="row g-3" @submit.prevent="aoSalvar">
                            <div class="col-12">
                                <label class="form-label" for="svc-edit-nome">Nome</label>
                                <input
                                    id="svc-edit-nome"
                                    v-model="form.nome"
                                    type="text"
                                    maxlength="120"
                                    class="form-control form-control-lg"
                                    :class="{ 'is-invalid': Boolean(erros.nome || erroCampos.nome) }"
                                />
                                <div v-if="erros.nome || erroCampos.nome" class="invalid-feedback d-block">
                                    {{ erros.nome || erroCampos.nome }}
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label" for="svc-edit-desc">Descrição</label>
                                <textarea
                                    id="svc-edit-desc"
                                    v-model="form.descricao"
                                    rows="5"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erroCampos.descricao) }"
                                />
                                <div v-if="erroCampos.descricao" class="invalid-feedback d-block">
                                    {{ erroCampos.descricao }}
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" for="svc-edit-status">Status</label>
                                <select
                                    id="svc-edit-status"
                                    v-model="form.status"
                                    class="form-select"
                                    :class="{ 'is-invalid': Boolean(erroCampos.status) }"
                                >
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                                <p class="small text-muted mt-1 mb-0">
                                    Inativo oculta o serviço da listagem do site.
                                </p>
                                <div v-if="erroCampos.status" class="invalid-feedback d-block">
                                    {{ erroCampos.status }}
                                </div>
                            </div>
                            <div class="col-12 d-flex flex-wrap justify-content-end gap-2 pt-2">
                                <RouterLink
                                    :to="{ name: 'AdministradorServicos' }"
                                    class="btn btn-outline-secondary rounded-3 px-4"
                                >
                                    Cancelar
                                </RouterLink>
                                <button
                                    type="submit"
                                    class="btn svc-form-page__submit rounded-3 px-4"
                                    :disabled="salvando"
                                >
                                    <RiSave3Line class="me-1" />
                                    {{ salvando ? "Salvando…" : "Salvar alterações" }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </template>
        </div>
    </article>
</template>

<style scoped>
.svc-form-page {
    background: #f6f8fc;
}
.svc-form-page__crumb {
    color: #435a90;
    font-weight: 700;
    font-size: 0.92rem;
}
.svc-form-page__icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(92, 107, 192, 0.12);
    color: #4054b8;
    font-size: 1.35rem;
}
.svc-form-page__title {
    font-size: 1.85rem;
    font-weight: 800;
    color: #16254e;
    margin: 0 0 0.35rem;
}
.svc-form-page__sub {
    margin: 0;
    color: #6b7c9f;
    line-height: 1.5;
}
.svc-form-page__card {
    border-radius: 18px !important;
}
.svc-form-page__h2 {
    font-size: 1.15rem;
    font-weight: 800;
    color: #16254e;
    margin: 0 0 1.25rem;
    display: flex;
    align-items: center;
}
.svc-form-page__submit {
    border: none !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
    color: #fff !important;
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
</style>
