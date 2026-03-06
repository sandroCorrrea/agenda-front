<script setup lang="ts">
defineProps({
    text: {
        type: String,
        default: 'Carregando...'
    }
})
</script>

<template>
    <div class="loading-container">
        <div class="spinner-border loading-spinner" role="status"></div>
        <p class="loading-text">{{ text }}</p>
    </div>
</template>

<style scoped>
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    gap: 1rem;
}

.loading-spinner {
    width: 3rem;
    height: 3rem;
    color: #5c6bc0;
}

.loading-text {
    font-size: 0.95rem;
    color: #64748b;
}
</style>