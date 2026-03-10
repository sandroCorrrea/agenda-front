<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Layout/Navbar.vue';
import { onMounted, inject, watch } from 'vue';
import { useMatrizStore } from './store/useMatrizStore';
import type { IMatrizRepository } from '@/domain/repositories/IMatrizRepository';

const repo = inject<IMatrizRepository>('IMatrizRepository');
const matrizStore = useMatrizStore();

onMounted(() => {
  if (!repo) throw new Error('IMatrizRepository not found');
  matrizStore.load(repo);
});

watch(
  () => matrizStore.matriz,
  (matriz) => {
    if (matriz) {
      document.title = matriz.apelido;
    }
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div class="app">
    <Navbar />
    <main class="main-content">
      <div class="page-wrapper">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
.main-content {
  padding-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
}
.page-wrapper {
  padding: 1.5rem;
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
}

.page-wrapper > * {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
</style>