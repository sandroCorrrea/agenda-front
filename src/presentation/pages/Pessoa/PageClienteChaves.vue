<script setup lang="ts">
import { computed, ref } from "vue";
import {
    RiEyeLine,
    RiEyeOffLine,
    RiFileCopyLine,
    RiRefreshLine,
    RiShieldKeyholeLine
} from "@remixicon/vue";
import { useTokenIntegracao } from "@/presentation/composables/Pessoa/useTokenIntegracao";

const {
    gerarToken,
    copiarTokenCompleto,
    carregando,
    token,
    tokenType,
    erro,
    copiado
} = useTokenIntegracao();

const mostrarToken = ref(false);

function mascararToken(valor: string): string {
    if (valor.length <= 12) return "************";
    const inicio = valor.slice(0, 6);
    const fim = valor.slice(-4);
    return `${inicio}${"*".repeat(Math.max(8, valor.length - 10))}${fim}`;
}

const tokenExibicao = computed(() => {
    if (!token.value) return "";
    const tokenFormatado = mostrarToken.value
        ? token.value
        : mascararToken(token.value);
    return `${tokenType.value} ${tokenFormatado}`;
});

async function aoGerarToken() {
    try {
        await gerarToken();
        mostrarToken.value = false;
    } catch {
        return;
    }
}

async function aoCopiarToken() {
    try {
        await copiarTokenCompleto();
    } catch {
        return;
    }
}

function alternarVisualizacaoToken() {
    mostrarToken.value = !mostrarToken.value;
}
</script>

<template>
    <article class="page-chaves min-vh-100 py-4">
        <div class="container">
            <div class="mb-4">
                <h1 class="section-title">Token de Integracao</h1>
            </div>

            <div class="card token-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="token-header">
                        <div class="token-icon">
                            <RiShieldKeyholeLine />
                        </div>
                        <div>
                            <h2 class="token-title">Chave Bearer para APIs</h2>
                            <p class="token-sub">
                                Gere seu token para integrar sistemas externos com APIs.
                                O token sera exibido somente apos a geracao.
                            </p>
                        </div>
                    </div>

                    <div class="token-actions">
                        <button
                            type="button"
                            class="btn btn-primary token-btn"
                            :disabled="carregando"
                            @click="aoGerarToken"
                        >
                            <RiRefreshLine class="me-1" />
                            {{ carregando ? "Gerando..." : "Gerar novo token" }}
                        </button>
                    </div>

                    <div v-if="erro" class="token-alert token-alert--erro mt-3">
                        {{ erro }}
                    </div>

                    <div v-if="token" class="token-box mt-3">
                        <label class="form-label fw-semibold">Token de integracao</label>
                        <div class="token-value-wrap">
                            <code class="token-value">{{ tokenExibicao }}</code>
                        </div>

                        <div class="token-copy-actions mt-3">
                            <button
                                type="button"
                                class="btn btn-outline-secondary token-btn-outline-secondary"
                                @click="alternarVisualizacaoToken"
                            >
                                <RiEyeLine v-if="!mostrarToken" class="me-1" />
                                <RiEyeOffLine v-else class="me-1" />
                                {{ mostrarToken ? "Ocultar token" : "Revelar token" }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-outline-primary token-btn-outline"
                                @click="aoCopiarToken"
                            >
                                <RiFileCopyLine class="me-1" />
                                Copiar token
                            </button>
                            <span v-if="copiado" class="token-copiado">
                                Token copiado com sucesso.
                            </span>
                        </div>
                    </div>

                    <p class="token-tip mt-4">
                        Por seguranca, nao compartilhe este token em canais publicos.
                        Se desconfiar de vazamento, gere um novo token.
                    </p>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.page-chaves {
    background: #f6f8fc;
}

.section-title {
    position: relative;
    display: inline-block;
    font-size: 2rem;
    font-weight: 800;
    color: #16254e;
    margin: 0;
}

.section-title::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 70%;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.token-card {
    border-radius: 18px;
}

.token-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.token-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(92, 107, 192, 0.12);
    color: #4054b8;
    flex-shrink: 0;
}

.token-icon :deep(svg) {
    width: 26px;
    height: 26px;
}

.token-title {
    font-size: 1.3rem;
    font-weight: 800;
    color: #16254e;
    margin: 0;
}

.token-sub {
    margin: 0.4rem 0 0;
    color: #5f6f8f;
    line-height: 1.5;
}

.token-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
}

.token-btn {
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 16px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
}

.token-btn-outline {
    border: 2px solid #5c6bc0 !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    color: #5c6bc0 !important;
}

.token-btn-outline-secondary {
    border: 2px solid #9aa8c5 !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    color: #4b5d83 !important;
    background: #fff !important;
}

.token-box {
    border: 1px solid rgba(20, 30, 40, 0.1);
    background: #fafcff;
    border-radius: 14px;
    padding: 1rem;
}

.token-value-wrap {
    border-radius: 10px;
    border: 1px dashed rgba(92, 107, 192, 0.5);
    background: #fff;
    padding: 0.75rem;
    overflow-x: auto;
}

.token-value {
    font-size: 0.86rem;
    color: #213153;
    white-space: nowrap;
}

.token-copy-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.token-copiado {
    color: #177245;
    font-weight: 600;
    font-size: 0.9rem;
}

.token-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
}

.token-alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}

.token-tip {
    margin: 0;
    color: #6b7c9f;
    font-size: 0.9rem;
    line-height: 1.45;
}

@media (max-width: 767.98px) {
    .section-title {
        font-size: 1.6rem;
    }

    .token-header {
        flex-direction: column;
    }
}
</style>
