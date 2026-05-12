<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiPencilLine,
    RiUserLine,
    RiPhoneLine,
    RiLockPasswordLine,
    RiSave3Line
} from "@remixicon/vue";
import { cpfMask, onlyNumbers, phoneMask } from "@/shared/utils/masks";
import { useEditarClienteFisica } from "@/presentation/composables/Pessoa/useEditarClienteFisica";

const router = useRouter();
const {
    pessoaId,
    perfil,
    formContato,
    formSenha,
    carregando,
    salvandoContato,
    salvandoSenha,
    erro,
    erroContato,
    erroSenha,
    erroSenhaCampos,
    sucessoContato,
    sucessoSenha,
    naoEncontrado,
    carregar,
    salvarContato,
    salvarSenha
} = useEditarClienteFisica();

const mostrarSenhaAtual = ref(false);
const mostrarNovaSenha = ref(false);
const mostrarConfirmacaoSenha = ref(false);
const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const errosContato = reactive({
    email: "",
    celular: ""
});

const erroSenhaLocal = ref<string | null>(null);

const nomeExibicao = computed(() => perfil.value?.nome || "Cliente");

function formatarData(date?: Date | null): string {
    if (!date) return "—";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
}

function aoDigitarCelular(e: Event) {
    const input = e.target as HTMLInputElement;
    formContato.celular = phoneMask(input.value);
}

function validarContato(): boolean {
    errosContato.email = /\S+@\S+\.\S+/.test(formContato.email.trim())
        ? ""
        : "Informe um e-mail valido.";
    errosContato.celular =
        onlyNumbers(formContato.celular).length >= 10
            ? ""
            : "Informe um celular valido.";
    return !errosContato.email && !errosContato.celular;
}

async function aoSalvarContato() {
    if (!validarContato()) return;
    try {
        formContato.celular = onlyNumbers(formContato.celular);
        await salvarContato();
        formContato.celular = phoneMask(formContato.celular);
    } catch {
        formContato.celular = phoneMask(formContato.celular);
        return;
    }
}

async function aoSalvarSenha() {
    erroSenhaLocal.value = null;
    if (!formSenha.senha_atual.trim()) {
        erroSenhaLocal.value = "Informe a senha atual.";
        return;
    }
    if (!regexSenhaForte.test(formSenha.nova_senha)) {
        erroSenhaLocal.value =
            "A nova senha deve ter 8+ caracteres, com maiuscula, minuscula, numero e simbolo.";
        return;
    }
    if (formSenha.nova_senha !== formSenha.nova_senha_confirmation) {
        erroSenhaLocal.value = "A confirmacao da nova senha nao confere.";
        return;
    }
    try {
        await salvarSenha();
    } catch {
        return;
    }
}

function irParaLista() {
    router.push({ name: "AdministradorClientesPessoaFisica" });
}

onMounted(async () => {
    try {
        await carregar();
        formContato.celular = phoneMask(formContato.celular);
    } catch {
        return;
    }
});
</script>

<template>
    <article class="edit-cliente min-vh-100">
        <div v-if="carregando" class="edit-cliente__loading">
            <span class="edit-cliente__spinner" aria-hidden="true" />
            <p>Carregando dados do cliente…</p>
        </div>

        <div v-else-if="naoEncontrado || Number.isNaN(pessoaId)" class="edit-cliente__missing">
            <div class="edit-cliente__missing-card">
                <RiUserLine class="edit-cliente__missing-icon" />
                <h1 class="edit-cliente__missing-title">Cliente não encontrado</h1>
                <button type="button" class="btn edit-cliente__btn-primary" @click="irParaLista">
                    Voltar para clientes
                </button>
            </div>
        </div>

        <template v-else>
            <header class="edit-cliente__hero">
                <div class="container">
                    <div class="edit-cliente__hero-card">
                        <nav class="edit-cliente__crumb">
                            <RouterLink
                                :to="{ name: 'AdministradorClientesPessoaFisica' }"
                                class="edit-cliente__crumb-link"
                            >
                                <RiArrowLeftLine />
                                Voltar para clientes
                            </RouterLink>
                        </nav>
                        <div class="edit-cliente__hero-body">
                            <div class="edit-cliente__hero-icon"><RiPencilLine /></div>
                            <div>
                                <span class="edit-cliente__hero-badge">Edição de cliente</span>
                                <h1 class="edit-cliente__hero-title">{{ nomeExibicao }}</h1>
                                <div class="edit-cliente__hero-meta">
                                    <span class="edit-cliente__pill">{{ cpfMask(perfil?.cpf ?? "") }}</span>
                                    <span class="edit-cliente__pill">
                                        {{ perfil?.usuario?.status ?? "sem usuario" }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div v-if="erro" class="container pt-3">
                <div class="edit-cliente__alert edit-cliente__alert--erro">{{ erro }}</div>
            </div>
            <div v-if="sucessoContato" class="container pt-3">
                <div class="edit-cliente__alert edit-cliente__alert--ok">{{ sucessoContato }}</div>
            </div>
            <div v-if="sucessoSenha" class="container pt-3">
                <div class="edit-cliente__alert edit-cliente__alert--ok">{{ sucessoSenha }}</div>
            </div>

            <div class="container edit-cliente__layout">
                <aside class="edit-cliente__aside d-none d-lg-block">
                    <nav class="edit-cliente__toc">
                        <a class="edit-cliente__toc-link" href="#sec-identificacao"><RiUserLine /> Identificação</a>
                        <a class="edit-cliente__toc-link" href="#sec-contato"><RiPhoneLine /> Contato</a>
                        <a class="edit-cliente__toc-link" href="#sec-seguranca"><RiLockPasswordLine /> Senha</a>
                    </nav>
                </aside>

                <div class="edit-cliente__main">
                    <section id="sec-identificacao" class="edit-panel">
                        <div class="edit-panel__head">
                            <RiUserLine class="edit-panel__icon" />
                            <div>
                                <h2 class="edit-panel__title">Identificação</h2>
                                <p class="edit-panel__hint">Campos de identidade não são editáveis.</p>
                            </div>
                        </div>
                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <label class="form-label">Nome</label>
                                <input :value="perfil?.nome ?? ''" type="text" class="form-control" disabled />
                            </div>
                            <div class="col-12 col-md-3">
                                <label class="form-label">CPF</label>
                                <input :value="cpfMask(perfil?.cpf ?? '')" type="text" class="form-control" disabled />
                            </div>
                            <div class="col-12 col-md-3">
                                <label class="form-label">Nascimento</label>
                                <input :value="formatarData(perfil?.dataNascimento)" type="text" class="form-control" disabled />
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label">Tipo de usuário</label>
                                <input :value="perfil?.usuario?.tipoUsuario ?? '—'" type="text" class="form-control" disabled />
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label">Status</label>
                                <input :value="perfil?.usuario?.status ?? '—'" type="text" class="form-control" disabled />
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label">ID pessoa</label>
                                <input :value="String(perfil?.id ?? '')" type="text" class="form-control" disabled />
                            </div>
                        </div>
                    </section>

                    <section id="sec-contato" class="edit-panel">
                        <div class="edit-panel__head">
                            <RiPhoneLine class="edit-panel__icon" />
                            <div>
                                <h2 class="edit-panel__title">Contato</h2>
                                <p class="edit-panel__hint">Somente e-mail e celular podem ser alterados.</p>
                            </div>
                        </div>
                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <label class="form-label" for="edit-cliente-email">E-mail</label>
                                <input
                                    id="edit-cliente-email"
                                    v-model="formContato.email"
                                    type="email"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(errosContato.email) }"
                                />
                                <div v-if="errosContato.email" class="invalid-feedback d-block">
                                    {{ errosContato.email }}
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" for="edit-cliente-celular">Celular</label>
                                <input
                                    id="edit-cliente-celular"
                                    :value="formContato.celular"
                                    type="text"
                                    class="form-control"
                                    inputmode="tel"
                                    maxlength="15"
                                    placeholder="(00) 00000-0000"
                                    :class="{ 'is-invalid': Boolean(errosContato.celular) }"
                                    @input="aoDigitarCelular"
                                />
                                <div v-if="errosContato.celular" class="invalid-feedback d-block">
                                    {{ errosContato.celular }}
                                </div>
                            </div>
                        </div>
                        <div v-if="erroContato" class="edit-cliente__inline-alert mt-3">{{ erroContato }}</div>
                        <div class="d-flex justify-content-end mt-3">
                            <button
                                type="button"
                                class="btn edit-cliente__btn-primary"
                                :disabled="salvandoContato"
                                @click="aoSalvarContato"
                            >
                                <RiSave3Line class="me-1" />
                                {{ salvandoContato ? "Salvando..." : "Salvar contato" }}
                            </button>
                        </div>
                    </section>

                    <section id="sec-seguranca" class="edit-panel">
                        <div class="edit-panel__head">
                            <RiLockPasswordLine class="edit-panel__icon" />
                            <div>
                                <h2 class="edit-panel__title">Senha</h2>
                                <p class="edit-panel__hint">Altere a senha do usuário vinculado ao cliente.</p>
                            </div>
                        </div>

                        <div class="row g-3">
                            <div class="col-12 col-md-4">
                                <label class="form-label">Senha atual</label>
                                <div class="password-wrap">
                                    <input
                                        v-model="formSenha.senha_atual"
                                        :type="mostrarSenhaAtual ? 'text' : 'password'"
                                        class="form-control"
                                        :class="{ 'is-invalid': Boolean(erroSenhaCampos.senha_atual) }"
                                    />
                                    <button type="button" class="password-toggle" @click="mostrarSenhaAtual = !mostrarSenhaAtual">
                                        {{ mostrarSenhaAtual ? "Ocultar" : "Mostrar" }}
                                    </button>
                                </div>
                                <div v-if="erroSenhaCampos.senha_atual" class="invalid-feedback d-block">
                                    {{ erroSenhaCampos.senha_atual }}
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label">Nova senha</label>
                                <div class="password-wrap">
                                    <input
                                        v-model="formSenha.nova_senha"
                                        :type="mostrarNovaSenha ? 'text' : 'password'"
                                        class="form-control"
                                        :class="{ 'is-invalid': Boolean(erroSenhaCampos.nova_senha) }"
                                    />
                                    <button type="button" class="password-toggle" @click="mostrarNovaSenha = !mostrarNovaSenha">
                                        {{ mostrarNovaSenha ? "Ocultar" : "Mostrar" }}
                                    </button>
                                </div>
                                <div v-if="erroSenhaCampos.nova_senha" class="invalid-feedback d-block">
                                    {{ erroSenhaCampos.nova_senha }}
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label">Confirmar nova senha</label>
                                <div class="password-wrap">
                                    <input
                                        v-model="formSenha.nova_senha_confirmation"
                                        :type="mostrarConfirmacaoSenha ? 'text' : 'password'"
                                        class="form-control"
                                        :class="{ 'is-invalid': Boolean(erroSenhaCampos.nova_senha_confirmation) }"
                                    />
                                    <button
                                        type="button"
                                        class="password-toggle"
                                        @click="mostrarConfirmacaoSenha = !mostrarConfirmacaoSenha"
                                    >
                                        {{ mostrarConfirmacaoSenha ? "Ocultar" : "Mostrar" }}
                                    </button>
                                </div>
                                <div v-if="erroSenhaCampos.nova_senha_confirmation" class="invalid-feedback d-block">
                                    {{ erroSenhaCampos.nova_senha_confirmation }}
                                </div>
                            </div>
                        </div>

                        <div v-if="erroSenhaLocal" class="edit-cliente__inline-alert mt-3">{{ erroSenhaLocal }}</div>
                        <div v-if="erroSenha" class="edit-cliente__inline-alert mt-3">{{ erroSenha }}</div>
                        <div class="d-flex justify-content-end mt-3">
                            <button
                                type="button"
                                class="btn edit-cliente__btn-primary"
                                :disabled="salvandoSenha || !perfil?.usuario?.id"
                                @click="aoSalvarSenha"
                            >
                                <RiSave3Line class="me-1" />
                                {{ salvandoSenha ? "Salvando..." : "Salvar senha" }}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </template>
    </article>
</template>

<style scoped>
.edit-cliente { background: #f4f7ff; padding-bottom: 4rem; }
.edit-cliente__loading,.edit-cliente__missing { min-height: 70vh; display:flex; align-items:center; justify-content:center; }
.edit-cliente__spinner { width:42px;height:42px;border-radius:50%;border:3px solid #dbe3fb;border-top-color:#5c6bc0;animation:spin 0.9s linear infinite;display:inline-block;margin-right:10px; }
@keyframes spin { to { transform: rotate(360deg); } }
.edit-cliente__missing-card { background:#fff; border-radius:18px; padding:2rem; text-align:center; box-shadow:0 12px 30px rgba(18,42,89,.08); }
.edit-cliente__missing-icon { font-size:2rem; color:#5c6bc0; margin-bottom:.5rem; }
.edit-cliente__hero { padding: 1.25rem 0 .75rem; }
.edit-cliente__hero-card { background:#fff; border-radius:18px; padding:1.25rem 1.25rem 1rem; box-shadow:0 14px 30px rgba(20,40,90,.08); }
.edit-cliente__crumb-link { display:inline-flex; align-items:center; gap:.4rem; color:#435a90; text-decoration:none; font-weight:700; }
.edit-cliente__hero-body { display:flex; gap:1rem; margin-top:.85rem; align-items:center; }
.edit-cliente__hero-icon { width:56px;height:56px;border-radius:14px; display:grid; place-items:center; background:linear-gradient(135deg,#eef2ff,#dde6ff); color:#3f4f84; font-size:1.3rem; }
.edit-cliente__hero-badge { font-size:.75rem; text-transform:uppercase; letter-spacing:.04em; color:#6b7fa8; font-weight:700; }
.edit-cliente__hero-title { margin:.25rem 0 .45rem; font-size:1.55rem; color:#1f3360; font-weight:800; }
.edit-cliente__hero-meta { display:flex; gap:.45rem; flex-wrap:wrap; }
.edit-cliente__pill { padding:.2rem .6rem; border-radius:999px; background:#eef2ff; color:#405687; font-size:.82rem; font-weight:700; }
.edit-cliente__layout { display:grid; grid-template-columns:240px 1fr; gap:1rem; margin-top:1rem; }
.edit-cliente__toc { position:sticky; top:94px; background:#fff; border-radius:14px; padding:1rem; box-shadow:0 10px 20px rgba(20,40,90,.06); }
.edit-cliente__toc-link { display:flex; align-items:center; gap:.45rem; padding:.45rem .55rem; border-radius:10px; text-decoration:none; color:#41598a; font-weight:700; }
.edit-cliente__toc-link:hover { background:#f0f4ff; }
.edit-panel { background:#fff; border-radius:16px; padding:1.1rem 1.1rem 1.2rem; box-shadow:0 10px 24px rgba(20,40,90,.06); margin-bottom:1rem; }
.edit-panel__head { display:flex; gap:.7rem; align-items:flex-start; margin-bottom:.8rem; }
.edit-panel__icon { font-size:1.2rem; color:#4f63a8; margin-top:.15rem; }
.edit-panel__title { margin:0; font-size:1.1rem; color:#223862; font-weight:800; }
.edit-panel__hint { margin:.2rem 0 0; color:#687c9d; font-size:.9rem; }
.edit-cliente__btn-primary { border:none; border-radius:12px; font-weight:700; padding:.55rem 1.25rem; color:#fff; background:linear-gradient(90deg,#5c6bc0,#2da0a8); }
.edit-cliente__alert { border-radius:10px; padding:.75rem .9rem; }
.edit-cliente__alert--erro,.edit-cliente__inline-alert { background:#fff3f3; border:1px solid #f1b4b4; color:#9e2b2b; }
.edit-cliente__alert--ok { background:#eefaf3; border:1px solid #b7e3c7; color:#1d6d3f; }
.edit-cliente__inline-alert { border-radius:10px; padding:.65rem .8rem; font-size:.9rem; }
.password-wrap { position:relative; }
.password-toggle { position:absolute; right:8px; top:50%; transform:translateY(-50%); border:none; background:transparent; color:#4b5f8a; font-size:.8rem; font-weight:700; }
@media (max-width: 991.98px) { .edit-cliente__layout { grid-template-columns: 1fr; } }
</style>
