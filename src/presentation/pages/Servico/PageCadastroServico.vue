<script setup lang="ts">
import { reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { RiArrowLeftLine, RiAddLine, RiSave3Line, RiStackLine } from "@remixicon/vue";
import { useServicosAdmin } from "@/presentation/composables/Servico/useServicosAdmin";

const router = useRouter();
const { criando, erro, sucesso, erroCampos, criar } = useServicosAdmin();

const form = reactive({
    nome: "",
    descricao: "",
    status: "ativo" as "ativo" | "inativo"
});

const erros = reactive({
    nome: "",
    descricao: ""
});

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome é obrigatório.";
    if (!erros.nome && form.nome.trim().length > 120) {
        erros.nome = "Nome deve ter no máximo 120 caracteres.";
    }
    erros.descricao = "";
    return !erros.nome;
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await criar({
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            status: form.status
        });
        await router.push({ name: "AdministradorServicos", query: { criado: "1" } });
    } catch {
        return;
    }
}
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

            <div class="mb-4 d-flex align-items-start gap-3">
                <div class="svc-form-page__icon" aria-hidden="true">
                    <RiAddLine />
                </div>
                <div>
                    <h1 class="svc-form-page__title">Novo serviço</h1>
                    <p class="svc-form-page__sub">
                        Preencha os dados abaixo. O serviço poderá ser ajustado depois na edição.
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
                            <label class="form-label" for="svc-nome">Nome</label>
                            <input
                                id="svc-nome"
                                v-model="form.nome"
                                type="text"
                                maxlength="120"
                                class="form-control form-control-lg"
                                :class="{ 'is-invalid': Boolean(erros.nome || erroCampos.nome) }"
                                placeholder="Ex.: Consultoria tributária"
                            />
                            <div v-if="erros.nome || erroCampos.nome" class="invalid-feedback d-block">
                                {{ erros.nome || erroCampos.nome }}
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label" for="svc-desc">Descrição</label>
                            <textarea
                                id="svc-desc"
                                v-model="form.descricao"
                                rows="5"
                                class="form-control"
                                :class="{ 'is-invalid': Boolean(erroCampos.descricao) }"
                                placeholder="Descreva o serviço para os visitantes..."
                            />
                            <div v-if="erroCampos.descricao" class="invalid-feedback d-block">
                                {{ erroCampos.descricao }}
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label" for="svc-status">Status inicial</label>
                            <select
                                id="svc-status"
                                v-model="form.status"
                                class="form-select"
                                :class="{ 'is-invalid': Boolean(erroCampos.status) }"
                            >
                                <option value="ativo">Ativo (visível na listagem pública)</option>
                                <option value="inativo">Inativo</option>
                            </select>
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
                                :disabled="criando"
                            >
                                <RiSave3Line class="me-1" />
                                {{ criando ? "Salvando…" : "Salvar serviço" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
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
