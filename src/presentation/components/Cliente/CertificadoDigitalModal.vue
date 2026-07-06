<script setup lang="ts">
import { computed, inject, onUnmounted, ref, watch } from "vue";
import {
    RiCloseLine,
    RiEyeLine,
    RiEyeOffLine,
    RiFileShield2Line,
    RiLock2Line,
    RiShieldKeyholeLine,
    RiUploadCloud2Line
} from "@remixicon/vue";
import type { EmpresaVinculoDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import { EnviarCertificadoDigitalVinculoUseCase } from "@/application/use-cases/EmpresaVinculo/EnviarCertificadoDigitalVinculoUseCase";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { cnpjMask } from "@/shared/utils/masks";
import axios from "axios";

const props = defineProps<{
    aberto: boolean;
    vinculo: EmpresaVinculoDTO | null;
}>();

const emit = defineEmits<{
    (e: "fechar"): void;
    (e: "enviado", mensagem: string): void;
}>();

const vinculoRepo = inject<IEmpresaVinculoRepository>("IEmpresaVinculoRepository");
if (!vinculoRepo) throw new Error("IEmpresaVinculoRepository not provided");

const enviarCertificadoCaso = new EnviarCertificadoDigitalVinculoUseCase(vinculoRepo);

const EXTENSOES_PERMITIDAS = [".pfx", ".p12", ".pem"];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

const arquivo = ref<File | null>(null);
const senha = ref("");
const mostrarSenha = ref(false);
const enviando = ref(false);
const erro = ref<string | null>(null);
const arrastando = ref(false);

const podeEnviar = computed(
    () => Boolean(arquivo.value && senha.value.trim()) && !enviando.value
);

const nomeEmpresa = computed(() => props.vinculo?.empresa.nome?.trim() || "Empresa");

const jaTemCertificado = computed(() => Boolean(props.vinculo?.tem_certificado));

const tituloModal = computed(() =>
    jaTemCertificado.value ? "Atualizar certificado" : "Enviar certificado"
);

const rotuloBotaoEnviar = computed(() => {
    if (enviando.value) return "Enviando...";
    return jaTemCertificado.value ? "Atualizar certificado" : "Enviar certificado";
});

function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extrairExtensao(nome: string): string {
    const idx = nome.lastIndexOf(".");
    return idx >= 0 ? nome.slice(idx).toLowerCase() : "";
}

function mensagemErroEnvio(e: unknown): string {
    if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        if (status === 429) {
            return "Muitas tentativas. Aguarde um minuto e tente novamente.";
        }

        const data = e.response?.data as ErroResponseDTO | undefined;
        const msg = data?.message?.trim();
        if (msg) return msg;

        const errors = data?.errors;
        if (errors && typeof errors === "object") {
            for (const v of Object.values(errors)) {
                if (Array.isArray(v) && v[0]) return String(v[0]);
            }
        }
    }
    if (e instanceof Error && e.message) return e.message;
    return "Não foi possível enviar o certificado digital. Tente novamente.";
}

function resetarFormulario() {
    arquivo.value = null;
    senha.value = "";
    mostrarSenha.value = false;
    erro.value = null;
    arrastando.value = false;
}

function fechar() {
    if (enviando.value) return;
    emit("fechar");
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && props.aberto) fechar();
}

function validarArquivo(file: File): string | null {
    const ext = extrairExtensao(file.name);
    if (!EXTENSOES_PERMITIDAS.includes(ext)) {
        return `Formato não suportado. Envie um arquivo ${EXTENSOES_PERMITIDAS.join(", ")}.`;
    }
    if (file.size > TAMANHO_MAXIMO_BYTES) {
        return `O arquivo excede o limite de ${formatarTamanho(TAMANHO_MAXIMO_BYTES)}.`;
    }
    return null;
}

function definirArquivo(file: File | null) {
    erro.value = null;
    if (!file) {
        arquivo.value = null;
        return;
    }
    const msg = validarArquivo(file);
    if (msg) {
        erro.value = msg;
        arquivo.value = null;
        return;
    }
    arquivo.value = file;
}

function aoSelecionarArquivo(e: Event) {
    const input = e.target as HTMLInputElement;
    definirArquivo(input.files?.[0] ?? null);
    input.value = "";
}

function aoSoltarArquivo(e: DragEvent) {
    arrastando.value = false;
    definirArquivo(e.dataTransfer?.files?.[0] ?? null);
}

function limparArquivo() {
    arquivo.value = null;
    erro.value = null;
}

async function aoEnviar() {
    if (!props.vinculo) return;

    erro.value = null;

    if (!arquivo.value) {
        erro.value = "Selecione o arquivo do certificado digital.";
        return;
    }
    if (!senha.value.trim()) {
        erro.value = "Informe a senha do certificado digital.";
        return;
    }

    enviando.value = true;
    try {
        const resp = await enviarCertificadoCaso.execute(
            props.vinculo.id,
            arquivo.value,
            senha.value.trim()
        );
        emit("enviado", resp.message);
        fechar();
    } catch (e) {
        erro.value = mensagemErroEnvio(e);
    } finally {
        enviando.value = false;
    }
}

watch(
    () => props.aberto,
    (aberto) => {
        if (!aberto) resetarFormulario();
        if (typeof document === "undefined") return;
        document.body.style.overflow = aberto ? "hidden" : "";
    },
    { immediate: true }
);

onUnmounted(() => {
    if (typeof document !== "undefined") {
        document.body.style.overflow = "";
    }
});
</script>

<template>
    <Teleport to="body">
        <div
            v-if="aberto"
            class="cert-modal__portal"
            role="presentation"
            @keydown="onKeydown"
        >
            <div class="cert-modal__backdrop" aria-hidden="true" @click="fechar" />
            <div
                class="cert-modal__wrap"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cert-modal-titulo"
                @click.self="fechar"
            >
                <div class="cert-modal__panel" @click.stop>
                    <button
                        type="button"
                        class="cert-modal__fechar"
                        aria-label="Fechar"
                        :disabled="enviando"
                        @click="fechar"
                    >
                        <RiCloseLine />
                    </button>

                    <header class="cert-modal__hero">
                        <div class="cert-modal__hero-glow" aria-hidden="true" />
                        <div class="cert-modal__hero-icon">
                            <RiShieldKeyholeLine />
                        </div>
                        <div>
                            <p class="cert-modal__eyebrow">Certificado digital</p>
                            <h2 id="cert-modal-titulo" class="cert-modal__titulo">
                                {{ tituloModal }}
                            </h2>
                            <p class="cert-modal__subtitulo">
                                Vinculação aprovada para
                                <strong>{{ nomeEmpresa }}</strong>
                                <span v-if="vinculo?.empresa.cnpj">
                                    · {{ cnpjMask(vinculo.empresa.cnpj) }}
                                </span>
                            </p>
                        </div>
                    </header>

                    <div class="cert-modal__corpo">
                        <p class="cert-modal__intro">
                            {{
                                jaTemCertificado
                                    ? "Envie um novo arquivo e a senha para substituir o certificado anterior. Os dados são transmitidos de forma segura."
                                    : "Envie o arquivo do seu certificado e a senha de acesso. Os dados são transmitidos de forma segura e utilizados apenas para operações vinculadas à empresa."
                            }}
                        </p>

                        <div
                            class="cert-modal__dropzone"
                            :class="{
                                'cert-modal__dropzone--active': arrastando,
                                'cert-modal__dropzone--filled': arquivo
                            }"
                            @dragenter.prevent="arrastando = true"
                            @dragover.prevent="arrastando = true"
                            @dragleave.prevent="arrastando = false"
                            @drop.prevent="aoSoltarArquivo"
                        >
                            <input
                                id="cert-modal-arquivo"
                                type="file"
                                class="cert-modal__file-input"
                                :accept="EXTENSOES_PERMITIDAS.join(',')"
                                :disabled="enviando"
                                @change="aoSelecionarArquivo"
                            />

                            <template v-if="arquivo">
                                <div class="cert-modal__file-preview">
                                    <div class="cert-modal__file-icon">
                                        <RiFileShield2Line />
                                    </div>
                                    <div class="cert-modal__file-meta">
                                        <strong>{{ arquivo.name }}</strong>
                                        <span>{{ formatarTamanho(arquivo.size) }}</span>
                                    </div>
                                    <button
                                        type="button"
                                        class="cert-modal__file-remove"
                                        :disabled="enviando"
                                        @click="limparArquivo"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </template>

                            <label v-else for="cert-modal-arquivo" class="cert-modal__drop-label">
                                <RiUploadCloud2Line class="cert-modal__drop-ic" />
                                <span class="cert-modal__drop-title">
                                    Arraste o certificado ou clique para selecionar
                                </span>
                                <span class="cert-modal__drop-hint">
                                    Formatos aceitos: {{ EXTENSOES_PERMITIDAS.join(", ") }} · até 5 MB
                                </span>
                            </label>
                        </div>

                        <div class="cert-modal__field">
                            <label for="cert-modal-senha" class="cert-modal__label">
                                <RiLock2Line aria-hidden="true" />
                                Senha do certificado
                            </label>
                            <div class="cert-modal__senha-wrap">
                                <input
                                    id="cert-modal-senha"
                                    v-model="senha"
                                    :type="mostrarSenha ? 'text' : 'password'"
                                    class="form-control cert-modal__input"
                                    placeholder="Digite a senha do certificado"
                                    autocomplete="new-password"
                                    maxlength="255"
                                    :disabled="enviando"
                                />
                                <button
                                    type="button"
                                    class="cert-modal__senha-toggle"
                                    :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                                    :disabled="enviando"
                                    @click="mostrarSenha = !mostrarSenha"
                                >
                                    <RiEyeOffLine v-if="mostrarSenha" />
                                    <RiEyeLine v-else />
                                </button>
                            </div>
                        </div>

                        <div class="cert-modal__seguranca" role="note">
                            <RiShieldKeyholeLine aria-hidden="true" />
                            <p>
                                Sua senha não será exibida novamente após o envio. Certifique-se de
                                que o arquivo e a senha correspondem ao mesmo certificado.
                            </p>
                        </div>

                        <div v-if="erro" class="cert-modal__erro" role="alert">
                            {{ erro }}
                        </div>
                    </div>

                    <footer class="cert-modal__rodape">
                        <button
                            type="button"
                            class="btn cert-modal__btn cert-modal__btn--ghost"
                            :disabled="enviando"
                            @click="fechar"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            class="btn cert-modal__btn cert-modal__btn--primary"
                            :disabled="!podeEnviar"
                            @click="aoEnviar"
                        >
                            <RiShieldKeyholeLine v-if="!enviando" />
                            {{ rotuloBotaoEnviar }}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.cert-modal__portal {
    position: fixed;
    inset: 0;
    z-index: 1080;
}

.cert-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
}

.cert-modal__wrap {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 1.25rem;
}

.cert-modal__panel {
    position: relative;
    width: min(100%, 520px);
    max-height: min(92vh, 720px);
    overflow: auto;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.22);
    border: 1px solid rgba(92, 107, 192, 0.12);
}

.cert-modal__fechar {
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    z-index: 2;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
    transition: background 0.15s ease;
}

.cert-modal__fechar:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.22);
}

.cert-modal__fechar:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.cert-modal__hero {
    position: relative;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding: 1.5rem 3.25rem 1.35rem 1.5rem;
    color: #fff;
    background: linear-gradient(135deg, #1a2338 0%, #243554 55%, #1e3d4a 100%);
    border-radius: 20px 20px 0 0;
    overflow: hidden;
}

.cert-modal__hero-glow {
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: #5c6bc0;
    filter: blur(50px);
    opacity: 0.35;
    top: -60px;
    right: -30px;
    pointer-events: none;
}

.cert-modal__hero-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.15);
    flex-shrink: 0;
}

.cert-modal__hero-icon :deep(svg) {
    width: 24px;
    height: 24px;
}

.cert-modal__eyebrow {
    margin: 0 0 0.25rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.8;
}

.cert-modal__titulo {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    line-height: 1.2;
}

.cert-modal__subtitulo {
    margin: 0.45rem 0 0;
    font-size: 0.85rem;
    line-height: 1.45;
    opacity: 0.9;
}

.cert-modal__subtitulo strong {
    font-weight: 700;
}

.cert-modal__corpo {
    padding: 1.25rem 1.5rem 0.5rem;
}

.cert-modal__intro {
    margin: 0 0 1rem;
    font-size: 0.88rem;
    line-height: 1.55;
    color: #6c7a94;
}

.cert-modal__dropzone {
    position: relative;
    border-radius: 14px;
    border: 1.5px dashed rgba(92, 107, 192, 0.35);
    background: #f5f7ff;
    transition:
        border-color 0.15s ease,
        background 0.15s ease,
        box-shadow 0.15s ease;
}

.cert-modal__dropzone--active {
    border-color: #5c6bc0;
    background: #eef1ff;
    box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.12);
}

.cert-modal__dropzone--filled {
    border-style: solid;
    background: #fff;
}

.cert-modal__file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
}

.cert-modal__drop-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 1.75rem 1.25rem;
    cursor: pointer;
    text-align: center;
}

.cert-modal__drop-ic {
    width: 36px;
    height: 36px;
    color: #5c6bc0;
}

.cert-modal__drop-title {
    font-size: 0.92rem;
    font-weight: 700;
    color: #16254e;
}

.cert-modal__drop-hint {
    font-size: 0.78rem;
    color: #6c7a94;
}

.cert-modal__file-preview {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem 1.1rem;
}

.cert-modal__file-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #eef1ff, #e8f7f8);
    color: #5c6bc0;
    flex-shrink: 0;
}

.cert-modal__file-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.cert-modal__file-meta strong {
    font-size: 0.88rem;
    color: #16254e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cert-modal__file-meta span {
    font-size: 0.78rem;
    color: #6c7a94;
}

.cert-modal__file-remove {
    border: none;
    background: transparent;
    font-size: 0.8rem;
    font-weight: 700;
    color: #c0392b;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
}

.cert-modal__file-remove:hover:not(:disabled) {
    background: rgba(192, 57, 43, 0.08);
}

.cert-modal__field {
    margin-top: 1.1rem;
}

.cert-modal__label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.45rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6c7a94;
}

.cert-modal__label :deep(svg) {
    width: 15px;
    height: 15px;
}

.cert-modal__senha-wrap {
    position: relative;
}

.cert-modal__input {
    padding-right: 2.75rem;
    border-radius: 12px;
    border-color: rgba(92, 107, 192, 0.25);
    font-size: 0.92rem;
}

.cert-modal__input:focus {
    border-color: #5c6bc0;
    box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.15);
}

.cert-modal__senha-toggle {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: #6c7a94;
}

.cert-modal__senha-toggle:hover:not(:disabled) {
    background: #f0f2fa;
    color: #5c6bc0;
}

.cert-modal__seguranca {
    display: flex;
    gap: 0.65rem;
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(92, 107, 192, 0.08), rgba(45, 160, 168, 0.08));
    color: #4a5878;
    font-size: 0.8rem;
    line-height: 1.5;
}

.cert-modal__seguranca :deep(svg) {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: #5c6bc0;
}

.cert-modal__seguranca p {
    margin: 0;
}

.cert-modal__erro {
    margin-top: 0.85rem;
    padding: 0.7rem 0.9rem;
    border-radius: 10px;
    background: #fff5f5;
    border: 1px solid rgba(192, 57, 43, 0.2);
    color: #a93226;
    font-size: 0.85rem;
}

.cert-modal__rodape {
    display: flex;
    justify-content: flex-end;
    gap: 0.65rem;
    padding: 1rem 1.5rem 1.35rem;
    border-top: 1px solid rgba(92, 107, 192, 0.1);
}

.cert-modal__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.88rem;
    padding: 0.55rem 1.1rem;
}

.cert-modal__btn--ghost {
    background: #f5f7ff;
    color: #4a5878;
    border: 1px solid rgba(92, 107, 192, 0.15);
}

.cert-modal__btn--ghost:hover:not(:disabled) {
    background: #eef1ff;
}

.cert-modal__btn--primary {
    background: linear-gradient(135deg, #5c6bc0, #4a5ab0);
    color: #fff;
    border: none;
    box-shadow: 0 8px 20px rgba(92, 107, 192, 0.28);
}

.cert-modal__btn--primary:hover:not(:disabled) {
    filter: brightness(1.03);
}

.cert-modal__btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}
</style>
