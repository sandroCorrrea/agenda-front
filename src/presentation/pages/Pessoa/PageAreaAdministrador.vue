<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { RiShieldUserLine } from "@remixicon/vue";
import { cpfMask, onlyNumbers, phoneMask } from "@/shared/utils/masks";
import { useAdministradores } from "@/presentation/composables/Pessoa/useAdministradores";
import { PerfilAdministrador } from "@/domain/types/PerfilAdministrador";
import { labelPerfilAdministrador } from "@/shared/utils/adminPermissions";

const {
    lista,
    perfis,
    carregandoLista,
    criando,
    erro,
    sucesso,
    atualizandoStatusId,
    atualizandoPerfilId,
    carregarPerfis,
    carregar,
    criar,
    atualizarStatus,
    atualizarPerfil
} = useAdministradores();

const form = reactive({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    celular: "",
    senha: "",
    senha_confirmation: "",
    perfil_administrador: PerfilAdministrador.CONTABILIDADE as PerfilAdministrador
});
const mostrarSenha = ref(false);
const mostrarConfirmacaoSenha = ref(false);
const erros = reactive({
    nome: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    celular: "",
    senha: "",
    senha_confirmation: "",
    perfil_administrador: ""
});

function handleCpf(e: Event) {
    const input = e.target as HTMLInputElement;
    form.cpf = cpfMask(input.value);
}

function handleCelular(e: Event) {
    const input = e.target as HTMLInputElement;
    form.celular = phoneMask(input.value);
}

function formatarData(iso: Date): string {
    return iso.toLocaleDateString("pt-BR");
}

function validarFormulario(): boolean {
    erros.nome = form.nome.trim() ? "" : "Nome e obrigatorio";
    erros.cpf =
        onlyNumbers(form.cpf).length === 11 ? "" : "CPF deve conter 11 digitos";
    erros.data_nascimento = form.data_nascimento
        ? ""
        : "Data de nascimento e obrigatoria";
    erros.email = /\S+@\S+\.\S+/.test(form.email.trim())
        ? ""
        : "Informe um e-mail valido";
    erros.celular =
        onlyNumbers(form.celular).length >= 10
            ? ""
            : "Informe um celular valido";
    erros.senha =
        form.senha.length >= 8
            ? ""
            : "Senha deve conter no minimo 8 caracteres";
    erros.senha_confirmation = !form.senha_confirmation
        ? "Confirme sua senha"
        : form.senha_confirmation !== form.senha
            ? "As senhas devem ser iguais"
            : "";
    erros.perfil_administrador = form.perfil_administrador
        ? ""
        : "Selecione o perfil do administrador";

    return (
        !erros.nome &&
        !erros.cpf &&
        !erros.data_nascimento &&
        !erros.email &&
        !erros.celular &&
        !erros.senha &&
        !erros.senha_confirmation &&
        !erros.perfil_administrador
    );
}

async function aoCriarAdministrador(e: Event) {
    e.preventDefault();
    if (!validarFormulario()) return;
    try {
        await criar({
            nome: form.nome.trim(),
            cpf: onlyNumbers(form.cpf),
            data_nascimento: form.data_nascimento.trim(),
            email: form.email.trim(),
            celular: onlyNumbers(form.celular),
            senha: form.senha,
            senha_confirmation: form.senha_confirmation,
            perfil_administrador: form.perfil_administrador
        });
        form.nome = "";
        form.cpf = "";
        form.data_nascimento = "";
        form.email = "";
        form.celular = "";
        form.senha = "";
        form.senha_confirmation = "";
        form.perfil_administrador = PerfilAdministrador.CONTABILIDADE;
    } catch {
        return;
    }
}

watch([() => form.senha, () => form.senha_confirmation], () => {
    if (form.senha_confirmation && form.senha_confirmation !== form.senha) {
        erros.senha_confirmation = "As senhas devem ser iguais";
    } else if (form.senha_confirmation) {
        erros.senha_confirmation = "";
    }
});

async function aoAlterarStatus(
    usuarioId: number,
    event: Event
) {
    const select = event.target as HTMLSelectElement;
    const status = select.value as "ativo" | "inativo" | "bloqueado";
    try {
        await atualizarStatus(usuarioId, status);
    } catch {
        return;
    }
}

async function aoAlterarPerfil(usuarioId: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    const perfil = select.value as PerfilAdministrador;
    try {
        await atualizarPerfil(usuarioId, perfil);
    } catch {
        return;
    }
}

onMounted(async () => {
    try {
        await carregarPerfis();
        await carregar();
    } catch {
        return;
    }
});
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Administradores"
                subtitle="Cadastre integrantes da equipe e controle o status de acesso ao painel."
            >
                <template #icon><RiShieldUserLine /></template>
            </AdminPageHero>

            <div class="card admin-card border-0 shadow-sm mb-4">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Criar novo administrador</h2>
                    <form class="row g-3" @submit="aoCriarAdministrador">
                        <div class="col-12 col-md-6">
                            <label class="form-label">Nome</label>
                            <input
                                v-model="form.nome"
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': erros.nome }"
                                required
                            />
                            <div class="invalid-feedback">{{ erros.nome }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">CPF</label>
                            <input
                                v-model="form.cpf"
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': erros.cpf }"
                                required
                                @input="handleCpf"
                            />
                            <div class="invalid-feedback">{{ erros.cpf }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Data de nascimento</label>
                            <input
                                v-model="form.data_nascimento"
                                type="date"
                                class="form-control"
                                :class="{ 'is-invalid': erros.data_nascimento }"
                                required
                            />
                            <div class="invalid-feedback">{{ erros.data_nascimento }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Email</label>
                            <input
                                v-model="form.email"
                                type="email"
                                class="form-control"
                                :class="{ 'is-invalid': erros.email }"
                                required
                            />
                            <div class="invalid-feedback">{{ erros.email }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Celular</label>
                            <input
                                v-model="form.celular"
                                type="text"
                                class="form-control"
                                :class="{ 'is-invalid': erros.celular }"
                                required
                                @input="handleCelular"
                            />
                            <div class="invalid-feedback">{{ erros.celular }}</div>
                        </div>
                        <div class="col-12 col-md-6">
                            <label class="form-label">Perfil do administrador</label>
                            <select
                                v-model="form.perfil_administrador"
                                class="form-select"
                                :class="{ 'is-invalid': erros.perfil_administrador }"
                                required
                            >
                                <option
                                    v-for="opcao in perfis"
                                    :key="opcao.value"
                                    :value="opcao.value"
                                >
                                    {{ opcao.label }}
                                </option>
                            </select>
                            <div class="invalid-feedback">{{ erros.perfil_administrador }}</div>
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label">Senha</label>
                            <div class="password-wrapper">
                                <input
                                    v-model="form.senha"
                                    :type="mostrarSenha ? 'text' : 'password'"
                                    class="form-control"
                                    :class="{ 'is-invalid': erros.senha }"
                                    required
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="mostrarSenha = !mostrarSenha"
                                >
                                    {{ mostrarSenha ? "🙈" : "👁" }}
                                </button>
                                <div class="invalid-feedback">{{ erros.senha }}</div>
                            </div>
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label">Confirmar senha</label>
                            <div class="password-wrapper">
                                <input
                                    v-model="form.senha_confirmation"
                                    :type="mostrarConfirmacaoSenha ? 'text' : 'password'"
                                    class="form-control"
                                    :class="{ 'is-invalid': erros.senha_confirmation }"
                                    required
                                />
                                <button
                                    type="button"
                                    class="password-toggle"
                                    @click="mostrarConfirmacaoSenha = !mostrarConfirmacaoSenha"
                                >
                                    {{ mostrarConfirmacaoSenha ? "🙈" : "👁" }}
                                </button>
                                <div class="invalid-feedback">{{ erros.senha_confirmation }}</div>
                            </div>
                        </div>
                        <div class="col-12 d-flex justify-content-end">
                            <button type="submit" class="btn btn-primary btn-admin" :disabled="criando">
                                {{ criando ? "Criando..." : "Criar administrador" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Administradores cadastrados</h2>

                    <div v-if="erro" class="admin-alert admin-alert--erro">{{ erro }}</div>
                    <div v-if="sucesso" class="admin-alert admin-alert--ok">{{ sucesso }}</div>

                    <div v-if="carregandoLista" class="text-muted mt-3">Carregando administradores...</div>
                    <div v-else class="table-responsive mt-3">
                        <table class="table admin-table align-middle">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>CPF</th>
                                    <th>Celular</th>
                                    <th>Nascimento</th>
                                    <th>Perfil</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in lista" :key="item.id">
                                    <td>{{ item.nome }}</td>
                                    <td>{{ item.email }}</td>
                                    <td>{{ cpfMask(item.cpf) }}</td>
                                    <td>{{ phoneMask(item.celular) }}</td>
                                    <td>{{ formatarData(item.dataNascimento) }}</td>
                                    <td>
                                        <select
                                            class="form-select form-select-sm"
                                            :value="item.usuario.perfilAdministrador ?? ''"
                                            :disabled="atualizandoPerfilId === item.usuario.id"
                                            @change="aoAlterarPerfil(item.usuario.id, $event)"
                                        >
                                            <option
                                                v-for="opcao in perfis"
                                                :key="opcao.value"
                                                :value="opcao.value"
                                            >
                                                {{ opcao.label }}
                                            </option>
                                        </select>
                                        <small
                                            v-if="!item.usuario.perfilAdministrador"
                                            class="text-muted d-block mt-1"
                                        >
                                            {{ labelPerfilAdministrador(item.usuario.perfilAdministrador) }}
                                        </small>
                                    </td>
                                    <td>
                                        <select
                                            class="form-select form-select-sm"
                                            :value="item.usuario.status"
                                            :disabled="atualizandoStatusId === item.usuario.id"
                                            @change="aoAlterarStatus(item.usuario.id, $event)"
                                        >
                                            <option value="ativo">ativo</option>
                                            <option value="inativo">inativo</option>
                                            <option value="bloqueado">bloqueado</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr v-if="lista.length === 0">
                                    <td colspan="7" class="text-center text-muted py-4">
                                        Nenhum administrador encontrado.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.admin-card {
    border-radius: 20px;
    border: 1px solid rgba(20, 30, 40, 0.08);
    box-shadow: 0 14px 28px rgba(20, 30, 40, 0.06) !important;
}

.admin-subtitle {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    font-weight: 800;
    color: #16254e;
}

.btn-admin {
    border: none !important;
    border-radius: 999px !important;
    padding: 10px 16px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
}

.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    margin-top: 0.75rem;
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

.admin-table th {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: #67789c;
}

.admin-table td {
    color: #243555;
    font-size: 0.93rem;
}

.admin-table tbody tr:hover td {
    background: rgba(92, 107, 192, 0.05);
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
