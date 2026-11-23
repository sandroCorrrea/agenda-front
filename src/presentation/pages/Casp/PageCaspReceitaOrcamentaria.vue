<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { RiArrowDownSLine, RiArrowUpSLine, RiDownload2Line, RiFileExcel2Line, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { useReceitaOrcamentaria } from "@/presentation/composables/Casp/useReceitaOrcamentaria";
import type { ReceitaOrcamentariaArquivo } from "@/domain/casp/receitaOrcamentaria";
import {
    celulaPrevia,
    formatarEnviadoEm,
    formatarTamanhoArquivo,
    mensagemListaVazia,
    rotuloApelido,
    rotuloSituacao,
    textoQuantidade
} from "@/shared/utils/receitaOrcamentaria";
import "@/presentation/assets/styles/politica-admin.css";

const { podeVisualizar, podeInserir } = usePermissaoMenu("admin.casp_receita_orcamentaria");
const {
    arquivos,
    carregando,
    enviando,
    progresso,
    baixandoId,
    erro,
    erroEnvio,
    sucesso,
    campos,
    q,
    buscaAtiva,
    pagina,
    total,
    totalPaginas,
    carregar,
    enviar,
    baixar
} = useReceitaOrcamentaria();

const arquivo = ref<File | null>(null);
const apelido = ref("");
const arquivoInput = ref<HTMLInputElement | null>(null);
const abertos = ref<number[]>([]);
let buscaAgendada = 0;

watch(
    podeVisualizar,
    (pode) => {
        if (pode) void carregar(1);
    },
    { immediate: true }
);

watch(arquivos, (lista) => {
    const ids = new Set(lista.map((item) => item.id));
    abertos.value = abertos.value.filter((id) => ids.has(id));
});

onBeforeUnmount(() => window.clearTimeout(buscaAgendada));

function aoEscolherArquivo(evento: Event) {
    arquivo.value = (evento.target as HTMLInputElement).files?.[0] ?? null;
    if (!campos.value.arquivo) return;
    campos.value = { ...campos.value, arquivo: "" };
}

function aoDigitarApelido() {
    if (!campos.value.apelido) return;
    campos.value = { ...campos.value, apelido: "" };
}

function agendarBusca() {
    window.clearTimeout(buscaAgendada);
    buscaAgendada = window.setTimeout(() => {
        void carregar(1);
    }, 400);
}

function buscar() {
    window.clearTimeout(buscaAgendada);
    void carregar(1);
}

async function submeter() {
    if (enviando.value) return;
    const ok = await enviar(arquivo.value, apelido.value);
    if (!ok) return;
    arquivo.value = null;
    apelido.value = "";
    if (arquivoInput.value) arquivoInput.value.value = "";
}

function alternar(id: number) {
    abertos.value = abertos.value.includes(id) ? abertos.value.filter((item) => item !== id) : [...abertos.value, id];
}

function aberto(item: ReceitaOrcamentariaArquivo) {
    return abertos.value.includes(item.id);
}
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Receita Orçamentária"
                subtitle="Envie a planilha .xlsx e consulte os arquivos já tratados."
            >
                <template #icon><RiFileExcel2Line /></template>
            </AdminPageHero>

            <form v-if="podeInserir" class="card border-0 shadow-sm pol-panel mb-4" @submit.prevent="submeter">
                <div class="card-body">
                    <h2 class="h5 mb-3">Enviar planilha</h2>
                    <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
                    <div v-if="erroEnvio" class="pol-alert pol-alert--erro mb-3">{{ erroEnvio }}</div>
                    <div class="row g-3">
                        <div class="col-md-7">
                            <label class="form-label" for="casp-receita-arquivo">Planilha .xlsx</label>
                            <input
                                id="casp-receita-arquivo"
                                ref="arquivoInput"
                                class="form-control"
                                type="file"
                                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                :disabled="enviando"
                                @change="aoEscolherArquivo"
                            />
                            <p v-if="arquivo" class="form-text mb-0">{{ arquivo.name }} · {{ formatarTamanhoArquivo(arquivo.size) }}</p>
                            <p v-if="campos.arquivo" class="text-danger small mb-0">{{ campos.arquivo }}</p>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label" for="casp-receita-apelido">Apelido (opcional)</label>
                            <input
                                id="casp-receita-apelido"
                                v-model="apelido"
                                class="form-control"
                                type="text"
                                maxlength="120"
                                placeholder="Ex.: Março 2026"
                                :disabled="enviando"
                                @input="aoDigitarApelido"
                            />
                            <p v-if="campos.apelido" class="text-danger small mb-0">{{ campos.apelido }}</p>
                        </div>
                    </div>
                    <button class="btn pol-btn mt-3" type="submit" :disabled="!arquivo || enviando">
                        {{ enviando ? "Enviando…" : "Enviar planilha" }}
                    </button>
                    <div
                        v-if="enviando"
                        class="progress mt-3"
                        role="progressbar"
                        :aria-valuenow="progresso ?? undefined"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        :aria-valuetext="progresso == null ? 'Enviando planilha' : `${progresso}%`"
                    >
                        <div
                            class="progress-bar"
                            :class="{ 'progress-bar-striped progress-bar-animated': progresso == null }"
                            :style="{ width: progresso == null ? '100%' : `${progresso}%` }"
                        >
                            {{ progresso == null ? "Enviando…" : `${progresso}%` }}
                        </div>
                    </div>
                </div>
            </form>

            <section v-if="podeVisualizar" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <div v-if="erro" class="pol-alert pol-alert--erro mb-3">{{ erro }}</div>
                    <form class="mb-3" @submit.prevent="buscar">
                        <div class="pol-search">
                            <RiSearchLine />
                            <input
                                v-model="q"
                                class="form-control"
                                type="search"
                                maxlength="160"
                                placeholder="Buscar por apelido ou nome do arquivo"
                                aria-label="Buscar receita orçamentária"
                                @input="agendarBusca"
                                @search="buscar"
                            />
                        </div>
                    </form>

                    <p v-if="carregando" class="text-muted mb-0">Carregando receitas orçamentárias…</p>
                    <div v-else-if="arquivos.length > 0 || !erro" class="table-responsive">
                        <table class="table pol-table mb-0">
                            <thead>
                                <tr>
                                    <th>Apelido</th>
                                    <th>Arquivo</th>
                                    <th>Tamanho</th>
                                    <th>Abas</th>
                                    <th>Linhas</th>
                                    <th>Situação</th>
                                    <th>Enviado em</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="item in arquivos" :key="item.id">
                                    <tr>
                                        <td>{{ rotuloApelido(item.apelido) }}</td>
                                        <td>{{ item.nomeOriginal }}</td>
                                        <td>{{ formatarTamanhoArquivo(item.tamanhoBytes) }}</td>
                                        <td>{{ item.quantidadeAbas }}</td>
                                        <td>{{ item.quantidadeLinhas }}</td>
                                        <td>
                                            <span class="pol-badge" :class="item.situacao === 'processado' ? 'pol-badge--on' : 'pol-badge--wait'">
                                                {{ rotuloSituacao(item.situacao) }}
                                            </span>
                                        </td>
                                        <td>{{ formatarEnviadoEm(item.criadoEm) }}</td>
                                        <td class="text-nowrap">
                                            <button
                                                class="btn btn-sm pol-btn--ghost me-1 d-inline-flex align-items-center gap-1"
                                                type="button"
                                                :aria-expanded="aberto(item)"
                                                @click="alternar(item.id)"
                                            >
                                                <RiArrowUpSLine v-if="aberto(item)" />
                                                <RiArrowDownSLine v-else />
                                                {{ aberto(item) ? "Ocultar abas" : "Ver abas" }}
                                            </button>
                                            <button
                                                class="btn btn-sm pol-btn d-inline-flex align-items-center gap-1"
                                                type="button"
                                                :disabled="baixandoId === item.id"
                                                @click="baixar(item)"
                                            >
                                                <RiDownload2Line />
                                                {{ baixandoId === item.id ? "Baixando…" : "Baixar" }}
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="aberto(item)">
                                        <td colspan="8">
                                            <div v-if="item.tratamento.abas.length" class="receita-abas">
                                                <article
                                                    v-for="(aba, indice) in item.tratamento.abas"
                                                    :key="`${item.id}-${aba.nome}-${indice}`"
                                                    class="receita-aba"
                                                >
                                                    <p class="receita-aba__nome mb-1">{{ aba.nome || "Aba sem nome" }}</p>
                                                    <p class="text-muted small mb-2">
                                                        {{ textoQuantidade(aba.linhas, "linha", "linhas") }}
                                                        ·
                                                        {{ textoQuantidade(aba.colunas, "coluna", "colunas") }}
                                                    </p>
                                                    <div v-if="aba.primeiraLinha.length" class="receita-previa">
                                                        <span v-for="(celula, celulaIndice) in aba.primeiraLinha" :key="celulaIndice">
                                                            {{ celulaPrevia(celula) }}
                                                        </span>
                                                    </div>
                                                    <p v-else class="text-muted mb-0">—</p>
                                                </article>
                                            </div>
                                            <p v-else class="text-muted mb-0">Nenhuma aba informada.</p>
                                        </td>
                                    </tr>
                                </template>
                                <tr v-if="arquivos.length === 0 && !erro">
                                    <td colspan="8" class="text-center text-muted py-4">{{ mensagemListaVazia(buscaAtiva) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
                </div>
            </section>
        </div>
    </article>
</template>

<style scoped>
.receita-abas {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.receita-aba {
    background: #f7f9fc;
    border-radius: 12px;
    padding: 0.75rem 0.9rem;
}

.receita-aba__nome {
    font-weight: 700;
    color: #1a2d4e;
}

.receita-previa {
    display: flex;
    gap: 0.4rem;
    overflow-x: auto;
}

.receita-previa span {
    flex: 0 0 auto;
    background: #fff;
    border: 1px solid rgba(22, 37, 78, 0.08);
    border-radius: 8px;
    padding: 0.25rem 0.55rem;
    font-size: 0.82rem;
    color: #1a2d4e;
}
</style>
