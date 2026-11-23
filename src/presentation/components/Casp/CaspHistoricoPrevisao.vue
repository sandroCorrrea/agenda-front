<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RiArrowLeftSLine, RiArrowRightSLine, RiSearchLine } from "@remixicon/vue";
import type { SicomPrevisao, SicomPrevisaoConta } from "@/domain/sicom/previsao";
import { classeSituacao, formatarReais } from "@/shared/utils/sicomRelatorio";
import {
    TAMANHO_PAGINA_HISTORICO,
    classeVariacao,
    filtrarContasPrevisao,
    formatarVariacao,
    linhasPrevisto,
    rotuloSituacaoHistorico,
    seloMetodo
} from "@/shared/utils/sicomHistorico";
import { textoIntervalo } from "@/shared/utils/sicomValidacao";

const props = defineProps<{ resposta: SicomPrevisao; horizonte: number }>();

const verContas = ref(false);
const aba = ref<"despesas" | "receitas" | "deducoes">("despesas");
const busca = ref("");
const filtro = ref("");
const pagina = ref(1);
const aberta = ref<string | null>(null);

const ultimo = computed(() => {
    const itens = props.resposta.totais?.previsoes ?? [];
    return itens.length ? itens[itens.length - 1] : null;
});

const origem = computed(() => {
    if (aba.value === "receitas") return props.resposta.receitas;
    if (aba.value === "deducoes") return props.resposta.deducoes;
    return props.resposta.despesas;
});
const itens = computed(() => filtrarContasPrevisao(origem.value, busca.value, filtro.value));
const fatia = computed(() => {
    const inicio = (pagina.value - 1) * TAMANHO_PAGINA_HISTORICO;
    return itens.value.slice(inicio, inicio + TAMANHO_PAGINA_HISTORICO);
});
const totalPaginas = computed(() => Math.max(1, Math.ceil(itens.value.length / TAMANHO_PAGINA_HISTORICO)));

watch(
    () => props.resposta,
    () => {
        verContas.value = false;
        aba.value = "despesas";
        busca.value = "";
        filtro.value = "";
        pagina.value = 1;
        aberta.value = null;
    }
);

watch([aba, busca, filtro], () => {
    pagina.value = 1;
    aberta.value = null;
});

function classeValor(situacao: string | null): string {
    if (situacao === "deficit") return "hist-valor--deficit";
    if (situacao === "superavit") return "hist-valor--superavit";
    if (situacao === "equilibrado") return "hist-valor--equilibrado";
    return "";
}

function chave(item: SicomPrevisaoConta, indice: number): string {
    return `${aba.value}:${item.codigo ?? ""}:${item.identificador ?? ""}:${indice}`;
}

function complemento(item: SicomPrevisaoConta): string {
    const partes: string[] = [];
    if (item.nome && item.codigo) partes.push(item.codigo);
    if (item.codigoConta && item.codigoConta !== item.codigo) partes.push(`conta ${item.codigoConta}`);
    if (item.identificador) partes.push(`identificador ${item.identificador}`);
    return partes.join(" · ");
}
</script>

<template>
    <div>
        <div
            class="pol-alert mb-3"
            :class="{
                'pol-alert--erro': ultimo?.situacao === 'deficit',
                'relatorio-faixa--superavit': ultimo?.situacao === 'superavit',
                'pol-alert--ok': ultimo?.situacao === 'equilibrado',
                'pol-alert--aviso': !ultimo
            }"
        >
            {{ resposta.mensagem || "Previsão" }}
        </div>
        <div v-if="resposta.lacunas.length" class="d-flex flex-wrap gap-2 mb-3">
            <span v-for="ano in resposta.lacunas" :key="ano" class="pol-badge hist-selo">Sem {{ ano }}</span>
        </div>
        <div v-for="(aviso, indice) in resposta.avisos" :key="indice" class="pol-alert pol-alert--aviso mb-2">{{ aviso }}</div>

        <div v-if="ultimo" class="hist-cartoes mb-4">
            <article class="hist-cartao">
                <span>Previsão {{ ultimo.exercicio ?? "—" }} · receita bruta</span>
                <strong>{{ formatarReais(ultimo.receitaBruta) }}</strong>
            </article>
            <article class="hist-cartao">
                <span>Deduções</span>
                <strong>{{ formatarReais(ultimo.deducoes) }}</strong>
            </article>
            <article class="hist-cartao">
                <span>Receita líquida</span>
                <strong>{{ formatarReais(ultimo.receitaLiquida) }}</strong>
            </article>
            <article class="hist-cartao">
                <span>Despesa fixada</span>
                <strong>{{ formatarReais(ultimo.despesaFixada) }}</strong>
            </article>
            <article class="hist-cartao">
                <span>Resultado · {{ rotuloSituacaoHistorico(ultimo.situacao) }}</span>
                <strong :class="classeValor(ultimo.situacao)">{{ formatarReais(ultimo.resultado, true) }}</strong>
            </article>
        </div>

        <section class="card border-0 shadow-sm pol-panel mb-4">
            <div class="card-body">
                <h2 class="h6">Série</h2>
                <p class="text-muted small">Gravado é o exercício que já entrou. Previsto é a projeção a partir do último ano gravado.</p>
                <div class="table-responsive">
                    <table class="table pol-table mb-0">
                        <thead>
                            <tr>
                                <th>Exercício</th>
                                <th class="text-end">Receita líquida</th>
                                <th class="text-end">Despesa fixada</th>
                                <th class="text-end">Resultado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in resposta.totais?.historico ?? []" :key="`h-${item.exercicio}`">
                                <td>{{ item.exercicio ?? "—" }} <span class="pol-badge hist-selo">Gravado</span></td>
                                <td class="text-end">{{ formatarReais(item.receitaLiquida) }}</td>
                                <td class="text-end">{{ formatarReais(item.despesaFixada) }}</td>
                                <td class="text-end">{{ formatarReais(item.resultado, true) }}</td>
                            </tr>
                            <tr v-for="item in resposta.totais?.previsoes ?? []" :key="`p-${item.exercicio}`" :class="classeSituacao(item.situacao)">
                                <td>{{ item.exercicio ?? "—" }} <span class="pol-badge hist-selo">Previsto</span></td>
                                <td class="text-end">{{ formatarReais(item.receitaLiquida) }}</td>
                                <td class="text-end">{{ formatarReais(item.despesaFixada) }}</td>
                                <td class="text-end">{{ formatarReais(item.resultado, true) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <section class="card border-0 shadow-sm pol-panel">
            <div class="card-body">
                <h2 class="h6">Contas</h2>
                <p class="text-muted small mb-3">O total previsto está nos cartões. A soma das contas não o reproduz, porque códigos deixaram de existir.</p>
                <button class="btn pol-btn--ghost" type="button" @click="verContas = !verContas">
                    {{ verContas ? "Ocultar contas" : "Ver as contas" }}
                </button>
                <template v-if="verContas">
                    <div class="hist-abas my-3" role="tablist" aria-label="Contas da previsão">
                        <button type="button" :class="{ 'is-on': aba === 'despesas' }" @click="aba = 'despesas'">Despesas</button>
                        <button type="button" :class="{ 'is-on': aba === 'receitas' }" @click="aba = 'receitas'">Receitas</button>
                        <button type="button" :class="{ 'is-on': aba === 'deducoes' }" @click="aba = 'deducoes'">Deduções</button>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-md-8">
                            <div class="pol-search">
                                <RiSearchLine />
                                <input v-model="busca" type="search" placeholder="Nome ou código" aria-label="Buscar conta da previsão" />
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="visually-hidden" for="historico-metodo">Método</label>
                            <select id="historico-metodo" v-model="filtro" class="form-select">
                                <option value="">Todos os métodos</option>
                                <option value="tendencia">Tendência</option>
                                <option value="crescimento">Crescimento</option>
                                <option value="insuficiente">Sem base</option>
                                <option value="encerrada">Encerrada</option>
                            </select>
                        </div>
                    </div>
                    <p v-if="itens.length === 0 && busca.trim()" class="text-muted small mb-0">Nenhum item encontrado para esta busca.</p>
                    <div v-else class="table-responsive">
                        <table class="table pol-table mb-0">
                            <thead>
                                <tr>
                                    <th>Natureza</th>
                                    <th class="text-end">Variação</th>
                                    <th class="text-end">Último valor</th>
                                    <th class="text-end">Previsto</th>
                                    <th>Método</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(item, indice) in fatia" :key="chave(item, indice)">
                                    <tr>
                                        <td>
                                            <button type="button" class="hist-conta" @click="aberta = aberta === chave(item, indice) ? null : chave(item, indice)">
                                                {{ item.nome || item.codigo || "—" }}
                                            </button>
                                            <span v-if="complemento(item)" class="hist-sub">{{ complemento(item) }}</span>
                                        </td>
                                        <td class="text-end" :class="classeVariacao(item.variacaoPercentual)">{{ formatarVariacao(item.variacaoPercentual) }}</td>
                                        <td class="text-end">{{ formatarReais(item.ultimoValor) }}</td>
                                        <td class="text-end">
                                            <span v-for="(linha, linhaIndice) in linhasPrevisto(item, horizonte)" :key="linhaIndice" class="d-block">{{ linha }}</span>
                                        </td>
                                        <td><span class="pol-badge hist-selo">{{ seloMetodo(item.metodo) || "—" }}</span></td>
                                    </tr>
                                    <tr v-if="aberta === chave(item, indice)" class="hist-detalhe">
                                        <td colspan="5">
                                            <p class="small text-muted mb-2">Clique de novo na natureza para fechar. A linha mostra o que já foi gravado e o que a previsão projetou.</p>
                                            <p v-for="ponto in item.historico" :key="`h-${ponto.exercicio}`" class="mb-1">
                                                {{ ponto.exercicio ?? "—" }} · {{ formatarReais(ponto.valor) }} <span class="pol-badge hist-selo">Gravado</span>
                                            </p>
                                            <p v-for="ponto in item.previsao" :key="`p-${ponto.exercicio}`" class="mb-1">
                                                {{ ponto.exercicio ?? "—" }} · {{ formatarReais(ponto.valor) }} <span class="pol-badge hist-selo">Previsto</span>
                                            </p>
                                            <p v-if="item.historico.length === 0 && item.previsao.length === 0" class="mb-0 text-muted">—</p>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                        <div v-if="itens.length > 0" class="pol-pag mt-3">
                            <span class="text-muted small">{{ textoIntervalo(pagina, itens.length, TAMANHO_PAGINA_HISTORICO) }}</span>
                            <button v-if="itens.length > TAMANHO_PAGINA_HISTORICO" type="button" :disabled="pagina <= 1" aria-label="Página anterior" @click="pagina -= 1">
                                <RiArrowLeftSLine />
                            </button>
                            <button
                                v-if="itens.length > TAMANHO_PAGINA_HISTORICO"
                                type="button"
                                :disabled="pagina >= totalPaginas"
                                aria-label="Próxima página"
                                @click="pagina += 1"
                            >
                                <RiArrowRightSLine />
                            </button>
                        </div>
                    </div>
                </template>
            </div>
        </section>
    </div>
</template>

<style scoped>
.hist-selo {
    text-transform: none;
}

.hist-cartoes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
}

.hist-cartao {
    background: #fff;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 16px;
    padding: 0.9rem 1rem;
}

.hist-cartao span {
    display: block;
    color: #5d6e8f;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.hist-cartao strong {
    display: block;
    margin-top: 0.25rem;
    color: #1a2d4e;
    font-size: 1.05rem;
}

.hist-abas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.hist-abas button {
    border: 1px solid rgba(92, 107, 192, 0.2);
    background: #fff;
    color: #40528b;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    font-size: 0.82rem;
    font-weight: 700;
}

.hist-abas button.is-on {
    background: #1f2e54;
    color: #fff;
    border-color: #1f2e54;
}

.hist-conta {
    border: 0;
    background: transparent;
    padding: 0;
    color: #1a2d4e;
    font-weight: 700;
    text-align: left;
}

.hist-sub {
    display: block;
    color: #5d6e8f;
    font-size: 0.78rem;
}

.hist-detalhe {
    background: #f8fafc;
}

.hist-valor--deficit {
    color: #9e2b2b;
}

.hist-valor--superavit {
    color: #1e4fa8;
}

.hist-valor--equilibrado {
    color: #1d6d3f;
}

.relatorio-faixa--superavit {
    background: #eef3ff;
    border: 1px solid #c5d4f7;
    color: #1e3a8a;
}

.relatorio-linha--deficit {
    background: #fff6f6;
    color: #9e2b2b;
}

.relatorio-linha--superavit {
    background: #f4f7ff;
    color: #1e3a8a;
}

:deep(.relatorio-valor--deficit) {
    color: #9e2b2b;
}

:deep(.relatorio-valor--superavit) {
    color: #1e4fa8;
}
</style>
