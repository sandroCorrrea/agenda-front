<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { RiAddLine, RiDeleteBinLine, RiGovernmentLine, RiPencilLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import { useEleicoesAdmin } from "@/presentation/composables/Politica/useEleicoesAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { classeStatusPolitica, formatarDataCurta, rotuloDe, STATUS_ELEICAO, TIPOS_ELEICAO } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir, podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_eleicoes");
const {
    itens,
    carregando,
    excluindoId,
    erro,
    sucesso,
    q,
    status,
    tipo,
    ano,
    pagina,
    total,
    totalPaginas,
    carregar,
    remover
} = useEleicoesAdmin();

const confirmarId = ref<number | null>(null);

onMounted(() => {
    void carregar(1);
});
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Eleições"
                subtitle="Cadastre o pleito, envie o CSV oficial e enfileire a leitura dos candidatos. Não há consulta ao vivo ao TSE."
            >
                <template #icon><RiGovernmentLine /></template>
                <template #actions>
                    <RouterLink v-if="podeInserir" :to="{ name: 'AdministradorPoliticaEleicaoCadastro' }" class="btn">
                        <RiAddLine class="me-1" /> Nova eleição
                    </RouterLink>
                </template>
            </AdminPageHero>

            <div v-if="erro" class="pol-alert pol-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>

            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="carregar(1)">
                <div class="card-body row g-3">
                    <div class="col-md-4 pol-search">
                        <RiSearchLine />
                        <input v-model="q" class="form-control" type="search" placeholder="Buscar eleição" />
                    </div>
                    <div class="col-md-2">
                        <select v-model="tipo" class="form-select">
                            <option value="">Tipo</option>
                            <option v-for="item in TIPOS_ELEICAO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="status" class="form-select">
                            <option value="">Status</option>
                            <option v-for="item in STATUS_ELEICAO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <input v-model="ano" class="form-control" type="number" min="1900" max="2200" placeholder="Ano" />
                    </div>
                    <div class="col-md-2">
                        <button class="btn pol-btn w-100" type="submit">Filtrar</button>
                    </div>
                </div>
            </form>

            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <p v-if="carregando" class="text-muted mb-0">Carregando eleições…</p>
                    <div v-else class="table-responsive">
                        <table class="table pol-table mb-0">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Ano</th>
                                    <th>Tipo</th>
                                    <th>Período</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in itens" :key="item.id">
                                    <td>
                                        <strong>{{ item.nome }}</strong>
                                        <div class="small text-muted">
                                            {{ item.possuiArquivo ? "CSV enviado" : "Sem CSV" }}
                                            <template v-if="item.sincronizadoEm"> · sincronizado {{ formatarDataCurta(item.sincronizadoEm) }}</template>
                                        </div>
                                    </td>
                                    <td>{{ item.ano }}</td>
                                    <td>{{ rotuloDe(TIPOS_ELEICAO, item.tipo) }}</td>
                                    <td>{{ formatarDataCurta(item.dataInicio) }} – {{ formatarDataCurta(item.dataFim) }}</td>
                                    <td><span :class="classeStatusPolitica(item.status)">{{ rotuloDe(STATUS_ELEICAO, item.status) }}</span></td>
                                    <td class="text-end text-nowrap">
                                        <RouterLink
                                            v-if="podeAtualizar"
                                            class="btn btn-sm pol-btn--ghost me-1"
                                            :to="{ name: 'AdministradorPoliticaEleicaoEditar', params: { id: item.id } }"
                                        >
                                            <RiPencilLine />
                                        </RouterLink>
                                        <button v-if="podeExcluir" class="btn btn-sm pol-btn--danger" type="button" @click="confirmarId = item.id">
                                            <RiDeleteBinLine />
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="itens.length === 0">
                                    <td colspan="6" class="text-muted text-center py-4">Nenhuma eleição encontrada.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
                </div>
            </section>
        </div>

        <div v-if="confirmarId !== null" class="pol-modal">
            <div class="pol-modal__backdrop" @click="confirmarId = null" />
            <div class="pol-modal__panel" role="dialog" aria-modal="true">
                <h2 class="h5">Excluir eleição</h2>
                <p>A exclusão só acontece se a API permitir. Se já houver dados vinculados, a mensagem dela aparece na lista.</p>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="confirmarId = null">Cancelar</button>
                    <button
                        class="btn pol-btn--danger"
                        type="button"
                        :disabled="excluindoId !== null"
                        @click="remover(confirmarId).finally(() => (confirmarId = null))"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    </article>
</template>
