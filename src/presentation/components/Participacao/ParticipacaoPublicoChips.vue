<script setup lang="ts">
import { computed } from "vue";
import type { ParticipacaoValueLabelDTO } from "@/application/dto/Participacao/ParticipacaoValueLabelDTO";
import {
    labelPublicoBeneficiado,
    normalizarPublicoBeneficiado
} from "@/shared/utils/participacaoLabels";

const props = withDefaults(
    defineProps<{
        values: string | string[] | null | undefined;
        opcoes?: ParticipacaoValueLabelDTO[];
        /** Visual mais compacto (listagens). */
        compacto?: boolean;
    }>(),
    {
        opcoes: undefined,
        compacto: false
    }
);

const items = computed(() =>
    normalizarPublicoBeneficiado(props.values).map((value) => ({
        value,
        label: labelPublicoBeneficiado(value, props.opcoes)
    }))
);
</script>

<template>
    <div
        v-if="items.length > 0"
        class="pub-chips"
        :class="{ 'pub-chips--compacto': compacto }"
        role="list"
        aria-label="Público beneficiado"
    >
        <span
            v-for="item in items"
            :key="item.value"
            class="pub-chips__item"
            role="listitem"
        >
            {{ item.label }}
        </span>
    </div>
    <span v-else class="pub-chips__empty">—</span>
</template>

<style scoped>
.pub-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.pub-chips__item {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 0.28rem 0.7rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 0.01em;
    color: #1f3a6e;
    background: linear-gradient(180deg, #f3f7ff 0%, #eaf0fc 100%);
    border: 1px solid #d4dff5;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset;
}

.pub-chips--compacto .pub-chips__item {
    padding: 0.18rem 0.55rem;
    font-size: 0.72rem;
}

.pub-chips__empty {
    color: #6b7d9c;
    font-weight: 600;
}
</style>
