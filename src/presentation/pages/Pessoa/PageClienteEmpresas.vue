<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiBuilding4Line,
    RiCheckDoubleLine,
    RiCloseLine,
    RiErrorWarningLine,
    RiExternalLinkLine,
    RiInboxLine,
    RiInformationLine,
    RiLinkM,
    RiRefreshLine,
    RiSearchLine,
    RiShieldCheckLine,
    RiShieldKeyholeLine
} from "@remixicon/vue";
import CertificadoDigitalModal from "@/presentation/components/Cliente/CertificadoDigitalModal.vue";
import VinculoStatusBadge from "@/presentation/components/Cliente/VinculoStatusBadge.vue";
import { useEmpresasCliente } from "@/presentation/composables/Empresa/useEmpresasCliente";
import type { EmpresaVinculoDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import { formatarData, formatarDataIsoPtBr } from "@/shared/utils/date.util";
import { cnpjMask, onlyNumbers } from "@/shared/utils/masks";

const {
    cnpjBusca,
    buscandoCnpj,
    erroBusca,
    empresaEncontradaLocal,
    consultaReceita,
    vinculos,
    carregandoVinculos,
    erroVinculos,
    paginaAtual,
    totalRegistros,
    totalPaginas,
    listaVinculosVazia,
    solicitando,
    cadastrandoReceita,
    erroSolicitacao,
    sucessoSolicitacao,
    vinculoDaEmpresa,
    podeSolicitarVinculo,
    rotuloAcaoVinculo,
    buscarPorCnpj,
    limparBusca,
    solicitarVinculo,
    cadastrarESolicitarVinculoDaReceita,
    irParaPagina,
    buscarInicial,
    recarregarVinculos
} = useEmpresasCliente();

function aoDigitarCnpj(e: Event) {
    const input = e.target as HTMLInputElement;
    cnpjBusca.value = cnpjMask(input.value);
}

const cnpjValido = computed(() => onlyNumbers(cnpjBusca.value).length === 14);

const resumoVinculos = computed(() => {
    if (carregandoVinculos.value) return "Carregando vinculações...";
    if (erroVinculos.value) return "Falha ao consultar";
    if (listaVinculosVazia.value) return "Nenhuma vinculação ainda";
    return `${totalRegistros.value} vinculação(ões)`;
});

const vinculoEmpresaBuscada = computed(() => {
    if (!empresaEncontradaLocal.value) return undefined;
    return vinculoDaEmpresa(empresaEncontradaLocal.value.id);
});

const podeSolicitarEmpresaBuscada = computed(() => {
    if (!empresaEncontradaLocal.value) return false;
    return podeSolicitarVinculo(empresaEncontradaLocal.value.id);
});

async function aoBuscar() {
    try {
        await buscarPorCnpj();
    } catch {
        return;
    }
}

async function aoSolicitar(empresaId: number) {
    try {
        await solicitarVinculo(empresaId);
    } catch {
        return;
    }
}

async function aoCadastrarESolicitar() {
    try {
        await cadastrarESolicitarVinculoDaReceita();
    } catch {
        return;
    }
}

onMounted(() => {
    void buscarInicial();
});

const certModalAberto = ref(false);
const certVinculoSelecionado = ref<EmpresaVinculoDTO | null>(null);
const sucessoCertificado = ref<string | null>(null);

function abrirCertificado(vinculo: EmpresaVinculoDTO) {
    certVinculoSelecionado.value = vinculo;
    certModalAberto.value = true;
}

function fecharCertificado() {
    certModalAberto.value = false;
    certVinculoSelecionado.value = null;
}

function rotuloCertificado(vinculo: EmpresaVinculoDTO): string {
    return vinculo.tem_certificado ? "Atualizar certificado" : "Enviar certificado digital";
}

function tituloAcaoCertificado(vinculo: EmpresaVinculoDTO): string {
    return vinculo.tem_certificado
        ? "Atualizar certificado digital"
        : "Enviar certificado digital";
}

async function aoCertificadoEnviado(mensagem: string) {
    sucessoCertificado.value = mensagem;
    fecharCertificado();
    await recarregarVinculos();
}
</script>

<template>
    <article class="cli-emp">
        <header class="cli-emp__hero">
            <div class="cli-emp__hero-bg" aria-hidden="true" />
            <div class="cli-emp__hero-inner">
                <div class="cli-emp__hero-icon">
                    <RiBuilding4Line />
                </div>
                <div class="cli-emp__hero-text">
                    <p class="cli-emp__eyebrow">Conta · Empresas</p>
                    <h1 class="cli-emp__title">Vincular empresas</h1>
                    <p class="cli-emp__subtitle">
                        Busque pelo CNPJ, solicite a vinculação e acompanhe o status das suas
                        solicitações em um só lugar.
                    </p>
                </div>
            </div>
        </header>

        <section class="cli-emp__meta">
            <div class="cli-emp__meta-card">
                <span class="cli-emp__meta-kicker">Minhas vinculações</span>
                <strong>{{ resumoVinculos }}</strong>
            </div>
            <div
                class="cli-emp__meta-card"
                :class="{ 'cli-emp__meta-card--active': empresaEncontradaLocal || consultaReceita }"
            >
                <span class="cli-emp__meta-kicker">Busca por CNPJ</span>
                <strong>
                    {{
                        empresaEncontradaLocal
                            ? "Cadastrada no sistema"
                            : consultaReceita
                              ? "Encontrada na Receita"
                              : "Aguardando consulta"
                    }}
                </strong>
            </div>
        </section>

        <section class="cli-emp__search card border-0 shadow-sm">
            <div class="card-body p-3 p-lg-4">
                <div class="cli-emp__search-head">
                    <RiSearchLine class="cli-emp__search-ic" aria-hidden="true" />
                    <div>
                        <h2 class="cli-emp__search-title">Buscar empresa pelo CNPJ</h2>
                    </div>
                </div>

                <form class="cli-emp__search-form" @submit.prevent="aoBuscar">
                    <div class="cli-emp__input-wrap">
                        <RiSearchLine class="cli-emp__input-ic" aria-hidden="true" />
                        <input
                            id="emp-cnpj"
                            :value="cnpjBusca"
                            type="text"
                            inputmode="numeric"
                            class="form-control cli-emp__input"
                            placeholder="00.000.000/0000-00"
                            maxlength="18"
                            autocomplete="off"
                            :disabled="buscandoCnpj"
                            @input="aoDigitarCnpj"
                        />
                    </div>
                    <div class="cli-emp__search-actions">
                        <button
                            type="submit"
                            class="btn cli-emp__btn cli-emp__btn--primary"
                            :disabled="!cnpjValido || buscandoCnpj"
                        >
                            <RiSearchLine v-if="!buscandoCnpj" />
                            {{ buscandoCnpj ? "Buscando..." : "Buscar CNPJ" }}
                        </button>
                        <button
                            v-if="cnpjBusca || empresaEncontradaLocal || consultaReceita"
                            type="button"
                            class="btn cli-emp__btn cli-emp__btn--ghost"
                            :disabled="buscandoCnpj"
                            @click="limparBusca"
                        >
                            <RiCloseLine /> Limpar
                        </button>
                    </div>
                </form>

                <div v-if="erroBusca" class="cli-emp__alert cli-emp__alert--erro" role="alert">
                    <RiErrorWarningLine />
                    <span>{{ erroBusca }}</span>
                </div>
            </div>
        </section>

        <div
            v-if="sucessoCertificado"
            class="cli-emp__alert cli-emp__alert--ok cli-emp__alert--cert"
            role="status"
        >
            <RiCheckDoubleLine />
            <span>{{ sucessoCertificado }}</span>
            <button
                type="button"
                class="cli-emp__alert-dismiss"
                aria-label="Fechar mensagem"
                @click="sucessoCertificado = null"
            >
                <RiCloseLine />
            </button>
        </div>

        <!-- Resultado: empresa no banco local -->
        <section
            v-if="empresaEncontradaLocal"
            class="cli-emp__result cli-emp__result--local card border-0 shadow-sm"
        >
            <div class="card-body p-4 p-lg-5">
                <div class="cli-emp__result-top">
                    <div class="cli-emp__result-badge cli-emp__result-badge--local">
                        <RiShieldCheckLine />
                        Cadastro interno
                    </div>
                    <div class="cli-emp__result-top-end">
                        <button
                            v-if="vinculoEmpresaBuscada?.status === 'aprovado'"
                            type="button"
                            class="cli-emp__cert-btn"
                            :title="tituloAcaoCertificado(vinculoEmpresaBuscada)"
                            :aria-label="tituloAcaoCertificado(vinculoEmpresaBuscada)"
                            @click="abrirCertificado(vinculoEmpresaBuscada)"
                        >
                            <RiShieldKeyholeLine />
                        </button>
                        <VinculoStatusBadge
                            v-if="vinculoEmpresaBuscada"
                            :status="vinculoEmpresaBuscada.status"
                        />
                    </div>
                </div>

                <h3 class="cli-emp__result-name">{{ empresaEncontradaLocal.nome }}</h3>
                <p v-if="empresaEncontradaLocal.apelido" class="cli-emp__result-alias">
                    {{ empresaEncontradaLocal.apelido }}
                </p>

                <dl class="cli-emp__result-grid">
                    <div>
                        <dt>CNPJ</dt>
                        <dd>{{ cnpjMask(empresaEncontradaLocal.cnpj) }}</dd>
                    </div>
                    <div>
                        <dt>Cidade / UF</dt>
                        <dd>
                            {{ empresaEncontradaLocal.cidade }} / {{ empresaEncontradaLocal.uf }}
                        </dd>
                    </div>
                    <div v-if="empresaEncontradaLocal.email">
                        <dt>E-mail</dt>
                        <dd>{{ empresaEncontradaLocal.email }}</dd>
                    </div>
                    <div v-if="empresaEncontradaLocal.situacao_cnpj">
                        <dt>Situação CNPJ</dt>
                        <dd>{{ empresaEncontradaLocal.situacao_cnpj }}</dd>
                    </div>
                </dl>

                <div
                    v-if="vinculoEmpresaBuscada?.status === 'rejeitado' && vinculoEmpresaBuscada.justificativa"
                    class="cli-emp__justificativa"
                    role="alert"
                >
                    <RiInformationLine />
                    <div>
                        <strong>Motivo da rejeição</strong>
                        <p>{{ vinculoEmpresaBuscada.justificativa }}</p>
                    </div>
                </div>

                <div v-if="sucessoSolicitacao" class="cli-emp__alert cli-emp__alert--ok" role="status">
                    <RiCheckDoubleLine />
                    <span>{{ sucessoSolicitacao }}</span>
                </div>
                <div v-if="erroSolicitacao" class="cli-emp__alert cli-emp__alert--erro" role="alert">
                    <RiErrorWarningLine />
                    <span>{{ erroSolicitacao }}</span>
                </div>

                <div class="cli-emp__result-actions">
                    <button
                        type="button"
                        class="btn cli-emp__btn cli-emp__btn--primary"
                        :disabled="!podeSolicitarEmpresaBuscada || solicitando"
                        @click="aoSolicitar(empresaEncontradaLocal.id)"
                    >
                        <RiLinkM />
                        {{
                            solicitando
                                ? "Enviando..."
                                : rotuloAcaoVinculo(vinculoEmpresaBuscada?.status)
                        }}
                    </button>
                    <p
                        v-if="vinculoEmpresaBuscada?.status === 'pendente'"
                        class="cli-emp__hint"
                    >
                        Sua solicitação está em análise. Você será notificado quando houver
                        atualização.
                    </p>
                    <p
                        v-else-if="vinculoEmpresaBuscada?.status === 'aprovado' && vinculoEmpresaBuscada.tem_certificado"
                        class="cli-emp__hint cli-emp__hint--ok"
                    >
                        Certificado enviado em
                        {{ formatarData(vinculoEmpresaBuscada.certificado_enviado_em ?? "") }}.
                    </p>
                    <p
                        v-else-if="vinculoEmpresaBuscada?.status === 'aprovado'"
                        class="cli-emp__hint cli-emp__hint--ok"
                    >
                        Você já está vinculado a esta empresa.
                    </p>
                    <button
                        v-if="vinculoEmpresaBuscada?.status === 'aprovado'"
                        type="button"
                        class="btn cli-emp__btn cli-emp__btn--cert btn-sm"
                        @click="abrirCertificado(vinculoEmpresaBuscada)"
                    >
                        <RiShieldKeyholeLine />
                        {{ rotuloCertificado(vinculoEmpresaBuscada) }}
                    </button>
                </div>
            </div>
        </section>

        <!-- Resultado: apenas Receita WS (não cadastrada) -->
        <section
            v-else-if="consultaReceita"
            class="cli-emp__result cli-emp__result--receita card border-0 shadow-sm"
        >
            <div class="card-body p-4 p-lg-5">
                <div class="cli-emp__result-top">
                    <div class="cli-emp__result-badge cli-emp__result-badge--receita">
                        <RiExternalLinkLine />
                        Receita Federal
                    </div>
                </div>

                <h3 class="cli-emp__result-name">{{ consultaReceita.nome }}</h3>
                <p v-if="consultaReceita.fantasia" class="cli-emp__result-alias">
                    {{ consultaReceita.fantasia }}
                </p>

                <dl class="cli-emp__result-grid">
                    <div>
                        <dt>CNPJ</dt>
                        <dd>{{ cnpjMask(consultaReceita.cnpj ?? "") }}</dd>
                    </div>
                    <div v-if="consultaReceita.situacao">
                        <dt>Situação</dt>
                        <dd>{{ consultaReceita.situacao }}</dd>
                    </div>
                    <div v-if="consultaReceita.municipio && consultaReceita.uf">
                        <dt>Cidade / UF</dt>
                        <dd>{{ consultaReceita.municipio }} / {{ consultaReceita.uf }}</dd>
                    </div>
                    <div v-if="consultaReceita.atividadePrincipal[0]?.text">
                        <dt>Atividade principal</dt>
                        <dd>{{ consultaReceita.atividadePrincipal[0].text }}</dd>
                    </div>
                </dl>

                <div class="cli-emp__aviso-receita" role="status">
                    <RiInformationLine />
                    <div>
                        <strong>Empresa ainda não cadastrada no sistema</strong>
                        <p>
                            Os dados foram obtidos na Receita Federal. Ao continuar,
                            cadastramos a empresa em nossa base e enviamos sua solicitação
                            de vinculação para análise do administrador.
                        </p>
                    </div>
                </div>

                <div v-if="sucessoSolicitacao" class="cli-emp__alert cli-emp__alert--ok" role="status">
                    <RiCheckDoubleLine />
                    <span>{{ sucessoSolicitacao }}</span>
                </div>
                <div v-if="erroSolicitacao" class="cli-emp__alert cli-emp__alert--erro" role="alert">
                    <RiErrorWarningLine />
                    <span>{{ erroSolicitacao }}</span>
                </div>

                <div class="cli-emp__result-actions">
                    <button
                        type="button"
                        class="btn cli-emp__btn cli-emp__btn--primary"
                        :disabled="cadastrandoReceita"
                        @click="aoCadastrarESolicitar"
                    >
                        <RiLinkM />
                        {{
                            cadastrandoReceita
                                ? "Cadastrando e enviando..."
                                : "Cadastrar empresa e solicitar vinculação"
                        }}
                    </button>
                </div>
            </div>
        </section>

        <!-- Lista de vinculações -->
        <section class="cli-emp__lista">
            <div class="cli-emp__lista-head">
                <h2 class="cli-emp__lista-title">Minhas vinculações</h2>
                <button
                    type="button"
                    class="btn cli-emp__btn cli-emp__btn--ghost btn-sm"
                    :disabled="carregandoVinculos"
                    @click="buscarInicial"
                >
                    <RiRefreshLine /> Atualizar
                </button>
            </div>

            <div v-if="erroVinculos" class="cli-emp__panel cli-emp__err">
                <div class="cli-emp__err-inner">
                    <RiErrorWarningLine class="cli-emp__err-ic" />
                    <div>
                        <h3>Não foi possível carregar</h3>
                        <p>{{ erroVinculos }}</p>
                        <button
                            type="button"
                            class="btn cli-emp__btn cli-emp__btn--primary btn-sm"
                            @click="buscarInicial"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>

            <div v-else-if="carregandoVinculos" class="cli-emp__skeleton-wrap">
                <div v-for="n in 3" :key="n" class="cli-emp__skeleton card border-0 shadow-sm">
                    <div class="card-body p-4">
                        <div class="cli-emp__sk-line cli-emp__sk-line--short" />
                        <div class="cli-emp__sk-line" />
                        <div class="cli-emp__sk-line cli-emp__sk-line--med" />
                    </div>
                </div>
            </div>

            <div v-else-if="listaVinculosVazia" class="cli-emp__empty card border-0 shadow-sm">
                <div class="card-body p-4 p-lg-5 text-center">
                    <div class="cli-emp__empty-icon">
                        <RiInboxLine />
                    </div>
                    <h3>Nenhuma vinculação ainda</h3>
                    <p>
                        Use a busca por CNPJ acima para localizar uma empresa cadastrada e enviar
                        sua primeira solicitação de vinculação.
                    </p>
                </div>
            </div>

            <template v-else>
                <div class="cli-emp__cards">
                    <article
                        v-for="v in vinculos"
                        :key="v.id"
                        class="cli-emp__card card border-0 shadow-sm"
                    >
                        <div class="card-body p-4">
                            <div class="cli-emp__card-top">
                                <div>
                                    <h3 class="cli-emp__card-name">{{ v.empresa.nome }}</h3>
                                    <p v-if="v.empresa.apelido" class="cli-emp__card-alias">
                                        {{ v.empresa.apelido }}
                                    </p>
                                </div>
                                <div class="cli-emp__card-top-end">
                                    <button
                                        v-if="v.status === 'aprovado'"
                                        type="button"
                                        class="cli-emp__cert-btn"
                                        :title="tituloAcaoCertificado(v)"
                                        :aria-label="tituloAcaoCertificado(v)"
                                        @click="abrirCertificado(v)"
                                    >
                                        <RiShieldKeyholeLine />
                                    </button>
                                    <VinculoStatusBadge :status="v.status" />
                                </div>
                            </div>

                            <dl class="cli-emp__card-meta">
                                <div>
                                    <dt>CNPJ</dt>
                                    <dd>{{ cnpjMask(v.empresa.cnpj) }}</dd>
                                </div>
                                <div>
                                    <dt>Solicitado em</dt>
                                    <dd>{{ formatarDataIsoPtBr(v.created_at) }}</dd>
                                </div>
                            </dl>

                            <div
                                v-if="v.status === 'rejeitado' && v.justificativa"
                                class="cli-emp__justificativa cli-emp__justificativa--compact"
                            >
                                <RiInformationLine />
                                <div>
                                    <strong>Motivo da rejeição</strong>
                                    <p>{{ v.justificativa }}</p>
                                </div>
                            </div>

                            <div v-if="v.status === 'rejeitado'" class="cli-emp__card-actions">
                                <button
                                    type="button"
                                    class="btn cli-emp__btn cli-emp__btn--primary btn-sm"
                                    :disabled="solicitando"
                                    @click="aoSolicitar(v.empresa_id)"
                                >
                                    <RiRefreshLine />
                                    {{ solicitando ? "Enviando..." : "Solicitar novamente" }}
                                </button>
                            </div>

                            <div v-else-if="v.status === 'aprovado'" class="cli-emp__card-actions">
                                <div
                                    v-if="v.tem_certificado"
                                    class="cli-emp__cert-status"
                                    role="status"
                                >
                                    <RiCheckDoubleLine />
                                    <span>
                                        Certificado enviado em
                                        {{ formatarData(v.certificado_enviado_em ?? "") }}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    class="btn cli-emp__btn cli-emp__btn--cert btn-sm"
                                    @click="abrirCertificado(v)"
                                >
                                    <RiShieldKeyholeLine />
                                    {{ rotuloCertificado(v) }}
                                </button>
                                <p class="cli-emp__cert-hint">
                                    {{
                                        v.tem_certificado
                                            ? "Você pode enviar um novo arquivo para substituir o certificado anterior."
                                            : "Envie o arquivo do certificado (.pfx, .p12 ou .pem) e a senha para habilitar operações com esta empresa."
                                    }}
                                </p>
                            </div>
                        </div>
                    </article>
                </div>

                <nav
                    v-if="totalPaginas > 1"
                    class="cli-emp__pagination"
                    aria-label="Paginação de vinculações"
                >
                    <button
                        type="button"
                        class="cli-emp__page-btn"
                        :disabled="paginaAtual <= 1 || carregandoVinculos"
                        aria-label="Página anterior"
                        @click="irParaPagina(paginaAtual - 1)"
                    >
                        <RiArrowLeftSLine />
                    </button>
                    <span class="cli-emp__page-info">
                        Página <strong>{{ paginaAtual }}</strong> de
                        <strong>{{ totalPaginas }}</strong>
                    </span>
                    <button
                        type="button"
                        class="cli-emp__page-btn"
                        :disabled="paginaAtual >= totalPaginas || carregandoVinculos"
                        aria-label="Próxima página"
                        @click="irParaPagina(paginaAtual + 1)"
                    >
                        <RiArrowRightSLine />
                    </button>
                </nav>
            </template>
        </section>

        <CertificadoDigitalModal
            :aberto="certModalAberto"
            :vinculo="certVinculoSelecionado"
            @fechar="fecharCertificado"
            @enviado="aoCertificadoEnviado"
        />
    </article>
</template>

<style scoped>
.cli-emp {
    --cli-accent: #5c6bc0;
    --cli-accent-2: #2da0a8;
    --cli-bg-soft: #f5f7ff;
    --cli-ink: #16254e;
    --cli-muted: #6c7a94;
    max-width: 1120px;
    margin: 0 auto;
    padding: 0 0 3rem;
}

.cli-emp__hero {
    position: relative;
    border-radius: 0 0 24px 24px;
    overflow: hidden;
    margin-bottom: 1.5rem;
}

.cli-emp__hero-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a2338 0%, #243554 55%, #1e3d4a 100%);
}

.cli-emp__hero-bg::before,
.cli-emp__hero-bg::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.35;
}

.cli-emp__hero-bg::before {
    width: 280px;
    height: 280px;
    background: var(--cli-accent);
    top: -80px;
    right: -40px;
}

.cli-emp__hero-bg::after {
    width: 200px;
    height: 200px;
    background: var(--cli-accent-2);
    bottom: -60px;
    left: 10%;
}

.cli-emp__hero-inner {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 2rem 1.25rem 2.25rem;
}

.cli-emp__hero-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    flex-shrink: 0;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.cli-emp__hero-icon :deep(svg) {
    width: 28px;
    height: 28px;
}

.cli-emp__eyebrow {
    margin: 0 0 0.35rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.65);
}

.cli-emp__title {
    margin: 0;
    font-size: clamp(1.5rem, 4vw, 1.85rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
}

.cli-emp__subtitle {
    margin: 0.5rem 0 0;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.78);
    line-height: 1.55;
    max-width: 52ch;
}

.cli-emp__meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.85rem;
    margin-bottom: 1.25rem;
    padding: 0 0.25rem;
}

.cli-emp__meta-card {
    background: #fff;
    border-radius: 16px;
    padding: 1rem 1.15rem;
    border: 1px solid rgba(20, 30, 40, 0.06);
    box-shadow: 0 8px 24px rgba(20, 30, 40, 0.04);
}

.cli-emp__meta-card--active {
    border-color: rgba(92, 107, 192, 0.35);
    background: linear-gradient(135deg, #fff 0%, var(--cli-bg-soft) 100%);
}

.cli-emp__meta-kicker {
    display: block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--cli-muted);
    margin-bottom: 0.35rem;
}

.cli-emp__meta-card strong {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--cli-ink);
}

.cli-emp__search {
    border-radius: 18px;
    margin-bottom: 1.25rem;
    background: linear-gradient(180deg, #fff 0%, #fafcff 100%);
}

.cli-emp__search-head {
    display: flex;
    gap: 0.85rem;
    margin-bottom: 1.25rem;
}

.cli-emp__search-ic {
    width: 22px;
    height: 22px;
    color: var(--cli-accent);
    flex-shrink: 0;
    margin-top: 0.15rem;
}

.cli-emp__search-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--cli-ink);
}

.cli-emp__search-lead {
    margin: 0.35rem 0 0;
    font-size: 0.88rem;
    color: var(--cli-muted);
    line-height: 1.5;
}

.cli-emp__search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: stretch;
}

.cli-emp__input-wrap {
    position: relative;
    flex: 1 1 220px;
    min-width: 0;
}

.cli-emp__input-ic {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: #9aa8c5;
    pointer-events: none;
}

.cli-emp__input {
    padding-left: 2.65rem !important;
    border-radius: 14px !important;
    border: 1px solid rgba(92, 107, 192, 0.25) !important;
    font-weight: 600;
    font-size: 1rem;
    letter-spacing: 0.04em;
    height: 48px;
}

.cli-emp__input:focus {
    border-color: var(--cli-accent) !important;
    box-shadow: 0 0 0 3px rgba(92, 107, 192, 0.15) !important;
}

.cli-emp__search-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.cli-emp__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    border-radius: 12px !important;
    font-weight: 700 !important;
    padding: 0.55rem 1.1rem !important;
}

.cli-emp__btn :deep(svg) {
    width: 18px;
    height: 18px;
}

.cli-emp__btn--primary {
    background: linear-gradient(90deg, var(--cli-accent) 0%, var(--cli-accent-2) 100%) !important;
    border: none !important;
    color: #fff !important;
}

.cli-emp__btn--ghost {
    background: #fff !important;
    border: 2px solid rgba(92, 107, 192, 0.35) !important;
    color: var(--cli-accent) !important;
}

.cli-emp__alert {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    line-height: 1.45;
}

.cli-emp__alert :deep(svg) {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.cli-emp__alert--erro {
    background: rgba(220, 53, 69, 0.08);
    border: 1px solid rgba(220, 53, 69, 0.25);
    color: #a52834;
}

.cli-emp__alert--ok {
    background: rgba(45, 160, 168, 0.1);
    border: 1px solid rgba(45, 160, 168, 0.35);
    color: #1a6b72;
}

.cli-emp__alert--cert {
    margin-bottom: 1rem;
    align-items: center;
}

.cli-emp__alert-dismiss {
    margin-left: auto;
    border: none;
    background: transparent;
    color: inherit;
    opacity: 0.7;
    padding: 0.15rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cli-emp__alert-dismiss:hover {
    opacity: 1;
    background: rgba(45, 160, 168, 0.12);
}

.cli-emp__result-top-end,
.cli-emp__card-top-end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.cli-emp__cert-btn {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(92, 107, 192, 0.12), rgba(45, 160, 168, 0.12));
    color: var(--cli-accent);
    box-shadow: 0 4px 12px rgba(92, 107, 192, 0.12);
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease,
        background 0.15s ease;
}

.cli-emp__cert-btn :deep(svg) {
    width: 20px;
    height: 20px;
}

.cli-emp__cert-btn:hover {
    transform: translateY(-1px);
    background: linear-gradient(135deg, rgba(92, 107, 192, 0.18), rgba(45, 160, 168, 0.18));
    box-shadow: 0 6px 16px rgba(92, 107, 192, 0.18);
}

.cli-emp__btn--cert {
    background: linear-gradient(135deg, #eef1ff 0%, #e8f7f8 100%) !important;
    border: 1px solid rgba(92, 107, 192, 0.28) !important;
    color: var(--cli-accent) !important;
    box-shadow: 0 4px 14px rgba(92, 107, 192, 0.1);
}

.cli-emp__btn--cert:hover {
    filter: brightness(0.98);
    box-shadow: 0 6px 18px rgba(92, 107, 192, 0.14);
}

.cli-emp__cert-hint {
    margin: 0.55rem 0 0;
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--cli-muted);
    max-width: 52ch;
}

.cli-emp__cert-status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.65rem;
    padding: 0.45rem 0.75rem;
    border-radius: 999px;
    background: rgba(45, 160, 168, 0.12);
    border: 1px solid rgba(45, 160, 168, 0.28);
    color: #1a6b72;
    font-size: 0.78rem;
    font-weight: 700;
}

.cli-emp__cert-status :deep(svg) {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
}

.cli-emp__result {
    border-radius: 18px;
    margin-bottom: 1.25rem;
    overflow: hidden;
}

.cli-emp__result--local {
    background: linear-gradient(135deg, #fff 0%, #f0fafb 100%);
    border: 1px solid rgba(45, 160, 168, 0.2) !important;
}

.cli-emp__result--receita {
    background: linear-gradient(135deg, #fff 0%, #f8f6ff 100%);
    border: 1px solid rgba(92, 107, 192, 0.2) !important;
}

.cli-emp__result-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.cli-emp__result-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.cli-emp__result-badge :deep(svg) {
    width: 16px;
    height: 16px;
}

.cli-emp__result-badge--local {
    background: rgba(45, 160, 168, 0.12);
    color: #1a6b72;
}

.cli-emp__result-badge--receita {
    background: rgba(92, 107, 192, 0.12);
    color: #4054b8;
}

.cli-emp__result-name {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--cli-ink);
    line-height: 1.25;
}

.cli-emp__result-alias {
    margin: 0.25rem 0 0;
    font-size: 0.95rem;
    color: var(--cli-muted);
}

.cli-emp__result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem 1.5rem;
    margin: 1.25rem 0 0;
}

.cli-emp__result-grid dt {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cli-muted);
    margin-bottom: 0.2rem;
}

.cli-emp__result-grid dd {
    margin: 0;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--cli-ink);
}

.cli-emp__justificativa {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding: 1rem 1.1rem;
    border-radius: 14px;
    background: rgba(220, 53, 69, 0.06);
    border: 1px solid rgba(220, 53, 69, 0.2);
    color: #7a2830;
}

.cli-emp__justificativa--compact {
    margin-top: 0.85rem;
    padding: 0.85rem;
}

.cli-emp__justificativa :deep(svg) {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.cli-emp__justificativa strong {
    display: block;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
}

.cli-emp__justificativa p {
    margin: 0;
    font-size: 0.88rem;
    line-height: 1.5;
}

.cli-emp__aviso-receita {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding: 1rem 1.1rem;
    border-radius: 14px;
    background: rgba(92, 107, 192, 0.08);
    border: 1px solid rgba(92, 107, 192, 0.22);
    color: #3d4d7a;
}

.cli-emp__aviso-receita :deep(svg) {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
}

.cli-emp__aviso-receita strong {
    display: block;
    font-size: 0.88rem;
    margin-bottom: 0.3rem;
}

.cli-emp__aviso-receita p {
    margin: 0;
    font-size: 0.86rem;
    line-height: 1.55;
}

.cli-emp__result-actions {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.65rem;
}

.cli-emp__hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--cli-muted);
    line-height: 1.45;
}

.cli-emp__hint--ok {
    color: #1a6b72;
    font-weight: 600;
}

.cli-emp__lista {
    margin-top: 0.5rem;
}

.cli-emp__lista-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0 0.15rem;
}

.cli-emp__lista-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--cli-ink);
}

.cli-emp__panel {
    border-radius: 18px;
    background: #fff;
    border: 1px solid rgba(20, 30, 40, 0.08);
    padding: 1.5rem;
}

.cli-emp__err-inner {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.cli-emp__err-ic {
    width: 28px;
    height: 28px;
    color: #dc3545;
    flex-shrink: 0;
}

.cli-emp__err-inner h3 {
    margin: 0 0 0.35rem;
    font-size: 1rem;
    font-weight: 800;
    color: var(--cli-ink);
}

.cli-emp__err-inner p {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: var(--cli-muted);
}

.cli-emp__skeleton-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cli-emp__skeleton {
    border-radius: 16px;
}

.cli-emp__sk-line {
    height: 14px;
    border-radius: 8px;
    background: linear-gradient(
        90deg,
        rgba(92, 107, 192, 0.08) 0%,
        rgba(92, 107, 192, 0.15) 50%,
        rgba(92, 107, 192, 0.08) 100%
    );
    background-size: 200% 100%;
    animation: cli-emp-shimmer 1.2s ease-in-out infinite;
    margin-bottom: 0.65rem;
}

.cli-emp__sk-line--short {
    width: 40%;
}

.cli-emp__sk-line--med {
    width: 70%;
}

@keyframes cli-emp-shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

.cli-emp__empty {
    border-radius: 18px;
}

.cli-emp__empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cli-bg-soft);
    color: var(--cli-accent);
}

.cli-emp__empty-icon :deep(svg) {
    width: 32px;
    height: 32px;
}

.cli-emp__empty h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--cli-ink);
}

.cli-emp__empty p {
    margin: 0 auto;
    max-width: 42ch;
    font-size: 0.9rem;
    color: var(--cli-muted);
    line-height: 1.5;
}

.cli-emp__cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cli-emp__card {
    border-radius: 16px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cli-emp__card:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 28px rgba(20, 30, 40, 0.08) !important;
}

.cli-emp__card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.cli-emp__card-name {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--cli-ink);
}

.cli-emp__card-alias {
    margin: 0.2rem 0 0;
    font-size: 0.85rem;
    color: var(--cli-muted);
}

.cli-emp__card-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
}

.cli-emp__card-meta dt {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cli-muted);
}

.cli-emp__card-meta dd {
    margin: 0.15rem 0 0;
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--cli-ink);
}

.cli-emp__card-actions {
    margin-top: 0.85rem;
    padding-top: 0.85rem;
    border-top: 1px dashed rgba(92, 107, 192, 0.2);
}

.cli-emp__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.25rem;
    padding: 0.75rem;
}

.cli-emp__page-btn {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(92, 107, 192, 0.3);
    background: #fff;
    color: var(--cli-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;
}

.cli-emp__page-btn:hover:not(:disabled) {
    background: var(--cli-bg-soft);
}

.cli-emp__page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.cli-emp__page-btn :deep(svg) {
    width: 22px;
    height: 22px;
}

.cli-emp__page-info {
    font-size: 0.88rem;
    color: var(--cli-muted);
}

.cli-emp__page-info strong {
    color: var(--cli-ink);
}

@media (max-width: 575.98px) {
    .cli-emp__meta {
        grid-template-columns: 1fr;
    }

    .cli-emp__search-form {
        flex-direction: column;
    }

    .cli-emp__search-actions {
        width: 100%;
    }

    .cli-emp__search-actions .cli-emp__btn {
        flex: 1;
        justify-content: center;
    }
}
</style>
