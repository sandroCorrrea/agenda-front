<script setup lang="ts">
import { computed } from "vue";
import { STATUS_PARTICIPACAO_LABELS } from "@/shared/utils/participacaoLabels";

const props = defineProps<{
    status: string;
}>();

const label = computed(
    () => STATUS_PARTICIPACAO_LABELS[props.status] ?? props.status
);

const classe = computed(() => {
    switch (props.status) {
        case "atendida":
            return "part-badge--ok";
        case "nao_atendida":
            return "part-badge--nao";
        case "em_analise":
            return "part-badge--analise";
        default:
            return "part-badge--pendente";
    }
});
</script>

<template>
    <span class="part-badge" :class="classe">{{ label }}</span>
</template>

<style scoped>
.part-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    line-height: 1.4;
}

.part-badge--pendente {
    background: #fff4e5;
    color: #9a5b00;
}

.part-badge--analise {
    background: #e8f0fe;
    color: #1a56c4;
}

.part-badge--ok {
    background: #e6f6ed;
    color: #0f6b3a;
}

.part-badge--nao {
    background: #fde8e8;
    color: #b42318;
}
</style>
