<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { RiSearchLine } from "@remixicon/vue";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { usePessoaPerfil } from "@/presentation/composables/Pessoa/usePessoaPerfil";
import { useEnderecoUsuario } from "@/presentation/composables/Endereco/useEnderecoUsuario";
import { UsuarioSenhaUpdateDTO } from "@/application/dto/Usuario/UsuarioSenhaUpdateDTO";
import { PessoaContatoUpdateDTO } from "@/application/dto/Pessoa/PessoaContatoUpdateDTO";
import { EnderecoCreateDTO } from "@/application/dto/Endereco/EnderecoCreateDTO";
import { EnderecoUpdateDTO } from "@/application/dto/Endereco/EnderecoUpdateDTO";
import BaseLoading from "@/presentation/components/Shared/BaseLoading.vue";
import { cepMask, cpfMask, onlyNumbers, phoneMask } from "@/shared/utils/masks";

const auth = useAuthStore();
const router = useRouter();
const {
    carregar,
    atualizarContato,
    alterarSenha,
    enviarImagem,
    perfil,
    carregando,
    salvandoContato,
    salvandoSenha,
    salvandoImagem,
    erro,
    erroContato,
    erroSenha,
    erroSenhaCampos,
    erroImagem,
    sucessoContato,
    sucessoSenha,
    sucessoImagem
} = usePessoaPerfil();
const {
    buscarCep,
    salvarEndereco,
    atualizarEnderecoUsuario,
    carregarEnderecoUsuario,
    carregandoCep,
    carregandoEndereco,
    salvandoEndereco,
    erroCep,
    erroEndereco,
    sucessoEndereco,
    endereco
} = useEnderecoUsuario();

const pessoaId = computed(() => auth.usuario?.pessoa_id ?? null);
const usuarioId = computed(() => perfil.value?.usuario?.id ?? null);

const storageBaseUrl = import.meta.env.VITE_STORAGE_BASE_URL ?? "";
const baseApi =
    import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "";

const imgQuebrou = ref(false);

const urlImagemUsuario = computed(() => {
    const img = (perfil.value?.usuario?.img ?? "").trim();
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;

    const baseStorage = storageBaseUrl.replace(/\/$/, "");
    const apiSemSufixoApi = baseApi.replace(/\/api\/?$/, "");
    const baseApiStorage = `${apiSemSufixoApi.replace(/\/$/, "")}/storage`;
    const base = baseStorage || baseApiStorage;
    const caminhoNormalizado = img
        .replace(/^\/+/, "")
        .replace(/^storage\/+/i, "");
    return `${base}/${encodeURI(caminhoNormalizado)}`;
});

const previewLocal = ref<string | null>(null);
const inputArquivo = ref<HTMLInputElement | null>(null);
const temArquivoSelecionado = ref(false);

const formContato = reactive({
    email: "",
    celular: ""
});

const formEndereco = reactive({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    unidade: "",
    bairro: "",
    localidade: "",
    uf: "",
    estado: "",
    regiao: "",
    ibge: "",
    gia: "",
    ddd: "",
    siafi: ""
});

const formSenha = ref({
    senha_atual: "",
    nova_senha: "",
    nova_senha_confirmation: ""
});
const mostrarSenhaAtual = ref(false);
const mostrarNovaSenha = ref(false);
const mostrarConfirmacaoSenha = ref(false);
const erroSenhaLocal = ref<string | null>(null);
const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function sincronizarContatoComPerfil() {
    const p = perfil.value;
    if (!p) return;
    formContato.email = p.email;
    formContato.celular = phoneMask(p.celular);
}

watch(perfil, sincronizarContatoComPerfil, { immediate: true });
function formatarDataNascimento(d: Date): string {
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR");
}

function aoEscolherArquivo(e: Event) {
    const el = e.target as HTMLInputElement;
    const f = el.files?.[0];
    if (previewLocal.value) {
        URL.revokeObjectURL(previewLocal.value);
        previewLocal.value = null;
    }
    temArquivoSelecionado.value = Boolean(f);
    if (f) {
        previewLocal.value = URL.createObjectURL(f);
    }
}

function onImgError() {
    imgQuebrou.value = true;
}

onUnmounted(() => {
    if (previewLocal.value) {
        URL.revokeObjectURL(previewLocal.value);
    }
});

onMounted(async () => {
    if (pessoaId.value == null || pessoaId.value < 1) {
        await router.replace({ name: "AreaCliente" });
        return;
    }
    try {
        await carregar(pessoaId.value);
        const uid = auth.usuario?.id ?? null;
        if (uid != null) {
            const enderecoSalvo = await carregarEnderecoUsuario(uid);
            if (enderecoSalvo) {
                preencherEnderecoForm(enderecoSalvo);
            }
        }
    } catch {
        return;
    }
});

watch(
    () => perfil.value?.usuario?.img,
    () => {
        imgQuebrou.value = false;
    },
    { immediate: true }
);

function aoDigitarCelularContato(e: Event) {
    const input = e.target as HTMLInputElement;
    formContato.celular = phoneMask(input.value);
}

function aoDigitarCep(e: Event) {
    const input = e.target as HTMLInputElement;
    formEndereco.cep = cepMask(input.value);
}

async function aoBuscarCep() {
    const cepLimpo = onlyNumbers(formEndereco.cep);
    if (cepLimpo.length !== 8) {
        return;
    }
    const dados = await buscarCep(cepLimpo);
    if (!dados) return;
    formEndereco.cep = dados.cep || cepMask(cepLimpo);
    formEndereco.logradouro = dados.logradouro ?? "";
    formEndereco.complemento = dados.complemento ?? "";
    formEndereco.unidade = dados.unidade ?? "";
    formEndereco.bairro = dados.bairro ?? "";
    formEndereco.localidade = dados.localidade ?? "";
    formEndereco.uf = dados.uf ?? "";
    formEndereco.estado = dados.estado ?? "";
    formEndereco.regiao = dados.regiao ?? "";
    formEndereco.ibge = dados.ibge ?? "";
    formEndereco.gia = dados.gia ?? "";
    formEndereco.ddd = dados.ddd ?? "";
    formEndereco.siafi = dados.siafi ?? "";
}

function limparEnderecoForm() {
    formEndereco.cep = "";
    formEndereco.logradouro = "";
    formEndereco.numero = "";
    formEndereco.complemento = "";
    formEndereco.unidade = "";
    formEndereco.bairro = "";
    formEndereco.localidade = "";
    formEndereco.uf = "";
    formEndereco.estado = "";
    formEndereco.regiao = "";
    formEndereco.ibge = "";
    formEndereco.gia = "";
    formEndereco.ddd = "";
    formEndereco.siafi = "";
}

function preencherEnderecoForm(data: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    unidade: string;
    bairro: string;
    localidade: string;
    uf: string;
    estado: string;
    regiao: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
}) {
    formEndereco.cep = cepMask(data.cep);
    formEndereco.logradouro = data.logradouro ?? "";
    formEndereco.numero = data.numero ?? "";
    formEndereco.complemento = data.complemento ?? "";
    formEndereco.unidade = data.unidade ?? "";
    formEndereco.bairro = data.bairro ?? "";
    formEndereco.localidade = data.localidade ?? "";
    formEndereco.uf = data.uf ?? "";
    formEndereco.estado = data.estado ?? "";
    formEndereco.regiao = data.regiao ?? "";
    formEndereco.ibge = data.ibge ?? "";
    formEndereco.gia = data.gia ?? "";
    formEndereco.ddd = data.ddd ?? "";
    formEndereco.siafi = data.siafi ?? "";
}

async function aoSalvarEndereco(e: Event) {
    e.preventDefault();
    const uid = auth.usuario?.id ?? null;
    if (uid == null || !podeSalvarEndereco.value) return;
    try {
        const cep = onlyNumbers(formEndereco.cep);
        const logradouro = formEndereco.logradouro.trim();
        const numero = formEndereco.numero.trim();
        const complemento = formEndereco.complemento.trim();
        const unidade = formEndereco.unidade.trim();
        const bairro = formEndereco.bairro.trim();
        const localidade = formEndereco.localidade.trim();
        const uf = formEndereco.uf.trim();
        const estado = formEndereco.estado.trim();
        const regiao = formEndereco.regiao.trim();
        const ibge = formEndereco.ibge.trim();
        const gia = formEndereco.gia.trim();
        const ddd = formEndereco.ddd.trim();
        const siafi = formEndereco.siafi.trim();

        if (endereco.value) {
            await atualizarEnderecoUsuario(
                uid,
                new EnderecoUpdateDTO(
                    cep,
                    logradouro,
                    numero,
                    complemento,
                    unidade,
                    bairro,
                    localidade,
                    uf,
                    estado,
                    regiao,
                    ibge,
                    gia,
                    ddd,
                    siafi
                )
            );
        } else {
            await salvarEndereco(
                new EnderecoCreateDTO(
                    uid,
                    cep,
                    logradouro,
                    numero,
                    complemento,
                    unidade,
                    bairro,
                    localidade,
                    uf,
                    estado,
                    regiao,
                    ibge,
                    gia,
                    ddd,
                    siafi
                )
            );
        }
        const enderecoSalvo = await carregarEnderecoUsuario(uid);
        if (enderecoSalvo) {
            preencherEnderecoForm(enderecoSalvo);
        } else {
            limparEnderecoForm();
        }
    } catch {
        return;
    }
}

async function aoSalvarContato(e: Event) {
    e.preventDefault();
    const pid = pessoaId.value;
    if (pid == null) return;
    if (!/\S+@\S+\.\S+/.test(formContato.email.trim())) {
        return;
    }
    try {
        await atualizarContato(
            pid,
            new PessoaContatoUpdateDTO(
                formContato.email.trim(),
                onlyNumbers(formContato.celular)
            )
        );
    } catch {
        return;
    }
}

async function aoSalvarImagem() {
    const uid = usuarioId.value;
    const el = inputArquivo.value;
    const f = el?.files?.[0];
    if (uid == null || !f) return;
    const tiposPermitidos = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/svg+xml"
    ];
    const tamanhoMaximo = 5 * 1024 * 1024;
    if (f.type && !tiposPermitidos.includes(f.type)) {
        erroImagem.value =
            "Formato inválido. Use JPEG, JPG, PNG ou SVG.";
        return;
    }
    if (f.size > tamanhoMaximo) {
        erroImagem.value = "A imagem deve ter no máximo 5MB.";
        return;
    }
    try {
        await enviarImagem(uid, f);
        if (previewLocal.value) {
            URL.revokeObjectURL(previewLocal.value);
            previewLocal.value = null;
        }
        temArquivoSelecionado.value = false;
        if (el) el.value = "";
    } catch {
        return;
    }
}

async function aoSalvarSenha(e: Event) {
    e.preventDefault();
    const uid = usuarioId.value;
    erroSenhaLocal.value = null;
    erroSenhaCampos.value = {};
    if (uid == null || !podeSalvarSenha.value) return;
    if (!formSenha.value.senha_atual.trim()) {
        erroSenhaLocal.value = "Informe a senha atual.";
        return;
    }
    if (!regexSenhaForte.test(formSenha.value.nova_senha)) {
        erroSenhaLocal.value =
            "A nova senha deve ter 8+ caracteres, com maiúscula, minúscula, número e símbolo.";
        return;
    }
    if (
        formSenha.value.nova_senha !==
        formSenha.value.nova_senha_confirmation
    ) {
        erroSenhaLocal.value = "A confirmação da nova senha não confere.";
        return;
    }
    try {
        await alterarSenha(
            uid,
            new UsuarioSenhaUpdateDTO(
                formSenha.value.senha_atual,
                formSenha.value.nova_senha,
                formSenha.value.nova_senha_confirmation
            )
        );
        formSenha.value = {
            senha_atual: "",
            nova_senha: "",
            nova_senha_confirmation: ""
        };
    } catch {
        return;
    }
}

const imagemPreview = computed(() =>
    previewLocal.value ?? (!imgQuebrou.value ? urlImagemUsuario.value : null)
);
const podeEditarUsuario = computed(() => usuarioId.value != null);

const podeSalvarSenha = computed(() => {
    const f = formSenha.value;
    if (!f.senha_atual.trim()) return false;
    if (!regexSenhaForte.test(f.nova_senha)) return false;
    if (f.nova_senha !== f.nova_senha_confirmation) return false;
    return true;
});

const podeSalvarContato = computed(() => {
    const email = formContato.email.trim();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return false;
    return onlyNumbers(formContato.celular).length >= 10;
});

const podeSalvarEndereco = computed(() => {
    const cep = onlyNumbers(formEndereco.cep);
    if (cep.length !== 8) return false;
    if (!formEndereco.logradouro.trim()) return false;
    if (!formEndereco.bairro.trim()) return false;
    if (!formEndereco.localidade.trim()) return false;
    if (!formEndereco.uf.trim()) return false;
    if (!formEndereco.estado.trim()) return false;
    return true;
});
</script>

<template>
    <article class="page-perfil d-flex align-items-start min-vh-100 py-4">
        <div class="container">
            <div class="mb-3">
                <h1 class="section-title">Perfil</h1>
                <p class="page-perfil__intro">
                    Atualize e-mail, celular, foto e senha quando precisar.
                </p>
            </div>

            <BaseLoading v-if="carregando" text="Carregando seus dados..." />

            <div v-else-if="erro && !perfil" class="perfil-alerta perfil-alerta--erro">
                {{ erro }}
            </div>

            <div v-else-if="perfil" class="row justify-content-center g-4">
                <div class="col-12 col-lg-8 col-xl-7">
                    <div class="card perfil-card border-0 shadow-sm mb-4">
                        <div class="card-body p-4 p-md-5">
                            <h2 class="perfil-bloco-titulo">Dados pessoais</h2>
                            <p class="perfil-bloco-sub">
                                Nome, CPF e data de nascimento não podem ser alterados aqui.
                            </p>
                            <dl class="row perfil-dl mb-0">
                                <dt class="col-sm-4">Nome</dt>
                                <dd class="col-sm-8">{{ perfil.nome }}</dd>
                                <dt class="col-sm-4">CPF</dt>
                                <dd class="col-sm-8">{{ cpfMask(perfil.cpf) }}</dd>
                                <dt class="col-sm-4">Nascimento</dt>
                                <dd class="col-sm-8">{{ formatarDataNascimento(perfil.dataNascimento) }}</dd>
                            </dl>
                        </div>
                    </div>

                    <div class="card perfil-card border-0 shadow-sm mb-4">
                        <div class="card-body p-4 p-md-5">
                            <h2 class="perfil-bloco-titulo">Contato</h2>
                            <p class="perfil-bloco-sub">
                                E-mail e celular podem ser atualizados abaixo.
                            </p>
                            <form @submit="aoSalvarContato">
                                <div class="mb-3">
                                    <label for="contato-email" class="form-label">E-mail</label>
                                    <input
                                        id="contato-email"
                                        v-model="formContato.email"
                                        type="email"
                                        class="form-control form-control-lg"
                                        required
                                        autocomplete="email"
                                    />
                                </div>
                                <div class="mb-3">
                                    <label for="contato-celular" class="form-label">Celular</label>
                                    <input
                                        id="contato-celular"
                                        v-model="formContato.celular"
                                        type="tel"
                                        class="form-control form-control-lg"
                                        required
                                        autocomplete="tel"
                                        inputmode="numeric"
                                        @input="aoDigitarCelularContato"
                                    />
                                </div>
                                <div
                                    v-if="erroContato"
                                    class="perfil-alerta perfil-alerta--erro mb-3"
                                >
                                    {{ erroContato }}
                                </div>
                                <div
                                    v-if="sucessoContato"
                                    class="perfil-alerta perfil-alerta--ok mb-3"
                                    role="status"
                                >
                                    E-mail e celular atualizados com sucesso.
                                </div>
                                <button
                                    type="submit"
                                    class="btn btn-primary btn-salvar"
                                    :disabled="salvandoContato || !podeSalvarContato"
                                >
                                    {{ salvandoContato ? "Salvando..." : "Salvar contato" }}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div class="card perfil-card border-0 shadow-sm mb-4">
                        <div class="card-body p-4 p-md-5">
                            <h2 class="perfil-bloco-titulo">Endereço</h2>
                            <p class="perfil-bloco-sub">
                                Busque seu CEP para preencher automaticamente e salvar o endereço vinculado ao seu usuário.
                            </p>
                            <form @submit="aoSalvarEndereco">
                                <div class="row g-3">
                                    <div class="col-12 col-md-7">
                                        <label for="endereco-cep" class="form-label">CEP</label>
                                        <div class="endereco-cep-wrap">
                                            <input
                                                id="endereco-cep"
                                                v-model="formEndereco.cep"
                                                type="text"
                                                class="form-control form-control-lg"
                                                placeholder="00000-000"
                                                inputmode="numeric"
                                                maxlength="9"
                                                required
                                                @input="aoDigitarCep"
                                            />
                                            <button
                                                type="button"
                                                class="btn btn-outline-primary btn-cep"
                                                :disabled="carregandoCep || onlyNumbers(formEndereco.cep).length !== 8"
                                                @click="aoBuscarCep"
                                            >
                                                <span class="btn-cep__content">
                                                    <RiSearchLine class="btn-cep__icon" />
                                                    {{ carregandoCep ? "Buscando" : "Buscar" }}
                                                </span>
                                            </button>
                                        </div>
                                        <div
                                            v-if="erroCep"
                                            class="perfil-alerta perfil-alerta--erro mt-2"
                                        >
                                            {{ erroCep }}
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-5">
                                        <label for="endereco-numero" class="form-label">Número</label>
                                        <input
                                            id="endereco-numero"
                                            v-model="formEndereco.numero"
                                            type="text"
                                            class="form-control form-control-lg"
                                            placeholder="Opcional"
                                        />
                                    </div>

                                    <div class="col-12">
                                        <label for="endereco-logradouro" class="form-label">Logradouro</label>
                                        <input
                                            id="endereco-logradouro"
                                            v-model="formEndereco.logradouro"
                                            type="text"
                                            class="form-control form-control-lg"
                                            required
                                        />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label for="endereco-complemento" class="form-label">Complemento</label>
                                        <input
                                            id="endereco-complemento"
                                            v-model="formEndereco.complemento"
                                            type="text"
                                            class="form-control form-control-lg"
                                            placeholder="Opcional"
                                        />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label for="endereco-bairro" class="form-label">Bairro</label>
                                        <input
                                            id="endereco-bairro"
                                            v-model="formEndereco.bairro"
                                            type="text"
                                            class="form-control form-control-lg"
                                            required
                                        />
                                    </div>

                                    <div class="col-12 col-md-8">
                                        <label for="endereco-cidade" class="form-label">Cidade</label>
                                        <input
                                            id="endereco-cidade"
                                            v-model="formEndereco.localidade"
                                            type="text"
                                            class="form-control form-control-lg"
                                            required
                                        />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label for="endereco-uf" class="form-label">UF</label>
                                        <input
                                            id="endereco-uf"
                                            v-model="formEndereco.uf"
                                            type="text"
                                            class="form-control form-control-lg text-uppercase"
                                            maxlength="2"
                                            required
                                        />
                                    </div>
                                </div>

                                <input v-model="formEndereco.estado" type="hidden" />
                                <input v-model="formEndereco.regiao" type="hidden" />
                                <input v-model="formEndereco.ibge" type="hidden" />
                                <input v-model="formEndereco.gia" type="hidden" />
                                <input v-model="formEndereco.ddd" type="hidden" />
                                <input v-model="formEndereco.siafi" type="hidden" />
                                <input v-model="formEndereco.unidade" type="hidden" />

                                <div
                                    v-if="erroEndereco"
                                    class="perfil-alerta perfil-alerta--erro mt-3"
                                >
                                    {{ erroEndereco }}
                                </div>
                                <div
                                    v-if="sucessoEndereco"
                                    class="perfil-alerta perfil-alerta--ok mt-3"
                                    role="status"
                                >
                                    Endereço salvo com sucesso.
                                </div>
                                <button
                                    type="submit"
                                    class="btn btn-primary btn-salvar mt-3"
                                    :disabled="salvandoEndereco || !podeSalvarEndereco"
                                >
                                    {{
                                        salvandoEndereco
                                            ? "Salvando..."
                                            : endereco
                                                ? "Atualizar endereço"
                                                : "Salvar endereço"
                                    }}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div
                        v-if="!podeEditarUsuario"
                        class="perfil-alerta perfil-alerta--erro"
                    >
                        Não foi possível carregar os dados da sua conta de usuário para
                        alteração de foto ou senha.
                    </div>

                    <template v-else>
                        <div class="card perfil-card border-0 shadow-sm mb-4">
                            <div class="card-body p-4 p-md-5">
                                <h2 class="perfil-bloco-titulo">Foto do perfil</h2>
                                <p class="perfil-bloco-sub">
                                    Envie uma imagem (JPEG, JPG, PNG ou SVG, até 5MB).
                                </p>
                                <div class="perfil-foto-linha">
                                    <div class="perfil-avatar-wrap">
                                        <img
                                            v-if="imagemPreview"
                                            :src="imagemPreview"
                                            alt="Foto do usuário"
                                            class="perfil-avatar"
                                            @error="onImgError"
                                        />
                                        <div v-else class="perfil-avatar perfil-avatar--placeholder">
                                            <span>{{ perfil.nome.charAt(0).toUpperCase() }}</span>
                                        </div>
                                    </div>
                                    <div class="perfil-foto-acoes">
                                        <input
                                            ref="inputArquivo"
                                            type="file"
                                            class="form-control form-control-lg"
                                            accept=".jpeg,.jpg,.png,.svg,image/jpeg,image/png,image/svg+xml"
                                            @change="aoEscolherArquivo"
                                        />
                                        <button
                                            type="button"
                                            class="btn btn-primary btn-salvar mt-2"
                                            :disabled="salvandoImagem || !temArquivoSelecionado"
                                            @click="aoSalvarImagem"
                                        >
                                            {{ salvandoImagem ? "Enviando..." : "Salvar foto" }}
                                        </button>
                                    </div>
                                </div>
                                <div
                                    v-if="erroImagem"
                                    class="perfil-alerta perfil-alerta--erro mt-3"
                                >
                                    {{ erroImagem }}
                                </div>
                                <div
                                    v-if="sucessoImagem"
                                    class="perfil-alerta perfil-alerta--ok mt-3"
                                    role="status"
                                >
                                    Foto atualizada com sucesso.
                                </div>
                            </div>
                        </div>

                        <div class="card perfil-card border-0 shadow-sm">
                            <div class="card-body p-4 p-md-5">
                                <h2 class="perfil-bloco-titulo">Senha</h2>
                                <p class="perfil-bloco-sub">
                                    Informe sua senha atual e escolha uma nova senha.
                                </p>
                                <form @submit="aoSalvarSenha">
                                    <div class="mb-3">
                                        <label for="senha-atual" class="form-label">Senha atual</label>
                                        <div class="password-wrapper">
                                            <input
                                                id="senha-atual"
                                                v-model="formSenha.senha_atual"
                                                :type="mostrarSenhaAtual ? 'text' : 'password'"
                                                class="form-control form-control-lg"
                                                :class="{ 'is-invalid': erroSenhaCampos.senha_atual }"
                                                required
                                                autocomplete="current-password"
                                            />
                                            <button
                                                type="button"
                                                class="password-toggle"
                                                :aria-label="mostrarSenhaAtual ? 'Ocultar senha atual' : 'Mostrar senha atual'"
                                                @click="mostrarSenhaAtual = !mostrarSenhaAtual"
                                            >
                                                {{ mostrarSenhaAtual ? "🙈" : "👁" }}
                                            </button>
                                        </div>
                                        <div
                                            v-if="erroSenhaCampos.senha_atual"
                                            class="invalid-feedback d-block"
                                        >
                                            {{ erroSenhaCampos.senha_atual }}
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label for="senha-nova" class="form-label">Nova senha</label>
                                        <div class="password-wrapper">
                                            <input
                                                id="senha-nova"
                                                v-model="formSenha.nova_senha"
                                                :type="mostrarNovaSenha ? 'text' : 'password'"
                                                class="form-control form-control-lg"
                                                :class="{ 'is-invalid': erroSenhaCampos.nova_senha }"
                                                required
                                                minlength="8"
                                                autocomplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                class="password-toggle"
                                                :aria-label="mostrarNovaSenha ? 'Ocultar nova senha' : 'Mostrar nova senha'"
                                                @click="mostrarNovaSenha = !mostrarNovaSenha"
                                            >
                                                {{ mostrarNovaSenha ? "🙈" : "👁" }}
                                            </button>
                                        </div>
                                        <div
                                            v-if="erroSenhaCampos.nova_senha"
                                            class="invalid-feedback d-block"
                                        >
                                            {{ erroSenhaCampos.nova_senha }}
                                        </div>
                                        <p class="form-hint">Use 8+ caracteres com maiúscula, minúscula, número e símbolo.</p>
                                    </div>
                                    <div class="mb-4">
                                        <label for="senha-conf" class="form-label">Confirmar nova senha</label>
                                        <div class="password-wrapper">
                                            <input
                                                id="senha-conf"
                                                v-model="formSenha.nova_senha_confirmation"
                                                :type="mostrarConfirmacaoSenha ? 'text' : 'password'"
                                                class="form-control form-control-lg"
                                                :class="{ 'is-invalid': erroSenhaCampos.nova_senha_confirmation }"
                                                required
                                                autocomplete="new-password"
                                            />
                                            <button
                                                type="button"
                                                class="password-toggle"
                                                :aria-label="mostrarConfirmacaoSenha ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'"
                                                @click="mostrarConfirmacaoSenha = !mostrarConfirmacaoSenha"
                                            >
                                                {{ mostrarConfirmacaoSenha ? "🙈" : "👁" }}
                                            </button>
                                        </div>
                                        <div
                                            v-if="erroSenhaCampos.nova_senha_confirmation"
                                            class="invalid-feedback d-block"
                                        >
                                            {{ erroSenhaCampos.nova_senha_confirmation }}
                                        </div>
                                    </div>
                                    <div
                                        v-if="
                                            formSenha.nova_senha &&
                                            formSenha.nova_senha_confirmation &&
                                            formSenha.nova_senha !== formSenha.nova_senha_confirmation
                                        "
                                        class="perfil-alerta perfil-alerta--erro mb-3"
                                    >
                                        As novas senhas não coincidem.
                                    </div>
                                    <div
                                        v-if="erroSenhaLocal"
                                        class="perfil-alerta perfil-alerta--erro mb-3"
                                    >
                                        {{ erroSenhaLocal }}
                                    </div>
                                    <div
                                        v-if="erroSenha"
                                        class="perfil-alerta perfil-alerta--erro mb-3"
                                    >
                                        {{ erroSenha }}
                                    </div>
                                    <div
                                        v-if="sucessoSenha"
                                        class="perfil-alerta perfil-alerta--ok mb-3"
                                        role="status"
                                    >
                                        Senha alterada com sucesso.
                                    </div>
                                    <button
                                        type="submit"
                                        class="btn btn-primary btn-salvar"
                                        :disabled="salvandoSenha || !podeSalvarSenha"
                                    >
                                        {{ salvandoSenha ? "Salvando..." : "Alterar senha" }}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
.page-perfil {
    background: linear-gradient(
        180deg,
        rgba(250, 250, 250, 1) 0%,
        rgba(245, 247, 250, 1) 100%
    );
    padding-top: 6rem;
    padding-bottom: 4rem;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    position: relative;
    display: inline-block;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
}

.section-title::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border-radius: 3px;
}

.page-perfil__intro {
    margin: 0;
    color: #64748b;
    font-size: 0.95rem;
}

.perfil-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.06) !important;
    border-radius: 18px;
    box-shadow: 0 12px 40px rgba(20, 30, 40, 0.08) !important;
}

.perfil-bloco-titulo {
    font-size: 1.15rem;
    font-weight: 700;
    color: #16254e;
    margin: 0 0 0.25rem;
}

.perfil-bloco-sub {
    margin: 0 0 1.25rem;
    font-size: 0.88rem;
    color: #64748b;
}

.perfil-dl dt {
    font-weight: 600;
    color: #64748b;
    font-size: 0.88rem;
}

.perfil-dl dd {
    margin-bottom: 0.65rem;
    color: #1e293b;
}

.perfil-foto-linha {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    align-items: flex-start;
}

.perfil-avatar-wrap {
    flex-shrink: 0;
}

.perfil-avatar {
    width: 112px;
    height: 112px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(92, 107, 192, 0.25);
}

.perfil-avatar--placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #5c6bc0 0%, #2da0a8 100%);
    color: #fff;
    font-size: 2.25rem;
    font-weight: 700;
}

.perfil-foto-acoes {
    flex: 1;
    min-width: 200px;
}

.endereco-cep-wrap {
    display: flex;
    gap: 0.6rem;
    align-items: center;
}

.btn-cep {
    min-width: 138px;
    height: 48px;
    border-radius: 12px;
    border-color: rgba(92, 107, 192, 0.35);
    color: #3f4f80;
    font-weight: 700;
    background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
    box-shadow: 0 6px 18px rgba(92, 107, 192, 0.12);
    white-space: nowrap;
    padding-inline: 0.95rem;
}

.btn-cep:hover:not(:disabled) {
    border-color: #5c6bc0;
    color: #2e3f76;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(92, 107, 192, 0.18);
}

.btn-cep:disabled {
    opacity: 0.78;
    cursor: not-allowed;
}

.btn-cep__content {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
}

.btn-cep__icon {
    font-size: 1.05rem;
    flex-shrink: 0;
}

@media (max-width: 576px) {
    .endereco-cep-wrap {
        flex-direction: column;
        align-items: stretch;
    }

    .btn-cep {
        width: 100%;
        min-width: 0;
    }
}

.form-label {
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.35rem;
}

.form-control {
    background: #f6fbfc;
    border: 1px solid #e6f0f4;
    border-radius: 12px;
    padding: 0.85rem 1rem;
    transition: box-shadow 0.18s ease, border-color 0.18s ease;
}

.form-control:focus {
    outline: none;
    border-color: #5c6bc0;
    box-shadow: 0 6px 18px rgba(92, 107, 192, 0.08);
    background: #fff;
}

.password-wrapper {
    position: relative;
}

.password-wrapper .form-control {
    padding-right: 2.8rem;
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
    opacity: 0.75;
}

.password-toggle:hover {
    opacity: 1;
}

.form-hint {
    margin: 0.35rem 0 0;
    font-size: 0.8rem;
    color: #94a3b8;
}

.btn-salvar {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 12px 24px !important;
    font-weight: 700;
    box-shadow: 0 10px 24px rgba(45, 160, 168, 0.15);
}

.btn-salvar:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(45, 160, 168, 0.2);
}

.btn-salvar:disabled {
    opacity: 0.75;
    cursor: not-allowed;
}

.perfil-alerta {
    padding: 0.85rem 1rem;
    border-radius: 12px;
    font-size: 0.92rem;
    font-weight: 500;
}

.perfil-alerta--erro {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.2);
    color: #721c24;
}

.perfil-alerta--ok {
    background: rgba(22, 163, 74, 0.1);
    border: 1px solid rgba(22, 163, 74, 0.25);
    color: #14532d;
}
</style>
