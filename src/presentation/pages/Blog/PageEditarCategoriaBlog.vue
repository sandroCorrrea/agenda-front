<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiPriceTag3Line,
    RiSave3Line
} from "@remixicon/vue";
import { useEditarCategoriaBlog } from "@/presentation/composables/BlogCategoria/useEditarCategoriaBlog";

const router = useRouter();
const {
    form,
    carregando,
    salvando,
    erro,
    sucesso,
    naoEncontrado,
    erroCampos,
    carregar,
    salvar
} = useEditarCategoriaBlog();

const erros = reactive({
    nome: "",
    descricao: "",
    status: ""
});

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome e obrigatorio.";
    if (!erros.nome && form.nome.trim().length > 80) {
        erros.nome = "Nome deve ter no maximo 80 caracteres.";
    }
    erros.descricao = form.descricao.trim() ? "" : "Descricao e obrigatoria.";
    erros.status =
        !form.status || form.status === "ativo" || form.status === "inativo"
            ? ""
            : "Status invalido.";
    return !erros.nome && !erros.descricao && !erros.status;
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await salvar();
    } catch {
        if (naoEncontrado.value) {
            await router.push({ name: "BlogCategorias", query: { erro: "nao_encontrado" } });
        }
    }
}

onMounted(async () => {
    try {
        await carregar();
    } catch {
        if (naoEncontrado.value) {
            await router.push({ name: "BlogCategorias", query: { erro: "nao_encontrado" } });
        }
    }
});
</script>

<template>
    <article class="page-admin min-vh-100 py-4">
        <div class="container">
            <nav class="mb-3" aria-label="Navegação">
                <RouterLink
                    :to="{ name: 'BlogCategorias' }"
                    class="cat-crumb d-inline-flex align-items-center gap-1 text-decoration-none"
                >
                    <RiArrowLeftLine />
                    Voltar para categorias
                </RouterLink>
            </nav>

            <div class="mb-4 d-flex align-items-start gap-3 flex-wrap">
                <div class="cat-icon" aria-hidden="true">
                    <RiPriceTag3Line />
                </div>
                <div class="flex-grow-1">
                    <h1 class="section-title">Editar categoria</h1>
                    <p class="page-subtitle">
                        Atualize os dados da categoria. O status e opcional na requisição e
                        pode ser mantido como está.
                    </p>
                </div>
            </div>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <div class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Dados da categoria</h2>
                    <div v-if="carregando" class="text-muted">Carregando categoria...</div>
                    <form v-else class="row g-3" @submit.prevent="aoSalvar">
                        <div class="col-12">
                            <label class="form-label" for="edit-cat-nome">Nome</label>
                            <input
                                id="edit-cat-nome"
                                v-model="form.nome"
                                type="text"
                                maxlength="80"
                                class="form-control form-control-lg"
                                :class="{ 'is-invalid': Boolean(erros.nome || erroCampos.nome) }"
                            />
                            <div v-if="erros.nome || erroCampos.nome" class="invalid-feedback d-block">
                                {{ erros.nome || erroCampos.nome }}
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label" for="edit-cat-descricao">Descrição</label>
                            <textarea
                                id="edit-cat-descricao"
                                v-model="form.descricao"
                                rows="6"
                                class="form-control"
                                :class="{ 'is-invalid': Boolean(erros.descricao || erroCampos.descricao) }"
                            />
                            <div
                                v-if="erros.descricao || erroCampos.descricao"
                                class="invalid-feedback d-block"
                            >
                                {{ erros.descricao || erroCampos.descricao }}
                            </div>
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label" for="edit-cat-status">Status (opcional)</label>
                            <select
                                id="edit-cat-status"
                                v-model="form.status"
                                class="form-select"
                                :class="{ 'is-invalid': Boolean(erros.status || erroCampos.status) }"
                            >
                                <option value="">Manter status atual</option>
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                            <div v-if="erros.status || erroCampos.status" class="invalid-feedback d-block">
                                {{ erros.status || erroCampos.status }}
                            </div>
                        </div>

                        <div class="col-12 d-flex flex-wrap justify-content-end gap-2 pt-2">
                            <RouterLink
                                :to="{ name: 'BlogCategorias' }"
                                class="btn btn-outline-secondary btn-sec"
                            >
                                Cancelar
                            </RouterLink>
                            <button type="submit" class="btn btn-primary btn-admin" :disabled="salvando">
                                <RiSave3Line class="me-1" />
                                {{ salvando ? "Salvando..." : "Salvar alterações" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.page-admin { background: #f6f8fc; }
.cat-crumb { color: #435a90; font-weight: 700; font-size: 0.92rem; }
.cat-crumb:hover { color: #2d3f6e; }
.cat-icon { width: 48px; height: 48px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(92, 107, 192, 0.12); color: #4054b8; font-size: 1.35rem; }
.section-title { position: relative; display: inline-block; font-size: 2rem; font-weight: 800; color: #16254e; margin: 0 0 0.85rem; }
.section-title::after { content: ""; position: absolute; left: 0; bottom: -8px; width: 70%; height: 4px; border-radius: 999px; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%); }
.page-subtitle { margin: 0.25rem 0 0; color: #6b7c9f; line-height: 1.5; max-width: 42rem; }
.admin-card { border-radius: 18px; }
.admin-subtitle { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; color: #16254e; }
.btn-admin { border: none !important; border-radius: 12px !important; padding: 10px 18px !important; font-weight: 700 !important; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important; }
.btn-sec { border-radius: 12px !important; font-weight: 700 !important; padding: 10px 18px !important; }
.admin-alert { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.92rem; }
.admin-alert--erro { background: #fff3f3; border: 1px solid #f1b4b4; color: #9e2b2b; }
.admin-alert--ok { background: #eefaf3; border: 1px solid #b7e3c7; color: #1d6d3f; }
</style>
