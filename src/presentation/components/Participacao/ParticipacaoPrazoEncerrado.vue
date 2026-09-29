<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import {
    RiCheckboxCircleFill,
    RiFileSearchLine,
    RiHourglassLine,
    RiLockLine,
    RiMapPin2Line
} from "@remixicon/vue";
import { mensagemPrazoEncerrado } from "@/shared/utils/participacaoLabels";

const props = defineProps<{
    localidade?: string | null;
    uf?: string | null;
    mensagem?: string | null;
    exercicio?: number | null;
}>();

const tituloMunicipio = computed(() => {
    const localidade = props.localidade?.trim();
    const uf = props.uf?.trim();
    if (!localidade) return null;
    return uf ? `${localidade}/${uf}` : localidade;
});

const texto = computed(() => mensagemPrazoEncerrado(props.mensagem));
</script>

<template>
    <section class="part-prazo" aria-live="polite">
        <div class="part-prazo__seal" aria-hidden="true">
            <span class="part-prazo__ring" />
            <RiHourglassLine class="part-prazo__seal-icon" />
        </div>

        <p class="part-prazo__eyebrow">
            <RiLockLine />
            Recebimento encerrado
        </p>

        <h1 class="part-prazo__title">O prazo deste município expirou</h1>

        <p v-if="tituloMunicipio" class="part-prazo__municipio">
            <RiMapPin2Line />
            <span>
                {{ tituloMunicipio }}
                <small v-if="exercicio"> · LOA {{ exercicio }}</small>
            </span>
        </p>

        <blockquote class="part-prazo__msg">
            {{ texto }}
        </blockquote>

        <ul class="part-prazo__status" aria-label="O que ainda é possível fazer">
            <li class="part-prazo__status-item part-prazo__status-item--off">
                <RiLockLine />
                <div>
                    <strong>Novas propostas</strong>
                    <span>O formulário não recebe mais envios.</span>
                </div>
            </li>
            <li class="part-prazo__status-item part-prazo__status-item--on">
                <RiCheckboxCircleFill />
                <div>
                    <strong>Consulta de status</strong>
                    <span>Protocolos já enviados continuam disponíveis.</span>
                </div>
            </li>
        </ul>

        <div class="part-prazo__cta">
            <RouterLink
                :to="{ name: 'ParticipacaoConsulta' }"
                class="part-prazo__btn"
            >
                <RiFileSearchLine />
                Consultar status da pesquisa
            </RouterLink>
        </div>
    </section>
</template>

<style scoped>
.part-prazo {
    --prazo-ink: #0f2744;
    --prazo-mute: #5a6b7d;
    --prazo-accent: #0d6e6e;
    --prazo-warm: #b45309;
    position: relative;
    text-align: center;
    padding: 1.35rem 0.35rem 0.4rem;
    animation: part-prazo-in 0.45s ease;
}

.part-prazo__seal {
    position: relative;
    width: 5.25rem;
    height: 5.25rem;
    margin: 0 auto 1.1rem;
    display: grid;
    place-items: center;
}

.part-prazo__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
        radial-gradient(circle at 35% 30%, #fff7ed 0%, #ffedd5 42%, #fdba74 100%);
    box-shadow:
        0 16px 32px rgba(180, 83, 9, 0.18),
        0 0 0 8px rgba(253, 186, 116, 0.18);
}

.part-prazo__ring::after {
    content: "";
    position: absolute;
    inset: 8px;
    border-radius: inherit;
    border: 1.5px dashed rgba(180, 83, 9, 0.35);
}

.part-prazo__seal-icon {
    position: relative;
    width: 2.15rem;
    height: 2.15rem;
    color: var(--prazo-warm);
}

.part-prazo__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0 0 0.7rem;
    padding: 0.32rem 0.75rem;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--prazo-warm);
    background: rgba(180, 83, 9, 0.1);
}

.part-prazo__eyebrow :deep(svg) {
    width: 0.95rem;
    height: 0.95rem;
}

.part-prazo__title {
    margin: 0 0 0.65rem;
    font-size: clamp(1.4rem, 4.2vw, 2rem);
    line-height: 1.2;
    letter-spacing: -0.03em;
    font-weight: 800;
    color: var(--prazo-ink);
}

.part-prazo__municipio {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    margin: 0 0 1.1rem;
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--prazo-accent);
}

.part-prazo__municipio :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
    flex-shrink: 0;
}

.part-prazo__municipio small {
    font-weight: 600;
    color: var(--prazo-mute);
}

.part-prazo__msg {
    margin: 0 auto 1.25rem;
    max-width: 38rem;
    padding: 1rem 1.1rem;
    border-radius: 1.1rem;
    text-align: left;
    font-size: 0.98rem;
    line-height: 1.6;
    color: var(--prazo-ink);
    background: linear-gradient(165deg, #fff8f1, #f4f8fb);
    border: 1px solid rgba(180, 83, 9, 0.16);
    box-shadow: inset 3px 0 0 var(--prazo-warm);
}

.part-prazo__status {
    list-style: none;
    margin: 0 auto 1.35rem;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.65rem;
    max-width: 38rem;
    text-align: left;
}

.part-prazo__status-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.9rem 1rem;
    border-radius: 1rem;
    border: 1px solid rgba(15, 39, 68, 0.08);
    background: #fff;
}

.part-prazo__status-item :deep(svg) {
    width: 1.35rem;
    height: 1.35rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.part-prazo__status-item strong {
    display: block;
    font-size: 0.92rem;
    margin-bottom: 0.15rem;
}

.part-prazo__status-item span {
    display: block;
    font-size: 0.82rem;
    line-height: 1.45;
    color: var(--prazo-mute);
}

.part-prazo__status-item--off {
    color: #9a3412;
    background: #fff7ed;
    border-color: rgba(180, 83, 9, 0.18);
}

.part-prazo__status-item--on {
    color: #0f6b3a;
    background: #f0fdf6;
    border-color: rgba(15, 107, 58, 0.16);
}

.part-prazo__cta {
    display: flex;
    justify-content: center;
}

.part-prazo__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 3rem;
    padding: 0.85rem 1.35rem;
    border-radius: 999px;
    text-decoration: none;
    font-weight: 800;
    color: #fff;
    background: linear-gradient(135deg, #0d6e6e, #127a7a 40%, #1b4f8a);
    box-shadow: 0 12px 24px rgba(27, 79, 138, 0.22);
    transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.part-prazo__btn:hover {
    transform: translateY(-1px);
    color: #fff;
}

.part-prazo__btn :deep(svg) {
    width: 1.2rem;
    height: 1.2rem;
}

@keyframes part-prazo-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

@media (min-width: 640px) {
    .part-prazo {
        padding: 1.6rem 0.75rem 0.5rem;
    }

    .part-prazo__status {
        grid-template-columns: 1fr 1fr;
    }

    .part-prazo__msg {
        padding: 1.15rem 1.35rem;
        font-size: 1.02rem;
    }
}

@media (max-width: 420px) {
    .part-prazo__btn {
        width: 100%;
    }

    .part-prazo__msg {
        font-size: 0.92rem;
    }
}
</style>
