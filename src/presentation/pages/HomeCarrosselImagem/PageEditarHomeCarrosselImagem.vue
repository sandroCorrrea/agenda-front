<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiImage2Line,
    RiPencilLine,
    RiSave3Line,
    RiUploadCloud2Line
} from "@remixicon/vue";
import { useEditarHomeCarrosselImagem } from "@/presentation/composables/HomeCarrosselImagem/useEditarHomeCarrosselImagem";

const router = useRouter();
const {
    imagemId,
    form,
    imagemAtual,
    carregando,
    salvando,
    erro,
    sucesso,
    naoEncontrado,
    erroCampos,
    carregar,
    salvar
} = useEditarHomeCarrosselImagem();

const TIPOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// O backend aceita até 15 MB via Base64. O repositório escolhe multipart
// ou Base64 automaticamente conforme o tamanho/erro do servidor.
const TAMANHO_MAX_BYTES = 15 * 1024 * 1024;

const previewUrl = ref<string | null>(null);

const erros = reactive({
    titulo: "",
    imagem: "",
    linkUrl: ""
});

const nomeArquivo = computed(() => form.novaImagem?.name ?? "");
const imagemAtualUrl = computed(
    () => imagemAtual.value?.src || imagemAtual.value?.imagemUrl || ""
);

function validar(): boolean {
    erros.titulo = "";
    erros.imagem = "";
    erros.linkUrl = "";

    const titulo = form.titulo.trim();
    if (!titulo) erros.titulo = "Título é obrigatório.";
    else if (titulo.length < 3) erros.titulo = "Título deve ter no mínimo 3 caracteres.";
    else if (titulo.length > 120) erros.titulo = "Título deve ter no máximo 120 caracteres.";

    if (form.novaImagem) {
        if (!TIPOS_PERMITIDOS.includes(form.novaImagem.type)) {
            erros.imagem = "Formato inválido. Use JPG, PNG ou WEBP.";
        } else if (form.novaImagem.size > TAMANHO_MAX_BYTES) {
            erros.imagem = "Imagem deve ter no máximo 15 MB.";
        }
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
    form.novaImagem = file;
    erros.imagem = "";
}

watch(
    () => form.novaImagem,
    (novo) => {
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value);
            previewUrl.value = null;
        }
        if (novo) previewUrl.value = URL.createObjectURL(novo);
    }
);

async function aoSalvar() {
    if (!validar()) return;
    try {
        await salvar();
        if (sucesso.value && !erro.value) {
            await router.push({
                name: "AdministradorHomeCarrossel",
                query: { atualizado: "1" }
            });
        }
    } catch {
        return;
    }
}

async function voltarLista() {
    await router.push({ name: "AdministradorHomeCarrossel" });
}

onMounted(async () => {
    try {
        await carregar();
        if (naoEncontrado.value) {
            await router.push({
                name: "AdministradorHomeCarrossel",
                query: { erro: "nao_encontrado" }
            });
        }
    } catch {
        return;
    }
});

onBeforeUnmount(() => {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
    <article class="page-admin min-vh-100 py-4">
        <div class="container">
            <div v-if="carregando" class="edit-carrossel__loading">
                <span class="edit-carrossel__spinner" aria-hidden="true" />
                <p>Carregando imagem…</p>
            </div>

            <div
                v-else-if="naoEncontrado || Number.isNaN(imagemId)"
                class="edit-carrossel__missing"
            >
                <div class="edit-carrossel__missing-card">
                    <RiImage2Line class="edit-carrossel__missing-icon" />
                    <h1 class="edit-carrossel__missing-title">Imagem não encontrada</h1>
                    <button type="button" class="btn btn-primary btn-admin" @click="voltarLista">
                        Voltar para o carrossel
                    </button>
                </div>
            </div>

            <template v-else>
                <nav class="mb-3" aria-label="Navegação">
                    <RouterLink
                        :to="{ name: 'AdministradorHomeCarrossel' }"
                        class="carrossel-crumb d-inline-flex align-items-center gap-1 text-decoration-none"
                    >
                        <RiArrowLeftLine />
                        Voltar para o carrossel
                    </RouterLink>
                </nav>

                <header class="mb-4 d-flex align-items-start gap-3 flex-wrap">
                    <div class="emp-icon" aria-hidden="true"><RiPencilLine /></div>
                    <div class="flex-grow-1">
                        <h1 class="section-title">Editar imagem do carrossel</h1>
                        <p class="page-subtitle">
                            Atualize os dados ou substitua o arquivo da imagem.
                            Se você não selecionar uma nova imagem, a imagem atual será mantida.
                        </p>
                    </div>
                </header>

                <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>
                <div v-if="sucesso" class="admin-alert admin-alert--ok mb-3">{{ sucesso }}</div>

                <div class="card admin-card border-0 shadow-sm">
                    <div class="card-body p-4 p-md-5">
                        <h2 class="admin-subtitle">Dados da imagem</h2>
                        <form class="row g-3" @submit.prevent="aoSalvar">
                            <div class="col-12 col-md-8">
                                <label class="form-label" for="edit-carrossel-titulo">Título</label>
                                <input
                                    id="edit-carrossel-titulo"
                                    v-model="form.titulo"
                                    type="text"
                                    maxlength="120"
                                    class="form-control form-control-lg"
                                    :class="{ 'is-invalid': Boolean(erros.titulo || erroCampos.titulo) }"
                                />
                                <div v-if="erros.titulo || erroCampos.titulo" class="invalid-feedback d-block">
                                    {{ erros.titulo || erroCampos.titulo }}
                                </div>
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label" for="edit-carrossel-ordem">Ordem</label>
                                <input
                                    id="edit-carrossel-ordem"
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
                                <label class="form-label" for="edit-carrossel-alt">Texto alternativo (alt)</label>
                                <input
                                    id="edit-carrossel-alt"
                                    v-model="form.altText"
                                    type="text"
                                    maxlength="160"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erroCampos.alt_text) }"
                                />
                                <div v-if="erroCampos.alt_text" class="invalid-feedback d-block">
                                    {{ erroCampos.alt_text }}
                                </div>
                            </div>

                            <div class="col-12 col-md-8">
                                <label class="form-label" for="edit-carrossel-link">Link (opcional)</label>
                                <input
                                    id="edit-carrossel-link"
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
                                        id="edit-carrossel-ativo"
                                        v-model="form.ativo"
                                        class="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <label class="form-check-label" for="edit-carrossel-ativo">Ativo</label>
                                </div>
                                <div class="form-check form-switch">
                                    <input
                                        id="edit-carrossel-aba"
                                        v-model="form.abrirEmNovaAba"
                                        class="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <label class="form-check-label" for="edit-carrossel-aba">Nova aba</label>
                                </div>
                            </div>

                            <div class="col-12">
                                <label class="form-label d-block">Imagem atual</label>
                                <div class="current-image">
                                    <img
                                        v-if="imagemAtualUrl"
                                        :src="imagemAtualUrl"
                                        :alt="imagemAtual?.altText || imagemAtual?.titulo || ''"
                                    />
                                    <span v-else class="text-muted">Sem pré-visualização disponível.</span>
                                </div>
                            </div>

                            <div class="col-12">
                                <label class="form-label" for="edit-carrossel-imagem">Substituir imagem (opcional)</label>
                                <label
                                    class="dropzone"
                                    :class="{ 'is-invalid': Boolean(erros.imagem || erroCampos.imagem) }"
                                    for="edit-carrossel-imagem"
                                >
                                    <input
                                        id="edit-carrossel-imagem"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        class="dropzone__input"
                                        @change="trocarArquivo"
                                    />
                                    <div v-if="!previewUrl" class="dropzone__placeholder">
                                        <RiUploadCloud2Line class="dropzone__icon" />
                                        <span class="dropzone__title">Selecionar novo arquivo</span>
                                        <span class="dropzone__hint">
                                            JPG, PNG ou WEBP — até 15 MB. Mantenha em branco para preservar a imagem atual.
                                        </span>
                                    </div>
                                    <div v-else class="dropzone__preview">
                                        <img :src="previewUrl" alt="Pré-visualização da nova imagem" />
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
.edit-carrossel__loading,
.edit-carrossel__missing {
    min-height: 70vh; display: flex; align-items: center; justify-content: center;
}
.edit-carrossel__spinner {
    width: 42px; height: 42px; border-radius: 50%;
    border: 3px solid #dbe3fb; border-top-color: #5c6bc0;
    animation: spin 0.9s linear infinite;
    display: inline-block; margin-right: 10px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.edit-carrossel__missing-card {
    background: #fff; border-radius: 16px; padding: 2rem;
    text-align: center; box-shadow: 0 10px 24px rgba(20, 40, 90, 0.08);
}
.edit-carrossel__missing-icon { font-size: 2rem; color: #4f63a8; }
.edit-carrossel__missing-title { margin: 0.6rem 0 1rem; color: #1f3360; font-weight: 800; }
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

.current-image {
    background: #fbfcff;
    border: 1px solid rgba(92, 107, 192, 0.2);
    border-radius: 12px;
    padding: 0.75rem;
    text-align: center;
}
.current-image img {
    max-height: 220px;
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(20, 40, 90, 0.12);
}

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
