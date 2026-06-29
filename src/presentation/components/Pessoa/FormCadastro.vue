<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import logo from '@/presentation/assets/img/logo.jpeg';
import BaseTermoLgpdModal from '@/presentation/components/Shared/BaseTermoLgpdModal.vue';
import { cpfMask, onlyNumbers, phoneMask } from '@/shared/utils/masks';
import { TipoUsuario } from '@/domain/types/TipoUsuario';

const showSenha = ref(false);
const showConfirmarSenha = ref(false);
const aceitouTermoLgpd = ref(true);
const modalTermoAberto = ref(false);

const props = withDefaults(defineProps<{
  loading: boolean,
  error: string | null;
  persist: (dto: {
    nome: string,
    cpf: string,
    data_nascimento: string,
    email: string,
    celular: string,
    usuario: {
      senha: string,
      senha_confirmation: string,
      tipo_usuario: TipoUsuario
    }
  }) => Promise<any>;
  pessoaEntity: any | null;
}>(), {
});

const emit = defineEmits<{
  (e: 'submit', payload: {
    nome: string;
    cpf: string;
    data_nascimento: string;
    email: string;
    celular: string;
    usuario: {
      senha: string;
      senha_confirmation: string;
      tipo_usuario: TipoUsuario;
    };
  }): void;
}>();

const form = reactive({
  nome: '',
  cpf: '',
  data_nascimento: '',
  email: '',
  celular: '',
  senha: '',
  senha_confirmation: '',
  tipo_usuario: TipoUsuario.CLIENTE
});

const errors = reactive({
  nome: '',
  cpf: '',
  data_nascimento: '',
  email: '',
  celular: '',
  senha: '',
  senha_confirmation: '',
  aceite_lgpd: ''
});

function validate() {
  errors.nome = form.nome.trim() ? '' : 'Nome é obrigatório';

  errors.cpf =
    form.cpf.replace(/\D/g, '').length === 11
      ? ''
      : 'CPF deve conter 11 dígitos';

  errors.data_nascimento =
    form.data_nascimento
      ? ''
      : 'Data de nascimento é obrigatória';

  errors.email =
    /\S+@\S+\.\S+/.test(form.email)
      ? ''
      : 'Informe um e-mail válido';

  errors.celular =
    form.celular.replace(/\D/g, '').length >= 10
      ? ''
      : 'Informe um celular válido';

  errors.senha =
    form.senha.length >= 8
      ? ''
      : 'Senha deve conter no mínimo 8 caracteres';

  errors.senha_confirmation =
    !form.senha_confirmation
      ? 'Confirme sua senha'
      : form.senha_confirmation !== form.senha
        ? 'As senhas devem ser iguais'
        : '';

  errors.aceite_lgpd = aceitouTermoLgpd.value
    ? ''
    : 'É necessário aceitar o Termo de Transparência nos Dados para concluir o cadastro';

  return (
    !errors.nome &&
    !errors.cpf &&
    !errors.data_nascimento &&
    !errors.email &&
    !errors.celular &&
    !errors.senha &&
    !errors.senha_confirmation &&
    !errors.aceite_lgpd
  );
}

function abrirModalTermo(e: Event) {
  e.preventDefault();
  modalTermoAberto.value = true;
}

async function submitCadastro(e: Event) {
  e.preventDefault();
  if (!validate()) return;

  try {
    await props.persist({
      nome: form.nome.trim(),
      cpf: onlyNumbers(form.cpf),
      data_nascimento: form.data_nascimento.trim(),
      email: form.email.trim(),
      celular: onlyNumbers(form.celular),
      usuario: {
        senha: form.senha,
        senha_confirmation: form.senha_confirmation,
        tipo_usuario: form.tipo_usuario
      }
    });

    if (!props.error) {
      form.nome = '';
      form.cpf = '';
      form.data_nascimento = '';
      form.email = '';
      form.celular = '';
      form.senha = '';
      form.senha_confirmation = '';
    }
  } catch (error) {
    console.error('Erro ao enviar contato:', error);
  }
}

function handleCpfInput(event: Event) {
  const input = event.target as HTMLInputElement;
  form.cpf = cpfMask(input.value);
}

function handleCelularInput(event: Event) {
  const input = event.target as HTMLInputElement;
  form.celular = phoneMask(input.value);
}

watch([() => form.senha, () => form.senha_confirmation], () => {
  if (form.senha_confirmation && form.senha_confirmation !== form.senha) {
    errors.senha_confirmation = 'As senhas devem ser iguais';
  } else {
    errors.senha_confirmation = '';
  }
});

watch(aceitouTermoLgpd, (aceito) => {
  if (aceito) {
    errors.aceite_lgpd = '';
  }
});
</script>

<template>
  <article class="login-wrapper d-flex align-items-center min-vh-100 py-4">
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto px-3">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-sm-5">
              <div class="d-flex justify-content-center mb-4">
                <img :src="logo" alt="Logo Agenda" class="img-fluid login-logo" />
              </div>

              <h4 class="mb-3">Criar nova conta</h4>

              <form @submit.prevent="submitCadastro" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label for="nome" class="form-label">Nome completo</label>
                  <input v-model="form.nome" id="nome" type="text" class="form-control form-control-lg"
                    :class="{ 'is-invalid': errors.nome }" placeholder="Nome completo" required />
                  <div class="invalid-feedback">{{ errors.nome }}</div>
                </div>

                <div class="mb-3">
                  <label for="cpf" class="form-label">CPF</label>
                  <input @input="handleCpfInput" v-model="form.cpf" id="cpf" type="text"
                    class="form-control form-control-lg" :class="{ 'is-invalid': errors.cpf }"
                    placeholder="000.000.000-00" required />
                  <div class="invalid-feedback">{{ errors.cpf }}</div>
                </div>

                <div class="mb-3">
                  <label for="data_nascimento" class="form-label">Data de nascimento</label>
                  <input v-model="form.data_nascimento" id="data_nascimento" type="date"
                    class="form-control form-control-lg" :class="{ 'is-invalid': errors.data_nascimento }" required />
                  <div class="invalid-feedback">{{ errors.data_nascimento }}</div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input v-model="form.email" id="email" type="email" class="form-control form-control-lg"
                    :class="{ 'is-invalid': errors.email }" placeholder="seu@email.com" required />
                  <div class="invalid-feedback">{{ errors.email }}</div>
                </div>

                <div class="mb-3">
                  <label for="celular" class="form-label">Celular</label>
                  <input @input="handleCelularInput" v-model="form.celular" id="celular" type="tel"
                    class="form-control form-control-lg" :class="{ 'is-invalid': errors.celular }"
                    placeholder="(31) 98765-4321" required />
                  <div class="invalid-feedback">{{ errors.celular }}</div>
                </div>

                <div class="mb-3">
                  <label for="senha" class="form-label">Senha</label>

                  <div class="password-wrapper">
                    <input v-model="form.senha" id="senha" :type="showSenha ? 'text' : 'password'"
                      class="form-control form-control-lg" :class="{ 'is-invalid': errors.senha }"
                      placeholder="Digite sua senha" required />

                    <button type="button" class="password-toggle" @click="showSenha = !showSenha">
                      {{ showSenha ? '🙈' : '👁' }}
                    </button>

                    <div class="invalid-feedback">
                      {{ errors.senha }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="senha_confirmation" class="form-label">Confirmar senha</label>

                  <div class="password-wrapper">
                    <input v-model="form.senha_confirmation" id="senha_confirmation"
                      :type="showConfirmarSenha ? 'text' : 'password'" class="form-control form-control-lg"
                      :class="{ 'is-invalid': errors.senha_confirmation }" placeholder="Confirme sua senha" required />

                    <button type="button" class="password-toggle" @click="showConfirmarSenha = !showConfirmarSenha">
                      {{ showConfirmarSenha ? '🙈' : '👁' }}
                    </button>

                    <div class="invalid-feedback">
                      {{ errors.senha_confirmation }}
                    </div>
                  </div>
                </div>

                <BaseLoading v-if="loading" text="Criando conta..." />

                <div v-else-if="pessoaEntity && !error" class="newsletter-card-success mt-3">
                  <h4 class="mb-2">✓ Conta criada!</h4>
                  <p class="mb-0">
                    Seu cadastro foi realizado com sucesso.
                  </p>
                </div>

                <div v-else-if="error" class="filtro-alert mb-3">
                  <strong>Erro ao cadastrar:</strong> {{ error }}
                </div>

                <div
                  v-if="!loading && !(pessoaEntity && !error)"
                  class="mb-3 termo-lgpd-aceite"
                  :class="{ 'termo-lgpd-aceite--invalido': errors.aceite_lgpd }"
                >
                  <div class="form-check">
                    <input
                      v-model="aceitouTermoLgpd"
                      id="aceite-termo-lgpd"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label class="form-check-label" for="aceite-termo-lgpd">
                      Li e concordo com o
                      <button
                        type="button"
                        class="termo-lgpd-aceite__link"
                        @click="abrirModalTermo"
                      >
                        Termo de Transparência nos Dados
                      </button>
                    </label>
                  </div>
                  <div v-if="errors.aceite_lgpd" class="termo-lgpd-aceite__erro">
                    {{ errors.aceite_lgpd }}
                  </div>
                </div>

                <div v-if="!loading && !(pessoaEntity && !error)" class="d-grid mt-2">
                  <button
                    type="submit"
                    class="btn btn-primary btn-sm"
                    :disabled="!aceitouTermoLgpd"
                  >
                    Criar conta
                  </button>
                </div>

                <div class="text-center mt-3">
                  <small class="text-muted">Já tem conta? <RouterLink to="/login">Entrar</RouterLink></small>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>

  <BaseTermoLgpdModal
    :aberto="modalTermoAberto"
    @fechar="modalTermoAberto = false"
  />
</template>

<style scoped>
.login-logo {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 120px;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

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

.form-control {
  background: #f6fbfc;
  border: 1px solid #e6f0f4;
  border-radius: 12px;
  padding: .85rem 1rem;
  transition: box-shadow .18s ease, border-color .18s ease;
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

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(45, 160, 168, 0.16);
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

@media (max-width: 991.98px) {
  .card-body {
    padding: 1.25rem;
  }
}

.login-wrapper .col-12.col-sm-10.col-md-8.col-lg-6.col-xl-5 {
  display: flex;
  align-items: center;
  justify-content: center;
}

.filtro-alert {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.2);
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #721c24;
  font-weight: 500;
}

.newsletter-card-success {
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
  padding: 1.5rem;
  border-radius: 20px;
  color: #fff;
  text-align: center;
}

.newsletter-card-success h4 {
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fff;
}

.newsletter-card-success p {
  font-size: 0.9rem;
  margin-bottom: 0;
  opacity: 0.9;
}

.invalid-feedback {
  font-size: 0.85rem;
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

.termo-lgpd-aceite {
  margin-top: 0.25rem;
}

.termo-lgpd-aceite .form-check {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.termo-lgpd-aceite .form-check-input {
  margin-top: 0.2rem;
  width: 1.05rem;
  height: 1.05rem;
  border-color: #b8c9d4;
  cursor: pointer;
}

.termo-lgpd-aceite .form-check-input:checked {
  background-color: #2da0a8;
  border-color: #2da0a8;
}

.termo-lgpd-aceite .form-check-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(45, 160, 168, 0.2);
}

.termo-lgpd-aceite .form-check-label {
  font-size: 0.875rem;
  line-height: 1.45;
  color: #4a5b78;
  cursor: pointer;
}

.termo-lgpd-aceite__link {
  border: none;
  padding: 0;
  background: transparent;
  color: #2da0a8;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.termo-lgpd-aceite__link:hover {
  color: #5c6bc0;
}

.termo-lgpd-aceite--invalido .form-check-input {
  border-color: #dc3545;
}

.termo-lgpd-aceite__erro {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: #dc3545;
}
</style>