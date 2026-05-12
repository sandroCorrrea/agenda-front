<script setup lang="ts">
import type { Component } from "vue";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiArticleLine,
    RiExternalLinkLine,
    RiFileExcelLine,
    RiFileLine,
    RiFilePdfLine,
    RiFilePptLine,
    RiFileTextLine,
    RiFileWordLine,
    RiImage2Line,
    RiSave3Line,
    RiUploadCloud2Line
} from "@remixicon/vue";
import { useEditarPostagemBlog } from "@/presentation/composables/BlogPostagem/useEditarPostagemBlog";
import {
    docKindFromFileName,
    fileNameFromPath,
    resolvePublicAssetUrl,
    type DocKind
} from "@/shared/utils/mediaUrl";

const router = useRouter();
const {
    postagemAtual,
    categorias,
    form,
    carregando,
    carregandoCategorias,
    salvando,
    erro,
    sucesso,
    naoEncontrado,
    erroCampos,
    carregar,
    carregarCategorias,
    salvar
} = useEditarPostagemBlog();

const urlImagemServidor = computed(() =>
    resolvePublicAssetUrl(postagemAtual.value?.imagem ?? null)
);
const urlArquivoServidor = computed(() =>
    resolvePublicAssetUrl(postagemAtual.value?.arquivo ?? null)
);
const nomeArquivoServidor = computed(() =>
    fileNameFromPath(postagemAtual.value?.arquivo ?? null)
);
const docKindServidor = computed<DocKind>(() =>
    docKindFromFileName(nomeArquivoServidor.value)
);

const iconePorDocKind: Record<DocKind, Component> = {
    pdf: RiFilePdfLine,
    word: RiFileWordLine,
    excel: RiFileExcelLine,
    ppt: RiFilePptLine,
    text: RiFileTextLine,
    generic: RiFileLine
};
const iconeDocServidor = computed(() => iconePorDocKind[docKindServidor.value]);

const imagemServidorQuebrou = ref(false);
watch(
    () => postagemAtual.value?.imagem,
    () => {
        imagemServidorQuebrou.value = false;
    }
);

const previewNovaImagemUrl = ref<string | null>(null);
watch(
    () => form.imagem,
    (f) => {
        if (previewNovaImagemUrl.value) {
            URL.revokeObjectURL(previewNovaImagemUrl.value);
            previewNovaImagemUrl.value = null;
        }
        if (f) previewNovaImagemUrl.value = URL.createObjectURL(f);
    }
);
onUnmounted(() => {
    if (previewNovaImagemUrl.value) URL.revokeObjectURL(previewNovaImagemUrl.value);
});

function formatarBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const erros = reactive({
    nome: "",
    descricao: "",
    categoria_id: "",
    status: "",
    imagem: "",
    arquivo: ""
});

function onImagemChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    form.imagem = input.files?.[0] ?? null;
}

function onArquivoChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    form.arquivo = input.files?.[0] ?? null;
}

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome e obrigatorio.";
    if (!erros.nome && form.nome.trim().length > 80) {
        erros.nome = "Nome deve ter no maximo 80 caracteres.";
    }
    erros.descricao = form.descricao.trim() ? "" : "Descricao e obrigatoria.";
    erros.categoria_id =
        Number(form.categoria_id) > 0 ? "" : "Categoria e obrigatoria.";
    erros.status =
        !form.status || form.status === "ativo" || form.status === "inativo"
            ? ""
            : "Status invalido.";

    const tiposImagem = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (form.imagem && !tiposImagem.includes(form.imagem.type)) {
        erros.imagem = "Imagem deve ser jpeg, png, jpg ou gif.";
    } else if (form.imagem && form.imagem.size > 2 * 1024 * 1024) {
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
    if (form.arquivo && !tiposArquivo.includes(form.arquivo.type)) {
        erros.arquivo = "Arquivo deve ser PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX ou TXT.";
    } else if (form.arquivo && form.arquivo.size > 5 * 1024 * 1024) {
        erros.arquivo = "Arquivo deve ter no maximo 5 MB.";
    } else {
        erros.arquivo = "";
    }

    return !erros.nome && !erros.descricao && !erros.categoria_id && !erros.status && !erros.imagem && !erros.arquivo;
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await salvar();
    } catch {
        if (naoEncontrado.value) {
            await router.push({ name: "BlogPostagem", query: { erro: "nao_encontrado" } });
        }
    }
}

onMounted(async () => {
    try {
        await carregar();
    } catch {
        if (naoEncontrado.value) {
            await router.push({ name: "BlogPostagem", query: { erro: "nao_encontrado" } });
        }
        return;
    }
    try {
        await carregarCategorias();
    } catch {
        /* categorias não bloqueiam GET /blog/postagem/{id} */
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
                    <h1 class="section-title">Editar postagem</h1>
                    <p class="page-subtitle mb-0">
                        Ajuste o conteúdo, categoria e publicação. Envie novos arquivos apenas se quiser substituir os atuais.
                    </p>
                </div>
            </div>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <div v-if="carregando" class="text-muted py-4">Carregando postagem...</div>

            <div v-else class="row g-4 align-items-start">
                <div class="col-lg-8">
                    <div class="card admin-card border-0 shadow-sm">
                        <div class="card-body p-4 p-md-5">
                            <h2 class="admin-subtitle">Conteúdo</h2>
                            <p class="admin-hint">
                                Nome e descrição são obrigatórios. Imagem e anexo novos substituem os anteriores no servidor.
                            </p>
                            <form class="row g-3" @submit.prevent="aoSalvar">
                                <div class="col-12">
                                    <label class="form-label" for="edit-post-nome">Nome</label>
                                    <input
                                        id="edit-post-nome"
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
                                    <label class="form-label" for="edit-post-descricao">Descrição</label>
                                    <textarea
                                        id="edit-post-descricao"
                                        v-model="form.descricao"
                                        rows="8"
                                        class="form-control form-control-lg desc-area"
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
                                    <label class="form-label" for="edit-post-categoria">Categoria</label>
                                    <select
                                        id="edit-post-categoria"
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
                                    <label class="form-label" for="edit-post-imagem">
                                        Nova imagem (opcional)
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text"><RiUploadCloud2Line /></span>
                                        <input
                                            id="edit-post-imagem"
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
                                    <div v-if="previewNovaImagemUrl" class="preview-novo preview-novo--img mt-3">
                                        <p class="preview-novo__label">Pré-visualização do novo arquivo</p>
                                        <div class="preview-novo__frame">
                                            <img
                                                :src="previewNovaImagemUrl"
                                                alt="Pré-visualização da nova imagem"
                                                class="preview-novo__img"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <label class="form-label" for="edit-post-arquivo">
                                        Novo anexo (opcional)
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text"><RiUploadCloud2Line /></span>
                                        <input
                                            id="edit-post-arquivo"
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
                                    <div v-if="form.arquivo" class="preview-novo preview-novo--doc mt-3">
                                        <p class="preview-novo__label">Arquivo selecionado</p>
                                        <div class="preview-doc-chip">
                                            <RiFileTextLine class="preview-doc-chip__icon" aria-hidden="true" />
                                            <div class="preview-doc-chip__text">
                                                <span class="preview-doc-chip__name">{{ form.arquivo.name }}</span>
                                                <span class="preview-doc-chip__size">{{
                                                    formatarBytes(form.arquivo.size)
                                                }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 d-flex flex-wrap justify-content-end gap-2 pt-2">
                                    <RouterLink
                                        :to="{ name: 'BlogPostagem' }"
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

                <div class="col-lg-4">
                    <div class="side-panel">
                        <div class="side-panel__body">
                            <div class="side-field">
                                <label class="form-label" for="edit-post-status">Status</label>
                                <select
                                    id="edit-post-status"
                                    v-model="form.status"
                                    class="form-select side-select"
                                    :class="{ 'is-invalid': Boolean(erros.status || erroCampos.status) }"
                                >
                                    <option value="">Manter status atual</option>
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                                <p class="side-hint small">
                                    Deixe em branco para não alterar o status no servidor.
                                </p>
                                <div v-if="erros.status || erroCampos.status" class="invalid-feedback d-block">
                                    {{ erros.status || erroCampos.status }}
                                </div>
                            </div>

                            <div class="side-divider" />

                            <section class="media-block" aria-labelledby="media-servidor-heading">
                                <h3 id="media-servidor-heading" class="media-block__title">
                                    Arquivos no servidor
                                </h3>

                                <div class="media-card media-card--image">
                                    <div class="media-card__head">
                                        <RiImage2Line class="media-card__head-icon" aria-hidden="true" />
                                        <span>Imagem de capa</span>
                                    </div>
                                    <div class="media-card__body">
                                        <template v-if="urlImagemServidor && !imagemServidorQuebrou">
                                            <a
                                                :href="urlImagemServidor"
                                                class="media-thumb media-thumb--img"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <img
                                                    :src="urlImagemServidor"
                                                    alt="Imagem atual da postagem"
                                                    class="media-thumb__img"
                                                    loading="lazy"
                                                    @error="imagemServidorQuebrou = true"
                                                />
                                                <span class="media-thumb__zoom">
                                                    <RiExternalLinkLine aria-hidden="true" />
                                                </span>
                                            </a>
                                            <p class="media-card__filename">
                                                {{ fileNameFromPath(postagemAtual?.imagem ?? null) }}
                                            </p>
                                            <a
                                                :href="urlImagemServidor"
                                                class="media-card__link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Abrir em nova aba
                                                <RiExternalLinkLine class="ms-1" aria-hidden="true" />
                                            </a>
                                        </template>
                                        <div v-else-if="urlImagemServidor && imagemServidorQuebrou" class="media-fallback">
                                            <p class="media-fallback__text">
                                                Não foi possível exibir a pré-visualização.
                                            </p>
                                            <a
                                                :href="urlImagemServidor"
                                                class="media-card__link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Abrir imagem
                                                <RiExternalLinkLine class="ms-1" aria-hidden="true" />
                                            </a>
                                        </div>
                                        <div v-else class="media-empty">
                                            <RiImage2Line class="media-empty__icon" aria-hidden="true" />
                                            <p>Nenhuma imagem cadastrada</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="media-card media-card--doc">
                                    <div class="media-card__head">
                                        <RiFileTextLine class="media-card__head-icon" aria-hidden="true" />
                                        <span>Documento anexo</span>
                                    </div>
                                    <div class="media-card__body">
                                        <template v-if="urlArquivoServidor">
                                            <div class="doc-preview">
                                                <div class="doc-preview__icon-wrap">
                                                    <component
                                                        :is="iconeDocServidor"
                                                        class="doc-preview__icon"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div class="doc-preview__info">
                                                    <p class="doc-preview__name" :title="nomeArquivoServidor">
                                                        {{ nomeArquivoServidor || "Arquivo" }}
                                                    </p>
                                                    <p class="doc-preview__hint">Clique para baixar ou abrir</p>
                                                </div>
                                            </div>
                                            <a
                                                :href="urlArquivoServidor"
                                                class="media-card__link media-card__link--btn"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Abrir / baixar anexo
                                                <RiExternalLinkLine class="ms-1" aria-hidden="true" />
                                            </a>
                                        </template>
                                        <div v-else class="media-empty media-empty--sm">
                                            <RiFileTextLine class="media-empty__icon" aria-hidden="true" />
                                            <p>Nenhum documento anexo</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
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
.desc-area { min-height: 220px; resize: vertical; }
.btn-admin { border: none !important; border-radius: 12px !important; padding: 10px 18px !important; font-weight: 700 !important; background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important; }
.btn-sec { border-radius: 12px !important; font-weight: 700 !important; padding: 10px 18px !important; }
.admin-alert { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.92rem; }
.admin-alert--erro { background: #fff3f3; border: 1px solid #f1b4b4; color: #9e2b2b; }
.admin-alert--ok { background: #eefaf3; border: 1px solid #b7e3c7; color: #1d6d3f; }

.side-panel {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(20, 30, 40, 0.08);
    background: linear-gradient(165deg, #ffffff 0%, #f4f7ff 55%, #eefaf9 100%);
    box-shadow: 0 10px 32px rgba(20, 30, 40, 0.08);
}
.side-panel__body { padding: 1.25rem; }
.side-field { margin-bottom: 0.25rem; }
.side-select { border-radius: 12px; border-color: rgba(92, 107, 192, 0.25); }
.side-hint { margin: 0.35rem 0 0; color: #6c7a94; }
.side-divider { height: 1px; background: rgba(20, 30, 40, 0.08); margin: 1rem 0; }

.media-block { margin-top: 0.25rem; }
.media-block__title {
    margin: 0 0 0.85rem;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #5a6b8a;
}

.media-card {
    border-radius: 14px;
    border: 1px solid rgba(92, 107, 192, 0.18);
    background: #fff;
    overflow: hidden;
    margin-bottom: 1rem;
    box-shadow: 0 4px 18px rgba(22, 37, 78, 0.06);
}
.media-card:last-child { margin-bottom: 0; }
.media-card__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.9rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #2d3f6e;
    background: linear-gradient(90deg, rgba(92, 107, 192, 0.1) 0%, rgba(45, 160, 168, 0.08) 100%);
    border-bottom: 1px solid rgba(20, 30, 40, 0.06);
}
.media-card__head-icon { font-size: 1.1rem; color: #5c6bc0; flex-shrink: 0; }
.media-card__body { padding: 0.9rem; }
.media-card__filename {
    margin: 0.5rem 0 0;
    font-size: 0.75rem;
    color: #6b7d9c;
    word-break: break-all;
    line-height: 1.35;
}
.media-card__link {
    display: inline-flex;
    align-items: center;
    margin-top: 0.65rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #4054b8;
    text-decoration: none;
}
.media-card__link:hover { color: #2d3f6e; text-decoration: underline; }
.media-card__link--btn {
    width: 100%;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    background: rgba(92, 107, 192, 0.1);
    border: 1px solid rgba(92, 107, 192, 0.22);
    text-decoration: none !important;
}
.media-card__link--btn:hover {
    background: rgba(92, 107, 192, 0.16);
    color: #2d3f6e;
}

.media-thumb {
    position: relative;
    display: block;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(145deg, #eef1fb 0%, #e8f7f6 100%);
    aspect-ratio: 16 / 10;
    max-height: 200px;
}
.media-thumb--img { cursor: pointer; }
.media-thumb__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}
.media-thumb__zoom {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(22, 37, 78, 0.55);
    color: #fff;
    font-size: 1.1rem;
    pointer-events: none;
}

.media-fallback { text-align: center; padding: 0.25rem 0; }
.media-fallback__text { margin: 0 0 0.5rem; font-size: 0.85rem; color: #8a6d3b; }

.media-empty {
    text-align: center;
    padding: 1.25rem 0.75rem;
    color: #8a96ae;
    border: 2px dashed rgba(92, 107, 192, 0.22);
    border-radius: 12px;
    background: rgba(246, 248, 252, 0.8);
}
.media-empty--sm { padding: 0.85rem 0.5rem; }
.media-empty__icon { font-size: 2rem; color: rgba(92, 107, 192, 0.35); margin-bottom: 0.35rem; }
.media-empty p { margin: 0; font-size: 0.85rem; font-weight: 600; }

.doc-preview {
    display: flex;
    gap: 0.85rem;
    align-items: center;
    padding: 0.65rem 0.75rem;
    border-radius: 12px;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0faf9 100%);
    border: 1px solid rgba(45, 160, 168, 0.2);
}
.doc-preview__icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: linear-gradient(145deg, rgba(92, 107, 192, 0.18) 0%, rgba(45, 160, 168, 0.15) 100%);
}
.doc-preview__icon { font-size: 1.75rem; color: #4054b8; }
.doc-preview__info { min-width: 0; flex: 1; }
.doc-preview__name {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 700;
    color: #16254e;
    word-break: break-word;
    line-height: 1.35;
}
.doc-preview__hint { margin: 0.25rem 0 0; font-size: 0.72rem; color: #6b7d9c; }

.preview-novo { border-radius: 12px; }
.preview-novo__label {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #5a6b8a;
}
.preview-novo__frame {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(92, 107, 192, 0.2);
    background: #f0f2f8;
    max-height: 220px;
}
.preview-novo__img {
    width: 100%;
    max-height: 220px;
    object-fit: contain;
    display: block;
}
.preview-doc-chip {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.85rem;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.08);
    box-shadow: 0 2px 10px rgba(22, 37, 78, 0.06);
}
.preview-doc-chip__icon { font-size: 1.5rem; color: #5c6bc0; flex-shrink: 0; }
.preview-doc-chip__text { min-width: 0; }
.preview-doc-chip__name {
    display: block;
    font-size: 0.88rem;
    font-weight: 700;
    color: #16254e;
    word-break: break-word;
}
.preview-doc-chip__size { font-size: 0.75rem; color: #6b7d9c; }
</style>
