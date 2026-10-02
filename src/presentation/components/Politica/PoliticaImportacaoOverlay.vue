<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId } from "vue";

defineProps<{
    titulo: string;
    mensagem: string;
    arquivo?: string | null;
}>();

const tituloId = useId();
const mensagemId = useId();
const painel = ref<HTMLElement | null>(null);
let origem: HTMLElement | null = null;
let overflowAnterior = "";

function aoTecla(evento: KeyboardEvent) {
    if (evento.key === "Escape" || evento.key === "Tab") {
        evento.preventDefault();
        painel.value?.focus();
    }
}

onMounted(() => {
    origem = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", aoTecla);
    painel.value?.focus();
});

onUnmounted(() => {
    document.removeEventListener("keydown", aoTecla);
    document.body.style.overflow = overflowAnterior;
    origem?.focus();
});
</script>

<template>
    <div class="pol-modal">
        <div class="pol-modal__backdrop" />
        <div
            ref="painel"
            class="pol-modal__panel pol-csv"
            role="dialog"
            aria-modal="true"
            aria-busy="true"
            tabindex="-1"
            :aria-labelledby="tituloId"
            :aria-describedby="mensagemId"
        >
            <div class="pol-csv__folha" aria-hidden="true">
                <span class="pol-csv__varredor" />
                <span class="pol-csv__linha" />
                <span class="pol-csv__linha" />
                <span class="pol-csv__linha" />
                <span class="pol-csv__linha" />
                <span class="pol-csv__linha" />
            </div>
            <h2 :id="tituloId" class="pol-csv__titulo">{{ titulo }}</h2>
            <p :id="mensagemId" class="pol-csv__mensagem" role="status">{{ mensagem }}</p>
            <p v-if="arquivo" class="pol-csv__nome">{{ arquivo }}</p>
            <div class="pol-csv__trilho" aria-hidden="true"><span /></div>
        </div>
    </div>
</template>
