<script setup lang="ts">
import { reactive, ref } from 'vue';
import logo from '@/presentation/assets/img/logo.jpeg';

const emit = defineEmits<{
    (e: 'submit', payload: { nome: string; email: string; empresa?: string; mensagem: string }): void;
}>();

const activeView = ref<'contato' | 'maps'>('contato');

const form = reactive({
    nome: '',
    email: '',
    empresa: '',
    mensagem: ''
});

const errors = reactive({
    nome: '',
    email: '',
    mensagem: ''
});

function validate() {
    errors.nome = form.nome.trim() ? '' : 'Nome é obrigatório';
    errors.email = /\S+@\S+\.\S+/.test(form.email) ? '' : 'Informe um e‑mail válido';
    errors.mensagem = form.mensagem.trim() ? '' : 'Mensagem é obrigatória';
    return !errors.nome && !errors.email && !errors.mensagem;
}

function submitContact(e: Event) {
    e.preventDefault();
    if (!validate()) return;
    emit('submit', {
        nome: form.nome.trim(),
        email: form.email.trim(),
        empresa: form.empresa.trim() || undefined,
        mensagem: form.mensagem.trim()
    });
    // opcional: limpar formulário
    form.nome = form.email = form.empresa = form.mensagem = '';
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
                                <img :src="logo" alt="Logo Agenda" class="img-fluid login-logo" />
                            </div>

                            <div class="mb-3 gap-3 text-center">
                                <div class="view-toggle">
                                    <button type="button" class="btn btn-sm"
                                        :class="{ 'btn-outline-primary': activeView !== 'contato', 'btn-primary': activeView === 'contato' }"
                                        @click="activeView = 'contato'">Contato</button>
                                    <button type="button" class="btn btn-sm ms-2"
                                        :class="{ 'btn-outline-secondary': activeView !== 'maps', 'btn-primary': activeView === 'maps' }"
                                        @click="activeView = 'maps'">Mapa</button>
                                </div>
                            </div>

                            <transition name="fade-slide">
                                <div v-if="activeView === 'contato'" class="view-panel">
                                    <form @submit.prevent="submitContact" class="needs-validation" novalidate>
                                        <div class="mb-3">
                                            <label for="nome" class="form-label">Nome Completo</label>
                                            <input v-model="form.nome" id="nome" type="text"
                                                class="form-control form-control-lg"
                                                :class="{ 'is-invalid': errors.nome }" placeholder="Nome completo"
                                                required />
                                            <div class="invalid-feedback">{{ errors.nome }}</div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="email" class="form-label">Email</label>
                                            <input v-model="form.email" id="email" type="email"
                                                class="form-control form-control-lg"
                                                :class="{ 'is-invalid': errors.email }" placeholder="seu@email.com"
                                                required />
                                            <div class="invalid-feedback">{{ errors.email }}</div>
                                        </div>

                                        <div class="mb-3">
                                            <label for="empresa" class="form-label">Empresa</label>
                                            <input v-model="form.empresa" id="empresa" type="text"
                                                class="form-control form-control-lg" placeholder="Empresa (opcional)" />
                                        </div>

                                        <div class="mb-3">
                                            <label for="mensagem" class="form-label">Mensagem</label>
                                            <textarea v-model="form.mensagem" id="mensagem" rows="5"
                                                class="form-control form-control-lg"
                                                :class="{ 'is-invalid': errors.mensagem }"
                                                placeholder="Escreva sua mensagem" required></textarea>
                                            <div class="invalid-feedback">{{ errors.mensagem }}</div>
                                        </div>

                                        <div class="d-grid mt-2">
                                            <button type="submit" class="btn btn-primary btn-sm">Enviar</button>
                                        </div>
                                    </form>
                                </div>

                                <div v-else class="view-panel">
                                    <div class="maps-wrapper mt-2">
                                        <div class="map-frame rounded">
                                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d234.64481234089536!2d-42.14101967913323!3d-19.784152574314497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xba918b3497afb3%3A0xf391a74a9a03f7fe!2sAgenda%20Contabilidade%20e%20Administra%C3%A7%C3%A3o%20P%C3%BAblica!5e0!3m2!1spt-BR!2sbr!4v1771525024730!5m2!1spt-BR!2sbr" width="600" height="450" style="border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                                        </div>
                                    </div>
                                </div>
                            </transition>

                        </div>
                    </div>

                </div>

            </div>
        </div>
    </article>
</template>

<style scoped>
/* Mantém padrão visual dos demais formulários */
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

.login-logo {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 120px;
    display: block;
    margin: 0 auto;
    object-fit: contain;
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

/* Estilos para o toggle de views */
.view-toggle {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    background: rgba(45, 160, 168, 0.06);
    padding: 4px;
    border-radius: 999px;
    box-shadow: inset 0 0 0 1px rgba(45, 160, 168, 0.03);
}

.view-toggle .btn {
    border-radius: 999px;
    padding: 8px 14px;
    font-weight: 600;
    border: none;
    background: transparent;
    color: rgba(10, 20, 30, 0.85);
    transition: all .16s ease;
    box-shadow: none;
}

/* botão ativo com destaque da marca */
.view-toggle .btn.btn-primary {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff !important;
    box-shadow: 0 10px 26px rgba(45, 160, 168, 0.12);
}

/* botões não-ativos mais suaves */
.view-toggle .btn.btn-outline-primary,
.view-toggle .btn.btn-outline-secondary {
    background: transparent;
    border: none;
    color: rgba(10, 20, 30, 0.6);
}

.view-toggle .btn:focus {
    outline: none;
    box-shadow: none;
    transform: none;
}

/* Painel de visualização */
.view-panel {
    padding-top: 0.25rem;
}

/* Animação */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all .22s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

/* Mobile: botões ocupam largura total e ficam lado a lado com pesos iguais */
@media (max-width: 575.98px) {
    .view-toggle {
        display: flex;
        width: 100%;
    }

    .view-toggle .btn {
        flex: 1 1 0;
        padding: 10px 8px;
        text-align: center;
        font-size: 0.95rem;
    }

    .view-toggle .btn+.btn {
        margin-left: 6px;
    }
}

/* Responsividade: mostrar lado a lado em desktop, empilhar em mobile */
@media (min-width: 992px) {
    .row>.col-12.col-sm-10.col-md-8.col-lg-6.col-xl-5:first-child {
        margin-right: 0;
    }

    .container-fluid .row {
        gap: 0;
    }
}
</style>