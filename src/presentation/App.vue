<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './components/Layout/Navbar.vue';
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
  padding-top: var(--header-height); /* evita conteúdo escondido atrás do header fixo */
  min-height: calc(100vh - var(--header-height));
}

/* Wrapper padrão para todas as páginas: padroniza espaçamento interno e centraliza o conteúdo */
.page-wrapper {
  padding: 1.5rem; /* espaçamento interno padrão entre navbar e conteúdo */
  box-sizing: border-box;
  max-width: 1200px;
  margin: 0 auto;
}

/* Força que o primeiro elemento interno não tenha margem superior diferente */
.page-wrapper > * {
  margin-top: 0 !important;
  padding-top: 0 !important;
}
</style>