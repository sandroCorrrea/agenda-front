<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiArticleLine,
    RiSave3Line,
    RiUploadCloud2Line
} from "@remixicon/vue";
import { usePostagensAdmin } from "@/presentation/composables/BlogPostagem/usePostagensAdmin";

const router = useRouter();
const {
    categorias,
    carregandoCategorias,
    criando,
    erro,
    sucesso,
    erroCampos,
    carregarCategorias,
    criar
} = usePostagensAdmin();

const form = reactive({
    nome: "",
    descricao: "",
    categoria_id: ""
});
const imagem = ref<File | null>(null);
const arquivo = ref<File | null>(null);

const erros = reactive({
    nome: "",
    descricao: "",
    categoria_id: "",
    imagem: "",
    arquivo: ""
});

function onImagemChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    imagem.value = input.files?.[0] ?? null;
}

function onArquivoChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    arquivo.value = input.files?.[0] ?? null;
}

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome e obrigatorio.";
    if (!erros.nome && form.nome.trim().length > 80) {
        erros.nome = "Nome deve ter no maximo 80 caracteres.";
    }
    erros.descricao = form.descricao.trim() ? "" : "Descricao e obrigatoria.";
    erros.categoria_id =
        Number(form.categoria_id) > 0 ? "" : "Categoria e obrigatoria.";

    const tiposImagem = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (imagem.value && !tiposImagem.includes(imagem.value.type)) {
        erros.imagem = "Imagem deve ser jpeg, png, jpg ou gif.";
    } else if (imagem.value && imagem.value.size > 2 * 1024 * 1024) {
        erros.imagem = "Imagem deve ter no maximo 2 MB.";
    } else {
        erros.imagem = "";
    }

    const tiposArquivo = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain"
    ];
    if (arquivo.value && !tiposArquivo.includes(arquivo.value.type)) {
        erros.arquivo = "Arquivo deve ser PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX ou TXT.";
    } else if (arquivo.value && arquivo.value.size > 5 * 1024 * 1024) {
        erros.arquivo = "Arquivo deve ter no maximo 5 MB.";
    } else {
        erros.arquivo = "";
    }

    return !erros.nome && !erros.descricao && !erros.categoria_id && !erros.imagem && !erros.arquivo;
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await criar({
            nome: form.nome.trim(),
            descricao: form.descricao.trim(),
            categoria_id: Number(form.categoria_id),
            imagem: imagem.value,
            arquivo: arquivo.value
        });
        await router.push({ name: "BlogPostagem", query: { criado: "1" } });
    } catch {
        return;
    }
}

onMounted(async () => {
    try {
        await carregarCategorias();
    } catch {
        return;
    }
});
</script>

<template>
    <article class="page-admin min-vh-100 py-4">
        <div class="container">
            <nav class="mb-3" aria-label="Navegação">
                <RouterLink
                    :to="{ name: 'BlogPostagem' }"
                    class="post-crumb d-inline-flex align-items-center gap-1 text-decoration-none"
                >
                    <RiArrowLeftLine />
                    Voltar para postagens
                </RouterLink>
            </nav>

            <div class="mb-4 d-flex align-items-start gap-3 flex-wrap">
                <div class="post-icon" aria-hidden="true">
                    <RiArticleLine />
                </div>
                <div class="flex-grow-1">
                    <h1 class="section-title">Cadastrar postagem</h1>
                    <p class="page-subtitle">
                        Crie um conteúdo com categoria, imagem de destaque e arquivo complementar.
                    </p>
                </div>
            </div>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <div class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Dados da postagem</h2>
                    <p class="admin-hint">
                        Nome ate 80 caracteres. Imagem (max 2 MB) e arquivo (max 5 MB) sao opcionais.
                    </p>
                    <form class="row g-3" @submit.prevent="aoSalvar">
                        <div class="col-12">
                            <label class="form-label" for="cad-post-nome">Nome</label>
                            <input
                                id="cad-post-nome"
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
                            <label class="form-label" for="cad-post-descricao">Descrição</label>
                            <textarea
                                id="cad-post-descricao"
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

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cad-post-categoria">Categoria</label>
                            <select
                                id="cad-post-categoria"
                                v-model="form.categoria_id"
                                class="form-select"
                                :disabled="carregandoCategorias"
                                :class="{ 'is-invalid': Boolean(erros.categoria_id || erroCampos.categoria_id) }"
                            >
                                <option value="">Selecione uma categoria</option>
                                <option v-for="c in categorias" :key="c.id" :value="String(c.id)">
                                    {{ c.nome }}
                                </option>
                            </select>
                            <div
                                v-if="erros.categoria_id || erroCampos.categoria_id"
                                class="invalid-feedback d-block"
                            >
                                {{ erros.categoria_id || erroCampos.categoria_id }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cad-post-imagem">
                                Imagem (opcional)
                            </label>
                            <div class="input-group">
                                <span class="input-group-text"><RiUploadCloud2Line /></span>
                                <input
                                    id="cad-post-imagem"
                                    type="file"
                                    accept=".jpeg,.jpg,.png,.gif,image/jpeg,image/png,image/jpg,image/gif"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.imagem || erroCampos.imagem) }"
                                    @change="onImagemChange"
                                />
                            </div>
                            <div v-if="erros.imagem || erroCampos.imagem" class="invalid-feedback d-block">
                                {{ erros.imagem || erroCampos.imagem }}
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label" for="cad-post-arquivo">
                                Arquivo (opcional)
                            </label>
                            <div class="input-group">
                                <span class="input-group-text"><RiUploadCloud2Line /></span>
                                <input
                                    id="cad-post-arquivo"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.arquivo || erroCampos.arquivo) }"
                                    @change="onArquivoChange"
                                />
                            </div>
                            <div v-if="erros.arquivo || erroCampos.arquivo" class="invalid-feedback d-block">
                                {{ erros.arquivo || erroCampos.arquivo }}
                            </div>
                        </div>

                        <div class="col-12 d-flex flex-wrap justify-content-end gap-2 pt-2">
                            <RouterLink
                                :to="{ name: 'BlogPostagem' }"
                                class="btn btn-outline-secondary btn-sec"
                            >
                                Cancelar
                            </RouterLink>
                            <button type="submit" class="btn btn-primary btn-admin" :disabled="criando">
                                <RiSave3Line class="me-1" />
                                {{ criando ? "Salvando..." : "Salvar postagem" }}
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
.post-crumb { color: #435a90; font-weight: 700; font-size: 0.92rem; }
.post-crumb:hover { color: #2d3f6e; }
.post-icon { width: 48px; height: 48px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(92, 107, 192, 0.12); color: #4054b8; font-size: 1.35rem; }
.section-title { position: relative; display: inline-block; font-size: 2rem; font-weight: 800; color: #16254e; margin: 0 0 0.85rem; }
.section-title::after { content: ""; position: absolute; left: 0; bottom: -8px; width: 70%; height: 4px; border-radius: 999px; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%); }
.page-subtitle { margin: 0.25rem 0 0; color: #6b7c9f; line-height: 1.5; max-width: 42rem; }
.admin-card { border-radius: 18px; }
.admin-subtitle { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; color: #16254e; }
.admin-hint { margin-top: -0.4rem; margin-bottom: 1rem; color: #6c7a94; }
.btn-admin { border: none !important; border-radius: 12px !important; padding: 10px 18px !important; font-weight: 700 !important; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important; }
.btn-sec { border-radius: 12px !important; font-weight: 700 !important; padding: 10px 18px !important; }
.admin-alert { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.92rem; }
.admin-alert--erro { background: #fff3f3; border: 1px solid #f1b4b4; color: #9e2b2b; }
.admin-alert--ok { background: #eefaf3; border: 1px solid #b7e3c7; color: #1d6d3f; }
</style>
