<script setup lang="ts">
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import logo from '@/presentation/assets/img/logo.jpeg';
import { useRecuperacaoSenha } from '@/presentation/composables/Pessoa/useRecuperacaoSenha';

const {
  solicitar,
  carregando,
  erroGeral,
  erroEmail,
  mensagemNeutra,
  redefinirFormulario
} = useRecuperacaoSenha();

const form = reactive({
  email: ''
});

const tentouEnviar = ref(false);

async function submitRecover() {
  tentouEnviar.value = true;
  if (!form.email.trim()) {
    return;
  }
  try {
    await solicitar(form.email);
  } catch {
    /* mensagens tratadas no composable */
  }
}

function novoPedido() {
  form.email = '';
  tentouEnviar.value = false;
  redefinirFormulario();
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

              <template v-if="mensagemNeutra">
                <h4 class="mb-3">Verifique seu e-mail</h4>
                <div class="alerta-sucesso mb-3">
                  <p class="mb-2">{{ mensagemNeutra }}</p>
                  <p class="mb-0 text-muted small">
                    Se existir uma conta ativa com este e-mail, você receberá instruções em alguns minutos.
                    Verifique também a pasta de spam.
                  </p>
                </div>
                <div class="d-grid gap-2">
                  <button type="button" class="btn btn-outline-secondary btn-sm" @click="novoPedido">
                    Solicitar para outro e-mail
                  </button>
                  <RouterLink to="/login" class="btn btn-primary btn-sm text-center">Ir para o login</RouterLink>
                </div>
              </template>

              <template v-else>
                <h4 class="mb-3">Recuperar senha</h4>
                <p class="text-muted mb-4">
                  Informe o e-mail cadastrado. Se existir uma conta ativa, enviaremos um link para redefinir sua
                  senha.
                </p>

                <form class="needs-validation" novalidate @submit.prevent="submitRecover">
                  <div class="mb-3">
                    <label for="email-recuperacao" class="form-label">E-mail</label>
                    <input
                      id="email-recuperacao"
                      v-model="form.email"
                      type="email"
                      class="form-control form-control-lg"
                      :class="{ 'is-invalid': tentouEnviar && !form.email.trim() }"
                      placeholder="seu@email.com"
                      maxlength="180"
                      autocomplete="email"
                      required
                    />
                    <div v-if="erroEmail" class="invalid-feedback d-block">
                      {{ erroEmail }}
                    </div>
                    <div v-else-if="tentouEnviar && !form.email.trim()" class="invalid-feedback d-block">
                      Informe o e-mail.
                    </div>
                  </div>

                  <div v-if="erroGeral" class="alerta-erro mb-3">
                    {{ erroGeral }}
                  </div>

                  <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-sm" :disabled="carregando">
                      {{ carregando ? 'Enviando...' : 'Enviar link de recuperação' }}
                    </button>
                  </div>

                  <div class="text-center mt-3">
                    <small class="text-muted">Lembrou a senha? <RouterLink to="/login">Entrar</RouterLink></small>
                  </div>
                </form>
              </template>
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

a,
.form-check-label {
  color: #2da0a8;
}

a:hover {
  text-decoration: underline;
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

.alerta-sucesso {
  background: rgba(45, 160, 168, 0.08);
  border: 1px solid rgba(45, 160, 168, 0.22);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #0d3d3f;
}
</style>
