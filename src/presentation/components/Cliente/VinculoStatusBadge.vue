<script setup lang="ts">
import type { EmpresaVinculoStatus } from "@/domain/types/EmpresaVinculoStatus";

defineProps<{
    status: EmpresaVinculoStatus;
}>();

const mapa: Record<
    EmpresaVinculoStatus,
    { label: string; classe: string }
> = {
    pendente: {
        label: "Em análise",
        classe: "vinculo-badge--pendente"
    },
    aprovado: {
        label: "Vinculado",
        classe: "vinculo-badge--aprovado"
    },
    rejeitado: {
        label: "Rejeitado",
        classe: "vinculo-badge--rejeitado"
    }
};
</script>

<template>
    <span class="vinculo-badge" :class="mapa[status].classe">
        {{ mapa[status].label }}
    </span>
</template>

<style scoped>
.vinculo-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.72rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
}

.vinculo-badge--pendente {
    background: rgba(255, 193, 7, 0.18);
    color: #9a6b00;
    border: 1px solid rgba(255, 193, 7, 0.45);
}

.vinculo-badge--aprovado {
    background: rgba(45, 160, 168, 0.14);
    color: #1a6b72;
    border: 1px solid rgba(45, 160, 168, 0.4);
}

.vinculo-badge--rejeitado {
    background: rgba(220, 53, 69, 0.1);
    color: #a52834;
    border: 1px solid rgba(220, 53, 69, 0.35);
}
</style>
