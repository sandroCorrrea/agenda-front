<script setup lang="ts">
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/vue";

defineProps<{
    pagina: number;
    totalPaginas: number;
    total: number;
}>();

const emit = defineEmits<{
    ir: [pagina: number];
}>();
</script>

<template>
    <div v-if="total > 0" class="pol-pag mt-3">
        <span class="text-muted small">Página {{ pagina }} de {{ totalPaginas }} · {{ total }} registro(s)</span>
        <button type="button" :disabled="pagina <= 1" aria-label="Página anterior" @click="emit('ir', pagina - 1)">
            <RiArrowLeftSLine />
        </button>
        <button
            type="button"
            :disabled="pagina >= totalPaginas"
            aria-label="Próxima página"
            @click="emit('ir', pagina + 1)"
        >
            <RiArrowRightSLine />
        </button>
    </div>
</template>
