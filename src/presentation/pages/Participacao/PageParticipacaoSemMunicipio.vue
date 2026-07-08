<script setup lang="ts">
import { RouterLink } from "vue-router";
import { RiHomeLine, RiMapPinLine, RiSpeakLine } from "@remixicon/vue";
import logo from "@/presentation/assets/img/logo.jpeg";
</script>

<template>
    <article class="part-sem">
        <div class="part-sem__bg" aria-hidden="true" />

        <header class="part-sem__header">
            <img :src="logo" alt="" class="part-sem__logo" width="48" height="48" />
            <p class="part-sem__brand">Participação popular</p>
        </header>

        <section class="part-sem__card">
            <RiMapPinLine class="part-sem__icon" />
            <h1>Link do município necessário</h1>
            <p>
                O formulário de participação popular agora é acessado por um
                <strong>link exclusivo de cada município</strong>, fornecido pela prefeitura.
            </p>
            <p class="part-sem__hint">
                Se você recebeu um endereço da sua cidade, abra-o diretamente no navegador.
                O formato é semelhante a:
                <code>/participacao/…</code>
            </p>

            <div class="part-sem__acoes">
                <RouterLink :to="{ name: 'ParticipacaoConsulta' }" class="part-sem__btn part-sem__btn--primary">
                    <RiSpeakLine />
                    Acompanhar protocolo
                </RouterLink>
                <RouterLink to="/" class="part-sem__btn part-sem__btn--ghost">
                    <RiHomeLine />
                    Página inicial
                </RouterLink>
            </div>
        </section>
    </article>
</template>

<style scoped>
.part-sem {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 1rem 2rem;
    position: relative;
    background: #f4f8fc;
}

.part-sem__bg {
    position: absolute;
    inset: 0;
    background:
        radial-gradient(circle at 15% 10%, rgba(92, 107, 192, 0.12), transparent 45%),
        radial-gradient(circle at 85% 90%, rgba(45, 160, 168, 0.14), transparent 40%);
    pointer-events: none;
}

.part-sem__header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.part-sem__logo {
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(20, 30, 40, 0.12);
}

.part-sem__brand {
    margin: 0;
    font-weight: 800;
    color: #16254e;
}

.part-sem__card {
    position: relative;
    width: min(520px, 100%);
    padding: 2rem 1.5rem;
    border-radius: 22px;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.08);
    box-shadow: 0 16px 36px rgba(20, 30, 40, 0.08);
    text-align: center;
}

.part-sem__icon {
    font-size: 2.5rem;
    color: #2da0a8;
    margin-bottom: 0.75rem;
}

.part-sem__card h1 {
    margin: 0 0 0.75rem;
    font-size: 1.45rem;
    font-weight: 800;
    color: #16254e;
}

.part-sem__card p {
    margin: 0 0 0.75rem;
    color: #5a6d8f;
    line-height: 1.55;
}

.part-sem__hint {
    font-size: 0.9rem;
}

.part-sem__hint code {
    display: inline-block;
    margin-top: 0.35rem;
    padding: 0.15rem 0.45rem;
    border-radius: 6px;
    background: #eef4fb;
    color: #2b4068;
    font-size: 0.82rem;
}

.part-sem__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    justify-content: center;
    margin-top: 1.25rem;
}

.part-sem__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.9rem;
    text-decoration: none;
}

.part-sem__btn--primary {
    color: #fff;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.part-sem__btn--ghost {
    color: #4a5b78;
    background: #eef2f9;
}
</style>
