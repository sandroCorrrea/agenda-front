<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiEyeLine,
    RiLinkM,
    RiSearchLine,
    RiSpeakLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import ParticipacaoFormularioLinkCard from "@/presentation/components/Participacao/ParticipacaoFormularioLinkCard.vue";
import ParticipacaoStatusBadge from "@/presentation/components/Participacao/ParticipacaoStatusBadge.vue";
import { useParticipacaoAdmin } from "@/presentation/composables/Participacao/useParticipacaoAdmin";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import {
    labelDeOpcao,
    STATUS_PARTICIPACAO_LABELS
} from "@/shared/utils/participacaoLabels";

const auth = useAuthStore();
const ehPrefeitura = computed(() => auth.ehPrefeitura);
const ehContabilidade = computed(() => auth.ehContabilidade);

const {
    opcoes,
    itens,
    filtros,
    carregandoLista,
    erro,
    paginaAtual,
    totalRegistros,
    totalPaginas,
    carregarOpcoes,
    carregarLista,
    irParaPagina,
    limparFiltros
} = useParticipacaoAdmin();

const temFiltrosAtivos = computed(() =>
    Boolean(
        String(filtros.exercicio).trim() ||
            filtros.instrumento ||
            filtros.status ||
            filtros.prioridade ||
            filtros.localidade_atendida ||
            filtros.participacao_funcao_id ||
            filtros.ibge.trim()
    )
);

async function aplicarFiltros() {
    try {
        await carregarLista(1);
    } catch {
        /* erro já no estado */
    }
}

async function aoLimparFiltros() {
    limparFiltros();
    try {
        await carregarLista(1);
    } catch {
        /* erro já no estado */
    }
}

onMounted(async () => {
    await carregarOpcoes();
    try {
        await carregarLista(1);
    } catch {
        return;
    }
});
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Participação popular"
                :subtitle="
                    ehPrefeitura
                        ? 'Contribuições do seu município recebidas pelo link exclusivo do formulário público.'
                        : 'Contribuições cidadãs recebidas pelo formulário público de elaboração orçamentária (LOA/LDO/PPA). Análise técnica disponível no detalhe de cada protocolo.'
                "
            >
                <template #icon><RiSpeakLine /></template>
                <template v-if="ehPrefeitura" #actions>
                    <RouterLink
                        :to="{ name: 'AdministradorParticipacaoLink' }"
                        class="btn"
                    >
                        <RiLinkM class="me-1" />
                        Link do formulário
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="ehPrefeitura" class="mb-4">
                <ParticipacaoFormularioLinkCard compacto />
            </div>

            <div v-if="erro" class="admin-alert admin-alert--erro mb-3">{{ erro }}</div>

            <section class="card border-0 shadow-sm part-filters mb-4">
                <div class="card-body p-3 p-md-4">
                    <div class="part-filters__head">
                        <h2 class="part-filters__title">Filtros de busca</h2>
                        <span v-if="temFiltrosAtivos" class="part-filters__active">filtros ativos</span>
                    </div>

                    <form class="row g-3" @submit.prevent="aplicarFiltros">
                        <div class="col-6 col-lg-3">
                            <label class="form-label" for="f-exercicio">Exercício</label>
                            <input
                                id="f-exercicio"
                                v-model="filtros.exercicio"
                                type="number"
                                min="2000"
                                max="2100"
                                class="form-control"
                                placeholder="2027"
                            />
                            <small class="part-filter-hint">Ano do instrumento orçamentário</small>
                        </div>

                        <div class="col-6 col-lg-3">
                            <label class="form-label" for="f-instrumento">Instrumento</label>
                            <select id="f-instrumento" v-model="filtros.instrumento" class="form-select">
                                <option value="">Todos</option>
                                <option value="LOA">LOA</option>
                                <option value="LDO">LDO</option>
                                <option value="PPA">PPA</option>
                            </select>
                        </div>

                        <div class="col-6 col-lg-3">
                            <label class="form-label" for="f-status">Status</label>
                            <select id="f-status" v-model="filtros.status" class="form-select">
                                <option value="">Todos</option>
                                <option
                                    v-for="(label, value) in STATUS_PARTICIPACAO_LABELS"
                                    :key="value"
                                    :value="value"
                                >
                                    {{ label }}
                                </option>
                            </select>
                        </div>

                        <div class="col-6 col-lg-3">
                            <label class="form-label" for="f-prio">Prioridade</label>
                            <select id="f-prio" v-model="filtros.prioridade" class="form-select">
                                <option value="">Todas</option>
                                <option
                                    v-for="o in opcoes?.prioridade ?? []"
                                    :key="o.value"
                                    :value="o.value"
                                >
                                    {{ o.label }}
                                </option>
                            </select>
                        </div>

                        <div class="w-100" aria-hidden="true" />

                        <div class="col-12 col-md-6 col-lg-4">
                            <label class="form-label" for="f-loc">Localidade atendida</label>
                            <select
                                id="f-loc"
                                v-model="filtros.localidade_atendida"
                                class="form-select"
                            >
                                <option value="">Todas</option>
                                <option
                                    v-for="o in opcoes?.localidadeAtendida ?? []"
                                    :key="o.value"
                                    :value="o.value"
                                >
                                    {{ o.label }}
                                </option>
                            </select>
                            <small class="part-filter-hint">Regionalização da demanda</small>
                        </div>

                        <div class="col-12 col-md-6 col-lg-4">
                            <label class="form-label" for="f-funcao">Área temática</label>
                            <select
                                id="f-funcao"
                                v-model="filtros.participacao_funcao_id"
                                class="form-select"
                            >
                                <option value="">Todas</option>
                                <option
                                    v-for="f in opcoes?.funcao ?? []"
                                    :key="f.id"
                                    :value="String(f.id)"
                                >
                                    {{ f.codigo }} — {{ f.nome }}
                                </option>
                            </select>
                            <small class="part-filter-hint">Função pública (Portaria MOG 42/1999)</small>
                        </div>

                        <div v-if="ehContabilidade" class="col-6 col-lg-3">
                            <label class="form-label" for="f-ibge">IBGE (município)</label>
                            <input
                                id="f-ibge"
                                v-model="filtros.ibge"
                                type="text"
                                maxlength="7"
                                inputmode="numeric"
                                class="form-control"
                                placeholder="3550308"
                            />
                            <small class="part-filter-hint">7 dígitos — filtro opcional</small>
                        </div>

                        <div class="col-12 col-lg-4">
                            <label class="form-label part-filter-actions-label" aria-hidden="true">&nbsp;</label>
                            <div class="part-filters__acoes">
                                <button
                                    v-if="temFiltrosAtivos"
                                    type="button"
                                    class="btn part-filter-btn part-filter-btn--ghost"
                                    @click="aoLimparFiltros"
                                >
                                    Limpar
                                </button>
                                <button
                                    class="btn part-filter-btn"
                                    type="submit"
                                    :disabled="carregandoLista"
                                >
                                    <RiSearchLine class="me-1" />
                                    Filtrar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            <section class="card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <h2 class="part-subtitle mb-0">Listagem</h2>
                        <small class="text-muted">{{ totalRegistros }} registro(s)</small>
                    </div>

                    <div v-if="carregandoLista" class="text-muted py-4">Carregando contribuições...</div>

                    <div v-else-if="itens.length === 0" class="text-center py-5 text-muted">
                        Nenhuma contribuição encontrada com os filtros atuais.
                    </div>

                    <div v-else class="table-responsive">
                        <table class="table align-middle part-table mb-0">
                            <thead>
                                <tr>
                                    <th>Protocolo</th>
                                    <th v-if="ehContabilidade">IBGE</th>
                                    <th>Localidade</th>
                                    <th>Área</th>
                                    <th>Prioridade</th>
                                    <th>Status</th>
                                    <th class="part-actions-head">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in itens" :key="item.id">
                                    <td>
                                        <strong>#{{ item.id }}</strong>
                                        <div class="text-muted small">
                                            {{ item.instrumento }} {{ item.exercicio }}
                                        </div>
                                    </td>
                                    <td v-if="ehContabilidade">
                                        <code v-if="item.ibge" class="part-ibge">{{ item.ibge }}</code>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td>
                                        {{ item.bairroComunidade }}
                                        <div class="text-muted small">
                                            {{
                                                labelDeOpcao(
                                                    opcoes?.localidadeAtendida,
                                                    item.localidadeAtendida
                                                )
                                            }}
                                        </div>
                                    </td>
                                    <td>
                                        <span v-if="item.funcao">
                                            {{ item.funcao.codigo }} — {{ item.funcao.nome }}
                                        </span>
                                        <span v-else>—</span>
                                    </td>
                                    <td>
                                        {{
                                            labelDeOpcao(opcoes?.prioridade, item.prioridade)
                                        }}
                                    </td>
                                    <td>
                                        <ParticipacaoStatusBadge :status="item.status" />
                                    </td>
                                    <td class="part-actions-cell">
                                        <RouterLink
                                            class="part-action-btn part-action-btn--view"
                                            :to="{
                                                name: 'AdministradorParticipacaoDetalhe',
                                                params: { id: item.id }
                                            }"
                                            title="Ver detalhes"
                                            aria-label="Ver detalhes"
                                        >
                                            <RiEyeLine />
                                        </RouterLink>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div
                        v-if="totalPaginas > 1"
                        class="part-pag mt-4"
                    >
                        <button
                            type="button"
                            class="btn part-pag__nav"
                            :disabled="paginaAtual <= 1 || carregandoLista"
                            @click="irParaPagina(paginaAtual - 1)"
                        >
                            <RiArrowLeftSLine /> Anterior
                        </button>
                        <span class="text-muted small">
                            Página {{ paginaAtual }} de {{ totalPaginas }}
                        </span>
                        <button
                            type="button"
                            class="btn part-pag__nav"
                            :disabled="paginaAtual >= totalPaginas || carregandoLista"
                            @click="irParaPagina(paginaAtual + 1)"
                        >
                            Próxima <RiArrowRightSLine />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    </article>
</template>

<style scoped>
.part-subtitle {
    font-size: 1.2rem;
    font-weight: 800;
    color: #16254e;
}

.part-filters {
    --part-filter-control-h: calc(1.5em + 0.75rem + 2px);
}

.part-filters__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.part-filters__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: #16254e;
}

.part-filters__active {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #2d6a9f;
    background: #eef3ff;
    border: 1px solid #d8e2ff;
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
}

.part-filter-hint {
    display: block;
    margin-top: 0.35rem;
    font-size: 0.75rem;
    color: #6b7d9c;
    line-height: 1.35;
}

.part-filters__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
    width: 100%;
    height: var(--part-filter-control-h);
    align-items: stretch;
}

.part-filter-actions-label {
    visibility: hidden;
    user-select: none;
}

.part-filter-btn {
    border: none;
    background: linear-gradient(90deg, #5c6bc0, #2da0a8);
    color: #fff;
    border-radius: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--part-filter-control-h);
    height: 100%;
    padding: 0.375rem 1rem;
    flex: 1;
}

.part-filter-btn--ghost {
    background: #fff;
    color: #3f5284;
    border: 1px solid rgba(92, 107, 192, 0.28);
}

.part-filter-btn--ghost:hover {
    background: #f4f7ff;
}

.part-filter-btn:disabled {
    opacity: 0.65;
}

.part-table th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #5a6b7d;
    white-space: nowrap;
}

.part-ibge {
    font-size: 0.78rem;
    padding: 0.1rem 0.35rem;
    border-radius: 6px;
    background: #eef4fb;
    color: #2b4068;
}

.part-actions-head,
.part-actions-cell {
    width: 1%;
    white-space: nowrap;
    text-align: right;
    vertical-align: middle;
}

.part-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border-radius: 8px;
    border: 1px solid #e8edf4;
    background: #fff;
    color: #5c6b8a;
    text-decoration: none;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        color 0.15s ease;
}

.part-action-btn svg {
    width: 1.05rem;
    height: 1.05rem;
}

.part-action-btn--view:hover {
    background: #eef3ff;
    border-color: #d8e2ff;
    color: #2d4d8f;
}

.part-pag {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
}

.part-pag__nav {
    border: 1px solid rgba(92, 107, 192, 0.3);
    border-radius: 10px;
    color: #3f5284;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.part-pag__nav:hover:not(:disabled) {
    background: #f4f7ff;
}

.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
}

.admin-alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}

@media (max-width: 991.98px) {
    .part-filters__acoes .part-filter-btn {
        flex: 1;
    }
}
</style>
