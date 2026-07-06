<script setup lang="ts">
import { computed, inject, ref } from "vue";
import {
    RiCheckLine,
    RiEyeLine,
    RiEyeOffLine,
    RiFileShield2Line,
    RiShieldKeyholeLine,
    RiUploadCloud2Line
} from "@remixicon/vue";
import { EnviarCertificadoDigitalPessoaUseCase } from "@/application/use-cases/Pessoa/EnviarCertificadoDigitalPessoaUseCase";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import axios from "axios";

const props = defineProps<{
    pessoaId: number;
    temCertificado?: boolean;
    certificadoEnviadoEm?: string | null;
}>();

const emit = defineEmits<{
    (e: "enviado"): void;
}>();

const repoPessoa = inject<IPessoaRepository>("IPessoaRepository");
if (!repoPessoa) throw new Error("IPessoaRepository not provided");

const enviarCertificadoCaso = new EnviarCertificadoDigitalPessoaUseCase(repoPessoa);

const EXTENSOES_PERMITIDAS = [".pfx", ".p12", ".pem"];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

const arquivo = ref<File | null>(null);
const senha = ref("");
const mostrarSenha = ref(false);
const enviando = ref(false);
const erro = ref<string | null>(null);
const sucesso = ref<string | null>(null);
const arrastando = ref(false);

const podeEnviar = computed(
    () => Boolean(arquivo.value && senha.value.trim()) && !enviando.value
);

const rotuloBotao = computed(() => {
    if (enviando.value) return "Enviando...";
    return props.temCertificado ? "Atualizar certificado" : "Enviar certificado";
});

function formatarData(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

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
    sucesso.value = null;
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

async function aoEnviar(e: Event) {
    e.preventDefault();
    erro.value = null;
    sucesso.value = null;

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
            props.pessoaId,
            arquivo.value,
            senha.value.trim()
        );
        sucesso.value = resp.message;
        resetarFormulario();
        emit("enviado");
    } catch (e) {
        erro.value = mensagemErroEnvio(e);
    } finally {
        enviando.value = false;
    }
}
</script>

<template>
    <div class="card perfil-card border-0 shadow-sm mb-4">
        <div class="card-body p-4 p-md-5">
            <div class="cert-pf__header">
                <div class="cert-pf__header-text">
                    <h2 class="perfil-bloco-titulo">Certificado digital</h2>
                    <p class="perfil-bloco-sub mb-0">
                        Envie seu certificado e-CPF (pessoa física) para habilitar
                        assinaturas e operações digitais vinculadas à sua conta.
                    </p>
                </div>
                <div
                    class="cert-pf__status"
                    :class="{
                        'cert-pf__status--ok': temCertificado,
                        'cert-pf__status--pending': !temCertificado
                    }"
                >
                    <RiShieldKeyholeLine aria-hidden="true" />
                    <span>{{ temCertificado ? "Cadastrado" : "Não cadastrado" }}</span>
                </div>
            </div>

            <div
                v-if="temCertificado && certificadoEnviadoEm"
                class="cert-pf__info"
                role="status"
            >
                <RiCheckLine aria-hidden="true" />
                <p>
                    Certificado enviado em
                    <strong>{{ formatarData(certificadoEnviadoEm) }}</strong>.
                    Você pode enviar um novo arquivo para substituí-lo.
                </p>
            </div>

            <form @submit="aoEnviar">
                <div
                    class="cert-pf__dropzone"
                    :class="{
                        'cert-pf__dropzone--active': arrastando,
                        'cert-pf__dropzone--filled': arquivo
                    }"
                    @dragenter.prevent="arrastando = true"
                    @dragover.prevent="arrastando = true"
                    @dragleave.prevent="arrastando = false"
                    @drop.prevent="aoSoltarArquivo"
                >
                    <input
                        id="cert-pf-arquivo"
                        type="file"
                        class="cert-pf__file-input"
                        :accept="EXTENSOES_PERMITIDAS.join(',')"
                        :disabled="enviando"
                        @change="aoSelecionarArquivo"
                    />

                    <template v-if="arquivo">
                        <div class="cert-pf__file-preview">
                            <div class="cert-pf__file-icon">
                                <RiFileShield2Line />
                            </div>
                            <div class="cert-pf__file-meta">
                                <strong>{{ arquivo.name }}</strong>
                                <span>{{ formatarTamanho(arquivo.size) }}</span>
                            </div>
                            <button
                                type="button"
                                class="cert-pf__file-remove"
                                :disabled="enviando"
                                @click="limparArquivo"
                            >
                                Remover
                            </button>
                        </div>
                    </template>

                    <label v-else for="cert-pf-arquivo" class="cert-pf__drop-label">
                        <RiUploadCloud2Line class="cert-pf__drop-ic" />
                        <span class="cert-pf__drop-title">
                            Arraste o certificado ou clique para selecionar
                        </span>
                        <span class="cert-pf__drop-hint">
                            Formatos: {{ EXTENSOES_PERMITIDAS.join(", ") }} · até 5 MB
                        </span>
                    </label>
                </div>

                <div class="cert-pf__field">
                    <label for="cert-pf-senha" class="form-label">
                        Senha do certificado
                    </label>
                    <div class="password-wrapper">
                        <input
                            id="cert-pf-senha"
                            v-model="senha"
                            :type="mostrarSenha ? 'text' : 'password'"
                            class="form-control form-control-lg"
                            placeholder="Digite a senha de acesso ao certificado"
                            autocomplete="new-password"
                            maxlength="255"
                            :disabled="enviando"
                        />
                        <button
                            type="button"
                            class="password-toggle"
                            :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                            :disabled="enviando"
                            @click="mostrarSenha = !mostrarSenha"
                        >
                            <RiEyeOffLine v-if="mostrarSenha" />
                            <RiEyeLine v-else />
                        </button>
                    </div>
                    <p class="form-hint">
                        A senha não será exibida novamente após o envio.
                    </p>
                </div>

                <div class="cert-pf__seguranca" role="note">
                    <RiShieldKeyholeLine aria-hidden="true" />
                    <p>
                        Seus dados são transmitidos de forma segura e utilizados apenas
                        para operações digitais da sua conta.
                    </p>
                </div>

                <div v-if="erro" class="perfil-alerta perfil-alerta--erro mt-3" role="alert">
                    {{ erro }}
                </div>
                <div
                    v-if="sucesso"
                    class="perfil-alerta perfil-alerta--ok mt-3"
                    role="status"
                >
                    {{ sucesso }}
                </div>

                <button
                    type="submit"
                    class="btn btn-primary btn-salvar mt-3"
                    :disabled="!podeEnviar"
                >
                    <RiShieldKeyholeLine v-if="!enviando" />
                    {{ rotuloBotao }}
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.perfil-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.06) !important;
    border-radius: 18px;
    box-shadow: 0 12px 40px rgba(20, 30, 40, 0.08) !important;
}

.perfil-bloco-titulo {
    font-size: 1.15rem;
    font-weight: 700;
    color: #16254e;
    margin: 0 0 0.25rem;
}

.perfil-bloco-sub {
    margin: 0 0 1.25rem;
    font-size: 0.88rem;
    color: #64748b;
}

.form-label {
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.35rem;
}

.form-control {
    background: #f6fbfc;
    border: 1px solid #e6f0f4;
    border-radius: 12px;
    padding: 0.85rem 1rem;
    transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.form-control:focus {
    outline: none;
    border-color: #5c6bc0;
    box-shadow: 0 6px 18px rgba(92, 107, 192, 0.08);
    background: #fff;
}

.password-wrapper {
    position: relative;
}

.password-wrapper .form-control {
    padding-right: 2.8rem;
}

.password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-hint {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    color: #94a3b8;
}

.btn-salvar {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 12px 24px !important;
    font-weight: 700;
    box-shadow: 0 10px 24px rgba(45, 160, 168, 0.15);
}

.btn-salvar:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(45, 160, 168, 0.2);
}

.btn-salvar:disabled {
    opacity: 0.75;
    cursor: not-allowed;
}

.perfil-alerta {
    padding: 0.85rem 1rem;
    border-radius: 12px;
    font-size: 0.92rem;
    font-weight: 500;
}

.perfil-alerta--erro {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.2);
    color: #721c24;
}

.perfil-alerta--ok {
    background: rgba(22, 163, 74, 0.1);
    border: 1px solid rgba(22, 163, 74, 0.25);
    color: #14532d;
}

.cert-pf__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.cert-pf__header-text {
    flex: 1;
    min-width: 200px;
}

.cert-pf__status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
}

.cert-pf__status :deep(svg) {
    width: 16px;
    height: 16px;
}

.cert-pf__status--ok {
    background: rgba(22, 163, 74, 0.1);
    color: #15803d;
    border: 1px solid rgba(22, 163, 74, 0.25);
}

.cert-pf__status--pending {
    background: rgba(92, 107, 192, 0.1);
    color: #3f4f80;
    border: 1px solid rgba(92, 107, 192, 0.2);
}

.cert-pf__info {
    display: flex;
    gap: 0.65rem;
    align-items: flex-start;
    margin-bottom: 1.25rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: rgba(22, 163, 74, 0.06);
    border: 1px solid rgba(22, 163, 74, 0.15);
    color: #166534;
    font-size: 0.88rem;
    line-height: 1.5;
}

.cert-pf__info :deep(svg) {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.cert-pf__info p {
    margin: 0;
}

.cert-pf__dropzone {
    position: relative;
    border-radius: 14px;
    border: 1.5px dashed rgba(92, 107, 192, 0.35);
    background: #f6fbfc;
    transition:
        border-color 0.18s ease,
        background 0.18s ease,
        box-shadow 0.18s ease;
}

.cert-pf__dropzone--active {
    border-color: #5c6bc0;
    background: #eef1ff;
    box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.12);
}

.cert-pf__dropzone--filled {
    border-style: solid;
    background: #fff;
}

.cert-pf__file-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
}

.cert-pf__drop-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 1.75rem 1.25rem;
    cursor: pointer;
    text-align: center;
}

.cert-pf__drop-ic {
    width: 36px;
    height: 36px;
    color: #5c6bc0;
}

.cert-pf__drop-title {
    font-size: 0.92rem;
    font-weight: 700;
    color: #16254e;
}

.cert-pf__drop-hint {
    font-size: 0.78rem;
    color: #64748b;
}

.cert-pf__file-preview {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1rem 1.1rem;
}

.cert-pf__file-icon {
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

.cert-pf__file-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.cert-pf__file-meta strong {
    font-size: 0.88rem;
    color: #16254e;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.cert-pf__file-meta span {
    font-size: 0.78rem;
    color: #64748b;
}

.cert-pf__file-remove {
    border: none;
    background: transparent;
    font-size: 0.8rem;
    font-weight: 700;
    color: #c0392b;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
}

.cert-pf__file-remove:hover:not(:disabled) {
    background: rgba(192, 57, 43, 0.08);
}

.cert-pf__field {
    margin-top: 1.25rem;
}

.cert-pf__seguranca {
    display: flex;
    gap: 0.65rem;
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(92, 107, 192, 0.06), rgba(45, 160, 168, 0.06));
    color: #4a5878;
    font-size: 0.82rem;
    line-height: 1.5;
}

.cert-pf__seguranca :deep(svg) {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 0.1rem;
    color: #5c6bc0;
}

.cert-pf__seguranca p {
    margin: 0;
}

.btn-salvar {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.btn-salvar :deep(svg) {
    width: 18px;
    height: 18px;
}

.password-toggle :deep(svg) {
    width: 18px;
    height: 18px;
    opacity: 0.75;
}

.password-toggle:hover :deep(svg) {
    opacity: 1;
}
</style>
