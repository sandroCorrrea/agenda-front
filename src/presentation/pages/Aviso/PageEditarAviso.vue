<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiChatHistoryLine,
    RiPencilLine,
    RiSave3Line
} from "@remixicon/vue";
import { useEditarAviso } from "@/presentation/composables/Aviso/useEditarAviso";

const router = useRouter();
const {
    avisoId,
    form,
    avisoAtual,
    carregando,
    salvando,
    erro,
    sucesso,
    naoEncontrado,
    erroCampos,
    carregar,
    salvar
} = useEditarAviso();

const erros = reactive({
    nome: "",
    descricao: ""
});

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome e obrigatório.";
    if (!erros.nome && form.nome.trim().length > 80) {
        erros.nome = "Nome deve ter no máximo 80 caracteres.";
    }
    erros.descricao = form.descricao.trim() ? "" : "Descrição é obrigatória.";
    return !erros.nome && !erros.descricao;
}

function formatarData(valor?: string): string {
    if (!valor) return "—";
    const d = new Date(valor.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return valor;
    return d.toLocaleString("pt-BR");
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await salvar();
    } catch {
        return;
    }
}

async function voltarLista() {
    await router.push({ name: "AdministradorAvisos" });
}

onMounted(async () => {
    try {
        await carregar();
        if (naoEncontrado.value) {
            await router.push({
                name: "AdministradorAvisos",
                query: { erro: "nao_encontrado" }
            });
        }
    } catch {
        return;
    }
});
</script>

<template>
    <article class="page-admin min-vh-100 py-4">
        <div class="container">
            <div v-if="carregando" class="edit-aviso__loading">
                <span class="edit-aviso__spinner" aria-hidden="true" />
                <p>Carregando aviso…</p>
            </div>

            <div v-else-if="naoEncontrado || Number.isNaN(avisoId)" class="edit-aviso__missing">
                <div class="edit-aviso__missing-card">
                    <RiChatHistoryLine class="edit-aviso__missing-icon" />
                    <h1 class="edit-aviso__missing-title">Aviso não encontrado</h1>
                    <button type="button" class="btn btn-primary btn-admin" @click="voltarLista">
                        Voltar para avisos
                    </button>
                </div>
            </div>

            <template v-else>
                <nav class="mb-3" aria-label="Navegação">
                    <RouterLink
                        :to="{ name: 'AdministradorAvisos' }"
                        class="aviso-crumb d-inline-flex align-items-center gap-1 text-decoration-none"
                    >
                        <RiArrowLeftLine />
                        Voltar para avisos
                    </RouterLink>
                </nav>

                <header class="mb-4 d-flex align-items-start gap-3 flex-wrap">
                    <div class="emp-icon" aria-hidden="true">
                        <RiPencilLine />
                    </div>
                    <div class="flex-grow-1">
                        <h1 class="section-title">Editar aviso</h1>
                        <p class="page-subtitle">
                            Atualize o título e a descrição. A expiração é somente leitura e não pode ser alterada.
                        </p>
                    </div>
                </header>

                <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
                <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

                <div class="card admin-card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <h2 class="admin-subtitle">Dados do aviso</h2>
                        <form class="row g-3" @submit.prevent="aoSalvar">
                            <div class="col-12 col-md-8">
                                <label class="form-label" for="edit-aviso-nome">Nome</label>
                                <input
                                    id="edit-aviso-nome"
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

                            <div class="col-12 col-md-4">
                                <label class="form-label" for="edit-aviso-expiracao">Expiração</label>
                                <input
                                    id="edit-aviso-expiracao"
                                    :value="formatarData(avisoAtual?.expiracao)"
                                    type="text"
                                    class="form-control"
                                    disabled
                                />
                            </div>

                            <div class="col-12">
                                <label class="form-label" for="edit-aviso-descricao">Descrição</label>
                                <textarea
                                    id="edit-aviso-descricao"
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

                            <div class="col-12 d-flex justify-content-end gap-2 pt-2">
                                <RouterLink :to="{ name: 'AdministradorAvisos' }" class="btn btn-outline-secondary btn-aviso-sec">
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
            </template>
        </div>
    </article>
</template>

<style scoped>
.page-admin { background: #f6f8fc; }
.edit-aviso__loading,.edit-aviso__missing { min-height: 70vh; display:flex; align-items:center; justify-content:center; }
.edit-aviso__spinner { width:42px;height:42px;border-radius:50%;border:3px solid #dbe3fb;border-top-color:#5c6bc0;animation:spin .9s linear infinite;display:inline-block;margin-right:10px; }
@keyframes spin { to { transform: rotate(360deg); } }
.edit-aviso__missing-card { background:#fff; border-radius:16px; padding:2rem; text-align:center; box-shadow:0 10px 24px rgba(20,40,90,.08); }
.edit-aviso__missing-icon { font-size:2rem; color:#4f63a8; }
.edit-aviso__missing-title { margin:.6rem 0 1rem; color:#1f3360; font-weight:800; }
.aviso-crumb { color: #435a90; font-weight: 700; font-size: 0.92rem; }
.aviso-crumb:hover { color: #2d3f6e; }
.emp-icon { width: 48px; height: 48px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(92, 107, 192, 0.12); color: #4054b8; font-size: 1.35rem; }
.section-title { position: relative; display: inline-block; font-size: 2rem; font-weight: 800; color: #16254e; margin: 0 0 0.85rem; }
.section-title::after { content: ""; position: absolute; left: 0; bottom: -8px; width: 70%; height: 4px; border-radius: 999px; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%); }
.page-subtitle { margin: 0.25rem 0 0; color: #6b7c9f; line-height: 1.5; max-width: 42rem; }
.admin-card { border-radius: 18px; }
.admin-subtitle { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; color: #16254e; }
.btn-admin { border: none !important; border-radius: 12px !important; padding: 10px 18px !important; font-weight: 700 !important; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important; }
.btn-aviso-sec { border-radius: 12px !important; font-weight: 700 !important; padding: 10px 18px !important; }
.admin-alert { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.92rem; }
.admin-alert--erro { background: #fff3f3; border: 1px solid #f1b4b4; color: #9e2b2b; }
.admin-alert--ok { background: #eefaf3; border: 1px solid #b7e3c7; color: #1d6d3f; }
</style>
