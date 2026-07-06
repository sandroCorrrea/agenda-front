<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
    RiBuildingLine,
    RiSearchLine,
    RiAddLine,
    RiDeleteBinLine,
    RiSave3Line,
    RiCloseLine,
    RiEyeLine,
    RiPencilLine,
    RiArrowLeftLine,
    RiArrowRightLine
} from "@remixicon/vue";
import { cnpjMask, onlyNumbers, phoneMask } from "@/shared/utils/masks";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useEmpresasAdmin } from "@/presentation/composables/Empresa/useEmpresasAdmin";
import { useViaCepEndereco } from "@/presentation/composables/Endereco/useViaCepEndereco";
import type { EmpresaListagemDTO } from "@/domain/repositories/IMatrizRepository";

const {
    form,
    carregando,
    carregandoCnpj,
    salvando,
    erro,
    sucesso,
    erroCampos,
    empresas,
    carregandoEmpresas,
    totalRegistros,
    filtroNome,
    textoBuscaNome,
    paginaAtual,
    totalPaginas,
    intervaloMostrado,
    paginasNavegacao,
    aplicarBuscaNome,
    limparBuscaNome,
    irParaPagina,
    carregar,
    buscarPorCnpj,
    salvar,
    adicionarAtividadeSecundaria,
    removerAtividadeSecundaria,
    adicionarQsa,
    removerQsa,
    adicionarAtividadePrincipal,
    removerAtividadePrincipal
} = useEmpresasAdmin();

const { carregandoCep, erroCep, aoDigitarCep, buscarCep } =
    useViaCepEndereco(form);

const cnpjBusca = ref("");
const empresaDetalhe = ref<EmpresaListagemDTO | null>(null);

function abrirDetalhesEmpresa(empresa: EmpresaListagemDTO) {
    empresaDetalhe.value = empresa;
}

function fecharDetalhesEmpresa() {
    empresaDetalhe.value = null;
}

function onKeydownEmpresaModal(e: KeyboardEvent) {
    if (e.key === "Escape" && empresaDetalhe.value) {
        fecharDetalhesEmpresa();
    }
}

watch(empresaDetalhe, (v) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = v ? "hidden" : "";
});

const erros = reactive<Record<string, string>>({
    cnpj: "",
    nome: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: ""
});

function aoMascaraCnpj(e: Event) {
    const input = e.target as HTMLInputElement;
    cnpjBusca.value = cnpjMask(input.value);
}

function aoDigitarTelefone(e: Event) {
    const input = e.target as HTMLInputElement;
    form.telefone = phoneMask(input.value);
}

function aoDigitarCelular(e: Event) {
    const input = e.target as HTMLInputElement;
    form.celular = phoneMask(input.value);
}

/** CNPJ base: edição manual (sem depender da busca). Armazena só dígitos em `form.cnpj`. */
function aoDigitarCnpjBase(e: Event) {
    const input = e.target as HTMLInputElement;
    form.cnpj = onlyNumbers(cnpjMask(input.value));
    cnpjBusca.value = form.cnpj ? cnpjMask(form.cnpj) : "";
}

function validar(): boolean {
    erros.cnpj = onlyNumbers(form.cnpj).length === 14 ? "" : "CNPJ e obrigatorio.";
    erros.nome = form.nome.trim() ? "" : "Nome da empresa e obrigatorio.";
    erros.email = /\S+@\S+\.\S+/.test(form.email.trim())
        ? ""
        : "Informe um e-mail valido.";
    erros.cep = form.cep.trim() ? "" : "CEP e obrigatorio.";
    erros.rua = form.rua.trim() ? "" : "Logradouro e obrigatorio.";
    erros.numero = form.numero.trim() ? "" : "Numero e obrigatorio.";
    erros.bairro = form.bairro.trim() ? "" : "Bairro e obrigatorio.";
    erros.cidade = form.cidade.trim() ? "" : "Cidade e obrigatoria.";
    erros.uf = form.uf.trim() ? "" : "UF e obrigatoria.";

    return Object.values(erros).every((v) => !v);
}

async function aoBuscarCnpj() {
    erro.value = null;
    sucesso.value = null;
    const cnpjSemMascara = onlyNumbers(cnpjBusca.value);
    form.cnpj = cnpjSemMascara;
    try {
        await buscarPorCnpj(cnpjSemMascara);
    } catch {
        return;
    }
}

async function aoBuscarNomeLista() {
    try {
        await aplicarBuscaNome();
    } catch {
        return;
    }
}

async function aoSalvar() {
    erro.value = null;
    sucesso.value = null;
    // Atualiza CNPJ a partir da busca/mascara para consistencia.
    if (cnpjBusca.value) form.cnpj = onlyNumbers(cnpjBusca.value);

    if (!validar()) return;
    try {
        await salvar();
        cnpjBusca.value = "";
    } catch {
        return;
    }
}

onMounted(async () => {
    document.addEventListener("keydown", onKeydownEmpresaModal);
    try {
        await carregar();
    } catch {
        return;
    }
    if (form.cnpj) cnpjBusca.value = cnpjMask(form.cnpj);
});

onUnmounted(() => {
    document.removeEventListener("keydown", onKeydownEmpresaModal);
    document.body.style.overflow = "";
});
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Empresas"
                subtitle="Cadastre ou atualize os dados da sua empresa. Você pode buscar pelo CNPJ e, se preferir, preencher manualmente."
            >
                <template #icon><RiBuildingLine /></template>
            </AdminPageHero>

            <div v-if="erro" class="admin-alert admin-alert--erro">{{ erro }}</div>
            <div v-if="sucesso" class="admin-alert admin-alert--ok">{{ sucesso }}</div>

            <section class="empresas-lista-secao card admin-card border-0 shadow mb-4" aria-labelledby="empresas-lista-titulo">
                <div class="empresas-lista-secao__head">
                    <div>
                        <h2 id="empresas-lista-titulo" class="empresas-lista-secao__title">
                            Empresas cadastradas
                        </h2>
                        <p class="empresas-lista-secao__lead">
                            Busque por nome ou apelido, navegue pelas páginas e abra
                            <strong>Detalhes</strong> ou <strong>Editar</strong> em cada card.
                        </p>
                    </div>
                    <div v-if="!carregandoEmpresas && totalRegistros > 0" class="empresas-lista-secao__badge" aria-live="polite">
                        {{ totalRegistros }}
                        {{ totalRegistros === 1 ? "empresa" : "empresas" }}
                    </div>
                </div>

                <div class="empresas-busca">
                    <label class="visually-hidden" for="empresa-busca-nome">Buscar por nome ou apelido</label>
                    <div class="empresas-busca__field">
                        <RiSearchLine class="empresas-busca__field-icon" aria-hidden="true" />
                        <input
                            id="empresa-busca-nome"
                            v-model="textoBuscaNome"
                            type="search"
                            class="empresas-busca__input"
                            placeholder="Buscar por nome ou apelido…"
                            maxlength="255"
                            autocomplete="off"
                            @keydown.enter.prevent="aoBuscarNomeLista"
                        />
                    </div>
                    <button
                        type="button"
                        class="empresas-busca__submit"
                        :disabled="carregandoEmpresas"
                        @click="aoBuscarNomeLista"
                    >
                        <RiSearchLine class="me-1" />
                        Buscar
                    </button>
                    <button
                        v-if="filtroNome"
                        type="button"
                        class="empresas-busca__limpar"
                        :disabled="carregandoEmpresas"
                        @click="limparBuscaNome"
                    >
                        Limpar filtro
                    </button>
                </div>

                <div v-if="carregandoEmpresas" class="empresas-lista-secao__loading text-muted">
                    <span class="empresas-lista-secao__spinner" aria-hidden="true" />
                    Carregando empresas…
                </div>

                <div
                    v-else-if="totalRegistros === 0 && !filtroNome"
                    class="empresas-lista-secao__empty"
                >
                    <div class="empresas-lista-secao__empty-icon">
                        <RiBuildingLine />
                    </div>
                    <p class="mb-0">Nenhuma empresa cadastrada até o momento.</p>
                    <p class="empresas-lista-secao__empty-hint mb-0">
                        Use o formulário abaixo para incluir a primeira empresa.
                    </p>
                </div>

                <div v-else-if="totalRegistros === 0 && filtroNome" class="empresas-lista-secao__empty empresas-lista-secao__empty--filtro">
                    <div class="empresas-lista-secao__empty-icon">
                        <RiSearchLine />
                    </div>
                    <p class="mb-0">
                        Nenhum resultado para
                        <strong>“{{ filtroNome }}”</strong>.
                    </p>
                    <p class="empresas-lista-secao__empty-hint mb-0">
                        Tente outro termo ou limpe o filtro para ver todas as empresas.
                    </p>
                    <button type="button" class="btn empresas-busca__limpar mt-2" @click="limparBuscaNome">
                        Limpar filtro
                    </button>
                </div>

                <div v-else class="empresas-lista-grid" role="list">
                    <article
                        v-for="empresa in empresas"
                        :key="empresa.id"
                        class="empresa-resumo"
                        role="listitem"
                    >
                        <div class="empresa-resumo__icon" aria-hidden="true">
                            <RiBuildingLine />
                        </div>
                        <div class="empresa-resumo__body">
                            <h3 class="empresa-resumo__nome">{{ empresa.nome }}</h3>
                            <p class="empresa-resumo__cnpj">{{ cnpjMask(empresa.cnpj) }}</p>
                        </div>
                        <div class="empresa-resumo__actions">
                            <RouterLink
                                class="btn empresa-resumo__btn empresa-resumo__btn--edit"
                                :to="{ name: 'AdministradorEmpresaEditar', params: { id: empresa.id } }"
                            >
                                <RiPencilLine class="me-1" />
                                Editar
                            </RouterLink>
                            <button
                                type="button"
                                class="btn empresa-resumo__btn"
                                :aria-label="`Ver detalhes de ${empresa.nome}`"
                                @click="abrirDetalhesEmpresa(empresa)"
                            >
                                <RiEyeLine class="me-1" />
                                Detalhes
                            </button>
                        </div>
                    </article>
                </div>

                <div
                    v-if="!carregandoEmpresas && totalRegistros > 0"
                    class="empresas-pag"
                    role="navigation"
                    aria-label="Paginação da listagem"
                >
                    <p class="empresas-pag__info">
                        Mostrando
                        <strong>{{ intervaloMostrado.de }}–{{ intervaloMostrado.ate }}</strong>
                        de
                        <strong>{{ totalRegistros }}</strong>
                        <span v-if="filtroNome" class="empresas-pag__filtro-ativo">
                            · filtro “{{ filtroNome }}”
                        </span>
                    </p>
                    <div v-if="totalPaginas > 1" class="empresas-pag__bar">
                        <button
                            type="button"
                            class="empresas-pag__nav empresas-pag__nav--prev"
                            :disabled="paginaAtual <= 1"
                            aria-label="Página anterior"
                            @click="irParaPagina(paginaAtual - 1)"
                        >
                            <RiArrowLeftLine />
                        </button>
                        <div class="empresas-pag__nums">
                            <template v-for="(p, idx) in paginasNavegacao" :key="'pg-' + idx">
                                <span v-if="p === 'dots'" class="empresas-pag__dots" aria-hidden="true">…</span>
                                <button
                                    v-else
                                    type="button"
                                    class="empresas-pag__num"
                                    :class="{ 'empresas-pag__num--active': p === paginaAtual }"
                                    :aria-current="p === paginaAtual ? 'page' : undefined"
                                    @click="irParaPagina(p)"
                                >
                                    {{ p }}
                                </button>
                            </template>
                        </div>
                        <button
                            type="button"
                            class="empresas-pag__nav empresas-pag__nav--next"
                            :disabled="paginaAtual >= totalPaginas"
                            aria-label="Próxima página"
                            @click="irParaPagina(paginaAtual + 1)"
                        >
                            <RiArrowRightLine />
                        </button>
                    </div>
                </div>
            </section>

            <div class="card admin-card border-0 shadow-sm mb-4">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Buscar pelo CNPJ</h2>
                    <p class="admin-hint">
                        Informe o CNPJ e clique em <strong>Buscar</strong>. Os dados serão preenchidos automaticamente.
                    </p>

                    <form class="row g-3 align-items-end" @submit.prevent="aoBuscarCnpj">
                        <div class="col-12 col-md-8">
                            <label class="form-label">CNPJ</label>
                            <input
                                id="cnpj-busca"
                                v-model="cnpjBusca"
                                type="text"
                                class="form-control form-control-lg"
                                placeholder="00.000.000/0000-00"
                                inputmode="numeric"
                                maxlength="18"
                                @input="aoMascaraCnpj"
                            />
                            <div v-if="erros.cnpj" class="invalid-feedback d-block">
                                {{ erros.cnpj }}
                            </div>
                        </div>
                        <div class="col-12 col-md-4 d-grid">
                            <button
                                type="submit"
                                class="btn btn-primary btn-admin"
                                :disabled="carregandoCnpj || !cnpjBusca"
                            >
                                <RiSearchLine class="me-1" />
                                {{ carregandoCnpj ? "Buscando..." : "Buscar" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <h2 class="admin-subtitle">Dados da empresa</h2>

                    <form @submit.prevent="aoSalvar">
                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <label class="form-label">Nome</label>
                                <input
                                    v-model="form.nome"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.nome || erroCampos.nome) }"
                                />
                                <div v-if="erros.nome || erroCampos.nome" class="invalid-feedback d-block">
                                    {{ erros.nome || erroCampos.nome }}
                                </div>
                            </div>

                            <div class="col-12 col-md-6">
                                <label class="form-label">Apelido</label>
                                <input v-model="form.apelido" type="text" class="form-control" />
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label" for="empresa-cnpj-base">CNPJ (base)</label>
                                <input
                                    id="empresa-cnpj-base"
                                    :value="cnpjMask(form.cnpj)"
                                    type="text"
                                    class="form-control"
                                    inputmode="numeric"
                                    maxlength="18"
                                    placeholder="00.000.000/0000-00"
                                    autocomplete="off"
                                    :class="{ 'is-invalid': Boolean(erros.cnpj || erroCampos.cnpj) }"
                                    @input="aoDigitarCnpjBase"
                                />
                                <div v-if="erros.cnpj || erroCampos.cnpj" class="invalid-feedback d-block">
                                    {{ erros.cnpj || erroCampos.cnpj }}
                                </div>
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label">Tipo empresa</label>
                                <input v-model="form.tipo_empresa" type="text" class="form-control" />
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label">Situação do CNPJ</label>
                                <input v-model="form.situacao_cnpj" type="text" class="form-control" />
                            </div>

                            <div class="col-12 col-md-6">
                                <label class="form-label">Data situação (UF)</label>
                                <input
                                    v-model="form.data_situacao_uf"
                                    type="text"
                                    class="form-control"
                                />
                            </div>

                            <div class="col-12 col-md-6">
                                <label class="form-label">Inscrição estadual</label>
                                <input
                                    v-model="form.inscricao_estadual"
                                    type="text"
                                    class="form-control"
                                />
                            </div>

                            <div class="col-12 col-md-6">
                                <label class="form-label">Situação IE</label>
                                <input
                                    v-model="form.situacao_ie"
                                    type="text"
                                    class="form-control"
                                />
                            </div>

                            <div class="col-12 col-md-6">
                                <label class="form-label">CNAE</label>
                                <input v-model="form.cnae" type="text" class="form-control" />
                            </div>
                        </div>

                        <div class="divider" />

                        <div class="row g-3">
                            <div class="col-12 col-md-4">
                                <label class="form-label" for="empresa-cep">CEP</label>
                                <div class="empresa-cep-wrap">
                                    <input
                                        id="empresa-cep"
                                        :value="form.cep"
                                        type="text"
                                        class="form-control empresa-cep-wrap__input"
                                        inputmode="numeric"
                                        maxlength="9"
                                        placeholder="00000-000"
                                        autocomplete="postal-code"
                                        :class="{
                                            'is-invalid': Boolean(
                                                erros.cep || erroCampos.cep || erroCep
                                            )
                                        }"
                                        @input="aoDigitarCep"
                                    />
                                    <button
                                        type="button"
                                        class="btn empresa-cep-btn"
                                        :disabled="
                                            carregandoCep ||
                                            onlyNumbers(form.cep).length !== 8
                                        "
                                        @click="buscarCep"
                                    >
                                        <span class="empresa-cep-btn__inner">
                                            <RiSearchLine class="empresa-cep-btn__icon" />
                                            Buscar
                                        </span>
                                    </button>
                                </div>
                                <div
                                    v-if="erros.cep || erroCampos.cep || erroCep"
                                    class="invalid-feedback d-block"
                                >
                                    {{ erros.cep || erroCampos.cep || erroCep }}
                                </div>
                                <div v-if="carregandoCep" class="form-text form-text-muted">
                                    Consultando CEP…
                                </div>
                            </div>
                            <div class="col-12 col-md-8">
                                <label class="form-label">Logradouro</label>
                                <input
                                    v-model="form.rua"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.rua || erroCampos.rua) }"
                                />
                                <div v-if="erros.rua || erroCampos.rua" class="invalid-feedback d-block">
                                    {{ erros.rua || erroCampos.rua }}
                                </div>
                            </div>
                            <div class="col-12 col-md-3">
                                <label class="form-label">Número</label>
                                <input
                                    v-model="form.numero"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.numero || erroCampos.numero) }"
                                />
                                <div v-if="erros.numero || erroCampos.numero" class="invalid-feedback d-block">
                                    {{ erros.numero || erroCampos.numero }}
                                </div>
                            </div>
                            <div class="col-12 col-md-9">
                                <label class="form-label">Bairro</label>
                                <input
                                    v-model="form.bairro"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.bairro || erroCampos.bairro) }"
                                />
                                <div v-if="erros.bairro || erroCampos.bairro" class="invalid-feedback d-block">
                                    {{ erros.bairro || erroCampos.bairro }}
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label">Cidade</label>
                                <input
                                    v-model="form.cidade"
                                    type="text"
                                    class="form-control"
                                    :class="{ 'is-invalid': Boolean(erros.cidade || erroCampos.cidade) }"
                                />
                                <div v-if="erros.cidade || erroCampos.cidade" class="invalid-feedback d-block">
                                    {{ erros.cidade || erroCampos.cidade }}
                                </div>
                            </div>
                            <div class="col-12 col-md-3">
                                <label class="form-label">UF</label>
                                <input
                                    v-model="form.uf"
                                    type="text"
                                    class="form-control text-uppercase"
                                    :class="{ 'is-invalid': Boolean(erros.uf || erroCampos.uf) }"
                                />
                                <div v-if="erros.uf || erroCampos.uf" class="invalid-feedback d-block">
                                    {{ erros.uf || erroCampos.uf }}
                                </div>
                            </div>
                        </div>

                        <div class="divider" />

                        <div class="row g-3">
                            <div class="col-12 col-md-6">
                                <label class="form-label">E-mail</label>
                                <input
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
                                <label class="form-label" for="empresa-telefone">Telefone</label>
                                <input
                                    id="empresa-telefone"
                                    :value="form.telefone"
                                    type="text"
                                    class="form-control"
                                    inputmode="tel"
                                    maxlength="15"
                                    placeholder="(00) 0000-0000"
                                    autocomplete="tel"
                                    @input="aoDigitarTelefone"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label" for="empresa-celular">Celular</label>
                                <input
                                    id="empresa-celular"
                                    :value="form.celular"
                                    type="text"
                                    class="form-control"
                                    inputmode="tel"
                                    maxlength="15"
                                    placeholder="(00) 00000-0000"
                                    autocomplete="tel"
                                    @input="aoDigitarCelular"
                                />
                            </div>
                        </div>

                        <div class="divider" />

                        <h3 class="list-title">Atividade principal (uma ou mais)</h3>
                        <div class="row g-2 align-items-end mb-2" v-for="(a, i) in form.atividades_principais" :key="'p'+i">
                            <div class="col-12 col-md-4">
                                <label class="form-label">Código</label>
                                <input v-model="a.code" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-7">
                                <label class="form-label">Descrição</label>
                                <input v-model="a.text" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-1 d-flex justify-content-end">
                                <button
                                    v-if="form.atividades_principais.length > 1"
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="removerAtividadePrincipal(i)"
                                >
                                    <RiDeleteBinLine />
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-outline-secondary btn-sm mb-4" @click="adicionarAtividadePrincipal">
                            <RiAddLine class="me-1" />
                            Adicionar atividade principal
                        </button>

                        <h3 class="list-title">Atividades secundárias (opcional, múltiplas)</h3>
                        <div class="row g-2 align-items-end mb-2" v-for="(a, i) in form.atividades_secundarias" :key="'s'+i">
                            <div class="col-12 col-md-4">
                                <label class="form-label">Código</label>
                                <input v-model="a.code" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-7">
                                <label class="form-label">Descrição</label>
                                <input v-model="a.text" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-1 d-flex justify-content-end">
                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="removerAtividadeSecundaria(i)"
                                >
                                    <RiDeleteBinLine />
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-outline-secondary btn-sm mb-4" @click="adicionarAtividadeSecundaria">
                            <RiAddLine class="me-1" />
                            Adicionar atividade secundária
                        </button>

                        <h3 class="list-title">QSA (quadro societário)</h3>
                        <div class="row g-2 align-items-end mb-2" v-for="(q, i) in form.qsa" :key="'q'+i">
                            <div class="col-12 col-md-7">
                                <label class="form-label">Nome</label>
                                <input v-model="q.nome" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-4">
                                <label class="form-label">Qual</label>
                                <input v-model="q.qual" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-1 d-flex justify-content-end">
                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="removerQsa(i)"
                                >
                                    <RiDeleteBinLine />
                                </button>
                            </div>
                        </div>
                        <button type="button" class="btn btn-outline-secondary btn-sm mb-4" @click="adicionarQsa">
                            <RiAddLine class="me-1" />
                            Adicionar participante
                        </button>

                        <div class="d-flex justify-content-end">
                            <button
                                type="submit"
                                class="btn btn-primary btn-admin"
                                :disabled="salvando || carregando || carregandoCnpj"
                            >
                                <RiSave3Line class="me-1" />
                                {{ salvando ? "Salvando..." : "Criar empresa" }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="empresaDetalhe" class="empresa-modal" role="presentation">
                <div
                    class="empresa-modal__backdrop"
                    aria-hidden="true"
                    @click="fecharDetalhesEmpresa"
                />
                <div
                    class="empresa-modal__wrap"
                    tabindex="-1"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="empresa-modal-titulo"
                    @click.self="fecharDetalhesEmpresa"
                >
                    <div class="empresa-modal__panel" @click.stop>
                        <button
                            type="button"
                            class="empresa-modal__fechar"
                            aria-label="Fechar"
                            @click="fecharDetalhesEmpresa"
                        >
                            <RiCloseLine />
                        </button>

                        <header class="empresa-modal__header">
                            <p class="empresa-modal__eyebrow">Detalhes da empresa</p>
                            <h2 id="empresa-modal-titulo" class="empresa-modal__title">
                                {{ empresaDetalhe.nome }}
                            </h2>
                            <p class="empresa-modal__cnpj">{{ cnpjMask(empresaDetalhe.cnpj) }}</p>
                            <p v-if="empresaDetalhe.apelido" class="empresa-modal__apelido">
                                {{ empresaDetalhe.apelido }}
                            </p>
                        </header>

                        <div class="empresa-modal__scroll">
                            <section class="empresa-modal__secao">
                                <h3 class="empresa-modal__secao-titulo">Situação e cadastro</h3>
                                <dl class="empresa-modal__dl">
                                    <template v-if="empresaDetalhe.tipo_empresa">
                                        <dt>Tipo</dt>
                                        <dd>{{ empresaDetalhe.tipo_empresa }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.situacao_cnpj">
                                        <dt>Situação CNPJ</dt>
                                        <dd>{{ empresaDetalhe.situacao_cnpj }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.situacao_ie">
                                        <dt>Situação IE</dt>
                                        <dd>{{ empresaDetalhe.situacao_ie }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.inscricao_estadual">
                                        <dt>Inscrição estadual</dt>
                                        <dd>{{ empresaDetalhe.inscricao_estadual }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.cnae">
                                        <dt>CNAE</dt>
                                        <dd>{{ empresaDetalhe.cnae }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.data_situacao_uf">
                                        <dt>Data situação UF</dt>
                                        <dd>{{ empresaDetalhe.data_situacao_uf }}</dd>
                                    </template>
                                </dl>
                            </section>

                            <section class="empresa-modal__secao">
                                <h3 class="empresa-modal__secao-titulo">Endereço</h3>
                                <p class="empresa-modal__texto">
                                    {{ empresaDetalhe.rua }}, {{ empresaDetalhe.numero }}
                                    <template v-if="empresaDetalhe.bairro"> — {{ empresaDetalhe.bairro }}</template>
                                </p>
                                <p class="empresa-modal__texto mb-0">
                                    {{ empresaDetalhe.cidade }}/{{ empresaDetalhe.uf }} · CEP {{ empresaDetalhe.cep }}
                                </p>
                            </section>

                            <section class="empresa-modal__secao">
                                <h3 class="empresa-modal__secao-titulo">Contato</h3>
                                <dl class="empresa-modal__dl">
                                    <dt>E-mail</dt>
                                    <dd>{{ empresaDetalhe.email }}</dd>
                                    <template v-if="empresaDetalhe.telefone">
                                        <dt>Telefone</dt>
                                        <dd>{{ phoneMask(empresaDetalhe.telefone) }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.celular">
                                        <dt>Celular</dt>
                                        <dd>{{ phoneMask(empresaDetalhe.celular) }}</dd>
                                    </template>
                                </dl>
                            </section>

                            <section
                                v-if="empresaDetalhe.atividades_principais.length"
                                class="empresa-modal__secao"
                            >
                                <h3 class="empresa-modal__secao-titulo">Atividades principais</h3>
                                <ul class="empresa-modal__lista">
                                    <li v-for="(a, i) in empresaDetalhe.atividades_principais" :key="`m-p-${i}`">
                                        <span class="empresa-modal__codigo">{{ a.code }}</span>
                                        {{ a.text }}
                                    </li>
                                </ul>
                            </section>

                            <section
                                v-if="empresaDetalhe.atividades_secundarias.length"
                                class="empresa-modal__secao"
                            >
                                <h3 class="empresa-modal__secao-titulo">Atividades secundárias</h3>
                                <ul class="empresa-modal__lista">
                                    <li v-for="(a, i) in empresaDetalhe.atividades_secundarias" :key="`m-s-${i}`">
                                        <span class="empresa-modal__codigo">{{ a.code }}</span>
                                        {{ a.text }}
                                    </li>
                                </ul>
                            </section>

                            <section v-if="empresaDetalhe.qsa.length" class="empresa-modal__secao">
                                <h3 class="empresa-modal__secao-titulo">Quadro societário (QSA)</h3>
                                <ul class="empresa-modal__lista">
                                    <li v-for="(q, i) in empresaDetalhe.qsa" :key="`m-q-${i}`">
                                        <strong>{{ q.nome }}</strong>
                                        <span class="empresa-modal__qual">{{ q.qual }}</span>
                                    </li>
                                </ul>
                            </section>

                            <section
                                v-if="empresaDetalhe.created_at || empresaDetalhe.updated_at"
                                class="empresa-modal__secao empresa-modal__secao--muted"
                            >
                                <h3 class="empresa-modal__secao-titulo">Registro no sistema</h3>
                                <dl class="empresa-modal__dl empresa-modal__dl--compact">
                                    <template v-if="empresaDetalhe.created_at">
                                        <dt>Cadastro</dt>
                                        <dd>{{ empresaDetalhe.created_at }}</dd>
                                    </template>
                                    <template v-if="empresaDetalhe.updated_at">
                                        <dt>Última atualização</dt>
                                        <dd>{{ empresaDetalhe.updated_at }}</dd>
                                    </template>
                                </dl>
                            </section>
                        </div>

                        <footer class="empresa-modal__footer empresa-modal__footer--split">
                            <RouterLink
                                v-if="empresaDetalhe"
                                class="btn empresa-modal__btn-edit"
                                :to="{ name: 'AdministradorEmpresaEditar', params: { id: empresaDetalhe.id } }"
                                @click="fecharDetalhesEmpresa"
                            >
                                <RiPencilLine class="me-1" />
                                Editar empresa
                            </RouterLink>
                            <button
                                type="button"
                                class="btn empresa-modal__btn-primary"
                                @click="fecharDetalhesEmpresa"
                            >
                                Fechar
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </Teleport>
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
    color: #6b7c9f;
    margin: 0 0 1rem;
    line-height: 1.45;
}

.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    margin: 0 0 1rem;
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

.btn-admin {
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 16px !important;
    font-weight: 700 !important;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
}

.divider {
    height: 1px;
    background: rgba(20, 30, 40, 0.08);
    margin: 1.5rem 0;
}

.list-title {
    margin: 1.25rem 0 0.75rem;
    font-size: 1.05rem;
    font-weight: 800;
    color: #16254e;
}

/* —— Listagem em destaque (resumo) —— */
.empresas-lista-secao {
    overflow: hidden;
    background: linear-gradient(135deg, #ffffff 0%, #f4f6fd 100%);
    border: 1px solid rgba(92, 107, 192, 0.18) !important;
    box-shadow: 0 12px 40px rgba(22, 37, 78, 0.08) !important;
}

.empresas-lista-secao__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.35rem 1.5rem 1rem;
    border-bottom: 1px solid rgba(20, 30, 40, 0.06);
    background: rgba(255, 255, 255, 0.65);
}

.empresas-lista-secao__title {
    margin: 0 0 0.35rem;
    font-size: 1.35rem;
    font-weight: 800;
    color: #16254e;
    letter-spacing: -0.02em;
}

.empresas-lista-secao__lead {
    margin: 0;
    max-width: 42rem;
    color: #5f6f8f;
    font-size: 0.94rem;
    line-height: 1.5;
}

.empresas-lista-secao__badge {
    flex-shrink: 0;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 800;
    color: #3e53b2;
    background: linear-gradient(90deg, rgba(92, 107, 192, 0.14) 0%, rgba(45, 160, 168, 0.14) 100%);
    border: 1px solid rgba(92, 107, 192, 0.22);
}

.empresas-busca {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
    padding: 1rem 1.5rem 1.25rem;
    border-bottom: 1px solid rgba(20, 30, 40, 0.06);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(244, 246, 253, 0.95) 100%);
}

.empresas-busca__field {
    position: relative;
    flex: 1 1 220px;
    min-width: 0;
}

.empresas-busca__field-icon {
    position: absolute;
    left: 0.95rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.15rem;
    height: 1.15rem;
    color: #8a96b0;
    pointer-events: none;
}

.empresas-busca__input {
    width: 100%;
    padding: 0.65rem 1rem 0.65rem 2.65rem;
    border-radius: 14px;
    border: 1px solid rgba(92, 107, 192, 0.22);
    font-size: 0.95rem;
    color: #16254e;
    background: #fff;
    box-shadow: 0 2px 12px rgba(22, 37, 78, 0.05);
    transition:
        border-color 0.2s,
        box-shadow 0.2s;
}

.empresas-busca__input::placeholder {
    color: #9aa8c0;
}

.empresas-busca__input:hover {
    border-color: rgba(92, 107, 192, 0.35);
}

.empresas-busca__input:focus {
    outline: none;
    border-color: #5c6bc0;
    box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.18);
}

.empresas-busca__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.65rem 1.25rem;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    font-size: 0.9rem;
    color: #fff;
    white-space: nowrap;
    background: linear-gradient(135deg, #5c6bc0 0%, #4a5fc9 45%, #2da0a8 100%);
    box-shadow: 0 6px 20px rgba(92, 107, 192, 0.35);
    transition:
        transform 0.15s,
        filter 0.15s;
}

.empresas-busca__submit:hover:not(:disabled) {
    filter: brightness(1.06);
    transform: translateY(-1px);
}

.empresas-busca__submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.empresas-busca__limpar {
    padding: 0.55rem 0.9rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.88rem;
    color: #5f6f8f;
    background: transparent;
    border: 1px dashed rgba(20, 30, 40, 0.15);
    transition:
        background 0.2s,
        border-color 0.2s;
}

.empresas-busca__limpar:hover:not(:disabled) {
    background: rgba(92, 107, 192, 0.06);
    border-color: rgba(92, 107, 192, 0.35);
    color: #4054b8;
}

.empresas-pag {
    padding: 1rem 1.5rem 1.35rem;
    border-top: 1px solid rgba(20, 30, 40, 0.06);
    background: rgba(255, 255, 255, 0.55);
}

.empresas-pag__info {
    margin: 0 0 0.85rem;
    font-size: 0.88rem;
    color: #6b7c9f;
    text-align: center;
}

.empresas-pag__info strong {
    color: #24365a;
    font-weight: 700;
}

.empresas-pag__filtro-ativo {
    color: #5c6bc0;
    font-weight: 600;
}

.empresas-pag__bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.empresas-pag__nav {
    width: 42px;
    height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 12px;
    color: #4054b8;
    background: #fff;
    border: 1px solid rgba(92, 107, 192, 0.25);
    box-shadow: 0 2px 8px rgba(22, 37, 78, 0.06);
    transition:
        background 0.2s,
        transform 0.15s;
}

.empresas-pag__nav:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff 0%, #f0f3fb 100%);
    transform: translateY(-1px);
}

.empresas-pag__nav:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
}

.empresas-pag__nums {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
}

.empresas-pag__num {
    min-width: 40px;
    height: 40px;
    padding: 0 0.5rem;
    border: 1px solid transparent;
    border-radius: 11px;
    font-size: 0.88rem;
    font-weight: 700;
    color: #4a5b78;
    background: rgba(255, 255, 255, 0.8);
    transition:
        background 0.2s,
        color 0.2s,
        box-shadow 0.2s;
}

.empresas-pag__num:hover {
    background: rgba(92, 107, 192, 0.1);
    color: #4054b8;
}

.empresas-pag__num--active {
    color: #fff !important;
    background: linear-gradient(135deg, #5c6bc0 0%, #2da0a8 100%) !important;
    box-shadow: 0 4px 14px rgba(92, 107, 192, 0.35);
}

.empresas-pag__dots {
    padding: 0 0.2rem;
    font-weight: 700;
    color: #b0b8cc;
    user-select: none;
}

.empresas-lista-secao__loading {
    display: flex;
    align-items: center;
    padding: 1.5rem 1.5rem 1.75rem;
    font-size: 0.95rem;
}

.empresas-lista-secao__spinner {
    display: inline-block;
    width: 1.1rem;
    height: 1.1rem;
    margin-right: 0.6rem;
    border: 2px solid rgba(92, 107, 192, 0.2);
    border-top-color: #5c6bc0;
    border-radius: 50%;
    animation: empresa-spin 0.75s linear infinite;
}

@keyframes empresa-spin {
    to {
        transform: rotate(360deg);
    }
}

.empresas-lista-secao__empty {
    text-align: center;
    padding: 2.25rem 1.5rem 2.5rem;
    color: #5f6f8f;
}

.empresas-lista-secao__empty-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 1rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(92, 107, 192, 0.1);
    color: #4054b8;
    font-size: 1.5rem;
}

.empresas-lista-secao__empty-hint {
    margin-top: 0.5rem;
    font-size: 0.88rem;
    color: #8a96b0;
}

.empresas-lista-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
    padding: 1.25rem 1.5rem 1.5rem;
}

.empresa-resumo {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.85rem;
    padding: 1.15rem 1.15rem 1.1rem;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.07);
    box-shadow: 0 4px 18px rgba(22, 37, 78, 0.06);
    transition:
        box-shadow 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.empresa-resumo:hover {
    border-color: rgba(92, 107, 192, 0.35);
    box-shadow: 0 10px 28px rgba(64, 84, 184, 0.12);
    transform: translateY(-2px);
}

.empresa-resumo__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, rgba(92, 107, 192, 0.15) 0%, rgba(45, 160, 168, 0.12) 100%);
    color: #4054b8;
    font-size: 1.35rem;
}

.empresa-resumo__body {
    flex: 1;
    min-width: 0;
}

.empresa-resumo__nome {
    margin: 0;
    font-size: 0.98rem;
    font-weight: 800;
    color: #16254e;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.empresa-resumo__cnpj {
    margin: 0.4rem 0 0;
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #5f6f8f;
    font-variant-numeric: tabular-nums;
}

.empresa-resumo__actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

.empresa-resumo__btn {
    width: 100%;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.88rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid rgba(92, 107, 192, 0.35);
    color: #4054b8;
    background: rgba(92, 107, 192, 0.06);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease;
    text-decoration: none;
}

.empresa-resumo__btn--edit {
    border-color: rgba(45, 160, 168, 0.45);
    color: #1d6b72;
    background: rgba(45, 160, 168, 0.1);
}

.empresa-resumo__btn--edit:hover {
    background: linear-gradient(90deg, rgba(92, 107, 192, 0.12) 0%, rgba(45, 160, 168, 0.18) 100%);
    color: #0f4f55;
}

.empresa-resumo__btn:hover {
    background: linear-gradient(90deg, rgba(92, 107, 192, 0.14) 0%, rgba(45, 160, 168, 0.12) 100%);
    border-color: rgba(62, 83, 178, 0.45);
    color: #2f3d8f;
}

/* —— Modal de detalhes —— */
.empresa-modal {
    position: fixed;
    inset: 0;
    z-index: 4000;
}

.empresa-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
}

.empresa-modal__wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    overflow-y: auto;
}

.empresa-modal__panel {
    position: relative;
    width: 100%;
    max-width: 640px;
    max-height: min(90vh, 760px);
    display: flex;
    flex-direction: column;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.25);
    border: 1px solid rgba(20, 30, 40, 0.06);
    animation: empresa-modal-in 0.25s ease;
}

@keyframes empresa-modal-in {
    from {
        opacity: 0;
        transform: translateY(12px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.empresa-modal__fechar {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 30, 40, 0.06);
    color: #4a5b78;
    transition: background 0.2s ease;
}

.empresa-modal__fechar:hover {
    background: rgba(20, 30, 40, 0.1);
}

.empresa-modal__header {
    padding: 1.75rem 3.25rem 1rem 1.5rem;
    border-bottom: 1px solid rgba(20, 30, 40, 0.06);
    background: linear-gradient(180deg, #f8f9ff 0%, #fff 100%);
    border-radius: 20px 20px 0 0;
}

.empresa-modal__eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #5c6bc0;
}

.empresa-modal__title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: #16254e;
    line-height: 1.35;
}

.empresa-modal__cnpj {
    margin: 0.5rem 0 0;
    font-size: 0.92rem;
    font-weight: 700;
    color: #5f6f8f;
    font-variant-numeric: tabular-nums;
}

.empresa-modal__apelido {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: #4a5b78;
}

.empresa-modal__scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem 0.5rem;
}

.empresa-modal__secao {
    margin-bottom: 1.35rem;
}

.empresa-modal__secao--muted {
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(20, 30, 40, 0.1);
}

.empresa-modal__secao-titulo {
    margin: 0 0 0.65rem;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b7c9f;
}

.empresa-modal__texto {
    margin: 0 0 0.35rem;
    font-size: 0.92rem;
    color: #3d4f6e;
    line-height: 1.5;
}

.empresa-modal__dl {
    display: grid;
    grid-template-columns: minmax(7rem, 38%) 1fr;
    gap: 0.35rem 1rem;
    margin: 0;
    font-size: 0.92rem;
}

.empresa-modal__dl--compact {
    font-size: 0.85rem;
}

.empresa-modal__dl dt {
    margin: 0;
    font-weight: 600;
    color: #6b7c9f;
}

.empresa-modal__dl dd {
    margin: 0;
    color: #24365a;
}

.empresa-modal__lista {
    margin: 0;
    padding-left: 1.15rem;
    font-size: 0.9rem;
    color: #3d4f6e;
    line-height: 1.45;
}

.empresa-modal__lista li {
    margin-bottom: 0.35rem;
}

.empresa-modal__lista li:last-child {
    margin-bottom: 0;
}

.empresa-modal__codigo {
    display: inline-block;
    margin-right: 0.35rem;
    font-weight: 700;
    color: #4054b8;
    font-size: 0.82rem;
}

.empresa-modal__qual {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.84rem;
    font-weight: 500;
    color: #6b7c9f;
}

.empresa-modal__footer {
    padding: 1rem 1.5rem 1.35rem;
    border-top: 1px solid rgba(20, 30, 40, 0.06);
}

.empresa-modal__footer--split {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    justify-content: stretch;
}

.empresa-modal__btn-edit {
    flex: 1;
    min-width: 140px;
    border-radius: 12px;
    font-weight: 700;
    padding: 0.65rem 1rem;
    border: 1px solid rgba(45, 160, 168, 0.45);
    color: #1d6b72;
    background: rgba(45, 160, 168, 0.1);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.empresa-modal__btn-edit:hover {
    background: rgba(45, 160, 168, 0.18);
    color: #0b4a50;
}

.empresa-modal__footer--split .empresa-modal__btn-primary {
    flex: 1;
    min-width: 120px;
    width: auto;
}

.empresa-modal__btn-primary {
    width: 100%;
    border: none;
    border-radius: 12px;
    padding: 0.65rem 1rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.empresa-modal__btn-primary:hover {
    filter: brightness(1.05);
}

@media (max-width: 575.98px) {
    .empresas-lista-secao__head {
        padding: 1.1rem 1.1rem 0.85rem;
    }

    .empresas-lista-grid {
        padding: 1rem 1.1rem 1.25rem;
    }

    .empresa-modal__panel {
        max-height: 92vh;
        border-radius: 16px;
    }

    .empresa-modal__header {
        border-radius: 16px 16px 0 0;
    }
}

.empresa-cep-wrap {
    display: flex;
    gap: 0.6rem;
    align-items: center;
}

.empresa-cep-wrap__input {
    flex: 1;
    min-width: 0;
}

.empresa-cep-btn {
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

.empresa-cep-btn:hover:not(:disabled) {
    border-color: #5c6bc0;
    color: #2e3f76;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(92, 107, 192, 0.18);
}

.empresa-cep-btn:disabled {
    opacity: 0.78;
    cursor: not-allowed;
}

.empresa-cep-btn__inner {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
}

.empresa-cep-btn__icon {
    font-size: 1.05rem;
    flex-shrink: 0;
}

@media (max-width: 576px) {
    .empresa-cep-wrap {
        flex-direction: column;
        align-items: stretch;
    }

    .empresa-cep-btn {
        width: 100%;
        min-width: 0;
    }
}
</style>

