<script setup lang="ts">
import { RouterLink } from "vue-router";
import { RiArrowLeftLine, RiLinkM, RiMapPinLine } from "@remixicon/vue";
import ParticipacaoFormularioLinkCard from "@/presentation/components/Participacao/ParticipacaoFormularioLinkCard.vue";
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <header class="part-link-page__hero mb-4">
                <RouterLink
                    :to="{ name: 'AdministradorParticipacao' }"
                    class="part-link-page__back"
                >
                    <RiArrowLeftLine />
                    Voltar às contribuições
                </RouterLink>
                <div class="part-link-page__hero-inner">
                    <span class="part-link-page__eyebrow">
                        <RiLinkM />
                        Distribuição do formulário
                    </span>
                    <h1 class="part-link-page__title">Link público do município</h1>
                    <p class="part-link-page__subtitle">
                        Compartilhe o endereço exclusivo com a população. Cada envio será
                        automaticamente associado ao IBGE do seu cadastro.
                    </p>
                </div>
            </header>

            <ParticipacaoFormularioLinkCard />
        </div>
    </article>
</template>

<style scoped>
.part-link-page__hero {
    position: relative;
}

.part-link-page__back {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-bottom: 0.85rem;
    color: #4a5b78;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 700;
}

.part-link-page__back:hover {
    color: #2da0a8;
}

.part-link-page__hero-inner {
    padding: 1.25rem 1.35rem;
    border-radius: 18px;
    background: linear-gradient(120deg, rgba(92, 107, 192, 0.08), rgba(45, 160, 168, 0.1));
    border: 1px solid rgba(20, 30, 40, 0.08);
}

.part-link-page__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #2da0a8;
}

.part-link-page__title {
    margin: 0.45rem 0 0.35rem;
    font-size: clamp(1.45rem, 3vw, 1.9rem);
    font-weight: 800;
    color: #16254e;
}

.part-link-page__subtitle {
    margin: 0;
    max-width: 58ch;
    color: #5a6d8f;
    line-height: 1.55;
}
</style>
