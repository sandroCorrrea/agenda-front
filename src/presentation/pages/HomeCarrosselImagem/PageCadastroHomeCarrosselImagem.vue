<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiImage2Line,
    RiSave3Line,
    RiUploadCloud2Line
} from "@remixicon/vue";
import { useHomeCarrosselAdmin } from "@/presentation/composables/HomeCarrosselImagem/useHomeCarrosselAdmin";

const router = useRouter();
const { criando, erro, sucesso, erroCampos, criar } = useHomeCarrosselAdmin();

const TIPOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// O backend aceita até 15 MB quando o envio vai por Base64 (JSON).
// Arquivos maiores que ~5 MB são automaticamente transmitidos em Base64
// pelo HomeCarrosselImagemRepository para evitar limites do PHP/multipart.
const TAMANHO_MAX_BYTES = 15 * 1024 * 1024; // 15 MB

const form = reactive({
    titulo: "",
    altText: "",
    ordem: 0,
    ativo: true,
    linkUrl: "",
    abrirEmNovaAba: false
});

const arquivo = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

const erros = reactive({
    titulo: "",
    imagem: "",
    linkUrl: ""
});

const nomeArquivo = computed(() => arquivo.value?.name ?? "");

function validar(): boolean {
    erros.titulo = "";
    erros.imagem = "";
    erros.linkUrl = "";

    const titulo = form.titulo.trim();
    if (!titulo) erros.titulo = "Título é obrigatório.";
    else if (titulo.length < 3) erros.titulo = "Título deve ter no mínimo 3 caracteres.";
    else if (titulo.length > 120) erros.titulo = "Título deve ter no máximo 120 caracteres.";

    if (!arquivo.value) {
        erros.imagem = "Selecione uma imagem (JPG, PNG ou WEBP).";
    } else if (!TIPOS_PERMITIDOS.includes(arquivo.value.type)) {
        erros.imagem = "Formato inválido. Use JPG, PNG ou WEBP.";
    } else if (arquivo.value.size > TAMANHO_MAX_BYTES) {
        erros.imagem = "Imagem deve ter no máximo 15 MB.";
    }

    if (form.linkUrl.trim() !== "") {
        try {
            new URL(form.linkUrl.trim());
        } catch {
            erros.linkUrl = "Informe uma URL válida (com http:// ou https://).";
        }
    }

    return !erros.titulo && !erros.imagem && !erros.linkUrl;
}

function trocarArquivo(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    arquivo.value = file;
    erros.imagem = "";
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
    }
    if (file) previewUrl.value = URL.createObjectURL(file);
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await criar({
            titulo: form.titulo.trim(),
            imagem: arquivo.value as File,
            ordem: Number.isFinite(form.ordem) ? Number(form.ordem) : 0,
            ativo: form.ativo,
            abrirEmNovaAba: form.abrirEmNovaAba,
            altText: form.altText.trim() === "" ? null : form.altText.trim(),
            linkUrl: form.linkUrl.trim() === "" ? null : form.linkUrl.trim()
        });
        await router.push({
            name: "AdministradorHomeCarrossel",
            query: { criado: "1" }
        });
    } catch {
        return;
    }
}

onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
    <article class="page-admin min-vh-100 py-4">
        <div class="container">
            <nav class="mb-3" aria-label="Navegação">
                <RouterLink
                    :to="{ name: 'AdministradorHomeCarrossel' }"
                    class="carrossel-crumb d-inline-flex align-items-center gap-1 text-decoration-none"
                >
                    <RiArrowLeftLine />
                    Voltar para o carrossel
                </RouterLink>
            </nav>

            <div class="mb-4 d-flex align-items-start gap-3 flex-wrap">
                <div class="emp-icon" aria-hidden="true"><RiImage2Line /></div>
                <div class="flex-grow-1">
                    <h1 class="section-title">Cadastrar imagem do carrossel</h1>
                    <p class="page-subtitle">
                        Adicione uma nova imagem ao carrossel da Home. As imagens
                        <strong>ativas</strong> são exibidas em /home na ordem
                        ascendente do campo <strong>Ordem</strong>.
                    </p>
                </div>
            </div>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

            <div class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Dados da imagem</h2>
                    <p class="admin-hint">
                        Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: 15 MB.
                    </p>
                    <form class="row g-3" @submit.prevent="aoSalvar">
                        <div class="col-12 col-md-8">
                            <label class="form-label" for="cad-carrossel-titulo">Título</label>
                            <input
                                id="cad-carrossel-titulo"
                                v-model="form.titulo"
                                type="text"
                                maxlength="120"
                                class="form-control form-control-lg"
                                placeholder="Ex.: Plataforma contábil integrada"
                                :class="{ 'is-invalid': Boolean(erros.titulo || erroCampos.titulo) }"
                            />
                            <div v-if="erros.titulo || erroCampos.titulo" class="invalid-feedback d-block">
                                {{ erros.titulo || erroCampos.titulo }}
                            </div>
                        </div>

                        <div class="col-12 col-md-4">
                            <label class="form-label" for="cad-carrossel-ordem">Ordem</label>
                            <input
                                id="cad-carrossel-ordem"
                                v-model.number="form.ordem"
                                type="number"
                                min="0"
                                step="1"
                                class="form-control form-control-lg"
                                :class="{ 'is-invalid': Boolean(erroCampos.ordem) }"
                            />
                            <div v-if="erroCampos.ordem" class="invalid-feedback d-block">
                                {{ erroCampos.ordem }}
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label" for="cad-carrossel-alt">Texto alternativo (alt)</label>
                            <input
                                id="cad-carrossel-alt"
                                v-model="form.altText"
                                type="text"
                                maxlength="160"
                                class="form-control"
                                placeholder="Descrição acessível da imagem (até 160 caracteres)"
                                :class="{ 'is-invalid': Boolean(erroCampos.alt_text) }"
                            />
                            <div v-if="erroCampos.alt_text" class="invalid-feedback d-block">
                                {{ erroCampos.alt_text }}
                            </div>
                            <div class="form-text">
                                Se vazio, o backend usará o título como texto alternativo.
                            </div>
                        </div>

                        <div class="col-12 col-md-8">
                            <label class="form-label" for="cad-carrossel-link">Link (opcional)</label>
                            <input
                                id="cad-carrossel-link"
                                v-model="form.linkUrl"
                                type="url"
                                class="form-control"
                                placeholder="https://exemplo.com"
                                :class="{ 'is-invalid': Boolean(erros.linkUrl || erroCampos.link_url) }"
                            />
                            <div v-if="erros.linkUrl || erroCampos.link_url" class="invalid-feedback d-block">
                                {{ erros.linkUrl || erroCampos.link_url }}
                            </div>
                        </div>

                        <div class="col-12 col-md-4 d-flex align-items-end gap-3 pb-1">
                            <div class="form-check form-switch">
                                <input
                                    id="cad-carrossel-ativo"
                                    v-model="form.ativo"
                                    class="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                />
                                <label class="form-check-label" for="cad-carrossel-ativo">Ativo</label>
                            </div>
                            <div class="form-check form-switch">
                                <input
                                    id="cad-carrossel-aba"
                                    v-model="form.abrirEmNovaAba"
                                    class="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                />
                                <label class="form-check-label" for="cad-carrossel-aba">Nova aba</label>
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label" for="cad-carrossel-imagem">Imagem</label>
                            <label
                                class="dropzone"
                                :class="{ 'is-invalid': Boolean(erros.imagem || erroCampos.imagem) }"
                                for="cad-carrossel-imagem"
                            >
                                <input
                                    id="cad-carrossel-imagem"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    class="dropzone__input"
                                    @change="trocarArquivo"
                                />
                                <div v-if="!previewUrl" class="dropzone__placeholder">
                                    <RiUploadCloud2Line class="dropzone__icon" />
                                    <span class="dropzone__title">Selecionar imagem</span>
                                    <span class="dropzone__hint">JPG, PNG ou WEBP — até 15 MB</span>
                                </div>
                                <div v-else class="dropzone__preview">
                                    <img :src="previewUrl" alt="Pré-visualização" />
                                    <span class="dropzone__filename">{{ nomeArquivo }}</span>
                                </div>
                            </label>
                            <div v-if="erros.imagem || erroCampos.imagem" class="invalid-feedback d-block">
                                {{ erros.imagem || erroCampos.imagem }}
                            </div>
                        </div>

                        <div class="col-12 d-flex flex-wrap justify-content-end gap-2 pt-2">
                            <RouterLink
                                :to="{ name: 'AdministradorHomeCarrossel' }"
                                class="btn btn-outline-secondary btn-carrossel-sec"
                            >
                                Cancelar
                            </RouterLink>
                            <button type="submit" class="btn btn-primary btn-admin" :disabled="criando">
                                <RiSave3Line class="me-1" />
                                {{ criando ? "Salvando..." : "Salvar imagem" }}
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

.carrossel-crumb { color: #435a90; font-weight: 700; font-size: 0.92rem; }
.carrossel-crumb:hover { color: #2d3f6e; }

.emp-icon {
    width: 48px; height: 48px; border-radius: 16px; display: inline-flex;
    align-items: center; justify-content: center; flex-shrink: 0;
    background: rgba(92, 107, 192, 0.12); color: #4054b8; font-size: 1.35rem;
}

.section-title {
    position: relative; display: inline-block;
    font-size: 2rem; font-weight: 800; color: #16254e; margin: 0 0 0.85rem;
}
.section-title::after {
    content: ""; position: absolute; left: 0; bottom: -8px;
    width: 70%; height: 4px; border-radius: 999px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.page-subtitle { margin: 0.25rem 0 0; color: #6b7c9f; line-height: 1.5; max-width: 42rem; }
.admin-card { border-radius: 18px; }
.admin-subtitle { margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800; color: #16254e; }
.admin-hint { margin-top: -0.4rem; margin-bottom: 1rem; color: #6c7a94; }

.btn-admin {
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 18px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
}

.btn-carrossel-sec {
    border-radius: 12px !important;
    font-weight: 700 !important;
    padding: 10px 18px !important;
}

.admin-alert { border-radius: 10px; padding: 0.75rem 0.9rem; font-size: 0.92rem; }
.admin-alert--erro { background: #fff3f3; border: 1px solid #f1b4b4; color: #9e2b2b; }
.admin-alert--ok { background: #eefaf3; border: 1px solid #b7e3c7; color: #1d6d3f; }

.dropzone {
    position: relative;
    display: block;
    border: 2px dashed rgba(92, 107, 192, 0.4);
    border-radius: 14px;
    padding: 1.25rem;
    background: #fbfcff;
    cursor: pointer;
    transition: background 0.18s ease, border-color 0.18s ease;
}
.dropzone:hover { background: #f4f7ff; border-color: #5c6bc0; }
.dropzone.is-invalid { border-color: #f1b4b4; background: #fff7f7; }
.dropzone__input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.dropzone__placeholder {
    display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
    color: #4a5b78; text-align: center; padding: 1rem 0;
}
.dropzone__icon { font-size: 1.8rem; color: #5c6bc0; }
.dropzone__title { font-weight: 700; color: #2f4578; }
.dropzone__hint { font-size: 0.85rem; color: #7585a4; }
.dropzone__preview {
    display: flex; gap: 0.9rem; align-items: center; flex-wrap: wrap; justify-content: center;
}
.dropzone__preview img {
    max-height: 180px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(20, 40, 90, 0.15);
}
.dropzone__filename { font-size: 0.88rem; color: #2f4578; font-weight: 600; }
</style>
