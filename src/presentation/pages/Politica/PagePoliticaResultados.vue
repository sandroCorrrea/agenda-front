<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { RiArrowLeftLine, RiBarChartBoxLine, RiDownloadLine, RiFilePdf2Line } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useResultadosPolitica } from "@/presentation/composables/Politica/useResultadosPolitica";
import { rotuloStatusPesquisa } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const id = computed(() => Number(route.params.id));
const {
    resultado, pesquisa, municipios, cargos, carregando, exportando, erro,
    ibge, cargoId, perguntaId, inicio, fim, carregar, carregarFiltros, baixarCsv, abrirPdf
} = useResultadosPolitica();

const maiorEvolucao = computed(() => Math.max(1, ...(resultado.value?.evolucao.map((item) => item.total) ?? [1])));

onMounted(() => {
    void carregarFiltros();
    void carregar(id.value);
});

watch(id, (valor) => {
    if (valor) void carregar(valor);
});
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <RouterLink :to="{ name: 'AdministradorPoliticaPesquisas' }" class="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-bold">
                <RiArrowLeftLine /> Voltar para pesquisas
            </RouterLink>
            <AdminPageHero
                :title="resultado?.pesquisa.nome || 'Resultados'"
                :subtitle="pesquisa ? `${pesquisa.eleicao?.nome || 'Pesquisa'} · ${rotuloStatusPesquisa(resultado?.pesquisa.status || '')}` : 'Coleta da pesquisa'"
            >
                <template #icon><RiBarChartBoxLine /></template>
                <template #actions>
                    <button class="btn me-2" type="button" :disabled="exportando !== null" @click="baixarCsv(id)">
                        <RiDownloadLine class="me-1" /> CSV
                    </button>
                    <button class="btn" type="button" :disabled="exportando !== null" @click="abrirPdf(id)">
                        <RiFilePdf2Line class="me-1" /> PDF
                    </button>
                </template>
            </AdminPageHero>

            <div v-if="resultado" class="pol-alert pol-alert--aviso mb-3">{{ resultado.aviso }}</div>
            <div v-if="erro" class="pol-alert pol-alert--erro mb-3">{{ erro }}</div>

            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="carregar(id)">
                <div class="card-body row g-2">
                    <div class="col-md-3">
                        <select v-model="ibge" class="form-select">
                            <option value="">Município</option>
                            <option v-for="item in municipios" :key="item.ibge" :value="item.ibge">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select v-model="cargoId" class="form-select">
                            <option value="">Cargo</option>
                            <option v-for="item in cargos" :key="item.id" :value="item.id">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="perguntaId" class="form-select">
                            <option value="">Pergunta</option>
                            <option v-for="item in pesquisa?.perguntas ?? []" :key="item.id" :value="item.id">{{ item.titulo }}</option>
                        </select>
                    </div>
                    <div class="col-md-2"><input v-model="inicio" class="form-control" type="date" /></div>
                    <div class="col-md-2"><input v-model="fim" class="form-control" type="date" /></div>
                    <div class="col-12 text-end"><button class="btn pol-btn" type="submit">Aplicar filtros</button></div>
                </div>
            </form>

            <p v-if="carregando" class="text-muted">Carregando resultados…</p>
            <template v-else-if="resultado">
                <div class="row g-3 mb-3">
                    <div v-for="card in [
                        ['Total', resultado.totalRespostas],
                        ['Concluídas', resultado.respostasConcluidas],
                        ['Incompletas', resultado.respostasIncompletas],
                        ['Conclusão', `${resultado.percentualConclusao}%`]
                    ]" :key="card[0]" class="col-6 col-md-3">
                        <div class="card border-0 shadow-sm pol-panel h-100">
                            <div class="card-body">
                                <div class="small text-muted">{{ card[0] }}</div>
                                <div class="h3 mb-0">{{ card[1] }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <section class="card border-0 shadow-sm pol-panel mb-3">
                    <div class="card-body">
                        <h2 class="h5">Linha do tempo</h2>
                        <div v-for="ponto in resultado.evolucao" :key="ponto.data" class="d-flex align-items-center gap-2 mb-2">
                            <span class="small text-nowrap" style="width: 7rem">{{ ponto.data }}</span>
                            <div class="flex-grow-1 bg-light rounded-pill" style="height: 10px">
                                <div class="rounded-pill h-100" :style="{ width: `${(ponto.total / maiorEvolucao) * 100}%`, background: '#2da0a8' }" />
                            </div>
                            <strong class="small">{{ ponto.total }}</strong>
                        </div>
                        <p v-if="resultado.evolucao.length === 0" class="text-muted mb-0">Ainda não há respostas concluídas no período.</p>
                    </div>
                </section>

                <section class="card border-0 shadow-sm pol-panel mb-3">
                    <div class="card-body">
                        <h2 class="h5">Por município</h2>
                        <div v-for="cidade in resultado.municipios" :key="cidade.ibge || cidade.nome" class="d-flex justify-content-between border-bottom py-2">
                            <span>{{ cidade.nome }}</span>
                            <strong>{{ cidade.total }}</strong>
                        </div>
                    </div>
                </section>

                <section v-for="pergunta in resultado.perguntas" :key="pergunta.id" class="card border-0 shadow-sm pol-panel mb-3">
                    <div class="card-body">
                        <h2 class="h5">{{ pergunta.titulo }}</h2>
                        <p class="small text-muted">{{ pergunta.tipo }}</p>
                        <div v-for="opcao in pergunta.opcoes" :key="opcao.opcaoId" class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span>{{ opcao.rotulo }}</span>
                                <strong>{{ opcao.total }} · {{ opcao.percentual }}%</strong>
                            </div>
                            <div class="bg-light rounded-pill" style="height: 12px">
                                <div class="rounded-pill h-100" :style="{ width: `${Math.min(100, opcao.percentual)}%`, background: 'linear-gradient(90deg,#5c6bc0,#2da0a8)' }" />
                            </div>
                        </div>
                        <ul v-if="pergunta.textos.length" class="list-group">
                            <li v-for="texto in pergunta.textos" :key="texto.valor" class="list-group-item d-flex justify-content-between">
                                <span>{{ texto.valor }}</span>
                                <strong>{{ texto.total }}</strong>
                            </li>
                        </ul>
                        <ul v-if="pergunta.numeros.length" class="list-group mt-2">
                            <li v-for="numero in pergunta.numeros" :key="numero.valor" class="list-group-item d-flex justify-content-between">
                                <span>{{ numero.valor }}</span>
                                <strong>{{ numero.total }}</strong>
                            </li>
                        </ul>
                    </div>
                </section>

                <section v-if="resultado.metodologia" class="card border-0 shadow-sm pol-panel">
                    <div class="card-body small text-muted">
                        <div v-if="resultado.metodologia.responsavel">Responsável: {{ resultado.metodologia.responsavel }}</div>
                        <div v-if="resultado.metodologia.tamanhoAmostra">Amostra informada: {{ resultado.metodologia.tamanhoAmostra }}</div>
                        <div v-if="resultado.metodologia.margemErro">Margem informada: {{ resultado.metodologia.margemErro }}</div>
                        <div v-if="resultado.metodologia.intervaloConfianca">Intervalo informado: {{ resultado.metodologia.intervaloConfianca }}</div>
                        <p v-if="resultado.metodologia.planoAmostral" class="mb-0 mt-2">{{ resultado.metodologia.planoAmostral }}</p>
                    </div>
                </section>
            </template>
        </div>
    </article>
</template>
