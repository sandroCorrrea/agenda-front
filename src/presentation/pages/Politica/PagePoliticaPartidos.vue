<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { RiAddLine, RiBookmark3Line, RiDeleteBinLine, RiPencilLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import { usePartidosAdmin } from "@/presentation/composables/Politica/usePartidosAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import type { Partido, PartidoStatus } from "@/domain/politica/tipos";
import { classeStatusPolitica, rotuloDe, STATUS_PARTIDO } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir, podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_partidos");
const { itens, carregando, salvando, excluindoId, erro, sucesso, campos, q, status, pagina, total, totalPaginas, carregar, salvar, remover } =
    usePartidosAdmin();

const aberto = ref(false);
const editando = ref<Partido | null>(null);
const confirmarId = ref<number | null>(null);
const form = reactive({ numero: "", sigla: "", nome: "", status: "ativo" as PartidoStatus });

function abrirNovo() {
    editando.value = null;
    form.numero = "";
    form.sigla = "";
    form.nome = "";
    form.status = "ativo";
    aberto.value = true;
}

function abrirEdicao(partido: Partido) {
    editando.value = partido;
    form.numero = String(partido.numero);
    form.sigla = partido.sigla;
    form.nome = partido.nome;
    form.status = partido.status as PartidoStatus;
    aberto.value = true;
}

async function aoSalvar() {
    try {
        await salvar(
            { numero: Number(form.numero), sigla: form.sigla.trim(), nome: form.nome.trim(), status: form.status },
            editando.value?.id
        );
        aberto.value = false;
    } catch {
        return;
    }
}

onMounted(() => void carregar(1));
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero title="Partidos" subtitle="Sigla e número usados nos cartões de candidato da pesquisa.">
                <template #icon><RiBookmark3Line /></template>
                <template #actions>
                    <button v-if="podeInserir" class="btn" type="button" @click="abrirNovo"><RiAddLine class="me-1" /> Novo partido</button>
                </template>
            </AdminPageHero>
            <div v-if="erro" class="pol-alert pol-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="carregar(1)">
                <div class="card-body row g-2">
                <div class="col-md-8 pol-search">
                    <RiSearchLine />
                    <input v-model="q" class="form-control" type="search" placeholder="Buscar partido" />
                </div>
                <div class="col-md-2">
                    <select v-model="status" class="form-select">
                        <option value="">Status</option>
                        <option v-for="item in STATUS_PARTIDO" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                </div>
                <div class="col-md-2"><button class="btn pol-btn w-100" type="submit">Filtrar</button></div>
                </div>
            </form>
            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <p v-if="carregando" class="text-muted">Carregando partidos…</p>
                    <table v-else class="table pol-table">
                        <thead><tr><th>Número</th><th>Sigla</th><th>Nome</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                            <tr v-for="item in itens" :key="item.id">
                                <td>{{ item.numero }}</td>
                                <td>{{ item.sigla }}</td>
                                <td>{{ item.nome }}</td>
                                <td><span :class="classeStatusPolitica(item.status)">{{ rotuloDe(STATUS_PARTIDO, item.status) }}</span></td>
                                <td class="text-end">
                                    <button v-if="podeAtualizar" class="btn btn-sm pol-btn--ghost me-1" type="button" @click="abrirEdicao(item)"><RiPencilLine /></button>
                                    <button v-if="podeExcluir" class="btn btn-sm pol-btn--danger" type="button" @click="confirmarId = item.id"><RiDeleteBinLine /></button>
                                </td>
                            </tr>
                            <tr v-if="itens.length === 0"><td colspan="5" class="text-center text-muted py-4">Nenhum partido encontrado.</td></tr>
                        </tbody>
                    </table>
                    <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
                </div>
            </section>
        </div>

        <div v-if="aberto" class="pol-modal">
            <div class="pol-modal__backdrop" @click="aberto = false" />
            <form class="pol-modal__panel" @submit.prevent="aoSalvar">
                <h2 class="h5">{{ editando ? "Editar partido" : "Novo partido" }}</h2>
                <div class="row g-2">
                    <div class="col-4">
                        <label class="form-label">Número</label>
                        <input v-model="form.numero" class="form-control" type="number" min="1" max="99" :class="{ 'is-invalid': campos.numero }" />
                    </div>
                    <div class="col-8">
                        <label class="form-label">Sigla</label>
                        <input v-model="form.sigla" class="form-control" maxlength="20" :class="{ 'is-invalid': campos.sigla }" />
                    </div>
                    <div class="col-12">
                        <label class="form-label">Nome</label>
                        <input v-model="form.nome" class="form-control" maxlength="160" :class="{ 'is-invalid': campos.nome }" />
                    </div>
                    <div class="col-12">
                        <label class="form-label">Status</label>
                        <select v-model="form.status" class="form-select">
                            <option v-for="item in STATUS_PARTIDO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                </div>
                <div class="d-flex justify-content-end gap-2 mt-3">
                    <button class="btn pol-btn--ghost" type="button" @click="aberto = false">Cancelar</button>
                    <button class="btn pol-btn" type="submit" :disabled="salvando">Salvar</button>
                </div>
            </form>
        </div>
        <div v-if="confirmarId !== null" class="pol-modal">
            <div class="pol-modal__backdrop" @click="confirmarId = null" />
            <div class="pol-modal__panel">
                <h2 class="h5">Excluir partido</h2>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="confirmarId = null">Cancelar</button>
                    <button class="btn pol-btn--danger" type="button" :disabled="excluindoId !== null" @click="remover(confirmarId!).finally(() => (confirmarId = null))">Excluir</button>
                </div>
            </div>
        </div>
    </article>
</template>
