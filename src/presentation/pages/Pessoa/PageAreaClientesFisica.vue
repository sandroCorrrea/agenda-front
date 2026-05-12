<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiPencilLine,
    RiSave3Line,
    RiUser3Line
} from "@remixicon/vue";
import { cpfMask, onlyNumbers, phoneMask } from "@/shared/utils/masks";
import { useClientesPessoaFisica } from "@/presentation/composables/Pessoa/useClientesPessoaFisica";

const {
    lista,
    carregandoLista,
    criando,
    erro,
    sucesso,
    erroCampos,
    paginaAtual,
    totalRegistros,
    totalPaginas,
    carregar,
    criar,
    irParaPagina
} = useClientesPessoaFisica();

const form = reactive({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    celular: "",
    senha: "",
    senha_confirmation: ""
});

const erros = reactive<Record<string, string>>({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    celular: "",
    senha: "",
    senha_confirmation: ""
});

const mostrarSenha = ref(false);
const mostrarConfirmacaoSenha = ref(false);
const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function aoDigitarCpf(e: Event) {
    const input = e.target as HTMLInputElement;
    form.cpf = cpfMask(input.value);
}

function aoDigitarCelular(e: Event) {
    const input = e.target as HTMLInputElement;
    form.celular = phoneMask(input.value);
}

function validar(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome e obrigatorio.";
    erros.cpf =
        onlyNumbers(form.cpf).length === 11 ? "" : "CPF deve conter 11 digitos.";
    erros.data_nascimento = form.data_nascimento
        ? ""
        : "Data de nascimento e obrigatoria.";
    erros.email = /\S+@\S+\.\S+/.test(form.email.trim())
        ? ""
        : "Informe um e-mail valido.";
    erros.celular =
        onlyNumbers(form.celular).length >= 10
            ? ""
            : "Informe um celular valido.";
    erros.senha = regexSenhaForte.test(form.senha)
        ? ""
        : "A senha deve ter 8+ caracteres, com maiuscula, minuscula, numero e simbolo.";
    erros.senha_confirmation = !form.senha_confirmation
        ? "Confirme a senha."
        : form.senha_confirmation !== form.senha
          ? "As senhas devem ser iguais."
          : "";
    return Object.values(erros).every((valor) => !valor);
}

function limparFormulario() {
    form.nome = "";
    form.cpf = "";
    form.data_nascimento = "";
    form.email = "";
    form.celular = "";
    form.senha = "";
    form.senha_confirmation = "";
}

function formatarData(date: Date): string {
    return date.toLocaleDateString("pt-BR");
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await criar({
            nome: form.nome.trim(),
            cpf: onlyNumbers(form.cpf),
            data_nascimento: form.data_nascimento,
            email: form.email.trim(),
            celular: onlyNumbers(form.celular),
            senha: form.senha,
            senha_confirmation: form.senha_confirmation
        });
        limparFormulario();
    } catch {
        return;
    }
}

onMounted(async () => {
    try {
        await carregar(1);
    } catch {
        return;
    }
});
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Clientes — pessoa física"
                subtitle="Cadastre clientes com usuário padrão cliente e acompanhe a lista paginada."
            >
                <template #icon><RiUser3Line /></template>
            </AdminPageHero>

            <div class="card admin-card border-0 shadow-sm mb-4">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Criar cliente</h2>
                    <p class="admin-hint">
                        Cadastro manual de cliente pessoa fisica com usuario padrao
                        <strong>cliente</strong>.
                    </p>

                    <form class="row g-3" @submit.prevent="aoSalvar">
                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cliente-nome">Nome</label>
                            <input
                                id="cliente-nome"
                                v-model="form.nome"
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': Boolean(erros.nome || erroCampos.nome) }"
                            />
                            <div v-if="erros.nome || erroCampos.nome" class="invalid-feedback d-block">
                                {{ erros.nome || erroCampos.nome }}
                            </div>
                        </div>

                        <div class="col-12 col-md-3">
                            <label class="form-label" for="cliente-cpf">CPF</label>
                            <input
                                id="cliente-cpf"
                                :value="form.cpf"
                                type="text"
                                class="form-control"
                                inputmode="numeric"
                                maxlength="14"
                                placeholder="000.000.000-00"
                                :class="{ 'is-invalid': Boolean(erros.cpf || erroCampos.cpf) }"
                                @input="aoDigitarCpf"
                            />
                            <div v-if="erros.cpf || erroCampos.cpf" class="invalid-feedback d-block">
                                {{ erros.cpf || erroCampos.cpf }}
                            </div>
                        </div>

                        <div class="col-12 col-md-3">
                            <label class="form-label" for="cliente-nascimento">Data de nascimento</label>
                            <input
                                id="cliente-nascimento"
                                v-model="form.data_nascimento"
                                type="date"
                                class="form-control"
                                :class="{
                                    'is-invalid': Boolean(
                                        erros.data_nascimento || erroCampos.data_nascimento
                                    )
                                }"
                            />
                            <div
                                v-if="erros.data_nascimento || erroCampos.data_nascimento"
                                class="invalid-feedback d-block"
                            >
                                {{ erros.data_nascimento || erroCampos.data_nascimento }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cliente-email">E-mail</label>
                            <input
                                id="cliente-email"
                                v-model="form.email"
                                type="email"
                                class="form-control"
                                :class="{ 'is-invalid': Boolean(erros.email || erroCampos.email) }"
                            />
                            <div v-if="erros.email || erroCampos.email" class="invalid-feedback d-block">
                                {{ erros.email || erroCampos.email }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cliente-celular">Celular</label>
                            <input
                                id="cliente-celular"
                                :value="form.celular"
                                type="text"
                                class="form-control"
                                inputmode="tel"
                                maxlength="15"
                                placeholder="(00) 00000-0000"
                                :class="{ 'is-invalid': Boolean(erros.celular || erroCampos.celular) }"
                                @input="aoDigitarCelular"
                            />
                            <div v-if="erros.celular || erroCampos.celular" class="invalid-feedback d-block">
                                {{ erros.celular || erroCampos.celular }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cliente-senha">Senha</label>
                            <div class="password-wrap">
                                <input
                                    id="cliente-senha"
                                    v-model="form.senha"
                                    :type="mostrarSenha ? 'text' : 'password'"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.senha || erroCampos.senha) }"
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="mostrarSenha = !mostrarSenha"
                                >
                                    {{ mostrarSenha ? "Ocultar" : "Mostrar" }}
                                </button>
                            </div>
                            <div v-if="erros.senha || erroCampos.senha" class="invalid-feedback d-block">
                                {{ erros.senha || erroCampos.senha }}
                            </div>
                        </div>

                        <div class="col-12 col-md-6">
                            <label class="form-label" for="cliente-senha-confirmacao">Confirmar senha</label>
                            <div class="password-wrap">
                                <input
                                    id="cliente-senha-confirmacao"
                                    v-model="form.senha_confirmation"
                                    :type="mostrarConfirmacaoSenha ? 'text' : 'password'"
                                    class="form-control"
                                    :class="{
                                        'is-invalid': Boolean(
                                            erros.senha_confirmation || erroCampos.senha_confirmation
                                        )
                                    }"
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="mostrarConfirmacaoSenha = !mostrarConfirmacaoSenha"
                                >
                                    {{ mostrarConfirmacaoSenha ? "Ocultar" : "Mostrar" }}
                                </button>
                            </div>
                            <div
                                v-if="erros.senha_confirmation || erroCampos.senha_confirmation"
                                class="invalid-feedback d-block"
                            >
                                {{ erros.senha_confirmation || erroCampos.senha_confirmation }}
                            </div>
                        </div>

                        <div class="col-12 d-flex justify-content-end">
                            <button type="submit" class="btn btn-primary btn-admin" :disabled="criando">
                                <RiSave3Line class="me-1" />
                                {{ criando ? "Salvando..." : "Salvar cliente" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h2 class="admin-subtitle mb-0">Clientes cadastrados</h2>
                        <small class="text-muted">{{ totalRegistros }} registros</small>
                    </div>

                    <div v-if="erro" class="admin-alert admin-alert--erro mt-3">{{ erro }}</div>
                    <div v-if="sucesso" class="admin-alert admin-alert--ok mt-3">{{ sucesso }}</div>

                    <div v-if="carregandoLista" class="text-muted mt-3">Carregando clientes...</div>
                    <div v-else class="row g-3 mt-1">
                        <div v-for="item in lista" :key="item.id" class="col-12 col-md-6 col-xl-4">
                            <div class="cliente-card">
                                <h3 class="cliente-card__nome">{{ item.nome }}</h3>
                                <p class="cliente-card__line">
                                    <span>CPF</span>
                                    <span class="cliente-card__value">{{ cpfMask(item.cpf) }}</span>
                                </p>
                                <p class="cliente-card__line">
                                    <span>E-mail</span>
                                    <span class="cliente-card__value cliente-card__value--email">
                                        {{ item.email }}
                                    </span>
                                </p>
                                <p class="cliente-card__line">
                                    <span>Celular</span>
                                    <span class="cliente-card__value">{{ phoneMask(item.celular) }}</span>
                                </p>
                                <p class="cliente-card__line">
                                    <span>Nascimento</span>
                                    <span class="cliente-card__value">
                                        {{ formatarData(item.dataNascimento) }}
                                    </span>
                                </p>
                                <p class="cliente-card__line">
                                    <span>Status</span>
                                    <span class="cliente-card__value">
                                        {{ item.usuario?.status ?? "sem usuario" }}
                                    </span>
                                </p>
                                <div class="cliente-card__actions">
                                    <RouterLink
                                        class="btn cliente-card__btn-edit"
                                        :to="{
                                            name: 'AdministradorClienteFisicaEditar',
                                            params: { id: item.id }
                                        }"
                                    >
                                        <RiPencilLine />
                                        Editar
                                    </RouterLink>
                                </div>
                            </div>
                        </div>
                        <div v-if="lista.length === 0" class="col-12">
                            <p class="text-center text-muted py-4 mb-0">
                                Nenhum cliente encontrado.
                            </p>
                        </div>
                    </div>

                    <div class="clientes-pag mt-4" v-if="lista.length > 0">
                        <button
                            type="button"
                            class="btn clientes-pag__nav"
                            :disabled="paginaAtual <= 1"
                            @click="irParaPagina(paginaAtual - 1)"
                        >
                            <RiArrowLeftSLine />
                        </button>
                        <span class="clientes-pag__info">
                            Pagina {{ paginaAtual }} de {{ totalPaginas() }}
                        </span>
                        <button
                            type="button"
                            class="btn clientes-pag__nav"
                            :disabled="paginaAtual >= totalPaginas()"
                            @click="irParaPagina(paginaAtual + 1)"
                        >
                            <RiArrowRightSLine />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.admin-card {
    border-radius: 18px;
}

.admin-subtitle {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: #16254e;
}

.admin-hint {
    margin-top: -0.4rem;
    margin-bottom: 1rem;
    color: #6c7a94;
}

.btn-admin {
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 16px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
}

.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
}

.admin-alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}

.admin-alert--ok {
    background: #eefaf3;
    border: 1px solid #b7e3c7;
    color: #1d6d3f;
}

.password-wrap {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: #4b5f8a;
    font-size: 0.8rem;
    font-weight: 700;
}

.cliente-card {
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 14px;
    padding: 0.95rem 1rem;
    background: #fff;
    height: 100%;
}

.cliente-card__nome {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 800;
    color: #223862;
}

.cliente-card__line {
    margin: 0.3rem 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    color: #304867;
    font-size: 0.9rem;
}

.cliente-card__line > span:first-child {
    color: #6b7d9c;
    font-weight: 600;
    flex-shrink: 0;
}

.cliente-card__value {
    color: #304867 !important;
    font-weight: 500 !important;
    text-align: right;
    min-width: 0;
}

.cliente-card__value--email {
    overflow-wrap: anywhere;
    word-break: break-word;
}

.cliente-card__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.75rem;
}

.cliente-card__btn-edit {
    border: 1px solid rgba(92, 107, 192, 0.3);
    border-radius: 10px;
    color: #3f5284;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.cliente-card__btn-edit:hover {
    border-color: #5c6bc0;
    color: #2f4578;
    background: #f4f7ff;
}

.clientes-pag {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.9rem;
}

.clientes-pag__nav {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(92, 107, 192, 0.28);
    color: #40528b;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.clientes-pag__info {
    font-size: 0.9rem;
    color: #4a5c82;
}
</style>
