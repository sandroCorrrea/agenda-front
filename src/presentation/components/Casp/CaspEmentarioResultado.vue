<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RiArrowLeftSLine, RiArrowRightSLine, RiInformationLine, RiSearchLine } from "@remixicon/vue";
import type { SicomContasResposta } from "@/domain/sicom/contas";
import { textoQuantidade, textoIntervalo, celulaSicom } from "@/shared/utils/sicomValidacao";
import {
    TAMANHO_PAGINA_CONTAS,
    campoRegistro,
    camposVisiveis,
    filtrarDicionario,
    paresEmentario,
    partesCaminho,
    seloDesdobramento,
    semVinculoVisiveis,
    textoPreenchido,
    textoSemVinculo
} from "@/shared/utils/sicomContas";

const props = defineProps<{
    resposta: SicomContasResposta;
}>();

const busca = ref("");
const arquivoFiltro = ref<string | null>(null);
const pagina = ref(1);

const comOcorrencias = computed(() => (props.resposta.totalOcorrencias ?? 0) > 0);
const filtradas = computed(() => filtrarDicionario(props.resposta.dicionario, busca.value, arquivoFiltro.value));
const totalPaginas = computed(() => (filtradas.value.length === 0 ? 1 : Math.ceil(filtradas.value.length / TAMANHO_PAGINA_CONTAS)));
const paginaAtual = computed(() => Math.min(pagina.value, totalPaginas.value));
const inicio = computed(() => (paginaAtual.value - 1) * TAMANHO_PAGINA_CONTAS);
const paginaContas = computed(() => filtradas.value.slice(inicio.value, inicio.value + TAMANHO_PAGINA_CONTAS));
const intervalo = computed(() => textoIntervalo(paginaAtual.value, filtradas.value.length, TAMANHO_PAGINA_CONTAS));
const avisosSemConta = computed(() => semVinculoVisiveis(props.resposta.arquivos, arquivoFiltro.value));

const contexto = computed(() => {
    const ementario = props.resposta.ementario;
    const partes: string[] = [];
    if (textoPreenchido(ementario?.arquivo)) partes.push(ementario!.arquivo!);
    if (ementario?.planilha != null && ementario.planilha !== "") partes.push(ementario.planilha);
    if (ementario?.totalContas != null) {
        partes.push(`${textoQuantidade(ementario.totalContas, "conta", "contas")} no ementário`);
    }
    if (props.resposta.totalOcorrencias != null && props.resposta.totalContas != null) {
        partes.push(
            `${textoQuantidade(props.resposta.totalOcorrencias, "ocorrência", "ocorrências")} em ${textoQuantidade(props.resposta.totalContas, "conta", "contas")} da remessa`
        );
    }
    return partes.join(" · ");
});

watch([busca, arquivoFiltro], () => {
    pagina.value = 1;
});

watch(
    () => props.resposta,
    () => {
        busca.value = "";
        arquivoFiltro.value = null;
        pagina.value = 1;
    }
);

function alternarArquivo(arquivo: string | null) {
    arquivoFiltro.value = arquivoFiltro.value === arquivo ? null : arquivo;
}

function irPagina(proxima: number) {
    pagina.value = Math.min(Math.max(1, proxima), totalPaginas.value);
}
</script>

<template>
    <section class="mt-4">
        <div v-if="comOcorrencias" class="pol-alert pol-alert--ok mb-2 validacao-quebra">{{ resposta.mensagem }}</div>
        <div v-else class="pol-alert pol-alert--aviso mb-2 validacao-quebra">{{ resposta.mensagem }}</div>
        <p v-if="contexto" class="text-muted small ementario-contexto mb-3">{{ contexto }}</p>

        <div v-if="resposta.arquivos.length" class="validacao-arquivos mb-4">
            <button
                v-for="(item, indice) in resposta.arquivos"
                :key="`${item.arquivo}-${indice}`"
                type="button"
                class="validacao-arquivo"
                :class="{
                    'validacao-arquivo--ok': item.totalSemVinculo === 0,
                    'validacao-arquivo--aviso': (item.totalSemVinculo ?? 0) > 0,
                    'is-on': arquivoFiltro === item.arquivo
                }"
                @click="alternarArquivo(item.arquivo)"
            >
                <span class="validacao-arquivo__titulo">{{ celulaSicom(item.arquivo) }}</span>
                <span class="validacao-arquivo__linhas">
                    coluna {{ celulaSicom(item.coluna) }} · {{ textoQuantidade(item.totalVinculos, "vínculo", "vínculos") }}
                </span>
                <span v-if="(item.totalSemVinculo ?? 0) > 0" class="pol-badge pol-badge--wait">
                    {{ textoQuantidade(item.totalSemVinculo, "sem conta", "sem conta") }}
                </span>
            </button>
        </div>

        <div v-if="resposta.arquivosSemCorrespondencia.length" class="ementario-info mb-4">
            <p class="ementario-info__titulo">
                <RiInformationLine />
                Arquivos sem códigos deste ementário
            </p>
            <p v-for="(item, indice) in resposta.arquivosSemCorrespondencia" :key="`${item.arquivo}-${indice}`" class="mb-1 validacao-quebra">
                <strong v-if="item.arquivo">{{ item.arquivo }}</strong>
                <template v-if="item.arquivo && item.mensagem"> · </template>
                {{ item.mensagem }}
            </p>
        </div>

        <div v-if="comOcorrencias" class="card border-0 shadow-sm pol-panel">
            <div class="card-body">
                <p class="mb-3 fw-semibold">{{ intervalo }}</p>
                <div class="pol-search mb-3">
                    <RiSearchLine />
                    <input v-model="busca" class="form-control" type="search" placeholder="Buscar código, conta, nome ou arquivo" />
                </div>

                <p v-if="paginaContas.length === 0" class="text-muted mb-0">Nenhuma conta encontrada para esta busca.</p>

                <article v-for="(conta, indice) in paginaContas" :key="`${conta.codigoInformado}-${indice}`" class="ementario-conta">
                    <header class="ementario-conta__topo">
                        <h3 class="h6 mb-1">
                            {{ textoPreenchido(conta.especificacao) ? conta.especificacao : celulaSicom(conta.codigoConta) }}
                        </h3>
                        <p class="mb-2">
                            <template v-if="conta.codigoInformado && conta.codigoInformado === conta.codigoConta">
                                {{ conta.codigoInformado }}
                            </template>
                            <template v-else>
                                {{ celulaSicom(conta.codigoInformado) }}
                                <span class="text-muted small">conta {{ celulaSicom(conta.codigoConta) }}</span>
                            </template>
                        </p>
                        <div class="d-flex flex-wrap gap-2">
                            <span v-if="seloDesdobramento(conta)" class="pol-badge pol-badge--on">{{ seloDesdobramento(conta) }}</span>
                            <span v-if="textoPreenchido(conta.status)" class="pol-badge pol-badge--wait">{{ conta.status }}</span>
                        </div>
                    </header>

                    <p v-if="partesCaminho(conta).length" class="ementario-caminho">
                        <template v-for="(parte, parteIndice) in partesCaminho(conta)" :key="parteIndice">
                            <span v-if="parteIndice"> › </span>{{ parte }}
                        </template>
                    </p>
                    <p v-if="textoPreenchido(conta.descricao)" class="text-muted small validacao-quebra">{{ conta.descricao }}</p>

                    <ul class="ementario-ocorrencias">
                        <li v-for="(ocorrencia, ocorrenciaIndice) in conta.ocorrencias" :key="ocorrenciaIndice">
                            <p class="mb-1">
                                {{ celulaSicom(ocorrencia.arquivo) }} · linha {{ celulaSicom(ocorrencia.linha) }} ·
                                {{ celulaSicom(ocorrencia.nomeNaRemessa) }} · {{ celulaSicom(ocorrencia.valor) }}
                            </p>
                            <div v-if="ocorrencia.detalhes.length" class="ementario-detalhes">
                                <p class="mb-1 fw-semibold">Detalhes</p>
                                <p v-for="(detalhe, detalheIndice) in ocorrencia.detalhes" :key="detalheIndice" class="mb-1 validacao-quebra">
                                    linha {{ celulaSicom(detalhe.linha) }}
                                    <template v-if="camposVisiveis(detalhe.registro).length">
                                        · {{ camposVisiveis(detalhe.registro).join(" · ") }}
                                    </template>
                                </p>
                            </div>
                            <details v-if="ocorrencia.registro.length" class="ementario-disclosure">
                                <summary>Linha do CSV</summary>
                                <ol>
                                    <li v-for="(campo, campoIndice) in ocorrencia.registro" :key="campoIndice">{{ campoRegistro(campo) }}</li>
                                </ol>
                            </details>
                        </li>
                    </ul>

                    <details v-if="paresEmentario(conta.conta).length" class="ementario-disclosure">
                        <summary>Campos do ementário</summary>
                        <dl>
                            <template v-for="[chave, valor] in paresEmentario(conta.conta)" :key="chave">
                                <dt>{{ chave }}</dt>
                                <dd class="validacao-quebra">{{ valor }}</dd>
                            </template>
                        </dl>
                    </details>
                </article>

                <div v-if="filtradas.length > TAMANHO_PAGINA_CONTAS" class="pol-pag mt-3">
                    <span class="text-muted small">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
                    <button type="button" :disabled="paginaAtual <= 1" aria-label="Página anterior" @click="irPagina(paginaAtual - 1)">
                        <RiArrowLeftSLine />
                    </button>
                    <button type="button" :disabled="paginaAtual >= totalPaginas" aria-label="Próxima página" @click="irPagina(paginaAtual + 1)">
                        <RiArrowRightSLine />
                    </button>
                </div>
            </div>
        </div>

        <p v-else class="text-muted">Nenhuma conta da remessa está neste ementário.</p>

        <div v-if="avisosSemConta.length" class="pol-alert pol-alert--aviso mt-3">
            <p v-for="(item, indice) in avisosSemConta" :key="indice" class="mb-1 validacao-quebra">{{ textoSemVinculo(item) }}</p>
        </div>
    </section>
</template>

<style scoped>
.ementario-contexto {
    white-space: pre-wrap;
}

.validacao-arquivos {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
}

.validacao-arquivo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    text-align: left;
    border-radius: 16px;
    border: 1px solid rgba(22, 37, 78, 0.08);
    background: #fff;
    padding: 0.9rem 1rem;
}

.validacao-arquivo--ok {
    border-color: #b7e3c7;
}

.validacao-arquivo.is-on {
    outline: 2px solid #5c6bc0;
}

.validacao-arquivo__titulo {
    font-weight: 700;
    color: #1a2d4e;
}

.validacao-arquivo__linhas {
    color: #5d6e8f;
    font-size: 0.86rem;
}

.validacao-quebra {
    overflow-wrap: anywhere;
    word-break: break-word;
    white-space: pre-wrap;
}

.ementario-info {
    border-radius: 14px;
    padding: 0.9rem 1rem;
    background: #eef3f8;
    border: 1px solid #c5d2e4;
    color: #24385c;
}

.ementario-info__titulo {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 700;
    margin-bottom: 0.45rem;
}

.validacao-arquivo--aviso {
    border-color: #efd48a;
}

.ementario-conta {
    padding: 1rem 0;
    border-top: 1px solid rgba(22, 37, 78, 0.08);
}

.ementario-conta .pol-badge {
    text-transform: none;
    letter-spacing: 0;
}

.ementario-conta:first-of-type {
    border-top: 0;
}

.ementario-caminho,
.ementario-ocorrencias,
.ementario-detalhes {
    margin-top: 0.7rem;
}

.ementario-ocorrencias {
    list-style: none;
    padding: 0;
}

.ementario-disclosure {
    margin-top: 0.7rem;
}

.ementario-disclosure summary {
    cursor: pointer;
    font-weight: 700;
    color: #40528b;
}

.ementario-disclosure ol,
.ementario-disclosure dl {
    margin: 0.55rem 0 0;
}

.ementario-disclosure dt {
    font-weight: 700;
}

.ementario-disclosure dd {
    margin: 0 0 0.45rem;
}
</style>
