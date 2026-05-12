<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
const titulo = computed(
    () => (route.meta.tituloCliente as string) ?? 'Área do cliente'
);
const isRotaAdmin = computed(() => route.path.startsWith('/admin'));
</script>

<template>
  <article class="area">
    <div class="area__card">
      <h1>{{ titulo }}</h1>
      <p class="area__hint">
        Conteúdo desta seção será integrado ao backend em breve.
      </p>
      <div class="area__acoes">
        <RouterLink
          v-if="!isRotaAdmin"
          to="/cliente"
          class="btn btn-outline-primary btn-sm"
        >
          Área do cliente
        </RouterLink>
        <RouterLink
          v-else
          to="/admin"
          class="btn btn-outline-primary btn-sm"
        >
          Área administrativa
        </RouterLink>
        <RouterLink to="/" class="btn btn-primary btn-sm">Início</RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.area {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.area__card {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(20, 30, 40, 0.08);
  padding: 1.75rem;
  box-shadow: 0 12px 28px rgba(20, 30, 40, 0.06);
}

.area__card h1 {
  font-size: 1.35rem;
  font-weight: 800;
  color: #16254e;
  margin: 0 0 0.75rem;
}

.area__hint {
  font-size: 0.9rem;
  color: #6c7a94;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.area__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.25rem;
}

.btn-primary {
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 10px 16px !important;
  font-weight: 700;
}

.btn-outline-primary {
  border: 2px solid #5c6bc0 !important;
  color: #5c6bc0 !important;
  border-radius: 12px !important;
  padding: 10px 16px !important;
  font-weight: 700;
}
</style>
