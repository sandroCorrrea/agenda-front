<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { RiAddLine, RiDeleteBinLine, RiPencilLine, RiSearchLine, RiUserStarLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import { useCandidatosAdmin, useOpcoesCandidato } from "@/presentation/composables/Politica/useCandidatosAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { classeStatusPolitica, rotuloDe, STATUS_CANDIDATO } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir, podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_candidatos");
const {
    itens, carregando, excluindoId, erro, sucesso, q, eleicaoId, cargoId, partidoId, status,
    pagina, total, totalPaginas, carregar, remover
} = useCandidatosAdmin();
const { eleicoes, cargos, partidos, erroOpcoes, carregarOpcoes } = useOpcoesCandidato();
const confirmarId = ref<number | null>(null);

onMounted(() => {
    void carregar(1);
    void carregarOpcoes();
});
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero title="Candidatos" subtitle="O município vem do cadastro de IBGE. Não criamos cidade nova nesta tela.">
                <template #icon><RiUserStarLine /></template>
                <template #actions>
                    <RouterLink v-if="podeInserir" class="btn" :to="{ name: 'AdministradorPoliticaCandidatoCadastro' }">
                        <RiAddLine class="me-1" /> Novo candidato
                    </RouterLink>
                </template>
            </AdminPageHero>
            <div v-if="erro || erroOpcoes" class="pol-alert pol-alert--erro mb-3">{{ erro || erroOpcoes }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="carregar(1)">
                <div class="card-body row g-2">
                    <div class="col-md-4 pol-search">
                        <RiSearchLine />
                        <input v-model="q" class="form-control" type="search" placeholder="Nome ou urna" />
                    </div>
                    <div class="col-md-2">
                        <select v-model="eleicaoId" class="form-select">
                            <option value="">Eleição</option>
                            <option v-for="item in eleicoes" :key="item.id" :value="item.id">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="cargoId" class="form-select">
                            <option value="">Cargo</option>
                            <option v-for="item in cargos" :key="item.id" :value="item.id">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="partidoId" class="form-select">
                            <option value="">Partido</option>
                            <option v-for="item in partidos" :key="item.id" :value="item.id">{{ item.sigla }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select v-model="status" class="form-select">
                            <option value="">Status</option>
                            <option v-for="item in STATUS_CANDIDATO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-12 text-end"><button class="btn pol-btn" type="submit">Filtrar</button></div>
                </div>
            </form>
            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body table-responsive">
                    <p v-if="carregando" class="text-muted">Carregando candidatos…</p>
                    <table v-else class="table pol-table">
                        <thead>
                            <tr><th>Número</th><th>Urna</th><th>Partido</th><th>Cargo</th><th>Município</th><th>Status</th><th></th></tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in itens" :key="item.id">
                                <td>{{ item.numero }}</td>
                                <td>
                                    <strong>{{ item.nomeUrna }}</strong>
                                    <div class="small text-muted">{{ item.nome }}</div>
                                </td>
                                <td>{{ item.partidoSigla || "—" }}</td>
                                <td>{{ item.cargoNome || item.cargoId }}</td>
                                <td>{{ item.ibge || "—" }} <small v-if="item.uf">{{ item.uf }}</small></td>
                                <td><span :class="classeStatusPolitica(item.status)">{{ rotuloDe(STATUS_CANDIDATO, item.status) }}</span></td>
                                <td class="text-end text-nowrap">
                                    <RouterLink v-if="podeAtualizar" class="btn btn-sm pol-btn--ghost me-1" :to="{ name: 'AdministradorPoliticaCandidatoEditar', params: { id: item.id } }">
                                        <RiPencilLine />
                                    </RouterLink>
                                    <button v-if="podeExcluir" class="btn btn-sm pol-btn--danger" type="button" @click="confirmarId = item.id"><RiDeleteBinLine /></button>
                                </td>
                            </tr>
                            <tr v-if="itens.length === 0"><td colspan="7" class="text-center text-muted py-4">Nenhum candidato encontrado.</td></tr>
                        </tbody>
                    </table>
                    <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
                </div>
            </section>
        </div>
        <div v-if="confirmarId !== null" class="pol-modal">
            <div class="pol-modal__backdrop" @click="confirmarId = null" />
            <div class="pol-modal__panel">
                <h2 class="h5">Excluir candidato</h2>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="confirmarId = null">Cancelar</button>
                    <button class="btn pol-btn--danger" type="button" :disabled="excluindoId !== null" @click="remover(confirmarId!).finally(() => (confirmarId = null))">Excluir</button>
                </div>
            </div>
        </div>
    </article>
</template>
