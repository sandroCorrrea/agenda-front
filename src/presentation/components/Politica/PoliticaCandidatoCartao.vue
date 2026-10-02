<script setup lang="ts">
defineProps<{
    numero: string;
    nomeUrna: string;
    nome?: string;
    partido?: string;
    cargo?: string;
    uf?: string;
    detalhe?: string;
}>();
</script>

<template>
    <article class="pol-urna-card">
        <span class="pol-urna-card__num">{{ numero || "—" }}</span>
        <div class="pol-urna-card__corpo">
            <strong>{{ nomeUrna || "Nome de urna" }}</strong>
            <small>{{ [partido, cargo, uf].filter(Boolean).join(" · ") || "Partido, cargo e UF" }}</small>
            <span v-if="nome && nome !== nomeUrna">{{ nome }}</span>
            <span v-if="detalhe">{{ detalhe }}</span>
        </div>
    </article>
</template>
