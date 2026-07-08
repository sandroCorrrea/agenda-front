<script setup lang="ts">
import { computed, inject, onMounted, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import Navbar from './components/Layout/Navbar.vue';
import Footer from './components/Layout/Footer.vue';
import FooterAdministrador from './components/Layout/FooterAdministrador.vue';
import AdminVinculosPendentesBanner from './components/Admin/AdminVinculosPendentesBanner.vue';
import { useMatrizStore } from './store/useMatrizStore';
import { useAuthStore } from './store/useAuthStore';
import { TipoUsuario } from '@/domain/types/TipoUsuario';
import { canAccessPainelContabilidade } from '@/shared/utils/adminPermissions';
import type { IMatrizRepository } from '@/domain/repositories/IMatrizRepository';
import { useLayoutMinimo } from '@/presentation/composables/useLayoutMinimo';

const repo = inject<IMatrizRepository>('IMatrizRepository');
const matrizStore = useMatrizStore();
const route = useRoute();
const auth = useAuthStore();
const layoutMinimo = useLayoutMinimo();

/** Rodapé do painel em rotas administrativas (/admin e telas com meta de administrador). */
const mostrarFooterAdministrador = computed(() => {
  if (layoutMinimo.value) return false;
  if (!auth.estaAutenticado || auth.usuario?.tipo_usuario !== TipoUsuario.ADMINISTRADOR) {
    return false;
  }
  if (route.path.startsWith('/admin')) {
    return true;
  }
  return route.meta.perfilPermitido === TipoUsuario.ADMINISTRADOR;
});

/** Banner de vinculações pendentes em telas administrativas da contabilidade. */
const mostrarBannerVinculosPendentes = computed(() => {
  if (layoutMinimo.value) return false;
  if (!auth.estaAutenticado || auth.usuario?.tipo_usuario !== TipoUsuario.ADMINISTRADOR) {
    return false;
  }
  if (!canAccessPainelContabilidade(auth.usuario)) return false;
  if (route.path.startsWith('/admin')) return true;
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
  <div class="app" :class="{ 'app--layout-minimo': layoutMinimo }">
    <Navbar v-if="!layoutMinimo" />
    <AdminVinculosPendentesBanner v-if="mostrarBannerVinculosPendentes" />
    <main
      class="main-content"
      :class="{ 'main-content--layout-minimo': layoutMinimo }"
    >
      <div
        class="page-wrapper"
        :class="{ 'page-wrapper--layout-minimo': layoutMinimo }"
      >
        <RouterView />
      </div>
    </main>
    <FooterAdministrador v-if="mostrarFooterAdministrador" />
    <Footer v-else-if="!layoutMinimo" />
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

.app--layout-minimo {
  min-height: 100dvh;
}

.main-content--layout-minimo {
  padding-top: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-wrapper--layout-minimo {
  padding: 0;
  max-width: none;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.page-wrapper--layout-minimo > * {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}
</style>