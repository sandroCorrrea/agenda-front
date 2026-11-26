<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RiDeleteBinLine, RiHistoryLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useReceitaOrcamentaria } from "@/presentation/composables/Casp/useReceitaOrcamentaria";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { useSicomHistorico } from "@/presentation/composables/Sicom/useSicomHistorico";
import {
    formatarTamanhoArquivo,
    mensagemListaVazia,
    rotuloApelido
} from "@/shared/utils/receitaOrcamentaria";
import { formatarBytes } from "@/shared/utils/sicomLabels";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir } = usePermissaoMenu("admin.casp_remessa");
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
    falhaGravacao,
    avisoSubstituido,
    sucessoGravacao,
    campo,
    selecionados,
    adicionar,
    remover,
    gravar: gravarHistorico
} = useSicomHistorico();

const receitaId = ref<number | "">("");
let buscaReceitasAgendada = 0;
porPagina.value = 100;

const receitaEscolhida = computed(() => receitas.value.find((item) => item.id === Number(receitaId.value)) ?? null);
const listaReceitasVazia = computed(() => !carregandoReceitas.value && receitas.value.length === 0 && !erroReceitas.value);

onMounted(() => {
    if (podeInserir.value && podeVerReceitas.value) void carregarReceitas(1);
});

onBeforeUnmount(() => window.clearTimeout(buscaReceitasAgendada));

function agendarBuscaReceitas() {
    window.clearTimeout(buscaReceitasAgendada);
    buscaReceitasAgendada = window.setTimeout(() => {
        void carregarReceitas(1);
    }, 400);
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
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Enviar Remessa"
                subtitle="Envie os ZIP e escolha o ementário já cadastrado. A consulta e a exclusão ficam na lista do município."
            >
                <template #icon><RiHistoryLine /></template>
                <template #actions>
                    <RouterLink class="btn pol-btn" :to="{ name: 'AdministradorCaspRemessa' }">Remessa</RouterLink>
                </template>
            </AdminPageHero>

            <section v-if="podeInserir" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <div v-for="(frase, indice) in sucessoGravacao" :key="`ok-${indice}`" class="pol-alert pol-alert--ok mb-2">{{ frase }}</div>
                    <div v-for="(frase, indice) in avisoSubstituido" :key="`sub-${indice}`" class="pol-alert pol-alert--aviso mb-2">{{ frase }}</div>
                    <p v-if="sucessoGravacao.length || avisoSubstituido.length" class="mb-3">
                        <RouterLink :to="{ name: 'AdministradorCaspRemessa' }">Ver na lista de remessas</RouterLink>
                    </p>

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
                    </div>
                </div>
            </section>

            <section v-else class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <p class="mb-3">Você não tem permissão para enviar remessas.</p>
                    <RouterLink class="btn pol-btn" :to="{ name: 'AdministradorCaspRemessa' }">Voltar para a lista</RouterLink>
                </div>
            </section>
        </div>
    </article>
</template>

<style scoped>
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
