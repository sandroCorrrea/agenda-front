<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import {
    RiArrowRightLine,
    RiCheckLine,
    RiCloseLine,
    RiLinkM,
    RiNotification3Line,
    RiSubtractLine
} from "@remixicon/vue";
import { useVinculosAdmin } from "@/presentation/composables/Empresa/useVinculosAdmin";
import { useVinculosPendentesAdmin } from "@/presentation/composables/Empresa/useVinculosPendentesAdmin";
import { useVinculosPendentesStore } from "@/presentation/store/useVinculosPendentesStore";
import { cnpjMask } from "@/shared/utils/masks";

const STORAGE_KEY = "adm_vinc_toast_minimizado";

const route = useRoute();
const store = useVinculosPendentesStore();
const { atualizarPendentes } = useVinculosPendentesAdmin();
const {
    aprovar,
    abrirModalRejeitar,
    fecharModalRejeitar,
    confirmarRejeicao,
    processandoId,
    modalRejeitarId,
    justificativaRejeicao,
    erroJustificativa,
    vinculoRejeicao
} = useVinculosAdmin();

const minimizado = ref(
    typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(STORAGE_KEY) === "1"
);

const naPaginaVinculos = computed(
    () => route.name === "AdministradorVinculacoes"
);

const rotuloContagem = computed(() => {
    const n = store.totalPendentes;
    if (n === 1) return "1 solicitação pendente";
    return `${n} solicitações pendentes`;
});

const rotuloTitulo = computed(() => {
    const n = store.totalPendentes;
    if (n === 1) return "Vinculação aguardando análise";
    return "Vinculações aguardando análise";
});

onMounted(() => {
    void atualizarPendentes();
});

watch(
    () => route.fullPath,
    () => {
        void atualizarPendentes();
    }
);

watch(
    () => store.temPendentes,
    (tem) => {
        if (tem) minimizado.value = false;
    }
);

function alternarMinimizado() {
    minimizado.value = !minimizado.value;
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, minimizado.value ? "1" : "0");
    }
}

async function aoAprovar(id: number) {
    await aprovar(id);
    await atualizarPendentes();
}

function aoRejeitar(id: number) {
    abrirModalRejeitar(id);
}

async function aoConfirmarRejeicao() {
    await confirmarRejeicao();
    await atualizarPendentes();
}
</script>

<template>
    <Teleport to="body">
        <div
            v-if="store.temPendentes"
            class="adm-vinc-toast-container"
            aria-live="polite"
        >
            <!-- Chip minimizado -->
            <button
                v-if="minimizado"
                type="button"
                class="adm-vinc-toast-chip"
                :aria-label="`${store.totalPendentes} vinculações pendentes. Clique para expandir.`"
                @click="alternarMinimizado"
            >
                <span class="adm-vinc-toast-chip__pulse" aria-hidden="true" />
                <RiNotification3Line class="adm-vinc-toast-chip__ic" />
                <span class="adm-vinc-toast-chip__count">{{ store.totalPendentes }}</span>
            </button>

            <!-- Toast expandido -->
            <div
                v-else
                class="toast adm-vinc-toast show"
                role="alert"
                aria-atomic="true"
            >
                <div class="toast-header adm-vinc-toast__header">
                    <div class="adm-vinc-toast__header-main">
                        <span class="adm-vinc-toast__icon" aria-hidden="true">
                            <RiNotification3Line />
                        </span>
                        <div class="adm-vinc-toast__header-text">
                            <strong class="adm-vinc-toast__title">{{ rotuloTitulo }}</strong>
                            <small class="adm-vinc-toast__kicker">{{ rotuloContagem }}</small>
                        </div>
                    </div>
                    <div class="adm-vinc-toast__header-actions">
                        <button
                            type="button"
                            class="adm-vinc-toast__icon-btn"
                            aria-label="Minimizar"
                            @click="alternarMinimizado"
                        >
                            <RiSubtractLine />
                        </button>
                    </div>
                </div>

                <div class="toast-body adm-vinc-toast__body">
                    <p class="adm-vinc-toast__lead">
                        Clientes solicitaram vinculação com empresas. Aprove ou rejeite
                        para liberar o acesso.
                    </p>

                    <ul v-if="store.preview.length" class="adm-vinc-toast__lista">
                        <li
                            v-for="v in store.preview"
                            :key="v.id"
                            class="adm-vinc-toast__item"
                        >
                            <div class="adm-vinc-toast__item-top">
                                <RiLinkM class="adm-vinc-toast__item-ic" aria-hidden="true" />
                                <div class="adm-vinc-toast__item-copy">
                                    <strong>{{ v.usuario.nome }}</strong>
                                    <span class="adm-vinc-toast__empresa">{{
                                        v.empresa.nome
                                    }}</span>
                                    <span class="adm-vinc-toast__cnpj">{{
                                        cnpjMask(v.empresa.cnpj)
                                    }}</span>
                                </div>
                            </div>
                            <div class="adm-vinc-toast__item-acoes">
                                <button
                                    type="button"
                                    class="btn btn-sm adm-vinc-toast__btn adm-vinc-toast__btn--ok"
                                    :disabled="processandoId === v.id"
                                    @click="aoAprovar(v.id)"
                                >
                                    <RiCheckLine />
                                    {{ processandoId === v.id ? "..." : "Aprovar" }}
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-sm adm-vinc-toast__btn adm-vinc-toast__btn--no"
                                    :disabled="processandoId === v.id"
                                    @click="aoRejeitar(v.id)"
                                >
                                    <RiCloseLine /> Rejeitar
                                </button>
                            </div>
                        </li>
                    </ul>

                    <p
                        v-if="store.totalPendentes > store.preview.length"
                        class="adm-vinc-toast__mais"
                    >
                        + {{ store.totalPendentes - store.preview.length }} na fila completa
                    </p>

                    <RouterLink
                        v-if="!naPaginaVinculos"
                        :to="{ name: 'AdministradorVinculacoes' }"
                        class="adm-vinc-toast__cta"
                    >
                        Analisar todas
                        <RiArrowRightLine />
                    </RouterLink>
                </div>
            </div>
        </div>

        <div
            v-if="modalRejeitarId != null"
            class="adm-vinc-modal"
            @click.self="fecharModalRejeitar"
        >
            <div class="adm-vinc-modal__card" role="dialog" aria-modal="true">
                <h3>Rejeitar vinculação</h3>
                <p v-if="vinculoRejeicao" class="adm-vinc-modal__sub">
                    {{ vinculoRejeicao.usuario.nome }} ·
                    {{ vinculoRejeicao.empresa.nome }}
                </p>
                <label class="adm-vinc-modal__label" for="toast-justificativa">
                    Justificativa (obrigatória)
                </label>
                <textarea
                    id="toast-justificativa"
                    v-model="justificativaRejeicao"
                    class="form-control adm-vinc-modal__textarea"
                    rows="4"
                    maxlength="1000"
                    placeholder="Informe o motivo da rejeição para o cliente..."
                />
                <small class="adm-vinc-modal__count">
                    {{ justificativaRejeicao.length }}/1000
                </small>
                <p v-if="erroJustificativa" class="adm-vinc-modal__erro">
                    {{ erroJustificativa }}
                </p>
                <div class="adm-vinc-modal__acoes">
                    <button
                        type="button"
                        class="adm-vinc-modal__btn adm-vinc-modal__btn--ghost"
                        :disabled="processandoId != null"
                        @click="fecharModalRejeitar"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        class="adm-vinc-modal__btn adm-vinc-modal__btn--danger"
                        :disabled="processandoId != null"
                        @click="aoConfirmarRejeicao"
                    >
                        {{ processandoId != null ? "Enviando..." : "Confirmar rejeição" }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.adm-vinc-toast-container {
    position: fixed;
    right: max(1rem, env(safe-area-inset-right, 0px));
    bottom: max(1.25rem, env(safe-area-inset-bottom, 0px));
    z-index: 2400;
    width: min(420px, calc(100vw - 2rem));
    pointer-events: none;
    animation: adm-vinc-toast-in 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes adm-vinc-toast-in {
    from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.adm-vinc-toast-chip {
    pointer-events: auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-left: auto;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff;
    box-shadow:
        0 12px 32px rgba(92, 107, 192, 0.35),
        0 4px 12px rgba(20, 30, 40, 0.12);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    float: right;
}

.adm-vinc-toast-chip:hover {
    transform: translateY(-2px);
    box-shadow:
        0 16px 40px rgba(92, 107, 192, 0.4),
        0 6px 16px rgba(20, 30, 40, 0.14);
}

.adm-vinc-toast-chip__pulse {
    position: absolute;
    inset: -4px;
    border-radius: 999px;
    border: 2px solid rgba(255, 152, 0, 0.65);
    animation: adm-vinc-chip-ring 2s ease-out infinite;
}

@keyframes adm-vinc-chip-ring {
    0% {
        transform: scale(1);
        opacity: 0.9;
    }
    100% {
        transform: scale(1.35);
        opacity: 0;
    }
}

.adm-vinc-toast-chip__ic {
    width: 24px;
    height: 24px;
}

.adm-vinc-toast-chip__count {
    position: absolute;
    top: -2px;
    right: -2px;
    min-width: 1.35rem;
    height: 1.35rem;
    padding: 0 0.3rem;
    border-radius: 999px;
    background: #ff9800;
    color: #1a1200;
    font-size: 0.68rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
}

.adm-vinc-toast {
    pointer-events: auto;
    width: 100%;
    max-width: 100%;
    border: none;
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow:
        0 20px 50px rgba(22, 37, 78, 0.14),
        0 8px 20px rgba(22, 37, 78, 0.08);
}

.adm-vinc-toast__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    background: linear-gradient(135deg, #f8f9ff 0%, #f0fafb 100%);
    border-bottom: 1px solid rgba(92, 107, 192, 0.12);
}

.adm-vinc-toast__header-main {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    min-width: 0;
}

.adm-vinc-toast__icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: linear-gradient(135deg, rgba(92, 107, 192, 0.15) 0%, rgba(45, 160, 168, 0.15) 100%);
    color: #5c6bc0;
}

.adm-vinc-toast__icon :deep(svg) {
    width: 20px;
    height: 20px;
}

.adm-vinc-toast__header-text {
    min-width: 0;
}

.adm-vinc-toast__title {
    display: block;
    font-size: 0.92rem;
    font-weight: 800;
    color: #16254e;
    line-height: 1.25;
}

.adm-vinc-toast__kicker {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #b45309;
}

.adm-vinc-toast__header-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
}

.adm-vinc-toast__icon-btn {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 8px;
    background: rgba(92, 107, 192, 0.08);
    color: #5c6bc0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s ease;
}

.adm-vinc-toast__icon-btn:hover {
    background: rgba(92, 107, 192, 0.16);
}

.adm-vinc-toast__icon-btn :deep(svg) {
    width: 16px;
    height: 16px;
}

.adm-vinc-toast__body {
    padding: 1rem;
}

.adm-vinc-toast__lead {
    margin: 0 0 0.85rem;
    font-size: 0.82rem;
    line-height: 1.5;
    color: #6c7a94;
}

.adm-vinc-toast__lista {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.adm-vinc-toast__item {
    padding: 0.75rem;
    border-radius: 12px;
    background: #f8faff;
    border: 1px solid rgba(92, 107, 192, 0.1);
}

.adm-vinc-toast__item-top {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    margin-bottom: 0.65rem;
}

.adm-vinc-toast__item-ic {
    width: 18px;
    height: 18px;
    color: #5c6bc0;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.adm-vinc-toast__item-copy {
    min-width: 0;
}

.adm-vinc-toast__item-copy strong {
    display: block;
    font-size: 0.84rem;
    font-weight: 800;
    color: #16254e;
    line-height: 1.3;
}

.adm-vinc-toast__empresa {
    margin-top: 0.2rem;
    font-size: 0.76rem;
    color: #4b5d83;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.adm-vinc-toast__cnpj {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: #9aa8c5;
    letter-spacing: 0.02em;
}

.adm-vinc-toast__item-acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.adm-vinc-toast__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    border-radius: 9px !important;
    font-weight: 700 !important;
    font-size: 0.76rem !important;
    padding: 0.35rem 0.7rem !important;
}

.adm-vinc-toast__btn :deep(svg) {
    width: 14px;
    height: 14px;
}

.adm-vinc-toast__btn--ok {
    background: rgba(45, 160, 168, 0.12) !important;
    border: 1px solid rgba(45, 160, 168, 0.35) !important;
    color: #1a6b72 !important;
}

.adm-vinc-toast__btn--no {
    background: rgba(220, 53, 69, 0.06) !important;
    border: 1px solid rgba(220, 53, 69, 0.28) !important;
    color: #a52834 !important;
}

.adm-vinc-toast__mais {
    margin: 0.65rem 0 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: #8a5a12;
}

.adm-vinc-toast__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    margin-top: 0.85rem;
    padding: 0.55rem 1rem;
    border-radius: 11px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff !important;
    font-size: 0.82rem;
    font-weight: 800;
    text-decoration: none;
    transition: opacity 0.15s ease, transform 0.15s ease;
}

.adm-vinc-toast__cta:hover {
    opacity: 0.92;
    transform: translateY(-1px);
    color: #fff !important;
}

.adm-vinc-toast__cta :deep(svg) {
    width: 16px;
    height: 16px;
}

.adm-vinc-modal {
    position: fixed;
    inset: 0;
    z-index: 2500;
    background: rgba(15, 22, 38, 0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.adm-vinc-modal__card {
    width: 100%;
    max-width: 480px;
    background: #fff;
    border-radius: 16px;
    padding: 1.35rem;
    box-shadow: 0 20px 50px rgba(20, 30, 40, 0.2);
}

.adm-vinc-modal__card h3 {
    margin: 0 0 0.35rem;
    font-size: 1.1rem;
    font-weight: 800;
    color: #16254e;
}

.adm-vinc-modal__sub {
    margin: 0 0 1rem;
    font-size: 0.85rem;
    color: #6c7a94;
}

.adm-vinc-modal__label {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    color: #16254e;
    margin-bottom: 0.35rem;
}

.adm-vinc-modal__textarea {
    border-radius: 12px !important;
    resize: vertical;
    min-height: 110px;
}

.adm-vinc-modal__count {
    display: block;
    text-align: right;
    font-size: 0.72rem;
    color: #9aa8c5;
    margin-top: 0.25rem;
}

.adm-vinc-modal__erro {
    margin: 0.65rem 0 0;
    font-size: 0.82rem;
    color: #a52834;
}

.adm-vinc-modal__acoes {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
}

.adm-vinc-modal__btn {
    border: none;
    border-radius: 10px;
    padding: 0.5rem 1rem;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
}

.adm-vinc-modal__btn--ghost {
    background: #f0f3fa;
    color: #4b5d83;
}

.adm-vinc-modal__btn--danger {
    background: #dc3545;
    color: #fff;
}

.adm-vinc-modal__btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

@media (max-width: 575.98px) {
    .adm-vinc-toast-container {
        right: 1rem;
        left: 1rem;
        width: auto;
    }

    .adm-vinc-toast-chip {
        float: right;
        margin-right: 0;
    }

    .adm-vinc-toast__item-acoes {
        width: 100%;
    }

    .adm-vinc-toast__btn {
        flex: 1;
        justify-content: center;
    }
}
</style>
