<script setup lang="ts">
import { RouterLink, useRouter } from "vue-router";
import { RiLockLine, RiLogoutBoxRLine } from "@remixicon/vue";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { useMenuStore } from "@/presentation/store/useMenuStore";
import { useLogoutUsuario } from "@/presentation/composables/Pessoa/useLogoutUsuario";
import { ref } from "vue";

const auth = useAuthStore();
const menuStore = useMenuStore();
const router = useRouter();
const { sair: chamarLogoutApi } = useLogoutUsuario();
const saindo = ref(false);

async function sair() {
  if (saindo.value) return;
  saindo.value = true;
  try {
    await chamarLogoutApi();
    auth.encerrarSessao();
    await router.push({ name: "Home" });
  } finally {
    saindo.value = false;
  }
}
</script>

<template>
  <article class="sem-acesso">
    <div class="container py-5">
      <div class="sem-acesso__card">
        <div class="sem-acesso__icon" aria-hidden="true">
          <RiLockLine />
        </div>
        <h1>Sem permissões de acesso</h1>
        <p>
          Sua conta está autenticada, mas nenhum grupo de acesso foi atribuído
          (ou o grupo não possui funcionalidades liberadas). Solicite ao
          administrador da contabilidade a inclusão em um grupo.
        </p>
        <div class="sem-acesso__acoes">
          <RouterLink
            v-if="menuStore.podeVisualizarCodigo('admin.perfil')"
            :to="{ name: 'AdministradorPerfil' }"
            class="btn sem-acesso__btn"
          >
            Ir para o perfil
          </RouterLink>
          <button
            type="button"
            class="btn sem-acesso__btn sem-acesso__btn--danger"
            :disabled="saindo"
            @click="sair"
          >
            <RiLogoutBoxRLine />
            {{ saindo ? "Saindo..." : "Sair" }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.sem-acesso {
  min-height: 60vh;
}

.sem-acesso__card {
  max-width: 560px;
  margin: 2rem auto;
  padding: 2rem 1.75rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(20, 40, 80, 0.08);
  box-shadow: 0 12px 30px rgba(20, 35, 70, 0.08);
  text-align: center;
}

.sem-acesso__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #eef2ff;
  color: #334155;
}

.sem-acesso__card h1 {
  font-size: 1.35rem;
  margin-bottom: 0.65rem;
}

.sem-acesso__card p {
  color: #64748b;
  margin-bottom: 1.4rem;
}

.sem-acesso__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
}

.sem-acesso__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 10px;
  font-weight: 700;
  background: #1e293b;
  color: #fff;
}

.sem-acesso__btn--danger {
  background: #b42318;
}
</style>
