<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Navbar from './components/Layout/Navbar.vue';
import Footer from './components/Layout/Footer.vue';
import FooterAdministrador from './components/Layout/FooterAdministrador.vue';
import { useMatrizStore } from './store/useMatrizStore';
import { useAuthStore } from './store/useAuthStore';
import { TipoUsuario } from '@/domain/types/TipoUsuario';
import type { IMatrizRepository } from '@/domain/repositories/IMatrizRepository';

const repo = inject<IMatrizRepository>('IMatrizRepository');
const matrizStore = useMatrizStore();
const route = useRoute();
const auth = useAuthStore();

/** Rodapé do painel em rotas administrativas (/admin e telas com meta de administrador). */
const mostrarFooterAdministrador = computed(() => {
  if (!auth.estaAutenticado || auth.usuario?.tipo_usuario !== TipoUsuario.ADMINISTRADOR) {
    return false;
  }
  if (route.path.startsWith('/admin')) {
    return true;
  }
  return route.meta.perfilPermitido === TipoUsuario.ADMINISTRADOR;
});

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
    <FooterAdministrador v-if="mostrarFooterAdministrador" />
    <Footer v-else />
  </div>
</template>

<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  padding-top: var(--header-height);
  flex: 1;
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