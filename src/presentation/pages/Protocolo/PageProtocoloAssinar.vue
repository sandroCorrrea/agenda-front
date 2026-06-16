<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import {
    RiArrowDownSLine,
    RiCalendarLine,
    RiCheckboxCircleFill,
    RiFileList3Line,
    RiLoader4Line,
    RiMapPinLine,
    RiPenNibFill,
    RiShieldCheckLine,
    RiUser3Line
} from "@remixicon/vue";
import { useProtocoloAssinaturaPublica } from "@/presentation/composables/Protocolo/useProtocoloAssinaturaPublica";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import { cpfMask, onlyNumbers } from "@/shared/utils/masks";
import { formatarDataIsoPtBr } from "@/shared/utils/date.util";
import logo from "@/presentation/assets/img/logo.jpeg";

const route = useRoute();
const matriz = useMatrizStore();

const {
    carregando,
    dados,
    erroConsulta,
    enviando,
    erroEnvio,
    errosCampo,
    enviarAssinatura
} = useProtocoloAssinaturaPublica(() => String(route.params.token ?? ""));

const nome = ref("");
const cpf = ref("");
const detalhesAbertos = ref(false);

const chipTipo = (t: string) =>
    t === "fisica" ? "Pessoa física" : "Pessoa jurídica";

function aoDigitarCpf(ev: Event) {
    const el = ev.target as HTMLInputElement;
    cpf.value = cpfMask(el.value);
}

function formatarDataHoraPtBr(s: string) {
    if (!s) return "—";
    const d = new Date(s.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatarCep(cep: string) {
    const d = onlyNumbers(cep);
    if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return cep || "—";
}

const enderecoFormatado = computed(() => {
    const p = dados.value?.protocolo;
    if (!p) return "";
    const cep = formatarCep(p.cep_destinatario);
    const rua = p.rua_destinatario?.trim() || "—";
    const bairro = p.bairro_destinatario?.trim() || "—";
    const cidade = p.cidade_destinatario?.trim() || "—";
    return `${rua}, ${bairro} — ${cidade} · CEP ${cep}`;
});

const cpfDigitos = computed(() => onlyNumbers(cpf.value));

const cpfCompleto = computed(() => cpfDigitos.value.length === 11);

const podeEnviar = computed(
    () =>
        nome.value.trim().length >= 1 &&
        nome.value.trim().length <= 120 &&
        cpfCompleto.value &&
        !enviando.value &&
        dados.value &&
        !dados.value.jaAssinado
);

const mostrarFormulario = computed(
    () => Boolean(dados.value && !dados.value.jaAssinado && !carregando.value)
);

const nomeMarca = computed(
    () => matriz.matriz?.apelido?.trim() || "Agenda Contabilidade"
);

async function onSubmit() {
    if (!podeEnviar.value) return;
    try {
        await enviarAssinatura(nome.value, cpfDigitos.value);
        nome.value = "";
        cpf.value = "";
    } catch {
        /* erro já exibido em erroEnvio */
    }
}
</script>

<template>
    <article class="mob-assin">
        <div class="mob-assin__bg" aria-hidden="true">
            <span class="mob-assin__orb mob-assin__orb--1" />
            <span class="mob-assin__orb mob-assin__orb--2" />
        </div>

        <!-- Cabeçalho compacto da marca -->
        <header class="mob-assin__header">
            <img :src="logo" alt="" class="mob-assin__logo" width="44" height="44" />
            <div class="mob-assin__brand">
                <span class="mob-assin__brand-name">{{ nomeMarca }}</span>
                <span class="mob-assin__brand-tag">
                    <RiShieldCheckLine /> Assinatura segura
                </span>
            </div>
        </header>

        <!-- Loading -->
        <section v-if="carregando" class="mob-assin__center">
            <div class="mob-assin__loader" role="status" aria-live="polite">
                <RiLoader4Line class="mob-assin__spin" />
                <p>Carregando protocolo...</p>
            </div>
        </section>

        <!-- Erro -->
        <section v-else-if="erroConsulta && !dados" class="mob-assin__center mob-assin__scroll">
            <div class="mob-assin__panel mob-assin__panel--erro">
                <RiFileList3Line class="mob-assin__panel-icon mob-assin__panel-icon--erro" />
                <h1 class="mob-assin__panel-title">Link indisponível</h1>
                <p class="mob-assin__panel-text">{{ erroConsulta }}</p>
                <p class="mob-assin__hint">
                    Escaneie novamente o QR Code impresso no protocolo.
                </p>
            </div>
        </section>

        <!-- Conteúdo principal -->
        <template v-else-if="dados">
            <!-- Sucesso: já assinado -->
            <section
                v-if="dados.jaAssinado"
                class="mob-assin__center mob-assin__scroll mob-assin__scroll--solo"
            >
                <div class="mob-assin__panel mob-assin__panel--ok">
                    <div class="mob-assin__ok-ring">
                        <RiCheckboxCircleFill />
                    </div>
                    <h1 class="mob-assin__panel-title">Recebimento confirmado</h1>
                    <p class="mob-assin__panel-text">
                        Este protocolo já foi assinado digitalmente.
                    </p>
                    <dl v-if="dados.entrega" class="mob-assin__recibo">
                        <div class="mob-assin__recibo-row">
                            <dt>Responsável</dt>
                            <dd>{{ dados.entrega.nome_responsavel_recebimento }}</dd>
                        </div>
                        <div class="mob-assin__recibo-row">
                            <dt>CPF</dt>
                            <dd>{{ cpfMask(dados.entrega.cpf_responsavel_recebimento) }}</dd>
                        </div>
                        <div class="mob-assin__recibo-row">
                            <dt>Registrado em</dt>
                            <dd>{{ formatarDataHoraPtBr(dados.entrega.data_entrega) }}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            <!-- Formulário de assinatura -->
            <template v-else>
                <section class="mob-assin__scroll" :class="{ 'mob-assin__scroll--com-cta': mostrarFormulario }">
                    <div class="mob-assin__hero">
                        <span class="mob-assin__badge">
                            {{ chipTipo(dados.protocolo.destinatario_tipo) }}
                        </span>
                        <h1 class="mob-assin__titulo">
                            {{ dados.protocolo.titulo || "Protocolo de entrega" }}
                        </h1>
                        <p
                            v-if="dados.protocolo.destinatario_nome"
                            class="mob-assin__destinatario"
                        >
                            Para <strong>{{ dados.protocolo.destinatario_nome }}</strong>
                        </p>
                        <div class="mob-assin__chips">
                            <span class="mob-assin__chip">
                                <RiCalendarLine />
                                {{ formatarDataIsoPtBr(dados.protocolo.data_para_entrega) }}
                            </span>
                            <span class="mob-assin__chip">
                                Ano {{ dados.protocolo.ano }}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="mob-assin__accordion"
                        :aria-expanded="detalhesAbertos"
                        @click="detalhesAbertos = !detalhesAbertos"
                    >
                        <span>Detalhes do protocolo</span>
                        <RiArrowDownSLine
                            class="mob-assin__accordion-icon"
                            :class="{ 'mob-assin__accordion-icon--open': detalhesAbertos }"
                        />
                    </button>

                    <div
                        class="mob-assin__detalhes"
                        :class="{ 'mob-assin__detalhes--open': detalhesAbertos }"
                    >
                        <p v-if="dados.protocolo.administrador_nome" class="mob-assin__detalhe">
                            <span>Cadastrado por</span>
                            {{ dados.protocolo.administrador_nome }}
                        </p>
                        <p v-if="dados.protocolo.descricao" class="mob-assin__detalhe">
                            <span>Descrição</span>
                            {{ dados.protocolo.descricao }}
                        </p>
                        <p class="mob-assin__detalhe mob-assin__detalhe--endereco">
                            <RiMapPinLine />
                            {{ enderecoFormatado }}
                        </p>
                    </div>

                    <form
                        id="form-assinatura-protocolo"
                        class="mob-assin__form"
                        @submit.prevent="onSubmit"
                    >
                        <div class="mob-assin__form-head">
                            <RiPenNibFill />
                            <div>
                                <h2>Quem recebeu?</h2>
                                <p>Preencha com os dados de quem assina o recebimento.</p>
                            </div>
                        </div>

                        <label class="mob-assin__field">
                            <span class="mob-assin__label">
                                <RiUser3Line /> Nome completo
                            </span>
                            <input
                                v-model="nome"
                                type="text"
                                maxlength="120"
                                autocomplete="name"
                                enterkeyhint="next"
                                placeholder="Seu nome completo"
                                :class="{ 'mob-assin__input--invalid': errosCampo.nome_responsavel_recebimento }"
                            />
                            <span
                                v-if="errosCampo.nome_responsavel_recebimento"
                                class="mob-assin__field-erro"
                            >
                                {{ errosCampo.nome_responsavel_recebimento }}
                            </span>
                        </label>

                        <label class="mob-assin__field">
                            <span class="mob-assin__label">CPF</span>
                            <input
                                :value="cpf"
                                type="text"
                                inputmode="numeric"
                                maxlength="14"
                                autocomplete="off"
                                enterkeyhint="done"
                                placeholder="000.000.000-00"
                                :class="{ 'mob-assin__input--invalid': errosCampo.cpf_responsavel_recebimento }"
                                @input="aoDigitarCpf"
                            />
                            <span
                                v-if="errosCampo.cpf_responsavel_recebimento"
                                class="mob-assin__field-erro"
                            >
                                {{ errosCampo.cpf_responsavel_recebimento }}
                            </span>
                            <span v-else-if="cpf.length > 0 && !cpfCompleto" class="mob-assin__field-hint">
                                {{ 11 - cpfDigitos.length }} dígito(s) restante(s)
                            </span>
                        </label>

                        <div v-if="erroEnvio" class="mob-assin__alert" role="alert">
                            {{ erroEnvio }}
                        </div>
                    </form>
                </section>

                <!-- CTA fixo no rodapé (só formulário) -->
                <footer class="mob-assin__cta">
                    <button
                        type="submit"
                        form="form-assinatura-protocolo"
                        class="mob-assin__cta-btn"
                        :disabled="!podeEnviar || enviando"
                    >
                        <RiPenNibFill v-if="!enviando" />
                        <RiLoader4Line v-else class="mob-assin__spin" />
                        <span>{{ enviando ? "Registrando..." : "Assinar recebimento" }}</span>
                    </button>
                </footer>
            </template>
        </template>
    </article>
</template>

<style scoped>
.mob-assin {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(165deg, #0f1c3d 0%, #1a2f5c 38%, #1e3a5f 100%);
    color: #e8eef8;
    overflow: hidden;
    font-family: var(--body-font, "Montserrat", sans-serif);
}

.mob-assin__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.mob-assin__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.45;
}

.mob-assin__orb--1 {
    width: 220px;
    height: 220px;
    top: -40px;
    right: -60px;
    background: #2da0a8;
}

.mob-assin__orb--2 {
    width: 180px;
    height: 180px;
    bottom: 20%;
    left: -50px;
    background: #5c6bc0;
}

.mob-assin__header {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: max(0.85rem, env(safe-area-inset-top)) 1.15rem 0.65rem;
}

.mob-assin__logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.mob-assin__brand {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
}

.mob-assin__brand-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.mob-assin__brand-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 600;
}

.mob-assin__center {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
}

.mob-assin__scroll {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0.35rem 1rem 1.25rem;
}

.mob-assin__scroll--com-cta {
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom));
}

.mob-assin__scroll--solo {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
}

.mob-assin__loader {
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
}

.mob-assin__loader p {
    margin: 0.85rem 0 0;
    font-size: 0.95rem;
    font-weight: 600;
}

.mob-assin__spin {
    animation: mob-spin 0.9s linear infinite;
    font-size: 2rem;
    color: #7ee8df;
}

@keyframes mob-spin {
    to {
        transform: rotate(360deg);
    }
}

.mob-assin__panel {
    width: 100%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.97);
    border-radius: 22px;
    padding: 1.75rem 1.35rem;
    color: #16254e;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
    text-align: center;
}

.mob-assin__panel--erro .mob-assin__panel-icon--erro {
    font-size: 2.5rem;
    color: #c0392b;
    margin-bottom: 0.5rem;
}

.mob-assin__panel--ok {
    border: 1px solid rgba(45, 160, 168, 0.35);
}

.mob-assin__ok-ring {
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 2.75rem;
    color: #1d6d3f;
    background: linear-gradient(145deg, #e8faf0, #fff);
    box-shadow: 0 12px 28px rgba(29, 109, 63, 0.2);
}

.mob-assin__panel-title {
    margin: 0 0 0.5rem;
    font-size: 1.35rem;
    font-weight: 800;
    color: #16254e;
}

.mob-assin__panel-text {
    margin: 0;
    font-size: 0.92rem;
    color: #5a6b8a;
    line-height: 1.5;
}

.mob-assin__hint {
    margin: 1rem 0 0;
    font-size: 0.82rem;
    color: #7a8aa8;
}

.mob-assin__recibo {
    margin: 1.25rem 0 0;
    text-align: left;
    border-top: 1px dashed rgba(45, 160, 168, 0.35);
    padding-top: 1rem;
}

.mob-assin__recibo-row {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 0.35rem 0.75rem;
    margin-bottom: 0.65rem;
}

.mob-assin__recibo-row dt {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #7a8aa8;
    margin: 0;
}

.mob-assin__recibo-row dd {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #16254e;
    word-break: break-word;
}

.mob-assin__hero {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 20px;
    padding: 1.15rem 1.1rem 1rem;
    margin-bottom: 0.85rem;
}

.mob-assin__badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.28rem 0.55rem;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(92, 107, 192, 0.55), rgba(45, 160, 168, 0.55));
    color: #fff;
    margin-bottom: 0.65rem;
}

.mob-assin__titulo {
    margin: 0 0 0.45rem;
    font-size: 1.28rem;
    font-weight: 800;
    line-height: 1.25;
    color: #fff;
}

.mob-assin__destinatario {
    margin: 0 0 0.75rem;
    font-size: 0.88rem;
    color: rgba(255, 255, 255, 0.78);
}

.mob-assin__destinatario strong {
    color: #fff;
    font-weight: 700;
}

.mob-assin__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
}

.mob-assin__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    font-weight: 600;
    padding: 0.35rem 0.6rem;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.9);
}

.mob-assin__accordion {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 0.9rem;
    margin-bottom: 0.5rem;
    border: none;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}

.mob-assin__accordion-icon {
    font-size: 1.25rem;
    transition: transform 0.22s ease;
}

.mob-assin__accordion-icon--open {
    transform: rotate(180deg);
}

.mob-assin__detalhes {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: max-height 0.28s ease, opacity 0.22s ease, margin 0.22s ease;
    margin-bottom: 0;
}

.mob-assin__detalhes--open {
    max-height: 280px;
    opacity: 1;
    margin-bottom: 0.85rem;
}

.mob-assin__detalhe {
    margin: 0 0 0.55rem;
    font-size: 0.84rem;
    line-height: 1.45;
    color: rgba(255, 255, 255, 0.82);
}

.mob-assin__detalhe span {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.15rem;
}

.mob-assin__detalhe--endereco {
    display: flex;
    gap: 0.4rem;
    align-items: flex-start;
    padding: 0.65rem 0.75rem;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.15);
}

.mob-assin__form {
    background: #fff;
    border-radius: 22px 22px 0 0;
    padding: 1.35rem 1.15rem 1rem;
    color: #16254e;
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18);
}

.mob-assin__form-head {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-bottom: 1.15rem;
}

.mob-assin__form-head > svg {
    flex-shrink: 0;
    font-size: 1.5rem;
    color: #5c6bc0;
    margin-top: 0.15rem;
}

.mob-assin__form-head h2 {
    margin: 0 0 0.2rem;
    font-size: 1.1rem;
    font-weight: 800;
    color: #16254e;
}

.mob-assin__form-head p {
    margin: 0;
    font-size: 0.82rem;
    color: #6b7c9f;
    line-height: 1.4;
}

.mob-assin__field {
    display: block;
    margin-bottom: 1rem;
}

.mob-assin__label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #5a6b8a;
    margin-bottom: 0.45rem;
}

.mob-assin__field input {
    width: 100%;
    box-sizing: border-box;
    font-size: 1.05rem;
    font-weight: 600;
    padding: 0.95rem 1rem;
    border-radius: 14px;
    border: 2px solid #e6edf5;
    background: #f8fafc;
    color: #16254e;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    -webkit-appearance: none;
}

.mob-assin__field input::placeholder {
    color: #a8b5c9;
    font-weight: 500;
}

.mob-assin__field input:focus {
    border-color: #5c6bc0;
    box-shadow: 0 0 0 4px rgba(92, 107, 192, 0.12);
    background: #fff;
}

.mob-assin__input--invalid {
    border-color: #e57373 !important;
    background: #fff8f8 !important;
}

.mob-assin__field-erro {
    display: block;
    margin-top: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #c0392b;
}

.mob-assin__field-hint {
    display: block;
    margin-top: 0.35rem;
    font-size: 0.78rem;
    color: #7a8aa8;
}

.mob-assin__alert {
    padding: 0.75rem 0.9rem;
    border-radius: 12px;
    background: #fff0f0;
    border: 1px solid #f5c6c6;
    color: #9e2b2b;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.4;
}

.mob-assin__cta {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    padding: 0.75rem 1rem max(0.85rem, env(safe-area-inset-bottom));
    background: linear-gradient(
        180deg,
        rgba(15, 28, 61, 0) 0%,
        rgba(15, 28, 61, 0.92) 35%,
        rgba(15, 28, 61, 0.98) 100%
    );
    pointer-events: none;
}

.mob-assin__cta-btn {
    pointer-events: auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border: none;
    border-radius: 16px;
    font-size: 1.05rem;
    font-weight: 800;
    color: #fff;
    background: linear-gradient(95deg, #5c6bc0 0%, #3d8f9a 45%, #2da0a8 100%);
    box-shadow: 0 12px 28px rgba(45, 160, 168, 0.35);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.mob-assin__cta-btn:active:not(:disabled) {
    transform: scale(0.98);
}

.mob-assin__cta-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
}

.mob-assin__cta-btn svg {
    font-size: 1.2rem;
}
</style>
