<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import logo from '@/presentation/assets/img/logo.jpeg';
import { useRedefinirSenha } from '@/presentation/composables/Pessoa/useRedefinirSenha';

const route = useRoute();
const router = useRouter();

const tokenRecuperacao = computed(() => {
  const q = route.query.token;
  if (typeof q === 'string' && q.length > 0) {
    try {
      return decodeURIComponent(q);
    } catch {
      return q;
    }
  }
  if (Array.isArray(q) && q[0]) {
    try {
      return decodeURIComponent(q[0]);
    } catch {
      return q[0];
    }
  }
  return '';
});

const linkInvalido = computed(() => !tokenRecuperacao.value);

const {
  redefinir,
  carregando,
  erroGeral,
  erroNovaSenha,
  erroConfirmacao,
  mensagemSucesso
} = useRedefinirSenha();

const form = reactive({
  nova_senha: '',
  nova_senha_confirmation: ''
});

const showNova = ref(false);
const showConf = ref(false);

/** Alinhado às regras do back (Laravel Password::min(8)->letters()->mixedCase()->numbers()->symbols()). */
const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

let timeoutRedirecionar: ReturnType<typeof setTimeout> | null = null;

watch(mensagemSucesso, (msg) => {
  if (timeoutRedirecionar) {
    clearTimeout(timeoutRedirecionar);
    timeoutRedirecionar = null;
  }
  if (!msg) return;
  timeoutRedirecionar = setTimeout(() => {
    router.replace({ name: 'Login' });
  }, 2800);
});

onUnmounted(() => {
  if (timeoutRedirecionar) clearTimeout(timeoutRedirecionar);
});

async function aoEnviar() {
  if (linkInvalido.value) return;
  try {
    await redefinir(
      tokenRecuperacao.value,
      form.nova_senha,
      form.nova_senha_confirmation
    );
  } catch {
    /* erros no composable */
  }
}

const erroLocalNova = ref<string | null>(null);
const erroLocalConf = ref<string | null>(null);

function validarAntesEnvio(): boolean {
  erroLocalNova.value = null;
  erroLocalConf.value = null;
  if (!regexSenhaForte.test(form.nova_senha)) {
    erroLocalNova.value =
      'A senha deve ter pelo menos 8 caracteres, com letras maiúsculas e minúsculas, números e símbolos.';
    return false;
  }
  if (form.nova_senha !== form.nova_senha_confirmation) {
    erroLocalConf.value = 'A confirmação deve ser igual à nova senha.';
    return false;
  }
  return true;
}

async function submitComValidacao(e: Event) {
  e.preventDefault();
  if (!validarAntesEnvio()) return;
  await aoEnviar();
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

              <template v-if="mensagemSucesso">
                <h4 class="mb-3">Senha alterada</h4>
                <div class="alerta-sucesso mb-3">
                  {{ mensagemSucesso }}
                </div>
                <p class="text-muted small mb-3">Redirecionando para o login...</p>
                <RouterLink to="/login" class="btn btn-primary btn-sm w-100 text-center d-block">Ir para o login</RouterLink>
              </template>

              <template v-else-if="linkInvalido">
                <h4 class="mb-3">Link inválido</h4>
                <p class="text-muted mb-4">Link inválido ou incompleto. Solicite um novo link de recuperação.</p>
                <div class="d-grid gap-2">
                  <RouterLink :to="{ name: 'RecuperarSenha' }" class="btn btn-primary btn-sm text-center">
                    Solicitar novo link
                  </RouterLink>
                  <RouterLink to="/login" class="btn btn-outline-secondary btn-sm text-center">Voltar ao login</RouterLink>
                </div>
              </template>

              <template v-else>
                <h4 class="mb-3">Redefinir senha</h4>
                <p class="text-muted mb-4">Escolha uma nova senha para sua conta.</p>

                <form class="needs-validation" novalidate @submit="submitComValidacao">
                  <div class="mb-3">
                    <label for="nova-senha-reset" class="form-label">Nova senha</label>
                    <div class="password-wrapper">
                      <input
                        id="nova-senha-reset"
                        v-model="form.nova_senha"
                        :type="showNova ? 'text' : 'password'"
                        class="form-control form-control-lg"
                        :class="{ 'is-invalid': Boolean(erroLocalNova || erroNovaSenha) }"
                        autocomplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        :aria-label="showNova ? 'Ocultar senha' : 'Mostrar senha'"
                        @click="showNova = !showNova"
                      >
                        {{ showNova ? '🙈' : '👁' }}
                      </button>
                    </div>
                    <div v-if="erroLocalNova || erroNovaSenha" class="invalid-feedback d-block">
                      {{ erroLocalNova || erroNovaSenha }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="nova-senha-conf-reset" class="form-label">Confirmar nova senha</label>
                    <div class="password-wrapper">
                      <input
                        id="nova-senha-conf-reset"
                        v-model="form.nova_senha_confirmation"
                        :type="showConf ? 'text' : 'password'"
                        class="form-control form-control-lg"
                        :class="{ 'is-invalid': Boolean(erroLocalConf || erroConfirmacao) }"
                        autocomplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        class="password-toggle"
                        :aria-label="showConf ? 'Ocultar confirmação' : 'Mostrar confirmação'"
                        @click="showConf = !showConf"
                      >
                        {{ showConf ? '🙈' : '👁' }}
                      </button>
                    </div>
                    <div v-if="erroLocalConf || erroConfirmacao" class="invalid-feedback d-block">
                      {{ erroLocalConf || erroConfirmacao }}
                    </div>
                  </div>

                  <div v-if="erroGeral" class="alerta-erro mb-3">
                    {{ erroGeral }}
                    <div v-if="!erroGeral.startsWith('Muitas tentativas')" class="mt-2">
                      <RouterLink :to="{ name: 'RecuperarSenha' }" class="small">Solicitar novo link</RouterLink>
                    </div>
                  </div>

                  <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-sm" :disabled="carregando">
                      {{ carregando ? 'Salvando...' : 'Salvar nova senha' }}
                    </button>
                  </div>

                  <div class="text-center mt-3">
                    <small class="text-muted"><RouterLink to="/login">Voltar ao login</RouterLink></small>
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
