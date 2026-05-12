<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiBuildingLine,
    RiPencilLine,
    RiMapPinLine,
    RiPhoneLine,
    RiFileListLine,
    RiSave3Line,
    RiAddLine,
    RiDeleteBinLine,
    RiStackLine,
    RiSearchLine
} from "@remixicon/vue";
import { cnpjMask, onlyNumbers, phoneMask } from "@/shared/utils/masks";
import { useEditarEmpresa } from "@/presentation/composables/Empresa/useEditarEmpresa";
import { useViaCepEndereco } from "@/presentation/composables/Endereco/useViaCepEndereco";

const router = useRouter();

const {
    empresaId,
    form,
    carregando,
    salvando,
    erro,
    sucesso,
    erroCampos,
    naoEncontrada,
    empresaAtual,
    carregar,
    salvar,
    adicionarAtividadeSecundaria,
    removerAtividadeSecundaria,
    adicionarQsa,
    removerQsa,
    adicionarAtividadePrincipal,
    removerAtividadePrincipal
} = useEditarEmpresa();

const { carregandoCep, erroCep, aoDigitarCep, buscarCep } =
    useViaCepEndereco(form);

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

function validar(): boolean {
    erros.cnpj = onlyNumbers(form.cnpj).length === 14 ? "" : "CNPJ é obrigatório (14 dígitos).";
    erros.nome = form.nome.trim() ? "" : "Nome da empresa é obrigatório.";
    erros.email = /\S+@\S+\.\S+/.test(form.email.trim())
        ? ""
        : "Informe um e-mail válido.";
    erros.cep = form.cep.trim() ? "" : "CEP é obrigatório.";
    erros.rua = form.rua.trim() ? "" : "Logradouro é obrigatório.";
    erros.numero = form.numero.trim() ? "" : "Número é obrigatório.";
    erros.bairro = form.bairro.trim() ? "" : "Bairro é obrigatório.";
    erros.cidade = form.cidade.trim() ? "" : "Cidade é obrigatória.";
    erros.uf = form.uf.trim() ? "" : "UF é obrigatória.";
    return Object.values(erros).every((v) => !v);
}

async function aoSalvar() {
    if (!validar()) return;
    try {
        await salvar();
    } catch {
        return;
    }
}

function irParaLista() {
    router.push({ name: "AdministradorEmpresas" });
}

function aoDigitarTelefone(e: Event) {
    const input = e.target as HTMLInputElement;
    form.telefone = phoneMask(input.value);
}

function aoDigitarCelular(e: Event) {
    const input = e.target as HTMLInputElement;
    form.celular = phoneMask(input.value);
}

onMounted(async () => {
    try {
        await carregar();
    } catch {
        return;
    }
});
</script>

<template>
    <article class="edit-empresa min-vh-100">
        <div v-if="carregando" class="edit-empresa__loading">
            <span class="edit-empresa__spinner" aria-hidden="true" />
            <p>Carregando dados da empresa…</p>
        </div>

        <div v-else-if="naoEncontrada || Number.isNaN(empresaId)" class="edit-empresa__missing">
            <div class="edit-empresa__missing-card">
                <RiBuildingLine class="edit-empresa__missing-icon" />
                <h1 class="edit-empresa__missing-title">Empresa não encontrada</h1>
                <p class="edit-empresa__missing-text">
                    Não localizamos esta empresa na listagem ou o link está incorreto.
                </p>
                <button type="button" class="btn edit-empresa__btn-primary" @click="irParaLista">
                    Voltar para empresas
                </button>
            </div>
        </div>

        <template v-else>
            <header class="edit-empresa__hero">
                <div class="container">
                    <div class="edit-empresa__hero-card">
                        <nav class="edit-empresa__crumb" aria-label="Navegação">
                            <RouterLink :to="{ name: 'AdministradorEmpresas' }" class="edit-empresa__crumb-link">
                                <RiArrowLeftLine />
                                Voltar para empresas
                            </RouterLink>
                        </nav>
                        <div class="edit-empresa__hero-body">
                            <div class="edit-empresa__hero-icon" aria-hidden="true">
                                <RiPencilLine />
                            </div>
                            <div class="edit-empresa__hero-text">
                                <span class="edit-empresa__hero-badge">Edição de cadastro</span>
                                <h1 class="edit-empresa__hero-title">
                                    {{ form.nome || "Empresa" }}
                                </h1>
                                <div class="edit-empresa__hero-meta">
                                    <span class="edit-empresa__cnpj-pill">{{ cnpjMask(form.cnpj) }}</span>
                                    <span
                                        v-if="empresaAtual?.updated_at"
                                        class="edit-empresa__meta-sep"
                                        aria-hidden="true"
                                    />
                                    <span v-if="empresaAtual?.updated_at" class="edit-empresa__updated">
                                        Última atualização: {{ empresaAtual.updated_at }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div v-if="erro" class="container pt-3">
                <div class="edit-empresa__alert edit-empresa__alert--erro">{{ erro }}</div>
            </div>
            <div v-if="sucesso" class="container pt-3">
                <div class="edit-empresa__alert edit-empresa__alert--ok">{{ sucesso }}</div>
            </div>

            <div class="container edit-empresa__layout">
                <aside class="edit-empresa__aside d-none d-lg-block">
                    <nav class="edit-empresa__toc" aria-label="Seções do formulário">
                        <p class="edit-empresa__toc-title">Nesta página</p>
                        <a class="edit-empresa__toc-link" href="#sec-identificacao">
                            <RiBuildingLine /> Identificação
                        </a>
                        <a class="edit-empresa__toc-link" href="#sec-endereco">
                            <RiMapPinLine /> Endereço
                        </a>
                        <a class="edit-empresa__toc-link" href="#sec-contato">
                            <RiPhoneLine /> Contato
                        </a>
                        <a class="edit-empresa__toc-link" href="#sec-fiscal">
                            <RiFileListLine /> Fiscal
                        </a>
                        <a class="edit-empresa__toc-link" href="#sec-atividades">
                            <RiStackLine /> Atividades &amp; QSA
                        </a>
                    </nav>
                </aside>

                <div class="edit-empresa__main">
                    <form id="form-editar-empresa" @submit.prevent="aoSalvar">
                        <section id="sec-identificacao" class="edit-panel">
                            <div class="edit-panel__head">
                                <RiBuildingLine class="edit-panel__icon" />
                                <div>
                                    <h2 class="edit-panel__title">Identificação</h2>
                                    <p class="edit-panel__hint">Razão social, CNPJ e dados cadastrais principais.</p>
                                </div>
                            </div>
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
                                    <label class="form-label">Apelido / fantasia</label>
                                    <input v-model="form.apelido" type="text" class="form-control" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <label class="form-label">CNPJ</label>
                                    <input
                                        v-model="form.cnpj"
                                        type="text"
                                        class="form-control"
                                        :class="{ 'is-invalid': Boolean(erros.cnpj || erroCampos.cnpj) }"
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
                                    <label class="form-label">Situação CNPJ</label>
                                    <input v-model="form.situacao_cnpj" type="text" class="form-control" />
                                </div>
                            </div>
                        </section>

                        <section id="sec-endereco" class="edit-panel">
                            <div class="edit-panel__head">
                                <RiMapPinLine class="edit-panel__icon" />
                                <div>
                                    <h2 class="edit-panel__title">Endereço</h2>
                                    <p class="edit-panel__hint">Localização completa da sede.</p>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12 col-md-3">
                                    <label class="form-label" for="editar-empresa-cep">CEP</label>
                                    <div class="empresa-cep-wrap">
                                        <input
                                            id="editar-empresa-cep"
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
                                <div class="col-12 col-md-9">
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
                                        maxlength="2"
                                        :class="{ 'is-invalid': Boolean(erros.uf || erroCampos.uf) }"
                                    />
                                    <div v-if="erros.uf || erroCampos.uf" class="invalid-feedback d-block">
                                        {{ erros.uf || erroCampos.uf }}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="sec-contato" class="edit-panel">
                            <div class="edit-panel__head">
                                <RiPhoneLine class="edit-panel__icon" />
                                <div>
                                    <h2 class="edit-panel__title">Contato</h2>
                                    <p class="edit-panel__hint">Canais oficiais de comunicação.</p>
                                </div>
                            </div>
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
                                <div class="col-12 col-md-3">
                                    <label class="form-label" for="editar-empresa-telefone">Telefone</label>
                                    <input
                                        id="editar-empresa-telefone"
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
                                <div class="col-12 col-md-3">
                                    <label class="form-label" for="editar-empresa-celular">Celular</label>
                                    <input
                                        id="editar-empresa-celular"
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
                        </section>

                        <section id="sec-fiscal" class="edit-panel">
                            <div class="edit-panel__head">
                                <RiFileListLine class="edit-panel__icon" />
                                <div>
                                    <h2 class="edit-panel__title">Fiscal</h2>
                                    <p class="edit-panel__hint">Inscrições e situação perante o fisco.</p>
                                </div>
                            </div>
                            <div class="row g-3">
                                <div class="col-12 col-md-4">
                                    <label class="form-label">Data situação (UF)</label>
                                    <input v-model="form.data_situacao_uf" type="text" class="form-control" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <label class="form-label">Inscrição estadual</label>
                                    <input v-model="form.inscricao_estadual" type="text" class="form-control" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <label class="form-label">Situação IE</label>
                                    <input v-model="form.situacao_ie" type="text" class="form-control" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <label class="form-label">CNAE</label>
                                    <input v-model="form.cnae" type="text" class="form-control" />
                                </div>
                            </div>
                        </section>

                        <section id="sec-atividades" class="edit-panel edit-panel--last">
                            <div class="edit-panel__head">
                                <RiStackLine class="edit-panel__icon" />
                                <div>
                                    <h2 class="edit-panel__title">Atividades e QSA</h2>
                                    <p class="edit-panel__hint">
                                        As listas são substituídas inteiras ao salvar — revise antes de enviar.
                                    </p>
                                </div>
                            </div>

                            <div
                                v-if="erroCampos.atividades_principais"
                                class="edit-empresa__inline-alert"
                            >
                                {{ erroCampos.atividades_principais }}
                            </div>

                            <h3 class="edit-subtitle">Atividades principais</h3>
                            <div
                                v-for="(a, i) in form.atividades_principais"
                                :key="'p' + i"
                                class="row g-2 align-items-end mb-2"
                            >
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
                                        aria-label="Remover"
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

                            <h3 class="edit-subtitle">Atividades secundárias</h3>
                            <div
                                v-for="(a, i) in form.atividades_secundarias"
                                :key="'s' + i"
                                class="row g-2 align-items-end mb-2"
                            >
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

                            <h3 class="edit-subtitle">QSA</h3>
                            <div
                                v-for="(q, i) in form.qsa"
                                :key="'q' + i"
                                class="row g-2 align-items-end mb-2"
                            >
                                <div class="col-12 col-md-7">
                                    <label class="form-label">Nome</label>
                                    <input v-model="q.nome" type="text" class="form-control" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <label class="form-label">Qualificação</label>
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
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="adicionarQsa">
                                <RiAddLine class="me-1" />
                                Adicionar participante
                            </button>
                        </section>

                        <div class="edit-empresa__spacer" />
                    </form>
                </div>
            </div>

            <div class="edit-empresa__dock">
                <div class="container edit-empresa__dock-inner">
                    <button type="button" class="btn edit-empresa__dock-secondary" @click="irParaLista">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="form-editar-empresa"
                        class="btn edit-empresa__dock-primary"
                        :disabled="salvando"
                    >
                        <RiSave3Line class="me-1" />
                        {{ salvando ? "Salvando…" : "Salvar alterações" }}
                    </button>
                </div>
            </div>
        </template>
    </article>
</template>

<style scoped>
.edit-empresa {
    background: #eef1f8;
    padding-bottom: 5.5rem;
}

.edit-empresa__loading,
.edit-empresa__missing {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
}

.edit-empresa__spinner {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    border: 3px solid rgba(92, 107, 192, 0.2);
    border-top-color: #5c6bc0;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.edit-empresa__missing-card {
    max-width: 400px;
    padding: 2rem;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 16px 48px rgba(22, 37, 78, 0.1);
}

.edit-empresa__missing-icon {
    font-size: 2.5rem;
    color: #5c6bc0;
    margin-bottom: 0.75rem;
}

.edit-empresa__missing-title {
    font-size: 1.35rem;
    font-weight: 800;
    color: #16254e;
    margin: 0 0 0.5rem;
}

.edit-empresa__missing-text {
    color: #6b7c9f;
    margin: 0 0 1.25rem;
    line-height: 1.5;
}

.edit-empresa__hero {
    padding: 1.25rem 0 0;
    margin-bottom: 1rem;
}

.edit-empresa__hero-card {
    position: relative;
    background: #fff;
    border-radius: 18px;
    padding: 1.15rem 1.35rem 1.35rem 1.5rem;
    box-shadow: 0 8px 32px rgba(22, 37, 78, 0.07);
    border: 1px solid rgba(20, 30, 40, 0.07);
    overflow: hidden;
}

.edit-empresa__hero-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 4px;
    border-radius: 999px;
    background: linear-gradient(180deg, #5c6bc0 0%, #2da0a8 100%);
}

.edit-empresa__crumb {
    margin-bottom: 1rem;
    padding-left: 0.35rem;
}

.edit-empresa__crumb-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #4054b8;
    font-size: 0.9rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
}

.edit-empresa__crumb-link:hover {
    color: #2f3d8f;
    text-decoration: underline;
}

.edit-empresa__hero-body {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    padding-left: 0.35rem;
}

.edit-empresa__hero-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.5rem;
    color: #4054b8;
    background: linear-gradient(
        145deg,
        rgba(92, 107, 192, 0.14) 0%,
        rgba(45, 160, 168, 0.1) 100%
    );
    border: 1px solid rgba(92, 107, 192, 0.18);
}

.edit-empresa__hero-badge {
    display: inline-block;
    margin: 0 0 0.45rem;
    padding: 0.2rem 0.55rem;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #3e53b2;
    background: rgba(92, 107, 192, 0.1);
    border: 1px solid rgba(92, 107, 192, 0.15);
}

.edit-empresa__hero-title {
    margin: 0;
    font-size: clamp(1.15rem, 2.8vw, 1.65rem);
    font-weight: 800;
    color: #16254e;
    line-height: 1.3;
    letter-spacing: -0.02em;
}

.edit-empresa__hero-meta {
    margin: 0.65rem 0 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    row-gap: 0.35rem;
}

.edit-empresa__cnpj-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.28rem 0.75rem;
    border-radius: 999px;
    font-size: 0.84rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #24365a;
    background: #f0f3fb;
    border: 1px solid rgba(92, 107, 192, 0.2);
}

.edit-empresa__meta-sep {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #c5cdd9;
    flex-shrink: 0;
}

.edit-empresa__updated {
    font-size: 0.84rem;
    font-weight: 500;
    color: #6b7c9f;
}

.edit-empresa__alert {
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-size: 0.92rem;
}

.edit-empresa__alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}

.edit-empresa__alert--ok {
    background: #eefaf3;
    border: 1px solid #b7e3c7;
    color: #1d6d3f;
}

.edit-empresa__layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 0.5rem;
}

@media (min-width: 992px) {
    .edit-empresa__layout {
        grid-template-columns: 220px minmax(0, 1fr);
        align-items: start;
    }
}

.edit-empresa__aside {
    position: sticky;
    top: 5.5rem;
}

.edit-empresa__toc {
    padding: 1.1rem;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.07);
    box-shadow: 0 8px 28px rgba(22, 37, 78, 0.06);
}

.edit-empresa__toc-title {
    margin: 0 0 0.75rem;
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #8a96b0;
}

.edit-empresa__toc-link {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.5rem;
    margin: 0 -0.25rem;
    border-radius: 10px;
    font-size: 0.88rem;
    font-weight: 600;
    color: #3d4f6e;
    text-decoration: none;
    transition: background 0.15s;
}

.edit-empresa__toc-link:hover {
    background: rgba(92, 107, 192, 0.08);
    color: #4054b8;
}

.edit-panel {
    background: #fff;
    border-radius: 18px;
    padding: 1.35rem 1.35rem 1.5rem;
    margin-bottom: 1.25rem;
    border: 1px solid rgba(20, 30, 40, 0.06);
    box-shadow: 0 6px 24px rgba(22, 37, 78, 0.05);
    scroll-margin-top: 6rem;
}

.edit-panel--last {
    margin-bottom: 0;
}

.edit-panel__head {
    display: flex;
    gap: 0.85rem;
    margin-bottom: 1.15rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(20, 30, 40, 0.06);
}

.edit-panel__icon {
    font-size: 1.5rem;
    color: #5c6bc0;
    flex-shrink: 0;
}

.edit-panel__title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #16254e;
}

.edit-panel__hint {
    margin: 0.25rem 0 0;
    font-size: 0.86rem;
    color: #6b7c9f;
    line-height: 1.45;
}

.edit-subtitle {
    margin: 1rem 0 0.65rem;
    font-size: 0.95rem;
    font-weight: 800;
    color: #24365a;
}

.edit-empresa__inline-alert {
    padding: 0.6rem 0.85rem;
    border-radius: 10px;
    background: #fff8f0;
    border: 1px solid #f0d9c2;
    color: #9a5b1a;
    font-size: 0.88rem;
    margin-bottom: 1rem;
}

.edit-empresa__spacer {
    height: 1rem;
}

.edit-empresa__dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(20, 30, 40, 0.08);
    box-shadow: 0 -8px 32px rgba(22, 37, 78, 0.08);
}

.edit-empresa__dock-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-end;
    align-items: center;
}

.edit-empresa__dock-secondary {
    border-radius: 12px;
    font-weight: 700;
    padding: 0.55rem 1.1rem;
    border: 1px solid rgba(20, 30, 40, 0.15);
    background: #fff;
    color: #4a5b78;
}

.edit-empresa__dock-primary {
    border: none;
    border-radius: 12px;
    font-weight: 700;
    padding: 0.55rem 1.35rem;
    color: #fff;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    box-shadow: 0 6px 20px rgba(92, 107, 192, 0.35);
}

.edit-empresa__dock-primary:disabled {
    opacity: 0.65;
}

.edit-empresa__btn-primary {
    border: none;
    border-radius: 12px;
    font-weight: 700;
    padding: 0.55rem 1.25rem;
    color: #fff;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
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
