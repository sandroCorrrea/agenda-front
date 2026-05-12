<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/presentation/store/useAuthStore';

const auth = useAuthStore();
</script>

<template>
  <article class="area">
    <div class="area__card">
      <span class="area__badge">Portal do Cliente</span>
      <h1>Área do cliente</h1>
      <p v-if="auth.usuario">
        Bem-vindo. Perfil: <strong>{{ auth.usuario.tipo_usuario }}</strong>
      </p>
      <p class="area__hint">
        Esta é uma área inicial. Você pode evoluir esta rota com menus e funcionalidades do portal.
      </p>
      <div class="area__acoes">
        <RouterLink to="/" class="btn btn-outline-primary btn-sm">Home</RouterLink>
        <RouterLink to="/servico" class="btn btn-primary btn-sm">Serviços</RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.area {
  min-height: 62vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.4rem 0.9rem;
  background: linear-gradient(180deg, #f4f7ff 0%, #eef3fb 100%);
}

.area__card {
  width: 100%;
  max-width: 620px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid rgba(20, 30, 40, 0.09);
  padding: 1.8rem;
  box-shadow: 0 18px 34px rgba(20, 30, 40, 0.08);
}

.area__badge {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(77, 141, 255, 0.12);
  border: 1px solid rgba(150, 186, 255, 0.28);
  color: #20458b;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  margin-bottom: 0.65rem;
}

.area__card h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #16254e;
  margin: 0 0 0.85rem;
}

.area__card p {
  color: #4a5b78;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.area__hint {
  font-size: 0.95rem;
  color: #6c7a94;
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
  border-radius: 999px !important;
  padding: 10px 16px !important;
  font-weight: 700;
}

.btn-outline-primary {
  border: 2px solid #5c6bc0 !important;
  color: #5c6bc0 !important;
  border-radius: 999px !important;
  padding: 10px 16px !important;
  font-weight: 700;
}

@media (max-width: 576px) {
  .area__card {
    padding: 1.35rem;
  }

  .area__card h1 {
    font-size: 1.3rem;
  }
}
</style>
