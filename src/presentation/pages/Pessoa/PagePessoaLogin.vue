<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormLogin from '@/presentation/components/Pessoa/FormLogin.vue';
import { useLoginUsuario } from '@/presentation/composables/Pessoa/useLoginUsuario';
import { TipoUsuario } from '@/domain/types/TipoUsuario';
import { useAuthStore } from '@/presentation/store/useAuthStore';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const { entrar, carregando, erro } = useLoginUsuario();
const erroFormulario = ref<string | null>(null);
const mensagemErro = computed(() => erroFormulario.value || erro.value || null);

onMounted(() => {
  if (route.query.sessionExpired === '1') {
    erroFormulario.value = 'Sua sessao expirou. Faca login novamente.';
  }
  if (!auth.estaAutenticado || !auth.usuario) return;
  if (auth.usuario.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
    void router.replace({ name: 'AdministradorPainel' });
  } else {
    void router.replace({ name: 'AreaCliente' });
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
    if (resposta.usuario.tipo_usuario === TipoUsuario.ADMINISTRADOR) {
      await router.push({ name: 'AdministradorPainel' });
    } else {
      await router.push({ name: 'AreaCliente' });
    }
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
