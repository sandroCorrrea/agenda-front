<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import logo from '@/presentation/assets/img/logo.jpeg';
import { cpfMask, onlyNumbers } from '@/shared/utils/masks';

const props = withDefaults(
  defineProps<{
    carregando?: boolean;
    erro?: string | null;
  }>(),
  {
    carregando: false,
    erro: null
  }
);

const emit = defineEmits<{
  (e: 'submit', payload: { cpf: string; senha: string }): void;
}>();

const showSenha = ref(false);

const form = reactive({
  cpf: '',
  senha: ''
});

function aoEnviar(e: Event) {
  e.preventDefault();
  emit('submit', {
    cpf: onlyNumbers(form.cpf),
    senha: form.senha
  });
}

function aoDigitarCpf(event: Event) {
  const input = event.target as HTMLInputElement;
  form.cpf = cpfMask(input.value);
}
</script>

<template>
  <article class="login-wrapper d-flex align-items-center min-vh-100 py-4">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto px-3">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-sm-5">
              <div class="d-flex justify-content-center mb-4">
                <img :src="logo" alt="Logo Agenda" class="img-fluid img-thumbnail w-25 h-25" />
              </div>

              <h4 class="mb-3">Entrar na sua conta</h4>

              <form @submit.prevent="aoEnviar" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label for="cpf" class="form-label">CPF</label>
                  <input
                    id="cpf"
                    v-model="form.cpf"
                    type="text"
                    class="form-control form-control-lg"
                    placeholder="000.000.000-00"
                    autocomplete="username"
                    required
                    @input="aoDigitarCpf"
                  />
                </div>

                <div class="mb-3">
                  <label for="senha" class="form-label">Senha</label>
                  <div class="password-wrapper">
                    <input
                      id="senha"
                      v-model="form.senha"
                      :type="showSenha ? 'text' : 'password'"
                      class="form-control form-control-lg"
                      placeholder="••••••••"
                      autocomplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      :aria-label="showSenha ? 'Ocultar senha' : 'Mostrar senha'"
                      @click="showSenha = !showSenha"
                    >
                      {{ showSenha ? '🙈' : '👁' }}
                    </button>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-3 flex-column flex-sm-row gap-2">
                  <RouterLink to="/recuperar-senha" class="small ms-sm-auto">Esqueceu a senha?</RouterLink>
                </div>

                <div v-if="props.erro" class="alerta-erro mb-3">
                  {{ props.erro }}
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary btn-sm" :disabled="props.carregando">
                    {{ props.carregando ? 'Entrando...' : 'Entrar' }}
                  </button>
                </div>

                <div class="text-center mt-3">
                  <small class="text-muted">Ainda não tem conta? <RouterLink to="/cadastro">Cadastre-se</RouterLink></small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.login-wrapper {
  background: linear-gradient(180deg, rgba(250, 250, 250, 1) 0%, rgba(245, 247, 250, 1) 100%);
}

.card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid rgba(20, 30, 40, 0.04);
  box-shadow: 0 12px 30px rgba(20, 30, 40, 0.06);
  border-radius: 16px;
  overflow: hidden;
}

h4 {
  font-weight: 600;
}

@media (min-width: 992px) {
  .card-body {
    padding: 2.75rem;
  }
}

@media (max-width: 991.98px) {
  .card-body {
    padding: 1.25rem;
  }
}

@media (max-width: 575.98px) {
  .card {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }
}

.form-control {
  background: #f6fbfc;
  border: 1px solid #e6f0f4;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  transition: box-shadow 0.18s ease, border-color 0.18s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.form-control::placeholder {
  color: #9aaec0;
}

.form-control:focus {
  outline: none;
  border-color: #5c6bc0;
  box-shadow: 0 6px 18px rgba(92, 107, 192, 0.08);
  background: #fff;
}

.btn-primary {
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 18px !important;
  box-shadow: 0 10px 24px rgba(45, 160, 168, 0.12);
  font-weight: 700;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(45, 160, 168, 0.16);
}

.btn-primary:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

a.small,
.form-check-label {
  color: #2da0a8;
}

a.small:hover {
  text-decoration: underline;
}

@media (min-width: 992px) {
  .card-body {
    padding: 2.75rem;
  }
}

.login-wrapper .col-12.col-sm-10.col-md-8.col-lg-6.col-xl-5 {
  display: flex;
  align-items: center;
  justify-content: center;
}

.alerta-erro {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #721c24;
  font-weight: 500;
}

.password-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.7;
}

.password-toggle:hover {
  opacity: 1;
}
</style>
