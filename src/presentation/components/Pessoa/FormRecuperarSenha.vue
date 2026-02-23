<script setup lang="ts">
import { reactive } from 'vue';
import logo from '@/presentation/assets/img/logo.jpeg';

const emit = defineEmits<{
  (e: 'submit', payload: { email: string }): void;
}>();

const form = reactive({
  email: ''
});

function submitRecover(e: Event) {
  e.preventDefault();
  emit('submit', { email: form.email });
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

              <h4 class="mb-3">Recuperar senha</h4>
              <p class="text-muted mb-4">Informe o e-mail cadastrado. Enviaremos um link para redefinir sua senha.</p>

              <form @submit.prevent="submitRecover" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label">E-mail</label>
                  <input v-model="form.email" id="email" type="email" class="form-control form-control-lg" placeholder="seu@email.com" required />
                </div>

                <div class="d-grid">
                  <button type="submit" class="btn btn-primary btn-sm">Enviar link de recuperação</button>
                </div>

                <div class="text-center mt-3">
                  <small class="text-muted">Lembrou a senha? <a href="/login">Entrar</a></small>
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
/* Reaproveita o visual das telas de login/cadastro para manter consistência */
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

/* Garantir legibilidade e espaçamento em telas grandes */
@media (min-width: 992px) {
  .card-body { padding: 2.75rem; }
}

/* Ajustes para tablets e celulares */
@media (max-width: 991.98px) {
  .card-body { padding: 1.25rem; }
}

@media (max-width: 575.98px) {
  .card { box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
}

/* Inputs com visual mais leve e arredondado */
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

/* Botão com gradiente da marca */
.btn-primary {
  background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 18px !important;
  box-shadow: 0 10px 24px rgba(45,160,168,0.12);
  font-weight: 700;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(45,160,168,0.16);
}

/* Links e textos com a cor da marca */
a, .form-check-label {
  color: #2da0a8;
}

a:hover { text-decoration: underline; }

/* Garante que o card ocupe bem o espaço central em telas largas */
.login-wrapper .col-12.col-sm-10.col-md-8.col-lg-6.col-xl-5 {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
