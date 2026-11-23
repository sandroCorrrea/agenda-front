<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RiDeleteBinLine, RiHistoryLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import CaspHistoricoDetalhe from "@/presentation/components/Casp/CaspHistoricoDetalhe.vue";
import CaspHistoricoPrevisao from "@/presentation/components/Casp/CaspHistoricoPrevisao.vue";
import { useReceitaOrcamentaria } from "@/presentation/composables/Casp/useReceitaOrcamentaria";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { useSicomHistorico } from "@/presentation/composables/Sicom/useSicomHistorico";
import type { SicomHistoricoListaItem } from "@/domain/sicom/historico";
import type { SicomRelatorioSituacao } from "@/domain/sicom/relatorio";
import {
    formatarTamanhoArquivo,
    mensagemListaVazia,
    rotuloApelido
} from "@/shared/utils/receitaOrcamentaria";
import { formatarBytes } from "@/shared/utils/sicomLabels";
import { formatarReais } from "@/shared/utils/sicomRelatorio";
import { formatarGravadoEm, rotuloSituacaoHistorico } from "@/shared/utils/sicomHistorico";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir, podeExcluir } = usePermissaoMenu("admin.casp_remessa");
const { podeVisualizar: podeVerReceitas } = usePermissaoMenu("admin.casp_receita_orcamentaria");
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
const {
    gravando,
    listando,
    consultando,
    excluindo,
    prevendo,
    lista,
    detalhe,
    previsao,
    falhaLista,
    falhaDetalhe,
    falhaGravacao,
    falhaExclusao,
    falhaPrevisao,
    avisoSubstituido,
    sucessoGravacao,
    sucessoExclusao,
    campo,
    selecionados,
    horizonte,
    municipioAtivo,
    adicionar,
    remover,
    listar,
    gravar: gravarHistorico,
    detalhar,
    excluir,
    definirMunicipio,
    definirHorizonte,
    prever
} = useSicomHistorico();

type Passo = "serie" | "gravar" | "exercicio" | "previsao";

const passo = ref<Passo>("serie");
const receitaId = ref<number | "">("");
const pendente = ref<SicomHistoricoListaItem | null>(null);
let buscaReceitasAgendada = 0;
porPagina.value = 100;

const receitaEscolhida = computed(() => receitas.value.find((item) => item.id === Number(receitaId.value)) ?? null);
const listaReceitasVazia = computed(() => !carregandoReceitas.value && receitas.value.length === 0 && !erroReceitas.value);
const grupos = computed(() => (lista.value?.status === "listado" ? lista.value.municipios : []));
const grupoAtivo = computed(() => grupos.value.find((item) => item.municipio === municipioAtivo.value) ?? null);
const previsaoVisivel = computed(() => Boolean(grupoAtivo.value && grupoAtivo.value.remessas.length > 0));
const exercicioAberto = computed(() => consultando.value || Boolean(falhaDetalhe.value) || detalhe.value?.status === "detalhado");
const subtitulo = computed(() => {
    if (passo.value === "gravar") return "Envie os ZIP e escolha o ementário já cadastrado. A série continua salva.";
    if (passo.value === "exercicio") return "Um exercício por vez. Receita, despesa e dedução ficam em abas.";
    if (passo.value === "previsao") return "Primeiro o total do município. As contas só aparecem se você pedir.";
    return "A série de um município. Abra um ano ou siga para a previsão.";
});

watch(gravando, (agora, antes) => {
    if (antes && !agora && !falhaGravacao.value && !campo.value) passo.value = "serie";
});

watch(previsaoVisivel, (pode) => {
    if (!pode && passo.value === "previsao") passo.value = "serie";
});

onMounted(() => {
    void listar();
});

onBeforeUnmount(() => window.clearTimeout(buscaReceitasAgendada));

function agendarBuscaReceitas() {
    window.clearTimeout(buscaReceitasAgendada);
    buscaReceitasAgendada = window.setTimeout(() => {
        void carregarReceitas(1);
    }, 400);
}

function abrirGravar() {
    passo.value = "gravar";
    if (podeVerReceitas.value && receitas.value.length === 0) void carregarReceitas(1);
}

function abrirAno(item: SicomHistoricoListaItem) {
    if (item.id == null) return;
    passo.value = "exercicio";
    if (detalhe.value?.id === item.id && detalhe.value.status === "detalhado") return;
    void detalhar(item.id);
}

function abrirPrevisao() {
    if (!previsaoVisivel.value) return;
    passo.value = "previsao";
    if (!previsao.value && !prevendo.value) void prever();
}

function aoAdicionar(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    adicionar(entrada.files);
    entrada.value = "";
}

async function gravar() {
    if (gravando.value) return;
    await gravarHistorico(receitaEscolhida.value);
}

function pedirExclusao(item: SicomHistoricoListaItem) {
    if (item.id == null) return;
    pendente.value = item;
}

async function confirmarExclusao() {
    const item = pendente.value;
    if (!item || item.id == null || excluindo.value) return;
    pendente.value = null;
    const eraEste = detalhe.value?.id === item.id;
    await excluir(item.id);
    if (eraEste) passo.value = "serie";
}

function tomAno(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "hist-ano--deficit";
    if (situacao === "superavit") return "hist-ano--superavit";
    if (situacao === "equilibrado") return "hist-ano--equilibrado";
    return "";
}

function classeValor(situacao: SicomRelatorioSituacao | null): string {
    if (situacao === "deficit") return "hist-valor--deficit";
    if (situacao === "superavit") return "hist-valor--superavit";
    if (situacao === "equilibrado") return "hist-valor--equilibrado";
    return "";
}
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero title="Histórico CASP" :subtitle="subtitulo">
                <template #icon><RiHistoryLine /></template>
                <template #actions>
                    <RouterLink class="btn pol-btn" :to="{ name: 'AdministradorCaspRemessa' }">Remessa</RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="falhaLista" class="pol-alert pol-alert--erro mb-3">{{ falhaLista }}</div>

            <nav class="pol-steps" aria-label="Leitura do histórico">
                <button type="button" :class="{ 'is-on': passo === 'serie' }" @click="passo = 'serie'">
                    <span>1</span>
                    Série
                </button>
                <button v-if="podeInserir" type="button" :class="{ 'is-on': passo === 'gravar' }" :disabled="gravando" @click="abrirGravar">
                    <span>2</span>
                    Gravar
                </button>
                <button type="button" :class="{ 'is-on': passo === 'exercicio' }" :disabled="!exercicioAberto" @click="passo = 'exercicio'">
                    <span>{{ podeInserir ? 3 : 2 }}</span>
                    Exercício
                </button>
                <button type="button" :class="{ 'is-on': passo === 'previsao' }" :disabled="!previsaoVisivel" @click="abrirPrevisao">
                    <span>{{ podeInserir ? 4 : 3 }}</span>
                    Previsão
                </button>
            </nav>

            <template v-if="passo === 'serie'">
                <div v-for="(frase, indice) in sucessoGravacao" :key="`ok-${indice}`" class="pol-alert pol-alert--ok mb-2">{{ frase }}</div>
                <div v-for="(frase, indice) in avisoSubstituido" :key="`sub-${indice}`" class="pol-alert pol-alert--aviso mb-2">{{ frase }}</div>
                <div v-if="sucessoExclusao" class="pol-alert pol-alert--ok mb-3">{{ sucessoExclusao }}</div>
                <div v-if="falhaExclusao" class="pol-alert pol-alert--erro mb-3">{{ falhaExclusao }}</div>

                <section class="card border-0 shadow-sm pol-panel">
                    <div class="card-body">
                        <h2 class="h5 mb-2">Exercícios gravados</h2>
                        <p class="text-muted mb-3">Um município por vez. O cartão abre as contas daquele ano. A previsão usa só esta série.</p>

                        <p v-if="listando && grupos.length === 0" class="text-muted mb-0">Carregando instrumentos…</p>
                        <div v-else-if="lista?.status === 'listado' && grupos.length === 0" class="hist-vazio">
                            <p class="mb-3">Nenhum instrumento gravado. Adicione os ZIP dos exercícios.</p>
                            <button v-if="podeInserir" class="btn pol-btn" type="button" @click="abrirGravar">Gravar instrumentos</button>
                        </div>
                        <template v-else>
                            <div v-if="grupos.length > 1" class="hist-abas mb-3" role="tablist" aria-label="Município">
                                <button
                                    v-for="grupo in grupos"
                                    :key="grupo.municipio ?? ''"
                                    type="button"
                                    :class="{ 'is-on': grupo.municipio === municipioAtivo }"
                                    @click="grupo.municipio && definirMunicipio(grupo.municipio)"
                                >
                                    {{ grupo.municipio }}
                                </button>
                            </div>
                            <p v-else-if="grupoAtivo" class="mb-3">Município <strong>{{ grupoAtivo.municipio }}</strong></p>
                            <p v-if="grupos.length > 1 && !grupoAtivo" class="mb-0">Escolha o município para ver os anos e a previsão.</p>
                            <template v-else-if="grupoAtivo">
                                <div class="hist-anos">
                                    <article v-for="item in grupoAtivo.remessas" :key="item.id ?? item.exercicio ?? 0" class="hist-ano" :class="tomAno(item.situacao)">
                                        <button type="button" class="hist-ano__abrir" :disabled="item.id == null" @click="abrirAno(item)">
                                            <span class="hist-ano__topo">
                                                <strong>{{ item.exercicio ?? "—" }}</strong>
                                                <em>{{ rotuloSituacaoHistorico(item.situacao) }}</em>
                                            </span>
                                            <span>{{ item.arquivo || "—" }}</span>
                                            <span>Receita líquida <b>{{ formatarReais(item.receitaLiquida) }}</b></span>
                                            <span>Despesa fixada <b>{{ formatarReais(item.despesaFixada) }}</b></span>
                                            <span>Resultado <b :class="classeValor(item.situacao)">{{ formatarReais(item.resultado, true) }}</b></span>
                                            <small>{{ formatarGravadoEm(item.gravadoEm) }}</small>
                                        </button>
                                        <button v-if="podeExcluir" class="btn pol-btn--danger" type="button" :disabled="excluindo" @click="pedirExclusao(item)">
                                            Excluir
                                        </button>
                                    </article>
                                </div>
                                <div class="d-flex flex-wrap gap-2 mt-4">
                                    <button class="btn pol-btn" type="button" @click="abrirPrevisao">Ver previsão</button>
                                    <button v-if="podeInserir" class="btn pol-btn--ghost" type="button" @click="abrirGravar">Gravar outro exercício</button>
                                </div>
                            </template>
                        </template>
                    </div>
                </section>
            </template>

            <section v-else-if="passo === 'gravar'" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <h2 class="h5 mb-2">Gravar instrumentos</h2>
                    <p class="text-muted mb-3">Um exercício já gravado para o mesmo município é substituído pelos números deste envio.</p>
                    <div v-if="falhaGravacao" class="pol-alert pol-alert--erro mb-3">{{ falhaGravacao }}</div>

                    <div class="hist-gravar__bloco">
                        <h3 class="h6 mb-2">Arquivos ZIP</h3>
                        <label class="btn pol-btn" :class="{ disabled: gravando }">
                            Adicionar instrumentos
                            <input class="d-none" type="file" accept=".zip" multiple :disabled="gravando" @change="aoAdicionar" />
                        </label>
                        <ul v-if="selecionados.length" class="hist-arquivos">
                            <li v-for="(arquivo, indice) in selecionados" :key="`${arquivo.name}-${indice}`">
                                <span>{{ arquivo.name }} · {{ formatarBytes(arquivo.size) }}</span>
                                <button
                                    type="button"
                                    class="btn btn-sm pol-btn--danger"
                                    :disabled="gravando"
                                    :aria-label="`Remover ${arquivo.name} da seleção`"
                                    @click="remover(indice)"
                                >
                                    <RiDeleteBinLine />
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div class="hist-gravar__bloco">
                        <h3 class="h6 mb-1">Ementário</h3>
                        <p class="text-muted small mb-3">Use a receita orçamentária já enviada. A busca e a lista ficam neste bloco.</p>
                    <label class="form-label" for="historico-busca-ementario">Buscar receita orçamentária</label>
                    <div class="pol-search mb-3">
                        <RiSearchLine />
                        <input
                            id="historico-busca-ementario"
                            v-model="buscaReceita"
                            type="search"
                            maxlength="160"
                            placeholder="Apelido ou nome do arquivo"
                            :disabled="carregandoReceitas || gravando || !podeVerReceitas"
                            @input="agendarBuscaReceitas"
                        />
                    </div>
                    <label class="form-label" for="historico-ementario">Ementário</label>
                    <p v-if="carregandoReceitas" class="text-muted small">Carregando receitas orçamentárias…</p>
                    <select id="historico-ementario" v-model="receitaId" class="form-select" :disabled="carregandoReceitas || gravando || !podeVerReceitas">
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
                    </div>
                    <p v-if="campo" class="text-danger small mb-0 mt-3">{{ campo }}</p>
                    <div class="d-flex flex-wrap gap-2 mt-3">
                        <button class="btn pol-btn" type="button" :disabled="gravando || selecionados.length === 0 || !receitaEscolhida" @click="gravar">
                            {{ gravando ? "Gravando instrumentos…" : "Gravar instrumentos" }}
                        </button>
                        <button class="btn pol-btn--ghost" type="button" :disabled="gravando" @click="passo = 'serie'">Voltar para a série</button>
                    </div>
                </div>
            </section>

            <template v-else-if="passo === 'exercicio'">
                <p v-if="consultando" class="mb-3">Consultando o exercício…</p>
                <div v-if="falhaDetalhe" class="pol-alert pol-alert--erro mb-3">{{ falhaDetalhe }}</div>
                <CaspHistoricoDetalhe v-if="detalhe?.status === 'detalhado'" :detalhe="detalhe" />
                <button class="btn pol-btn--ghost mt-3" type="button" @click="passo = 'serie'">Voltar para a série</button>
            </template>

            <template v-else>
                <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
                    <div>
                        <h2 class="h5 mb-1">Previsão do município {{ municipioAtivo }}</h2>
                        <p class="text-muted small mb-0">Exercícios à frente contam a partir do último ano gravado.</p>
                    </div>
                    <div class="hist-abas" role="group" aria-label="Exercícios à frente">
                        <button type="button" :class="{ 'is-on': horizonte === 1 }" :disabled="prevendo" @click="definirHorizonte(1)">1 ano</button>
                        <button type="button" :class="{ 'is-on': horizonte === 2 }" :disabled="prevendo" @click="definirHorizonte(2)">2 anos</button>
                        <button type="button" :class="{ 'is-on': horizonte === 3 }" :disabled="prevendo" @click="definirHorizonte(3)">3 anos</button>
                    </div>
                </div>
                <p v-if="prevendo">Gerando a previsão…</p>
                <div v-else-if="falhaPrevisao" class="pol-alert pol-alert--erro">{{ falhaPrevisao }}</div>
                <div v-else-if="previsao?.status === 'erro'" class="pol-alert pol-alert--aviso">{{ previsao.mensagem }}</div>
                <CaspHistoricoPrevisao v-else-if="previsao?.status === 'previsto'" :resposta="previsao" :horizonte="horizonte" />
                <button class="btn pol-btn--ghost mt-3" type="button" @click="passo = 'serie'">Voltar para a série</button>
            </template>
        </div>

        <div v-if="pendente" class="pol-modal">
            <div class="pol-modal__backdrop" @click="pendente = null" />
            <div class="pol-modal__panel" role="dialog" aria-modal="true" aria-labelledby="historico-excluir-titulo">
                <h2 id="historico-excluir-titulo" class="h5">Excluir instrumento</h2>
                <p>Excluir o instrumento de {{ pendente.exercicio }} do município {{ pendente.municipio }}? A previsão deixa de usar esse ano.</p>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="pendente = null">Cancelar</button>
                    <button class="btn pol-btn--danger" type="button" :disabled="excluindo" @click="confirmarExclusao">Excluir</button>
                </div>
            </div>
        </div>
    </article>
</template>

<style scoped>
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

.hist-anos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.75rem;
}

.hist-ano {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    justify-content: space-between;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 16px;
    background: #fff;
    padding: 1rem;
}

.hist-ano--deficit {
    background: #fff6f6;
}

.hist-ano--superavit {
    background: #f4f7ff;
}

.hist-ano--equilibrado {
    background: #f3faf6;
}

.hist-ano__abrir {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: flex-start;
    width: 100%;
    border: 0;
    background: transparent;
    padding: 0;
    color: #1a2d4e;
    text-align: left;
}

.hist-ano__abrir:focus-visible {
    outline: 2px solid #2da0a8;
    outline-offset: 3px;
}

.hist-ano__topo {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.hist-ano__topo strong {
    font-size: 1.35rem;
}

.hist-ano__topo em {
    font-style: normal;
    font-size: 0.78rem;
    font-weight: 700;
}

.hist-ano small,
.hist-ano__abrir > span {
    color: #5d6e8f;
    font-size: 0.86rem;
}

.hist-ano b {
    color: #1a2d4e;
    font-weight: 700;
}

.hist-valor--deficit {
    color: #9e2b2b !important;
}

.hist-valor--superavit {
    color: #1e4fa8 !important;
}

.hist-valor--equilibrado {
    color: #1d6d3f !important;
}

.hist-gravar__bloco + .hist-gravar__bloco {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(22, 37, 78, 0.08);
}

.hist-arquivos {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0 0;
    padding: 0;
}

.hist-arquivos li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 0.85rem;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 12px;
    background: #f8fafc;
}

.hist-arquivos .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border-radius: 12px;
}
</style>
