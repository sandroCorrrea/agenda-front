<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormLogin from '@/presentation/components/Pessoa/FormLogin.vue';
import { useLoginUsuario } from '@/presentation/composables/Pessoa/useLoginUsuario';
import { useAuthStore } from '@/presentation/store/useAuthStore';
import { useMenuStore } from '@/presentation/store/useMenuStore';
import { destinoAposMenu } from '@/shared/utils/adminPermissions';
import { useCarregarMenuSessao } from '@/presentation/composables/Menu/useCarregarMenuSessao';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const menuStore = useMenuStore();
const { entrar, carregando, erro } = useLoginUsuario();
const { carregarMenuSessao } = useCarregarMenuSessao();
const erroFormulario = ref<string | null>(null);
const mensagemErro = computed(() => erroFormulario.value || erro.value || null);

async function redirecionarAutenticado() {
  const destino = destinoAposMenu(menuStore.destinoSugerido, auth.usuario);
  await router.replace(destino);
}

onMounted(async () => {
  if (route.query.sessionExpired === '1') {
    erroFormulario.value = 'Sua sessao expirou. Faca login novamente.';
  }
  if (!auth.estaAutenticado || !auth.usuario) return;
  try {
    if (!menuStore.carregado) {
      await carregarMenuSessao();
    }
    await redirecionarAutenticado();
  } catch {
    await router.replace({ name: 'SemAcesso' });
  }
});

async function aoEnviarLogin(payload: { cpf: string; senha: string }) {
  erroFormulario.value = null;
  if (payload.cpf.length !== 11) {
    erroFormulario.value = 'Informe um CPF valido com 11 digitos.';
    return;
  }
  try {
    const resposta = await entrar(payload.cpf, payload.senha);
    const redirecionar = route.query.redirect;
    if (typeof redirecionar === 'string' && redirecionar.length > 0) {
      await router.push(redirecionar);
      return;
    }
    const destino = destinoAposMenu(resposta.menu.destino_sugerido, resposta.usuario);
    await router.push(destino);
  } catch {
    return;
  }
}
</script>

<template>
  <section>
    <FormLogin
      :carregando="carregando"
      :erro="mensagemErro"
      @submit="aoEnviarLogin"
    />
  </section>
</template>
