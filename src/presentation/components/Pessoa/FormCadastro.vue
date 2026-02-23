<script setup lang="ts">
import { reactive } from 'vue';
import logo from '@/presentation/assets/img/logo.jpeg';

const emit = defineEmits<{
  (e: 'submit', payload: { nome: string; cpf: string; data_nascimento: string; email: string; celular: string }): void;
}>();

const form = reactive({
  nome: '',
  cpf: '',
  data_nascimento: '',
  email: '',
  celular: ''
});

function submitCadastro(e: Event) {
  e.preventDefault();
  emit('submit', {
    nome: form.nome,
    cpf: form.cpf,
    data_nascimento: form.data_nascimento,
    email: form.email,
    celular: form.celular
  });
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

              <h4 class="mb-3">Criar nova conta</h4>

              <form @submit.prevent="submitCadastro" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label for="nome" class="form-label">Nome completo</label>
                  <input v-model="form.nome" id="nome" type="text" class="form-control form-control-lg" placeholder="Nome completo" required />
                </div>

                <div class="mb-3">
                  <label for="cpf" class="form-label">CPF</label>
                  <input v-model="form.cpf" id="cpf" type="text" class="form-control form-control-lg" placeholder="00000000000" required />
                </div>

                <div class="mb-3">
                  <label for="data_nascimento" class="form-label">Data de nascimento</label>
                  <input v-model="form.data_nascimento" id="data_nascimento" type="date" class="form-control form-control-lg" required />
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input v-model="form.email" id="email" type="email" class="form-control form-control-lg" placeholder="seu@email.com" required />
                </div>

                <div class="mb-3">
                  <label for="celular" class="form-label">Celular</label>
                  <input v-model="form.celular" id="celular" type="tel" class="form-control form-control-lg" placeholder="(85) 3679-8212" required />
                </div>

                <div class="d-grid mt-3">
                  <button type="submit" class="btn btn-primary btn-sm">Criar conta</button>
                </div>

                <div class="text-center mt-3">
                  <small class="text-muted">Já tem conta? <a href="/login">Entrar</a></small>
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
  background: linear-gradient(180deg, rgba(250,250,250,1) 0%, rgba(245,247,250,1) 100%);
}

.card {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid rgba(20,30,40,0.04);
  box-shadow: 0 12px 30px rgba(20,30,40,0.06);
  border-radius: 16px;
  overflow: hidden;
}

h4 { font-weight: 600; }

.form-control {
  background: #f6fbfc;
  border: 1px solid #e6f0f4;
  border-radius: 12px;
  padding: .85rem 1rem;
  transition: box-shadow .18s ease, border-color .18s ease;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
}

.form-control::placeholder { color: #9aaec0; }

.form-control:focus {
  outline: none;
  border-color: #5c6bc0;
  box-shadow: 0 6px 18px rgba(92,107,192,0.08);
  background: #fff;
}

.btn-primary {
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 18px !important;
  box-shadow: 0 10px 24px rgba(45,160,168,0.12);
  font-weight: 700;
}

.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(45,160,168,0.16); }

a.small, .form-check-label { color: #2da0a8; }

a.small:hover { text-decoration: underline; }

@media (min-width: 992px) {
  .card-body { padding: 2.75rem; }
}

@media (max-width: 991.98px) {
  .card-body { padding: 1.25rem; }
}

/* centraliza a coluna no eixo vertical em telas largas */
.login-wrapper .col-12.col-sm-10.col-md-8.col-lg-6.col-xl-5 { display: flex; align-items: center; justify-content: center; }
</style>