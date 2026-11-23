<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RiArrowLeftSLine, RiArrowRightSLine, RiFilePdf2Line, RiInformationLine, RiSearchLine } from "@remixicon/vue";
import type { SicomRelatorioResposta, SicomRelatorioSituacao } from "@/domain/sicom/relatorio";
import { textoIntervalo, textoQuantidade } from "@/shared/utils/sicomValidacao";
import {
    TAMANHO_PAGINA_RELATORIO,
    classeSituacao,
    classificacaoDespesa,
    complementoFonte,
    contextoRelatorio,
    fatiaPagina,
    filtrarDeducoes,
    filtrarDespesas,
    filtrarFontes,
    filtrarReceitas,
    formatarReais,
    formatarReaisAbsoluto,
    larguraBarra,
    maiorValor,
    rotuloDeducao,
    subtituloReceita,
    textoPreenchido,
    tituloFonte,
    tituloNatureza,
    tituloRelatorio,
    tituloReparticao,
    tomRelatorio
} from "@/shared/utils/sicomRelatorio";
import { exportarRelatorioPdf } from "@/shared/utils/sicomRelatorioPdf";
import logoUrl from "@/presentation/assets/img/logo.jpeg";

const props = defineProps<{
    resposta: SicomRelatorioResposta;
}>();

const busca = ref("");
const aba = ref<"receitas" | "despesas" | "deducoes">("receitas");
const paginaFontes = ref(1);
const paginaReceitas = ref(1);
const paginaDespesas = ref(1);
const paginaDeducoes = ref(1);
const fonteAberta = ref<number | null>(null);
const exportando = ref(false);
const erroPdf = ref<string | null>(null);

const resumo = computed(() => props.resposta.resumo);
const tom = computed(() => tomRelatorio(resumo.value));
const titulo = computed(() => tituloRelatorio(props.resposta.exercicio));
const contexto = computed(() => contextoRelatorio(props.resposta));
const fontes = computed(() => filtrarFontes(props.resposta.cruzamento, busca.value));
const receitas = computed(() => filtrarReceitas(props.resposta.receitas, busca.value));
const despesas = computed(() => filtrarDespesas(props.resposta.despesas, busca.value));
const deducoes = computed(() => filtrarDeducoes(props.resposta.deducoes, busca.value));
const fontesPagina = computed(() => fatiaPagina(fontes.value, paginaFontes.value));
const receitasPagina = computed(() => fatiaPagina(receitas.value, paginaReceitas.value));
const despesasPagina = computed(() => fatiaPagina(despesas.value, paginaDespesas.value));
const deducoesPagina = computed(() => fatiaPagina(deducoes.value, paginaDeducoes.value));
const maiorFuncao = computed(() => maiorValor(props.resposta.porFuncao));
const maiorUnidade = computed(() => maiorValor(props.resposta.porUnidade));
const maiorPrograma = computed(() => maiorValor(props.resposta.porPrograma));

watch(busca, () => {
    paginaFontes.value = 1;
    paginaReceitas.value = 1;
    paginaDespesas.value = 1;
    paginaDeducoes.value = 1;
    fonteAberta.value = null;
});

watch(
    () => props.resposta,
    () => {
        busca.value = "";
        aba.value = "receitas";
        fonteAberta.value = null;
    }
);

function indiceFonte(indiceNaPagina: number): number {
    const total = fontes.value.length === 0 ? 1 : Math.ceil(fontes.value.length / TAMANHO_PAGINA_RELATORIO);
    const atual = Math.min(paginaFontes.value, total);
    return (atual - 1) * TAMANHO_PAGINA_RELATORIO + indiceNaPagina;
}

function alternarFonte(indiceNaPagina: number) {
    const indice = indiceFonte(indiceNaPagina);
    fonteAberta.value = fonteAberta.value === indice ? null : indice;
}

function classeValor(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "relatorio-valor--deficit";
    if (situacao === "superavit") return "relatorio-valor--superavit";
    if (situacao === "equilibrado") return "relatorio-valor--equilibrado";
    return "";
}

function vazioFontes(): string {
    return busca.value.trim() ? "Nenhum item encontrado para esta busca." : "Não há fontes para cruzar.";
}

function vazioTabela(): string {
    return busca.value.trim() ? "Nenhum item encontrado para esta busca." : "—";
}

async function exportar() {
    if (exportando.value) return;
    exportando.value = true;
    erroPdf.value = null;
    try {
        const imagem = await fetch(logoUrl);
        const logo = new Uint8Array(await imagem.arrayBuffer());
        await exportarRelatorioPdf(props.resposta, logo);
    } catch {
        erroPdf.value = "Não foi possível exportar o PDF.";
    } finally {
        exportando.value = false;
    }
}
</script>

<template>
    <section class="mt-4">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <h2 class="h5 mb-0">{{ titulo }}</h2>
            <button class="btn pol-btn relatorio-pdf" type="button" :disabled="exportando" @click="exportar">
                <RiFilePdf2Line />
                {{ exportando ? "Exportando…" : "Exportar PDF" }}
            </button>
        </div>
        <p v-if="erroPdf" class="text-danger small">{{ erroPdf }}</p>
        <div
            class="pol-alert mb-2 validacao-quebra"
            :class="{
                'pol-alert--ok': tom === 'ok',
                'pol-alert--aviso': tom === 'aviso',
                'pol-alert--erro': tom === 'erro',
                'relatorio-faixa--superavit': tom === 'superavit'
            }"
        >
            {{ resposta.mensagem }}
        </div>
        <div v-if="resposta.avisos.length" class="pol-alert pol-alert--aviso mb-3">
            <p v-for="(aviso, indice) in resposta.avisos" :key="indice" class="mb-0 relatorio-aviso">
                <RiInformationLine />
                <span>{{ aviso }}</span>
            </p>
        </div>
        <p v-if="contexto" class="text-muted small mb-3">{{ contexto }}</p>

        <div class="relatorio-cartoes mb-3">
            <article class="relatorio-cartao">
                <span>Receita bruta</span>
                <strong>{{ formatarReais(resumo?.receitaBruta ?? null) }}</strong>
            </article>
            <article class="relatorio-cartao">
                <span>Deduções</span>
                <strong>{{ formatarReais(resumo?.deducoes ?? null) }}</strong>
            </article>
            <article class="relatorio-cartao">
                <span>Receita líquida</span>
                <strong>{{ formatarReais(resumo?.receitaLiquida ?? null) }}</strong>
            </article>
            <article class="relatorio-cartao">
                <span>Despesa fixada</span>
                <strong>{{ formatarReais(resumo?.despesaFixada ?? null) }}</strong>
            </article>
            <article class="relatorio-cartao">
                <span>Resultado</span>
                <strong :class="classeValor(resumo?.situacao ?? null)">{{ formatarReais(resumo?.resultado ?? null, true) }}</strong>
            </article>
            <article class="relatorio-cartao" :class="{ 'relatorio-cartao--alerta': (resumo?.fontesDesequilibradas ?? 0) > 0 }">
                <span>Fontes descobertas</span>
                <strong>{{ resumo?.fontesDesequilibradas ?? "—" }}</strong>
                <small v-if="resumo?.fontes != null">{{ textoQuantidade(resumo.fontes, "fonte", "fontes") }}</small>
            </article>
        </div>

        <p class="relatorio-secundario mb-4">
            <span>Receita corrente líquida <b>{{ formatarReais(resumo?.receitaCorrenteLiquida ?? null) }}</b></span>
            <span>Despesa corrente <b>{{ formatarReais(resumo?.despesaCorrente ?? null) }}</b></span>
            <span>Resultado corrente <b :class="classeValor(resumo?.resultadoCorrente == null ? null : resumo.resultadoCorrente > 0 ? 'superavit' : resumo.resultadoCorrente < 0 ? 'deficit' : 'equilibrado')">{{ formatarReais(resumo?.resultadoCorrente ?? null, true) }}</b></span>
            <span>Receita de capital líquida <b>{{ formatarReais(resumo?.receitaCapitalLiquida ?? null) }}</b></span>
            <span>Despesa de capital <b>{{ formatarReais(resumo?.despesaCapital ?? null) }}</b></span>
            <span>Reserva de contingência <b>{{ formatarReais(resumo?.reservaContingencia ?? null) }}</b></span>
        </p>

        <div class="card border-0 shadow-sm pol-panel mb-4">
            <div class="card-body">
                <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h3 class="h6 mb-0">Fontes</h3>
                    <div class="pol-search">
                        <RiSearchLine />
                        <input v-model="busca" type="search" placeholder="Nome ou código" aria-label="Buscar no relatório" />
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table pol-table mb-0">
                        <thead>
                            <tr>
                                <th>Fonte</th>
                                <th>Receita líquida</th>
                                <th>Despesa fixada</th>
                                <th>Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(fonte, indice) in fontesPagina" :key="`${fonte.fonte}-${indiceFonte(indice)}`">
                                <tr :class="classeSituacao(fonte.situacao)" class="relatorio-linha" @click="alternarFonte(indice)">
                                    <td>
                                        <span class="relatorio-titulo">{{ tituloFonte(fonte) }}</span>
                                        <span v-if="complementoFonte(fonte)" class="relatorio-sub">{{ complementoFonte(fonte) }}</span>
                                    </td>
                                    <td>{{ formatarReais(fonte.receitaLiquida) }}</td>
                                    <td>{{ formatarReais(fonte.despesaFixada) }}</td>
                                    <td :class="classeValor(fonte.situacao)">{{ formatarReais(fonte.resultado, true) }}</td>
                                </tr>
                                <tr v-if="fonteAberta === indiceFonte(indice)">
                                    <td colspan="4" class="relatorio-detalhe">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <h4 class="h6">Receitas desta fonte</h4>
                                                <p v-if="fonte.receitas.length === 0" class="text-muted small mb-0">—</p>
                                                <ul v-else class="relatorio-lista">
                                                    <li v-for="(item, itemIndice) in fonte.receitas" :key="itemIndice">
                                                        <span>
                                                            {{ tituloNatureza(item.nome, item.codigo) }}
                                                            <small v-if="textoPreenchido(item.nome) && textoPreenchido(item.codigo)">{{ item.codigo }}</small>
                                                            <em v-if="item.deducao" class="pol-badge">Dedução</em>
                                                        </span>
                                                        <b :class="{ 'relatorio-valor--deficit': item.deducao }">{{ formatarReais(item.valor) }}</b>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div class="col-md-6">
                                                <h4 class="h6">Despesas desta fonte</h4>
                                                <p v-if="fonte.despesas.length === 0" class="text-muted small mb-0">—</p>
                                                <ul v-else class="relatorio-lista">
                                                    <li v-for="(item, itemIndice) in fonte.despesas" :key="itemIndice">
                                                        <span>
                                                            {{ tituloNatureza(item.nome, item.codigo) }}
                                                            <small v-if="textoPreenchido(item.nome) && textoPreenchido(item.codigo)">{{ item.codigo }}</small>
                                                        </span>
                                                        <b>{{ formatarReais(item.valor) }}</b>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                            <tr v-if="fontesPagina.length === 0">
                                <td colspan="4" class="text-muted">{{ vazioFontes() }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-if="fontes.length > 0" class="pol-pag mt-3">
                    <span class="text-muted small">{{ textoIntervalo(paginaFontes, fontes.length, TAMANHO_PAGINA_RELATORIO) }}</span>
                    <button v-if="fontes.length > TAMANHO_PAGINA_RELATORIO" type="button" :disabled="paginaFontes <= 1" aria-label="Página anterior" @click="paginaFontes -= 1">
                        <RiArrowLeftSLine />
                    </button>
                    <button
                        v-if="fontes.length > TAMANHO_PAGINA_RELATORIO"
                        type="button"
                        :disabled="paginaFontes >= Math.ceil(fontes.length / TAMANHO_PAGINA_RELATORIO)"
                        aria-label="Próxima página"
                        @click="paginaFontes += 1"
                    >
                        <RiArrowRightSLine />
                    </button>
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm pol-panel mb-4">
            <div class="card-body">
                <div class="relatorio-abas mb-3" role="tablist" aria-label="Detalhes do relatório">
                    <button type="button" :class="{ 'is-on': aba === 'receitas' }" @click="aba = 'receitas'">Receitas</button>
                    <button type="button" :class="{ 'is-on': aba === 'despesas' }" @click="aba = 'despesas'">Despesas</button>
                    <button type="button" :class="{ 'is-on': aba === 'deducoes' }" @click="aba = 'deducoes'">Deduções da receita</button>
                </div>

                <div v-if="aba === 'receitas'" class="table-responsive">
                    <table class="table pol-table mb-0">
                        <thead>
                            <tr>
                                <th>Natureza</th>
                                <th>Categoria</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, indice) in receitasPagina" :key="indice">
                                <td>
                                    <span class="relatorio-titulo">{{ tituloNatureza(item.nome, item.codigo) }}</span>
                                    <span v-if="subtituloReceita(item)" class="relatorio-sub">{{ subtituloReceita(item) }}</span>
                                </td>
                                <td>{{ textoPreenchido(item.categoria) ? item.categoria : "—" }}</td>
                                <td>{{ formatarReais(item.valor) }}</td>
                            </tr>
                            <tr v-if="receitasPagina.length === 0">
                                <td colspan="3" class="text-muted">{{ vazioTabela() }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="receitas.length > 0" class="pol-pag mt-3">
                        <span class="text-muted small">{{ textoIntervalo(paginaReceitas, receitas.length, TAMANHO_PAGINA_RELATORIO) }}</span>
                    </div>
                </div>

                <div v-else-if="aba === 'despesas'" class="table-responsive">
                    <table class="table pol-table mb-0">
                        <thead>
                            <tr>
                                <th>Natureza</th>
                                <th>Classificação</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, indice) in despesasPagina" :key="indice">
                                <td>
                                    <span class="relatorio-titulo">{{ tituloNatureza(item.nome, item.codigo) }}</span>
                                    <span v-if="textoPreenchido(item.nome) && textoPreenchido(item.codigo)" class="relatorio-sub">{{ item.codigo }}</span>
                                </td>
                                <td>{{ classificacaoDespesa(item) || "—" }}</td>
                                <td>{{ formatarReais(item.valor) }}</td>
                            </tr>
                            <tr v-if="despesasPagina.length === 0">
                                <td colspan="3" class="text-muted">{{ vazioTabela() }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="despesas.length > 0" class="pol-pag mt-3">
                        <span class="text-muted small">{{ textoIntervalo(paginaDespesas, despesas.length, TAMANHO_PAGINA_RELATORIO) }}</span>
                    </div>
                </div>

                <div v-else class="table-responsive">
                    <table class="table pol-table mb-0">
                        <thead>
                            <tr>
                                <th>Natureza</th>
                                <th>Dedução</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, indice) in deducoesPagina" :key="indice">
                                <td>
                                    <span class="relatorio-titulo">{{ tituloNatureza(item.nome, item.codigo) }}</span>
                                    <span v-if="textoPreenchido(item.nome) && textoPreenchido(item.codigo)" class="relatorio-sub">{{ item.codigo }}</span>
                                </td>
                                <td class="validacao-quebra">{{ rotuloDeducao(item) }}</td>
                                <td>{{ formatarReaisAbsoluto(item.valor) }}</td>
                            </tr>
                            <tr v-if="deducoesPagina.length === 0">
                                <td colspan="3" class="text-muted">{{ vazioTabela() }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="deducoes.length > 0" class="pol-pag mt-3">
                        <span class="text-muted small">{{ textoIntervalo(paginaDeducoes, deducoes.length, TAMANHO_PAGINA_RELATORIO) }}</span>
                    </div>
                </div>

                <div v-if="aba === 'receitas' && receitas.length > TAMANHO_PAGINA_RELATORIO" class="pol-pag">
                    <button type="button" :disabled="paginaReceitas <= 1" aria-label="Página anterior das receitas" @click="paginaReceitas -= 1">
                        <RiArrowLeftSLine />
                    </button>
                    <button type="button" :disabled="paginaReceitas >= Math.ceil(receitas.length / TAMANHO_PAGINA_RELATORIO)" aria-label="Próxima página das receitas" @click="paginaReceitas += 1">
                        <RiArrowRightSLine />
                    </button>
                </div>
                <div v-else-if="aba === 'despesas' && despesas.length > TAMANHO_PAGINA_RELATORIO" class="pol-pag">
                    <button type="button" :disabled="paginaDespesas <= 1" aria-label="Página anterior das despesas" @click="paginaDespesas -= 1">
                        <RiArrowLeftSLine />
                    </button>
                    <button type="button" :disabled="paginaDespesas >= Math.ceil(despesas.length / TAMANHO_PAGINA_RELATORIO)" aria-label="Próxima página das despesas" @click="paginaDespesas += 1">
                        <RiArrowRightSLine />
                    </button>
                </div>
                <div v-else-if="aba === 'deducoes' && deducoes.length > TAMANHO_PAGINA_RELATORIO" class="pol-pag">
                    <button type="button" :disabled="paginaDeducoes <= 1" aria-label="Página anterior das deduções" @click="paginaDeducoes -= 1">
                        <RiArrowLeftSLine />
                    </button>
                    <button type="button" :disabled="paginaDeducoes >= Math.ceil(deducoes.length / TAMANHO_PAGINA_RELATORIO)" aria-label="Próxima página das deduções" @click="paginaDeducoes += 1">
                        <RiArrowRightSLine />
                    </button>
                </div>
            </div>
        </div>

        <div class="row g-3">
            <div class="col-lg-4">
                <section class="card border-0 shadow-sm pol-panel h-100">
                    <div class="card-body">
                        <h3 class="h6">Função</h3>
                        <ul class="relatorio-lista">
                            <li v-for="(item, indice) in resposta.porFuncao" :key="indice">
                                <span>
                                    {{ tituloReparticao(item) }}
                                    <i class="relatorio-barra"><b :style="{ width: larguraBarra(item.valor, maiorFuncao) }" /></i>
                                </span>
                                <b>{{ formatarReais(item.valor) }}</b>
                            </li>
                            <li v-if="resposta.porFuncao.length === 0" class="text-muted">—</li>
                        </ul>
                    </div>
                </section>
            </div>
            <div class="col-lg-4">
                <section class="card border-0 shadow-sm pol-panel h-100">
                    <div class="card-body">
                        <h3 class="h6">Unidade</h3>
                        <ul class="relatorio-lista">
                            <li v-for="(item, indice) in resposta.porUnidade" :key="indice">
                                <span>
                                    {{ tituloReparticao(item) }}
                                    <i class="relatorio-barra"><b :style="{ width: larguraBarra(item.valor, maiorUnidade) }" /></i>
                                </span>
                                <b>{{ formatarReais(item.valor) }}</b>
                            </li>
                            <li v-if="resposta.porUnidade.length === 0" class="text-muted">—</li>
                        </ul>
                    </div>
                </section>
            </div>
            <div class="col-lg-4">
                <section class="card border-0 shadow-sm pol-panel h-100">
                    <div class="card-body">
                        <h3 class="h6">Programa</h3>
                        <ul class="relatorio-lista">
                            <li v-for="(item, indice) in resposta.porPrograma" :key="indice">
                                <span>
                                    {{ tituloReparticao(item) }}
                                    <i class="relatorio-barra"><b :style="{ width: larguraBarra(item.valor, maiorPrograma) }" /></i>
                                </span>
                                <b>{{ formatarReais(item.valor) }}</b>
                            </li>
                            <li v-if="resposta.porPrograma.length === 0" class="text-muted">—</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    </section>
</template>

<style scoped>
.relatorio-pdf {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.relatorio-faixa--superavit {
    background: #eef3ff;
    border: 1px solid #c5d4f7;
    color: #1e3a8a;
}

.relatorio-aviso {
    display: flex;
    gap: 0.4rem;
    align-items: flex-start;
}

.relatorio-aviso + .relatorio-aviso {
    margin-top: 0.35rem;
}

.relatorio-cartoes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
}

.relatorio-cartao {
    background: #fff;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 16px;
    padding: 0.9rem 1rem;
}

.relatorio-cartao span,
.relatorio-secundario {
    color: #5d6e8f;
    font-size: 0.78rem;
}

.relatorio-cartao span {
    display: block;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.relatorio-cartao strong {
    display: block;
    margin-top: 0.25rem;
    color: #1a2d4e;
    font-size: 1.05rem;
}

.relatorio-cartao small {
    color: #5d6e8f;
}

.relatorio-cartao--alerta strong {
    color: #7a5b12;
}

.relatorio-secundario {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem 1rem;
}

.relatorio-secundario b {
    color: #1a2d4e;
    font-weight: 700;
}

.relatorio-titulo,
.relatorio-sub {
    display: block;
}

.relatorio-titulo {
    font-weight: 700;
    color: #1a2d4e;
}

.relatorio-sub,
.relatorio-lista small {
    color: #5d6e8f;
    font-size: 0.78rem;
}

.relatorio-linha {
    cursor: pointer;
}

.relatorio-linha--deficit {
    background: #fff6f6;
    color: #9e2b2b;
}

.relatorio-linha--superavit {
    background: #f4f7ff;
    color: #1e3a8a;
}

.relatorio-valor--deficit {
    color: #9e2b2b;
}

.relatorio-valor--superavit {
    color: #1e4fa8;
}

.relatorio-valor--equilibrado {
    color: #1d6d3f;
}

.relatorio-detalhe {
    background: #f8fafc;
}

.relatorio-lista {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
}

.relatorio-lista li {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: flex-start;
}

.relatorio-lista em {
    font-style: normal;
    margin-left: 0.35rem;
    text-transform: none;
    letter-spacing: 0;
}

.relatorio-barra {
    display: block;
    height: 0.35rem;
    margin-top: 0.3rem;
    border-radius: 999px;
    background: rgba(31, 46, 84, 0.08);
    overflow: hidden;
}

.relatorio-barra b {
    display: block;
    height: 100%;
    background: #2da0a8;
}

.relatorio-abas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.relatorio-abas button {
    border: 1px solid rgba(92, 107, 192, 0.2);
    background: #fff;
    color: #40528b;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    font-size: 0.82rem;
    font-weight: 700;
}

.relatorio-abas button.is-on {
    background: #1f2e54;
    color: #fff;
    border-color: #1f2e54;
}
</style>
