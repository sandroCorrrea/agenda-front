<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { RiArrowLeftSLine, RiArrowRightSLine, RiFolderZipLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import CaspEmentarioResultado from "@/presentation/components/Casp/CaspEmentarioResultado.vue";
import CaspRelatorioResultado from "@/presentation/components/Casp/CaspRelatorioResultado.vue";
import { useReceitaOrcamentaria } from "@/presentation/composables/Casp/useReceitaOrcamentaria";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { useSicomContas } from "@/presentation/composables/Sicom/useSicomContas";
import { useSicomRelatorio } from "@/presentation/composables/Sicom/useSicomRelatorio";
import { useSicomValidacao } from "@/presentation/composables/Sicom/useSicomValidacao";
import {
    formatarTamanhoArquivo,
    mensagemListaVazia,
    rotuloApelido
} from "@/shared/utils/receitaOrcamentaria";
import { formatarBytes } from "@/shared/utils/sicomLabels";
import {
    TAMANHO_PAGINA_ERROS,
    agruparErros,
    celulaSicom,
    filtrarErros,
    ordenarErros,
    podeSeguirValidacao,
    textoIntervalo,
    textoLinhas,
    textoLinhasArquivo,
    textoQuantidade
} from "@/shared/utils/sicomValidacao";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir } = usePermissaoMenu("admin.casp_remessa");
const { podeVisualizar: podeVerReceitas } = usePermissaoMenu("admin.casp_receita_orcamentaria");
const { validando, resultado, falhaTecnica, campos, validar, limpar: limparValidacao } = useSicomValidacao();
const {
    consultando,
    resultado: contas,
    falhaTecnica: falhaEmentario,
    campo: campoEmentario,
    consultarEnviada,
    limpar: limparEmentario
} = useSicomContas();
const {
    gerando,
    resultado: relatorio,
    falhaTecnica: falhaRelatorio,
    campo: campoRelatorio,
    gerar,
    limpar: limparRelatorio
} = useSicomRelatorio();
const {
    arquivos: receitas,
    carregando: carregandoReceitas,
    erro: erroReceitas,
    q: buscaReceita,
    buscaAtiva,
    total: totalReceitas,
    porPagina,
    carregar: carregarReceitas
} = useReceitaOrcamentaria();

const manual = ref<File | null>(null);
const remessa = ref<File | null>(null);
const passo = ref<1 | 2 | 3>(1);
const receitaId = ref<number | "">("");
let buscaReceitasAgendada = 0;
porPagina.value = 100;
const busca = ref("");
const arquivoFiltro = ref<string | null>(null);
const agrupar = ref(false);
const pagina = ref(1);

const errosOrdenados = computed(() => {
    const atual = resultado.value;
    if (!atual || atual.status !== "invalido") return [];
    return ordenarErros(
        atual.erros,
        atual.resultados.map((item) => item.arquivo)
    );
});
const errosFiltrados = computed(() => filtrarErros(errosOrdenados.value, busca.value, arquivoFiltro.value));
const grupos = computed(() => agruparErros(errosFiltrados.value));
const totalVisao = computed(() => (agrupar.value ? grupos.value.length : errosFiltrados.value.length));
const totalPaginas = computed(() => (totalVisao.value === 0 ? 1 : Math.ceil(totalVisao.value / TAMANHO_PAGINA_ERROS)));
const paginaAtual = computed(() => Math.min(pagina.value, totalPaginas.value));
const inicio = computed(() => (paginaAtual.value - 1) * TAMANHO_PAGINA_ERROS);
const errosPagina = computed(() => errosFiltrados.value.slice(inicio.value, inicio.value + TAMANHO_PAGINA_ERROS));
const gruposPagina = computed(() => grupos.value.slice(inicio.value, inicio.value + TAMANHO_PAGINA_ERROS));
const intervalo = computed(() => textoIntervalo(paginaAtual.value, totalVisao.value));
const podeSeguir = computed(() => podeSeguirValidacao(resultado.value));
const subtituloPasso = computed(() => {
    if (passo.value === 3) return "Gere o relatório da receita, da despesa e das fontes com o mesmo ementário.";
    if (passo.value === 2) return "Escolha a receita orçamentária já enviada para cruzar com a remessa.";
    return "Envie o manual em PDF e a remessa em ZIP. A tela mostra o resultado devolvido pelo serviço.";
});
const ocupado = computed(() => consultando.value || gerando.value || validando.value);

const resumoValido = computed(() => {
    const atual = resultado.value;
    if (!atual || atual.status !== "valido") return "";
    const partes = [atual.manual?.versao, atual.manual?.arquivo, atual.remessa?.arquivo].filter(
        (item): item is string => Boolean(item)
    );
    partes.push(
        `${textoQuantidade(atual.resultados.length, "arquivo", "arquivos")}, ${textoQuantidade(atual.totalErros ?? 0, "erro", "erros")}`
    );
    return partes.join(" · ");
});

const contexto = computed(() => {
    const atual = resultado.value;
    if (!atual || atual.status !== "invalido") return "";
    return [atual.manual?.versao, atual.manual?.arquivo, atual.remessa?.arquivo]
        .filter((item): item is string => Boolean(item))
        .join(" · ");
});

const receitaEscolhida = computed(() => receitas.value.find((item) => item.id === Number(receitaId.value)) ?? null);
const listaReceitasVazia = computed(() => !carregandoReceitas.value && receitas.value.length === 0 && !erroReceitas.value);

watch([busca, arquivoFiltro, agrupar], () => {
    pagina.value = 1;
});

watch(podeSeguir, (pode) => {
    if (!pode) passo.value = 1;
});

onBeforeUnmount(() => window.clearTimeout(buscaReceitasAgendada));

function aoEscolherManual(evento: Event) {
    manual.value = (evento.target as HTMLInputElement).files?.[0] ?? null;
    reiniciarDepoisDaValidacao();
}

function aoEscolherRemessa(evento: Event) {
    remessa.value = (evento.target as HTMLInputElement).files?.[0] ?? null;
    reiniciarDepoisDaValidacao();
}

function reiniciarDepoisDaValidacao() {
    passo.value = 1;
    receitaId.value = "";
    limparValidacao();
    limparEmentario();
    limparRelatorio();
}

async function submeter() {
    if (!manual.value || !remessa.value || validando.value) return;
    busca.value = "";
    arquivoFiltro.value = null;
    pagina.value = 1;
    passo.value = 1;
    receitaId.value = "";
    limparEmentario();
    limparRelatorio();
    await validar(manual.value, remessa.value);
}

function abrirEmentario() {
    if (!podeSeguir.value || ocupado.value || !remessa.value) return;
    passo.value = 2;
    if (podeVerReceitas.value) void carregarReceitas(1);
}

function abrirRelatorio() {
    if (!podeSeguir.value || ocupado.value || !remessa.value) return;
    passo.value = 3;
    if (podeVerReceitas.value) void carregarReceitas(1);
}

function agendarBuscaReceitas() {
    window.clearTimeout(buscaReceitasAgendada);
    buscaReceitasAgendada = window.setTimeout(() => {
        void carregarReceitas(1);
    }, 400);
}

function aoEscolherReceita() {
    limparEmentario();
    limparRelatorio();
}

async function consultarEmentario() {
    if (!remessa.value || !receitaEscolhida.value || consultando.value) return;
    await consultarEnviada(remessa.value, receitaEscolhida.value);
}

async function gerarRelatorio() {
    if (!podeSeguir.value || !remessa.value || !receitaEscolhida.value || gerando.value) return;
    await gerar(remessa.value, receitaEscolhida.value);
}

function alternarArquivo(arquivo: string | null) {
    arquivoFiltro.value = arquivoFiltro.value === arquivo ? null : arquivo;
}

function irPagina(proxima: number) {
    pagina.value = Math.min(Math.max(1, proxima), totalPaginas.value);
}
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="CASP"
                :subtitle="subtituloPasso"
            >
                <template #icon><RiFolderZipLine /></template>
                <template #actions>
                    <RouterLink class="btn pol-btn" :to="{ name: 'AdministradorCaspHistorico' }">Histórico</RouterLink>
                </template>
            </AdminPageHero>

            <nav class="pol-steps" aria-label="Passos da remessa">
                <button type="button" :class="{ 'is-on': passo === 1, 'is-done': passo > 1 }" :disabled="ocupado" @click="passo = 1">
                    <span>1</span>
                    Validar remessa
                </button>
                <button
                    type="button"
                    :class="{ 'is-on': passo === 2, 'is-done': passo > 2 }"
                    :disabled="!podeSeguir || ocupado"
                    @click="abrirEmentario"
                >
                    <span>2</span>
                    Ementário
                </button>
                <button type="button" :class="{ 'is-on': passo === 3 }" :disabled="!podeSeguir || ocupado" @click="abrirRelatorio">
                    <span>3</span>
                    Relatório
                </button>
            </nav>

            <template v-if="passo === 1">
            <form v-if="podeInserir" class="card border-0 shadow-sm pol-panel mb-4" @submit.prevent="submeter">
                <div class="card-body">
                    <h2 class="h5 mb-3">Validar remessa</h2>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label" for="sicom-validacao-manual">Manual em PDF</label>
                            <input
                                id="sicom-validacao-manual"
                                class="form-control"
                                type="file"
                                accept=".pdf,application/pdf"
                                :disabled="validando"
                                @change="aoEscolherManual"
                            />
                            <p v-if="manual" class="form-text mb-0">{{ manual.name }} · {{ formatarBytes(manual.size) }}</p>
                            <p v-if="campos.manual" class="text-danger small mb-0">{{ campos.manual }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label" for="sicom-validacao-remessa">Remessa em ZIP</label>
                            <input
                                id="sicom-validacao-remessa"
                                class="form-control"
                                type="file"
                                accept=".zip,application/zip"
                                :disabled="validando"
                                @change="aoEscolherRemessa"
                            />
                            <p v-if="remessa" class="form-text mb-0">{{ remessa.name }} · {{ formatarBytes(remessa.size) }}</p>
                            <p v-if="campos.remessa" class="text-danger small mb-0">{{ campos.remessa }}</p>
                        </div>
                    </div>
                    <button class="btn pol-btn mt-3" type="submit" :disabled="!manual || !remessa || validando">
                        {{ validando ? "Validando…" : "Validar remessa" }}
                    </button>
                    <p v-if="validando" class="form-text mb-0 mt-2">Consultando o validador de leiaute</p>
                </div>
            </form>

            <div v-if="falhaTecnica" class="pol-alert pol-alert--erro mb-3">{{ falhaTecnica }}</div>

            <section v-if="resultado?.status === 'valido'" class="mb-4">
                <div class="pol-alert pol-alert--ok mb-2">{{ resultado.mensagem }}</div>
                <p v-if="resumoValido" class="text-muted small mb-3">{{ resumoValido }}</p>

                <ul v-if="resultado.resultados.length" class="validacao-lista mb-3">
                    <li v-for="(item, indice) in resultado.resultados" :key="`${item.arquivo}-${indice}`">
                        <span class="validacao-lista__nome">{{ celulaSicom(item.arquivo) }}</span>
                        <span class="text-muted">{{ celulaSicom(item.leiaute) }} · {{ textoLinhasArquivo(item.linhas) }}</span>
                        <span class="pol-badge pol-badge--on">Válido</span>
                    </li>
                </ul>

                <div v-if="resultado.avisos.length" class="pol-alert pol-alert--aviso mb-3">
                    <p v-for="(aviso, indice) in resultado.avisos" :key="indice" class="mb-1 validacao-quebra">
                        <template v-if="aviso.arquivo">{{ aviso.arquivo }} · </template>{{ aviso.mensagem }}
                    </p>
                </div>

                <div v-if="resultado.manual?.avisos.length" class="pol-alert pol-alert--aviso">
                    <p class="fw-bold mb-1">Leitura do PDF</p>
                    <p v-for="(nota, indice) in resultado.manual.avisos" :key="indice" class="mb-1 validacao-quebra">{{ nota }}</p>
                </div>
            </section>

            <section v-else-if="resultado?.status === 'erro'" class="mb-4">
                <div class="pol-alert pol-alert--erro">
                    <p class="mb-0 validacao-quebra">{{ resultado.mensagem }}</p>
                    <p v-for="(detalhe, indice) in resultado.detalhes" :key="indice" class="mb-0 mt-1">{{ detalhe }}</p>
                </div>
            </section>

            <section v-else-if="resultado?.status === 'invalido'" class="mb-4">
                <div class="pol-alert pol-alert--erro mb-3">
                    <p class="mb-1 validacao-quebra">{{ resultado.mensagem }}</p>
                    <p class="mb-0">{{ textoQuantidade(resultado.totalErros, "erro", "erros") }}, {{ textoQuantidade(resultado.totalAvisos, "aviso", "avisos") }}</p>
                </div>
                <p v-if="contexto" class="text-muted small mb-3">{{ contexto }}</p>

                <div v-if="resultado.resultados.length" class="validacao-arquivos mb-4">
                    <button
                        v-for="(item, indice) in resultado.resultados"
                        :key="`${item.arquivo}-${indice}`"
                        type="button"
                        class="validacao-arquivo"
                        :class="{
                            'validacao-arquivo--ok': item.totalErros === 0,
                            'validacao-arquivo--erro': item.totalErros !== 0,
                            'is-on': arquivoFiltro === item.arquivo
                        }"
                        @click="alternarArquivo(item.arquivo)"
                    >
                        <span class="validacao-arquivo__titulo">
                            {{ celulaSicom(item.arquivo) }}
                            <span>{{ celulaSicom(item.leiaute) }}</span>
                        </span>
                        <span class="validacao-arquivo__linhas">{{ textoLinhasArquivo(item.linhas) }}</span>
                        <span v-if="item.totalErros === 0" class="pol-badge pol-badge--on">Válido</span>
                        <span v-else class="pol-badge pol-badge--stop">{{ textoQuantidade(item.totalErros, "erro", "erros") }}</span>
                    </button>
                </div>

                <div v-if="resultado.avisos.length" class="pol-alert pol-alert--aviso mb-3">
                    <p v-for="(aviso, indice) in resultado.avisos" :key="indice" class="mb-1 validacao-quebra">
                        <template v-if="aviso.arquivo">{{ aviso.arquivo }} · </template>{{ aviso.mensagem }}
                    </p>
                </div>

                <div class="card border-0 shadow-sm pol-panel">
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
                            <p class="mb-0 fw-semibold">{{ intervalo }}</p>
                            <label class="d-flex align-items-center gap-2 mb-0 small">
                                <input v-model="agrupar" type="checkbox" />
                                Agrupar erros iguais
                            </label>
                        </div>
                        <div class="pol-search mb-3">
                            <RiSearchLine />
                            <input
                                v-model="busca"
                                class="form-control"
                                type="search"
                                placeholder="Buscar por arquivo, campo, valor ou erro"
                            />
                        </div>

                        <div class="table-responsive">
                            <table v-if="agrupar" class="table pol-table validacao-tabela mb-0">
                                <thead>
                                    <tr>
                                        <th>Arquivo</th>
                                        <th>Quantidade</th>
                                        <th>Linhas</th>
                                        <th>Erro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(grupo, indice) in gruposPagina" :key="`${grupo.arquivo}-${indice}`">
                                        <td>{{ celulaSicom(grupo.arquivo) }}</td>
                                        <td>{{ grupo.quantidade }}</td>
                                        <td class="validacao-quebra">{{ textoLinhas(grupo.linhas) }}</td>
                                        <td class="validacao-quebra">{{ celulaSicom(grupo.mensagem) }}</td>
                                    </tr>
                                    <tr v-if="gruposPagina.length === 0">
                                        <td colspan="4" class="text-muted">Nenhum erro nesta visão.</td>
                                    </tr>
                                </tbody>
                            </table>
                            <table v-else class="table pol-table validacao-tabela mb-0">
                                <thead>
                                    <tr>
                                        <th>Linha</th>
                                        <th>Campo</th>
                                        <th>Valor encontrado</th>
                                        <th>Erro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(erro, indice) in errosPagina" :key="indice">
                                        <td>{{ celulaSicom(erro.linha) }}</td>
                                        <td>{{ celulaSicom(erro.campo) }}</td>
                                        <td class="validacao-quebra">{{ celulaSicom(erro.valor) }}</td>
                                        <td class="validacao-quebra">
                                            {{ celulaSicom(erro.mensagem) }}
                                            <span v-if="erro.coluna != null" class="validacao-coluna">coluna {{ erro.coluna }}</span>
                                        </td>
                                    </tr>
                                    <tr v-if="errosPagina.length === 0">
                                        <td colspan="4" class="text-muted">Nenhum erro nesta visão.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-if="totalVisao > TAMANHO_PAGINA_ERROS" class="pol-pag mt-3">
                            <span class="text-muted small">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
                            <button type="button" :disabled="paginaAtual <= 1" aria-label="Página anterior" @click="irPagina(paginaAtual - 1)">
                                <RiArrowLeftSLine />
                            </button>
                            <button
                                type="button"
                                :disabled="paginaAtual >= totalPaginas"
                                aria-label="Próxima página"
                                @click="irPagina(paginaAtual + 1)"
                            >
                                <RiArrowRightSLine />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <button
                v-if="resultado"
                class="btn pol-btn"
                type="button"
                :disabled="!podeSeguir || ocupado"
                @click="abrirEmentario"
            >
                Seguir
            </button>
            </template>

            <template v-else-if="passo === 2">
            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <h2 class="h5 mb-3">Ementário</h2>
                    <p v-if="remessa" class="text-muted mb-3">Remessa: {{ remessa.name }}</p>
                    <label class="form-label" for="sicom-busca-ementario">Buscar receita orçamentária</label>
                    <div class="pol-search mb-3">
                        <RiSearchLine />
                        <input
                            id="sicom-busca-ementario"
                            v-model="buscaReceita"
                            type="search"
                            maxlength="160"
                            placeholder="Apelido ou nome do arquivo"
                            :disabled="carregandoReceitas || consultando || !podeVerReceitas"
                            @input="agendarBuscaReceitas"
                        />
                    </div>
                    <label class="form-label" for="sicom-ementario">Ementário</label>
                    <p v-if="carregandoReceitas" class="text-muted small">Carregando receitas orçamentárias…</p>
                    <select
                        id="sicom-ementario"
                        v-model="receitaId"
                        class="form-select"
                        :disabled="carregandoReceitas || consultando || !podeVerReceitas"
                        @change="aoEscolherReceita"
                    >
                        <option value="">Selecione a receita orçamentária</option>
                        <option v-for="item in receitas" :key="item.id" :value="item.id">
                            {{ rotuloApelido(item.apelido) }} · {{ item.nomeOriginal }}
                        </option>
                    </select>
                    <p v-if="receitaEscolhida" class="form-text mb-0">
                        {{ rotuloApelido(receitaEscolhida.apelido) }} · {{ receitaEscolhida.nomeOriginal }} ·
                        {{ formatarTamanhoArquivo(receitaEscolhida.tamanhoBytes) }}
                    </p>
                    <p v-if="!podeVerReceitas" class="text-danger small mb-0">Você não tem permissão para realizar esta ação.</p>
                    <p v-else-if="erroReceitas" class="text-danger small mb-0">{{ erroReceitas }}</p>
                    <p v-else-if="listaReceitasVazia" class="text-muted small mb-0">{{ mensagemListaVazia(buscaAtiva) }}</p>
                    <p v-if="podeVerReceitas && listaReceitasVazia && !buscaAtiva" class="small mb-0">
                        <RouterLink :to="{ name: 'AdministradorCaspReceitaOrcamentaria' }">Enviar uma receita orçamentária</RouterLink>
                    </p>
                    <p v-else-if="totalReceitas > receitas.length" class="form-text mb-0">
                        Mostrando {{ receitas.length }} de {{ totalReceitas }}. Refine a busca para achar outro arquivo.
                    </p>
                    <p v-if="campoEmentario" class="text-danger small mb-0">{{ campoEmentario }}</p>
                    <button class="btn pol-btn mt-3" type="button" :disabled="consultando || !receitaEscolhida" @click="consultarEmentario">
                        {{ consultando ? "Consultando ementário…" : "Seguir" }}
                    </button>
                    <p v-if="consultando" class="form-text mb-0 mt-2">A leitura do ementário pode levar alguns segundos.</p>
                </div>
            </section>

            <div v-if="falhaEmentario" class="pol-alert pol-alert--erro mt-3">{{ falhaEmentario }}</div>
            <div v-else-if="contas?.status === 'erro'" class="pol-alert pol-alert--erro mt-3">
                <p class="mb-0 validacao-quebra">{{ contas.mensagem }}</p>
                <p v-for="(detalhe, indice) in contas.detalhes" :key="indice" class="mb-0 mt-1">{{ detalhe }}</p>
            </div>
            <CaspEmentarioResultado v-else-if="contas?.status === 'vinculado'" :resposta="contas" />
            <button class="btn pol-btn mt-3" type="button" :disabled="!podeSeguir || ocupado" @click="abrirRelatorio">
                Relatório
            </button>
            </template>

            <template v-else>
            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <h2 class="h5 mb-3">Relatório</h2>
                    <p v-if="remessa" class="text-muted mb-3">Remessa: {{ remessa.name }}</p>
                    <p v-if="!receitaEscolhida" class="mb-3">O relatório usa o mesmo ementário da etapa anterior.</p>
                    <label class="form-label" for="sicom-busca-relatorio">Buscar receita orçamentária</label>
                    <div class="pol-search mb-3">
                        <RiSearchLine />
                        <input
                            id="sicom-busca-relatorio"
                            v-model="buscaReceita"
                            type="search"
                            maxlength="160"
                            placeholder="Apelido ou nome do arquivo"
                            :disabled="carregandoReceitas || gerando || !podeVerReceitas"
                            @input="agendarBuscaReceitas"
                        />
                    </div>
                    <label class="form-label" for="sicom-relatorio-ementario">Ementário</label>
                    <p v-if="carregandoReceitas" class="text-muted small">Carregando receitas orçamentárias…</p>
                    <select
                        id="sicom-relatorio-ementario"
                        v-model="receitaId"
                        class="form-select"
                        :disabled="carregandoReceitas || gerando || !podeVerReceitas"
                        @change="aoEscolherReceita"
                    >
                        <option value="">Selecione a receita orçamentária</option>
                        <option v-for="item in receitas" :key="item.id" :value="item.id">
                            {{ rotuloApelido(item.apelido) }} · {{ item.nomeOriginal }}
                        </option>
                    </select>
                    <p v-if="receitaEscolhida" class="form-text mb-0">
                        {{ rotuloApelido(receitaEscolhida.apelido) }} · {{ receitaEscolhida.nomeOriginal }} ·
                        {{ formatarTamanhoArquivo(receitaEscolhida.tamanhoBytes) }}
                    </p>
                    <p v-if="!podeVerReceitas" class="text-danger small mb-0">Você não tem permissão para realizar esta ação.</p>
                    <p v-else-if="erroReceitas" class="text-danger small mb-0">{{ erroReceitas }}</p>
                    <p v-else-if="listaReceitasVazia" class="text-muted small mb-0">{{ mensagemListaVazia(buscaAtiva) }}</p>
                    <p v-if="campoRelatorio" class="text-danger small mb-0">{{ campoRelatorio }}</p>
                    <button class="btn pol-btn mt-3" type="button" :disabled="!podeSeguir || gerando || !receitaEscolhida" @click="gerarRelatorio">
                        {{ gerando ? "Gerando relatório…" : "Gerar relatório" }}
                    </button>
                    <p v-if="gerando" class="form-text mb-0 mt-2">A leitura do XLSX pode levar alguns segundos.</p>
                </div>
            </section>

            <div v-if="falhaRelatorio" class="pol-alert pol-alert--erro mt-3">{{ falhaRelatorio }}</div>
            <div v-else-if="relatorio?.status === 'erro'" class="pol-alert pol-alert--erro mt-3">
                <p class="mb-0 validacao-quebra">{{ relatorio.mensagem }}</p>
                <p v-for="(detalhe, indice) in relatorio.detalhes" :key="indice" class="mb-0 mt-1">{{ detalhe }}</p>
            </div>
            <CaspRelatorioResultado v-else-if="relatorio?.status === 'gerado'" :resposta="relatorio" />
            </template>
        </div>
    </article>
</template>

<style scoped>
.validacao-lista {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    margin: 0;
    padding: 0;
}

.validacao-lista li,
.validacao-arquivo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.55rem 0.85rem;
}

.validacao-lista li {
    background: #fff;
    border: 1px solid rgba(45, 160, 168, 0.35);
    border-radius: 14px;
    padding: 0.75rem 0.95rem;
}

.validacao-lista__nome,
.validacao-arquivo__titulo {
    font-weight: 700;
    color: #1a2d4e;
}

.validacao-arquivos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
}

.validacao-arquivo {
    text-align: left;
    flex-direction: column;
    align-items: flex-start;
    border-radius: 16px;
    border: 1px solid rgba(22, 37, 78, 0.08);
    background: #fff;
    padding: 0.9rem 1rem;
}

.validacao-arquivo--ok {
    border-color: #b7e3c7;
}

.validacao-arquivo--erro {
    border-color: #f1b4b4;
}

.validacao-arquivo.is-on {
    outline: 2px solid #5c6bc0;
}

.validacao-arquivo__titulo span,
.validacao-arquivo__linhas {
    font-weight: 500;
    color: #5d6e8f;
    font-size: 0.86rem;
}

.validacao-tabela td {
    vertical-align: top;
}

.validacao-quebra {
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: pre-wrap;
}

.validacao-coluna {
    display: block;
    margin-top: 0.2rem;
    color: #5d6e8f;
    font-size: 0.78rem;
}
</style>
