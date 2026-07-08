<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiCheckboxCircleFill,
    RiFileList3Line,
    RiLoader4Line,
    RiMailLine,
    RiMapPinLine,
    RiSearchLine,
    RiShieldCheckLine,
    RiSpeakLine,
    RiTimeLine
} from "@remixicon/vue";
import ParticipacaoStatusBadge from "@/presentation/components/Participacao/ParticipacaoStatusBadge.vue";
import { useParticipacaoConsultaPublica } from "@/presentation/composables/Participacao/useParticipacaoConsultaPublica";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import {
    labelDeOpcao,
    STATUS_PARTICIPACAO_DESCRICAO,
    STATUS_PARTICIPACAO_LABELS,
    STATUS_PARTICIPACAO_ORDEM
} from "@/shared/utils/participacaoLabels";
import logo from "@/presentation/assets/img/logo.jpeg";
import type { ParticipacaoConsultaPublicaItemDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaItemDTO";

const route = useRoute();
const router = useRouter();
const matriz = useMatrizStore();

const {
    opcoes,
    resultados,
    carregando,
    consultou,
    erro,
    carregarOpcoes,
    consultar,
    limpar
} = useParticipacaoConsultaPublica();

const protocolo = ref("");
const email = ref("");
const modo = ref<"protocolo" | "email">("protocolo");

const nomeMarca = computed(
    () => matriz.matriz?.apelido?.trim() || "Agenda Contabilidade"
);

const podeConsultar = computed(() => {
    if (carregando.value) return false;
    if (modo.value === "protocolo") return protocolo.value.trim().length > 0;
    return email.value.trim().length > 0;
});

function statusDescricao(status: string) {
    return STATUS_PARTICIPACAO_DESCRICAO[status] ?? "Status em acompanhamento pela administração.";
}

function etapaAtiva(status: string): number {
    if (status === "nao_atendida") return 2;
    const idx = STATUS_PARTICIPACAO_ORDEM.indexOf(
        status as (typeof STATUS_PARTICIPACAO_ORDEM)[number]
    );
    return idx >= 0 ? idx : 0;
}

function formatarData(valor: string | null) {
    if (!valor) return null;
    const d = new Date(valor.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return valor;
    return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

async function onConsultar() {
    limpar();
    const query: Record<string, string> = {};
    if (modo.value === "protocolo" && protocolo.value.trim()) {
        query.protocolo = protocolo.value.trim().replace(/\D/g, "");
    }
    if (modo.value === "email" && email.value.trim()) {
        query.email = email.value.trim();
    }
    await router.replace({ query });
    await consultar({
        protocolo: modo.value === "protocolo" ? protocolo.value : undefined,
        email: modo.value === "email" ? email.value : undefined
    });
}

function preencherDaQuery() {
    const qProto = route.query.protocolo;
    const qEmail = route.query.email;
    if (typeof qProto === "string" && qProto.trim()) {
        modo.value = "protocolo";
        protocolo.value = qProto.trim();
        return "protocolo" as const;
    }
    if (typeof qEmail === "string" && qEmail.trim()) {
        modo.value = "email";
        email.value = qEmail.trim();
        return "email" as const;
    }
    return null;
}

function labelLocalidade(item: ParticipacaoConsultaPublicaItemDTO) {
    const base = labelDeOpcao(opcoes.value?.localidadeAtendida, item.localidadeAtendida);
    if (item.localidadeDescricao) return `${base} · ${item.localidadeDescricao}`;
    return base;
}

onMounted(async () => {
    await carregarOpcoes();
    const origem = preencherDaQuery();
    if (origem) {
        await consultar({
            protocolo: origem === "protocolo" ? protocolo.value : undefined,
            email: origem === "email" ? email.value : undefined
        });
    }
});

watch(modo, () => {
    erro.value = null;
});
</script>

<template>
    <article class="part-track">
        <div class="part-track__bg" aria-hidden="true">
            <span class="part-track__orb part-track__orb--1" />
            <span class="part-track__orb part-track__orb--2" />
            <span class="part-track__grid" />
        </div>

        <header class="part-track__header">
            <div class="part-track__brand">
                <img :src="logo" alt="" class="part-track__logo" width="48" height="48" />
                <div>
                    <p class="part-track__brand-name">{{ nomeMarca }}</p>
                    <p class="part-track__brand-tag">
                        <RiShieldCheckLine /> Acompanhamento de contribuição
                    </p>
                </div>
            </div>
            <RouterLink
                :to="{ name: 'ParticipacaoPopular' }"
                class="part-track__back"
            >
                <RiArrowLeftLine /> Nova proposta
            </RouterLink>
        </header>

        <div class="part-track__shell">
            <section class="part-track__hero">
                <div class="part-track__eyebrow">
                    <RiSpeakLine /> Participação popular
                </div>
                <h1 class="part-track__title">
                    Acompanhe o status da sua
                    <span>contribuição</span>
                </h1>
                <p class="part-track__lead">
                    Consulte com o número do protocolo ou com o e-mail informado no
                    envio. Sem login — consulta pública e segura.
                </p>
            </section>

            <form class="part-track__form" novalidate @submit.prevent="onConsultar">
                <div class="part-track__tabs" role="tablist" aria-label="Tipo de consulta">
                    <button
                        type="button"
                        role="tab"
                        class="part-track__tab"
                        :class="{ 'part-track__tab--on': modo === 'protocolo' }"
                        :aria-selected="modo === 'protocolo'"
                        @click="modo = 'protocolo'"
                    >
                        <RiFileList3Line /> Protocolo
                    </button>
                    <button
                        type="button"
                        role="tab"
                        class="part-track__tab"
                        :class="{ 'part-track__tab--on': modo === 'email' }"
                        :aria-selected="modo === 'email'"
                        @click="modo = 'email'"
                    >
                        <RiMailLine /> E-mail
                    </button>
                </div>

                <div v-if="modo === 'protocolo'" class="part-track__field">
                    <label for="track-protocolo">Número do protocolo</label>
                    <div class="part-track__input-wrap">
                        <RiSearchLine class="part-track__input-icon" />
                        <input
                            id="track-protocolo"
                            v-model="protocolo"
                            type="text"
                            inputmode="numeric"
                            autocomplete="off"
                            placeholder="Ex.: 15"
                            class="part-track__input"
                        />
                    </div>
                </div>

                <div v-else class="part-track__field">
                    <label for="track-email">E-mail informado no envio</label>
                    <div class="part-track__input-wrap">
                        <RiMailLine class="part-track__input-icon" />
                        <input
                            id="track-email"
                            v-model="email"
                            type="email"
                            autocomplete="email"
                            placeholder="seu@email.com"
                            class="part-track__input"
                        />
                    </div>
                    <p class="part-track__hint">
                        Se você enviou mais de uma proposta com o mesmo e-mail, todas
                        aparecerão abaixo.
                    </p>
                </div>

                <button
                    type="submit"
                    class="part-track__btn"
                    :disabled="!podeConsultar"
                    :aria-busy="carregando"
                >
                    <RiLoader4Line v-if="carregando" class="part-track__spin" />
                    <RiSearchLine v-else />
                    {{ carregando ? "Consultando..." : "Consultar status" }}
                </button>
            </form>

            <div
                v-if="erro && (!consultou || resultados.length === 0)"
                class="part-track__alert"
                role="alert"
            >
                {{ erro }}
            </div>

            <section v-if="resultados.length > 0" class="part-track__results" aria-live="polite">
                <header class="part-track__results-head">
                    <h2>
                        {{ resultados.length === 1 ? "Resultado" : "Resultados" }}
                    </h2>
                    <span class="part-track__count">
                        {{ resultados.length }}
                        {{ resultados.length === 1 ? "contribuição" : "contribuições" }}
                    </span>
                </header>

                <article
                    v-for="item in resultados"
                    :key="item.id"
                    class="part-track__card"
                >
                    <div class="part-track__card-top">
                        <div>
                            <p class="part-track__proto">Protocolo nº {{ item.id }}</p>
                            <p class="part-track__meta">
                                {{ item.instrumento }} {{ item.exercicio }}
                                <template v-if="formatarData(item.registradoEm)">
                                    · registrado em {{ formatarData(item.registradoEm) }}
                                </template>
                            </p>
                        </div>
                        <ParticipacaoStatusBadge :status="item.status" />
                    </div>

                    <!-- Timeline -->
                    <ol
                        class="part-track__timeline"
                        :class="{
                            'part-track__timeline--nao': item.status === 'nao_atendida'
                        }"
                        aria-label="Andamento do protocolo"
                    >
                        <li
                            v-for="(st, i) in STATUS_PARTICIPACAO_ORDEM"
                            :key="st"
                            class="part-track__tl-item"
                            :class="{
                                'part-track__tl-item--done':
                                    item.status === 'nao_atendida'
                                        ? i < 2
                                        : i <= etapaAtiva(item.status),
                                'part-track__tl-item--ativo':
                                    item.status !== 'nao_atendida' &&
                                    i === etapaAtiva(item.status),
                                'part-track__tl-item--final-nao':
                                    item.status === 'nao_atendida' && i === 2
                            }"
                        >
                            <span class="part-track__tl-dot">
                                <RiCheckboxCircleFill
                                    v-if="
                                        item.status !== 'nao_atendida' &&
                                        i < etapaAtiva(item.status)
                                    "
                                />
                                <RiTimeLine
                                    v-else-if="
                                        item.status !== 'nao_atendida' &&
                                        i === etapaAtiva(item.status)
                                    "
                                />
                                <span v-else>{{ i + 1 }}</span>
                            </span>
                            <span class="part-track__tl-label">
                                <template v-if="item.status === 'nao_atendida' && i === 2">
                                    Não atendida
                                </template>
                                <template v-else>
                                    {{ STATUS_PARTICIPACAO_LABELS[st] }}
                                </template>
                            </span>
                        </li>
                    </ol>

                    <p class="part-track__status-desc">
                        {{
                            item.status === "nao_atendida"
                                ? statusDescricao("nao_atendida")
                                : statusDescricao(item.status)
                        }}
                    </p>

                    <div class="part-track__facts">
                        <div class="part-track__fact">
                            <RiMapPinLine />
                            <div>
                                <span class="part-track__fact-k">Localidade</span>
                                <span class="part-track__fact-v">
                                    {{ item.bairroComunidade }}
                                    <small>{{ labelLocalidade(item) }}</small>
                                </span>
                            </div>
                        </div>
                        <div class="part-track__fact">
                            <RiSpeakLine />
                            <div>
                                <span class="part-track__fact-k">Área temática</span>
                                <span class="part-track__fact-v">
                                    <template v-if="item.funcao">
                                        {{ item.funcao.codigo }} — {{ item.funcao.nome }}
                                    </template>
                                    <template v-else>—</template>
                                </span>
                            </div>
                        </div>
                        <div class="part-track__fact">
                            <RiFileList3Line />
                            <div>
                                <span class="part-track__fact-k">Prioridade</span>
                                <span class="part-track__fact-v">
                                    {{
                                        labelDeOpcao(opcoes?.prioridade, item.prioridade)
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div v-if="item.problemaResumo || item.solucaoResumo" class="part-track__resumo">
                        <p v-if="item.problemaResumo">
                            <strong>Problema:</strong> {{ item.problemaResumo }}
                        </p>
                        <p v-if="item.solucaoResumo">
                            <strong>Solução:</strong> {{ item.solucaoResumo }}
                        </p>
                    </div>
                </article>
            </section>

            <section
                v-else-if="consultou && !carregando && resultados.length === 0 && !erro"
                class="part-track__empty"
            >
                <RiSearchLine />
                <p>Nenhuma contribuição encontrada.</p>
            </section>
        </div>

        <footer class="part-track__footer">
            Consulta pública de participação popular · sem necessidade de login
        </footer>
    </article>
</template>

<style scoped>
.part-track {
    --ink: #0f2744;
    --mute: #5a6b7d;
    --accent: #0d6e6e;
    --accent-2: #1b4f8a;
    --surface: rgba(255, 255, 255, 0.9);
    --line: rgba(15, 39, 68, 0.1);
    position: relative;
    isolation: isolate;
    min-height: 100dvh;
    color: var(--ink);
    background: #e8f1f5;
    overflow-x: hidden;
}

.part-track__bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background:
        radial-gradient(1100px 560px at 8% -8%, #c5e6ee 0%, transparent 55%),
        radial-gradient(900px 480px at 100% 0%, #d5e2f6 0%, transparent 50%),
        linear-gradient(180deg, #edf5f8 0%, #e4eef3 50%, #dfe9f0 100%);
}

.part-track__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(42px);
    opacity: 0.5;
    animation: track-float 16s ease-in-out infinite;
}

.part-track__orb--1 {
    width: 260px;
    height: 260px;
    background: #7ec8c8;
    top: 10%;
    left: -70px;
}

.part-track__orb--2 {
    width: 200px;
    height: 200px;
    background: #9bb8e8;
    right: -50px;
    bottom: 20%;
    animation-delay: -5s;
}

.part-track__grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(15, 39, 68, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 39, 68, 0.03) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.3), transparent 75%);
}

@keyframes track-float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(16px);
    }
}

.part-track__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1rem 1.25rem 0.5rem;
    max-width: 820px;
    margin: 0 auto;
    width: 100%;
}

.part-track__brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.part-track__logo {
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 8px 20px rgba(15, 39, 68, 0.12);
}

.part-track__brand-name {
    margin: 0;
    font-weight: 700;
    font-size: 1rem;
}

.part-track__brand-tag {
    margin: 0.15rem 0 0;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: var(--mute);
}

.part-track__brand-tag :deep(svg) {
    width: 0.95rem;
    height: 0.95rem;
    color: var(--accent);
}

.part-track__back {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.86rem;
    font-weight: 700;
    color: var(--accent-2);
    text-decoration: none;
}

.part-track__back :deep(svg) {
    width: 1.1rem;
    height: 1.1rem;
}

.part-track__shell {
    width: min(820px, calc(100% - 1.5rem));
    margin: 0 auto 1.5rem;
    background: var(--surface);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 1.25rem;
    box-shadow:
        0 20px 50px rgba(15, 39, 68, 0.1),
        0 1px 0 rgba(255, 255, 255, 0.8) inset;
    padding: 1.25rem 1.15rem 1.5rem;
}

.part-track__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--accent);
    background: rgba(13, 110, 110, 0.1);
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    margin-bottom: 0.85rem;
}

.part-track__eyebrow :deep(svg) {
    width: 1rem;
    height: 1rem;
}

.part-track__title {
    margin: 0 0 0.65rem;
    font-size: clamp(1.4rem, 4.2vw, 2rem);
    line-height: 1.2;
    letter-spacing: -0.03em;
    font-weight: 700;
}

.part-track__title span {
    color: var(--accent-2);
}

.part-track__lead {
    margin: 0 0 1.25rem;
    color: var(--mute);
    font-size: 0.96rem;
    line-height: 1.55;
}

.part-track__form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    margin-bottom: 1.25rem;
}

.part-track__tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.4rem;
    padding: 0.3rem;
    background: #eef3f8;
    border-radius: 999px;
}

.part-track__tab {
    border: 0;
    background: transparent;
    border-radius: 999px;
    padding: 0.65rem 0.75rem;
    font: inherit;
    font-weight: 700;
    font-size: 0.88rem;
    color: var(--mute);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    cursor: pointer;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        box-shadow 0.2s ease;
}

.part-track__tab :deep(svg) {
    width: 1.05rem;
    height: 1.05rem;
}

.part-track__tab--on {
    background: #fff;
    color: var(--ink);
    box-shadow: 0 6px 16px rgba(15, 39, 68, 0.08);
}

.part-track__field label {
    display: block;
    font-size: 0.86rem;
    font-weight: 600;
    margin-bottom: 0.35rem;
}

.part-track__input-wrap {
    position: relative;
}

.part-track__input-icon {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.1rem;
    height: 1.1rem;
    color: #6b7d9c;
    pointer-events: none;
}

.part-track__input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 0.9rem;
    padding: 0.85rem 0.95rem 0.85rem 2.6rem;
    font: inherit;
    background: #fff;
    color: var(--ink);
}

.part-track__input:focus {
    outline: none;
    border-color: rgba(13, 110, 110, 0.55);
    box-shadow: 0 0 0 4px rgba(13, 110, 110, 0.12);
}

.part-track__hint {
    margin: 0.4rem 0 0;
    font-size: 0.78rem;
    color: var(--mute);
    line-height: 1.4;
}

.part-track__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: 0;
    border-radius: 999px;
    padding: 0.9rem 1.2rem;
    font: inherit;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(135deg, var(--accent), #127a7a 40%, var(--accent-2));
    box-shadow: 0 12px 24px rgba(27, 79, 138, 0.22);
    transition: transform 0.15s ease;
}

.part-track__btn:hover:not(:disabled) {
    transform: translateY(-1px);
}

.part-track__btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.part-track__btn :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
}

.part-track__spin {
    animation: track-spin 0.9s linear infinite;
}

@keyframes track-spin {
    to {
        transform: rotate(360deg);
    }
}

.part-track__alert {
    padding: 0.85rem 1rem;
    border-radius: 0.9rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    background: #fde8e8;
    color: #b42318;
    border: 1px solid #f3b4b0;
}

.part-track__results-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
}

.part-track__results-head h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
}

.part-track__count {
    font-size: 0.75rem;
    font-weight: 700;
    color: #2d6a9f;
    background: #eef3ff;
    border: 1px solid #d8e2ff;
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
}

.part-track__card {
    border: 1px solid var(--line);
    border-radius: 1.1rem;
    padding: 1.1rem 1rem 1.15rem;
    background: linear-gradient(180deg, #fff 0%, #f8fbfd 100%);
    margin-bottom: 0.85rem;
    animation: track-in 0.35s ease;
}

@keyframes track-in {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.part-track__card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.part-track__proto {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.part-track__meta {
    margin: 0.2rem 0 0;
    font-size: 0.82rem;
    color: var(--mute);
}

.part-track__timeline {
    list-style: none;
    margin: 0 0 0.9rem;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.35rem;
    position: relative;
}

.part-track__tl-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    text-align: center;
    opacity: 0.4;
    position: relative;
}

.part-track__tl-item--done,
.part-track__tl-item--ativo,
.part-track__tl-item--final-nao {
    opacity: 1;
}

.part-track__tl-dot {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #d9e4ee;
    color: var(--ink);
    font-size: 0.75rem;
    font-weight: 800;
    z-index: 1;
}

.part-track__tl-dot :deep(svg) {
    width: 1.1rem;
    height: 1.1rem;
}

.part-track__tl-item--done .part-track__tl-dot {
    background: #0f6b3a;
    color: #fff;
}

.part-track__tl-item--ativo .part-track__tl-dot {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 6px 14px rgba(13, 110, 110, 0.35);
}

.part-track__tl-item--final-nao .part-track__tl-dot {
    background: #b42318;
    color: #fff;
}

.part-track__tl-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--mute);
    line-height: 1.25;
}

.part-track__status-desc {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: var(--mute);
    line-height: 1.5;
    padding: 0.75rem 0.85rem;
    border-radius: 0.85rem;
    background: #f3f7fb;
}

.part-track__facts {
    display: grid;
    gap: 0.65rem;
}

.part-track__fact {
    display: flex;
    gap: 0.65rem;
    align-items: flex-start;
}

.part-track__fact > :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
    color: var(--accent);
    margin-top: 0.15rem;
    flex-shrink: 0;
}

.part-track__fact-k {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #6b7d9c;
    font-weight: 700;
}

.part-track__fact-v {
    display: block;
    font-size: 0.92rem;
    font-weight: 600;
    margin-top: 0.1rem;
}

.part-track__fact-v small {
    display: block;
    font-weight: 500;
    color: var(--mute);
    font-size: 0.8rem;
    margin-top: 0.1rem;
}

.part-track__resumo {
    margin-top: 0.9rem;
    padding-top: 0.85rem;
    border-top: 1px dashed var(--line);
    font-size: 0.88rem;
    color: var(--mute);
    line-height: 1.5;
}

.part-track__resumo p {
    margin: 0 0 0.45rem;
}

.part-track__resumo p:last-child {
    margin-bottom: 0;
}

.part-track__empty {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--mute);
}

.part-track__empty :deep(svg) {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

.part-track__footer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--mute);
    padding: 0 1rem 1.5rem;
}

@media (min-width: 640px) {
    .part-track__shell {
        padding: 1.75rem 1.85rem 1.9rem;
    }

    .part-track__facts {
        grid-template-columns: repeat(3, 1fr);
    }

    .part-track__tl-label {
        font-size: 0.78rem;
    }
}

@media (max-width: 420px) {
    .part-track__header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
