<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { RiAddLine, RiBarChartBoxLine, RiDeleteBinLine, RiPencilLine, RiSearchLine, RiSurveyLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import { usePesquisasAdmin } from "@/presentation/composables/Politica/usePesquisasAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import {
    classeStatusPolitica,
    formatarDataCurta,
    rotuloStatusPesquisa,
    TIPOS_PESQUISA,
    rotuloDe
} from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const { podeInserir, podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_pesquisas");
const { podeVisualizar: podeResultado } = usePermissaoMenu("admin.politica_resultados");
const {
    itens, carregando, excluindoId, erro, sucesso, q, status, tipo, pagina, total, totalPaginas, carregar, remover
} = usePesquisasAdmin();
const confirmarId = ref<number | null>(null);
const focoResultado = route.query.ver === "resultados";

onMounted(() => void carregar(1));
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Pesquisas"
                subtitle="Questionários de intenção de voto. A pesquisa nasce em rascunho e só vai ao ar quando você publica."
            >
                <template #icon><RiSurveyLine /></template>
                <template #actions>
                    <RouterLink v-if="podeInserir" class="btn" :to="{ name: 'AdministradorPoliticaPesquisaCadastro' }">
                        <RiAddLine class="me-1" /> Nova pesquisa
                    </RouterLink>
                </template>
            </AdminPageHero>
            <div v-if="focoResultado" class="pol-alert pol-alert--aviso mb-3">
                Escolha uma pesquisa para abrir o resultado da coleta. O número não é previsão de eleição.
            </div>
            <div v-if="erro" class="pol-alert pol-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
            <form class="row g-2 mb-3" @submit.prevent="carregar(1)">
                <div class="col-md-6 pol-search">
                    <RiSearchLine />
                    <input v-model="q" class="form-control" type="search" placeholder="Buscar pesquisa" />
                </div>
                <div class="col-md-2">
                    <select v-model="status" class="form-select">
                        <option value="">Status</option>
                        <option value="rascunho">Rascunho</option>
                        <option value="publicada">Publicada</option>
                        <option value="pausada">Pausada</option>
                        <option value="encerrada">Encerrada</option>
                        <option value="arquivada">Arquivada</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <select v-model="tipo" class="form-select">
                        <option value="">Tipo</option>
                        <option v-for="item in TIPOS_PESQUISA" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                </div>
                <div class="col-md-2"><button class="btn pol-btn w-100" type="submit">Filtrar</button></div>
            </form>
            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body table-responsive">
                    <p v-if="carregando" class="text-muted">Carregando pesquisas…</p>
                    <table v-else class="table pol-table">
                        <thead>
                            <tr><th>Nome</th><th>Eleição</th><th>Tipo</th><th>Período</th><th>Status</th><th></th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in itens" :key="item.id">
                                <td><strong>{{ item.nome }}</strong></td>
                                <td>{{ item.eleicaoNome || "—" }}</td>
                                <td>{{ rotuloDe(TIPOS_PESQUISA, item.tipo) }}</td>
                                <td>{{ formatarDataCurta(item.inicioEm) }} – {{ formatarDataCurta(item.fimEm) }}</td>
                                <td><span :class="classeStatusPolitica(item.status)">{{ rotuloStatusPesquisa(item.status) }}</span></td>
                                <td class="text-end text-nowrap">
                                    <RouterLink
                                        v-if="podeResultado"
                                        class="btn btn-sm pol-btn--ghost me-1"
                                        :to="{ name: 'AdministradorPoliticaResultados', params: { id: item.id } }"
                                    >
                                        <RiBarChartBoxLine />
                                    </RouterLink>
                                    <RouterLink
                                        v-if="podeAtualizar"
                                        class="btn btn-sm pol-btn--ghost me-1"
                                        :to="{ name: 'AdministradorPoliticaPesquisaEditar', params: { id: item.id } }"
                                    >
                                        <RiPencilLine />
                                    </RouterLink>
                                    <button v-if="podeExcluir" class="btn btn-sm pol-btn--danger" type="button" @click="confirmarId = item.id">
                                        <RiDeleteBinLine />
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="itens.length === 0"><td colspan="6" class="text-center text-muted py-4">Nenhuma pesquisa encontrada.</td></tr>
                        </tbody>
                    </table>
                    <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
                </div>
            </section>
        </div>
        <div v-if="confirmarId !== null" class="pol-modal">
            <div class="pol-modal__backdrop" @click="confirmarId = null" />
            <div class="pol-modal__panel">
                <h2 class="h5">Excluir pesquisa</h2>
                <p>Se já houver resposta, a API recusa a exclusão. Nesse caso, arquive a pesquisa.</p>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="confirmarId = null">Cancelar</button>
                    <button class="btn pol-btn--danger" type="button" :disabled="excluindoId !== null" @click="remover(confirmarId!).finally(() => (confirmarId = null))">Excluir</button>
                </div>
            </div>
        </div>
    </article>
</template>
