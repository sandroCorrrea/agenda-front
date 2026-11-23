<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RiArrowLeftSLine, RiArrowRightSLine, RiSearchLine } from "@remixicon/vue";
import type { SicomHistoricoConta, SicomHistoricoDetalhe } from "@/domain/sicom/historico";
import {
    classificacaoDespesa,
    formatarReais,
    formatarReaisAbsoluto,
    subtituloReceita,
    tituloNatureza
} from "@/shared/utils/sicomRelatorio";
import { TAMANHO_PAGINA_HISTORICO, filtrarContasHistorico, formatarGravadoEm, rotuloSituacaoHistorico } from "@/shared/utils/sicomHistorico";
import { textoIntervalo } from "@/shared/utils/sicomValidacao";

const props = defineProps<{ detalhe: SicomHistoricoDetalhe }>();

const aba = ref<"receitas" | "despesas" | "deducoes">("receitas");
const busca = ref("");
const pagina = ref(1);

watch(
    () => props.detalhe.id,
    () => {
        aba.value = "receitas";
        busca.value = "";
        pagina.value = 1;
    }
);

watch([aba, busca], () => {
    pagina.value = 1;
});

const origem = computed(() => {
    if (aba.value === "despesas") return props.detalhe.despesas;
    if (aba.value === "deducoes") return props.detalhe.deducoes;
    return props.detalhe.receitas;
});
const itens = computed(() => filtrarContasHistorico(origem.value, busca.value));
const fatia = computed(() => {
    const inicio = (pagina.value - 1) * TAMANHO_PAGINA_HISTORICO;
    return itens.value.slice(inicio, inicio + TAMANHO_PAGINA_HISTORICO);
});
const totalPaginas = computed(() => Math.max(1, Math.ceil(itens.value.length / TAMANHO_PAGINA_HISTORICO)));

function classeValor(situacao: string | null): string {
    if (situacao === "deficit") return "hist-valor--deficit";
    if (situacao === "superavit") return "hist-valor--superavit";
    if (situacao === "equilibrado") return "hist-valor--equilibrado";
    return "";
}

function valorDa(item: SicomHistoricoConta): string {
    return aba.value === "deducoes" ? formatarReaisAbsoluto(item.valor) : formatarReais(item.valor);
}
</script>

<template>
    <section class="card border-0 shadow-sm pol-panel">
        <div class="card-body">
            <p class="text-muted small mb-3">
                Exercício {{ detalhe.exercicio ?? "—" }} · município {{ detalhe.municipio || "—" }} · {{ detalhe.arquivo || "—" }} ·
                gravado em {{ formatarGravadoEm(detalhe.gravadoEm) }}
            </p>
            <div class="hist-cartoes mb-4">
                <article class="hist-cartao">
                    <span>Receita bruta</span>
                    <strong>{{ formatarReais(detalhe.receitaBruta) }}</strong>
                </article>
                <article v-if="detalhe.deducoesTotal != null" class="hist-cartao">
                    <span>Deduções</span>
                    <strong>{{ formatarReais(detalhe.deducoesTotal) }}</strong>
                </article>
                <article class="hist-cartao">
                    <span>Receita líquida</span>
                    <strong>{{ formatarReais(detalhe.receitaLiquida) }}</strong>
                </article>
                <article class="hist-cartao">
                    <span>Despesa fixada</span>
                    <strong>{{ formatarReais(detalhe.despesaFixada) }}</strong>
                </article>
                <article class="hist-cartao">
                    <span>Resultado</span>
                    <strong :class="classeValor(detalhe.situacao)">{{ formatarReais(detalhe.resultado, true) }}</strong>
                    <small>{{ rotuloSituacaoHistorico(detalhe.situacao) }}</small>
                </article>
            </div>

            <div class="hist-abas mb-3" role="tablist" aria-label="Contas do exercício">
                <button type="button" :class="{ 'is-on': aba === 'receitas' }" @click="aba = 'receitas'">Receitas</button>
                <button type="button" :class="{ 'is-on': aba === 'despesas' }" @click="aba = 'despesas'">Despesas</button>
                <button type="button" :class="{ 'is-on': aba === 'deducoes' }" @click="aba = 'deducoes'">Deduções da receita</button>
            </div>
            <p class="text-muted small">
                <template v-if="aba === 'receitas'">Receitas deste exercício, na ordem enviada.</template>
                <template v-else-if="aba === 'despesas'">Despesas fixadas deste exercício. A classificação junta categoria, grupo e modalidade.</template>
                <template v-else>Deduções da receita. O valor é absoluto e não entra de novo no total do cartão.</template>
            </p>
            <div class="pol-search mb-3">
                <RiSearchLine />
                <input v-model="busca" type="search" placeholder="Nome ou código" :aria-label="`Buscar ${aba}`" />
            </div>
            <p v-if="itens.length === 0 && busca.trim()" class="text-muted small mb-0">Nenhum item encontrado para esta busca.</p>
            <div v-else class="table-responsive">
                <table class="table pol-table mb-0">
                    <thead>
                        <tr>
                            <th>Natureza</th>
                            <th>{{ aba === "despesas" ? "Classificação" : aba === "deducoes" ? "Identificador" : "Categoria" }}</th>
                            <th class="text-end">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, indice) in fatia" :key="`${aba}-${indice}`">
                            <td>
                                <span class="hist-titulo">{{ tituloNatureza(item.nome, item.codigo) }}</span>
                                <span v-if="subtituloReceita(item)" class="hist-sub">{{ subtituloReceita(item) }}</span>
                            </td>
                            <td>
                                {{
                                    aba === "despesas"
                                        ? classificacaoDespesa(item) || "—"
                                        : aba === "deducoes"
                                          ? item.identificador || "—"
                                          : item.categoria || "—"
                                }}
                            </td>
                            <td class="text-end">{{ valorDa(item) }}</td>
                        </tr>
                        <tr v-if="fatia.length === 0">
                            <td colspan="3" class="text-muted">—</td>
                        </tr>
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
        </div>
    </section>
</template>

<style scoped>
.hist-cartoes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

.hist-cartao small {
    color: #5d6e8f;
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

.hist-titulo,
.hist-sub {
    display: block;
}

.hist-titulo {
    font-weight: 700;
    color: #1a2d4e;
}

.hist-sub {
    color: #5d6e8f;
    font-size: 0.78rem;
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
</style>
