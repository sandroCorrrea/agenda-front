<script setup lang="ts">
defineProps<{
    title: string;
    subtitle?: string;
}>();
</script>

<template>
    <div class="admin-page-hero mb-4">
        <div class="admin-page-hero__icon">
            <slot name="icon" />
        </div>
        <div class="admin-page-hero__text">
            <h1 class="admin-page-hero__title">{{ title }}</h1>
            <p v-if="subtitle" class="admin-page-hero__sub">{{ subtitle }}</p>
        </div>
        <div v-if="$slots.actions" class="admin-page-hero__actions">
            <slot name="actions" />
        </div>
    </div>
</template>

<style scoped>
.admin-page-hero {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    padding: 1.25rem;
    border-radius: 16px;
    background: linear-gradient(120deg, #1f2e54, #2d4a84 60%, #2da0a8);
    color: #fff;
}

.admin-page-hero__icon {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.16);
    font-size: 1.4rem;
    flex-shrink: 0;
}

.admin-page-hero__text {
    flex: 1;
    min-width: 200px;
}

.admin-page-hero__title {
    margin: 0;
    font-size: 1.9rem;
    font-weight: 800;
}

.admin-page-hero__sub {
    margin: 0.3rem 0 0;
    opacity: 0.9;
    line-height: 1.45;
}

.admin-page-hero__actions {
    margin-left: auto;
    flex-shrink: 0;
}

.admin-page-hero__actions :deep(.btn) {
    border: none !important;
    background: #fff !important;
    color: #1c3359 !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
}

.admin-page-hero__actions :deep(.btn:hover) {
    background: #f0f4ff !important;
    color: #152a4a !important;
}
</style>
