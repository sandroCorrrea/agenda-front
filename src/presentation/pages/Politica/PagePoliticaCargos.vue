<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { RiAddLine, RiBriefcase4Line, RiDeleteBinLine, RiPencilLine, RiSearchLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaPaginacao from "@/presentation/components/Politica/PoliticaPaginacao.vue";
import { useCargosAdmin } from "@/presentation/composables/Politica/useCargosAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import type { Cargo, CargoEsfera } from "@/domain/politica/tipos";
import { ESFERAS_CARGO, rotuloDe } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const { podeInserir, podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_cargos");
const { itens, carregando, salvando, excluindoId, erro, sucesso, campos, q, pagina, total, totalPaginas, carregar, salvar, remover } =
    useCargosAdmin();

const aberto = ref(false);
const editando = ref<Cargo | null>(null);
const confirmarId = ref<number | null>(null);
const form = reactive({ codigo: "", nome: "", esfera: "municipal" as CargoEsfera, ativo: true });

function abrirNovo() {
    editando.value = null;
    form.codigo = "";
    form.nome = "";
    form.esfera = "municipal";
    form.ativo = true;
    aberto.value = true;
}

function abrirEdicao(cargo: Cargo) {
    editando.value = cargo;
    form.codigo = cargo.codigo;
    form.nome = cargo.nome;
    form.esfera = cargo.esfera as CargoEsfera;
    form.ativo = cargo.ativo;
    aberto.value = true;
}

async function aoSalvar() {
    try {
        await salvar(
            { codigo: form.codigo.trim(), nome: form.nome.trim(), esfera: form.esfera, ativo: form.ativo },
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
            <AdminPageHero title="Cargos" subtitle="Cargos usados para vincular candidatos e perguntas de intenção de voto.">
                <template #icon><RiBriefcase4Line /></template>
                <template #actions>
                    <button v-if="podeInserir" class="btn" type="button" @click="abrirNovo"><RiAddLine class="me-1" /> Novo cargo</button>
                </template>
            </AdminPageHero>
            <div v-if="erro" class="pol-alert pol-alert--erro mb-3">{{ erro }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="carregar(1)">
                <div class="card-body">
                    <div class="pol-search">
                        <RiSearchLine />
                        <input v-model="q" class="form-control" type="search" placeholder="Buscar cargo" />
                    </div>
                </div>
            </form>
            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <p v-if="carregando" class="text-muted">Carregando cargos…</p>
                    <table v-else class="table pol-table">
                        <thead><tr><th>Código</th><th>Nome</th><th>Esfera</th><th>Ativo</th><th></th></tr></thead>
                        <tbody>
                            <tr v-for="item in itens" :key="item.id">
                                <td>{{ item.codigo }}</td>
                                <td>{{ item.nome }}</td>
                                <td>{{ rotuloDe(ESFERAS_CARGO, item.esfera) }}</td>
                                <td>{{ item.ativo ? "Sim" : "Não" }}</td>
                                <td class="text-end">
                                    <button v-if="podeAtualizar" class="btn btn-sm pol-btn--ghost me-1" type="button" @click="abrirEdicao(item)"><RiPencilLine /></button>
                                    <button v-if="podeExcluir" class="btn btn-sm pol-btn--danger" type="button" @click="confirmarId = item.id"><RiDeleteBinLine /></button>
                                </td>
                            </tr>
                            <tr v-if="itens.length === 0"><td colspan="5" class="text-center text-muted py-4">Nenhum cargo encontrado.</td></tr>
                        </tbody>
                    </table>
                    <PoliticaPaginacao :pagina="pagina" :total-paginas="totalPaginas" :total="total" @ir="carregar" />
                </div>
            </section>
        </div>

        <div v-if="aberto" class="pol-modal">
            <div class="pol-modal__backdrop" @click="aberto = false" />
            <form class="pol-modal__panel" @submit.prevent="aoSalvar">
                <h2 class="h5">{{ editando ? "Editar cargo" : "Novo cargo" }}</h2>
                <div class="mb-2">
                    <label class="form-label">Código</label>
                    <input v-model="form.codigo" class="form-control" maxlength="40" :class="{ 'is-invalid': campos.codigo }" />
                    <div v-if="campos.codigo" class="invalid-feedback d-block">{{ campos.codigo }}</div>
                </div>
                <div class="mb-2">
                    <label class="form-label">Nome</label>
                    <input v-model="form.nome" class="form-control" maxlength="80" :class="{ 'is-invalid': campos.nome }" />
                </div>
                <div class="mb-2">
                    <label class="form-label">Esfera</label>
                    <select v-model="form.esfera" class="form-select">
                        <option v-for="item in ESFERAS_CARGO" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                </div>
                <label class="form-check mb-3">
                    <input v-model="form.ativo" class="form-check-input" type="checkbox" />
                    <span class="form-check-label">Ativo</span>
                </label>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="aberto = false">Cancelar</button>
                    <button class="btn pol-btn" type="submit" :disabled="salvando">Salvar</button>
                </div>
            </form>
        </div>

        <div v-if="confirmarId !== null" class="pol-modal">
            <div class="pol-modal__backdrop" @click="confirmarId = null" />
            <div class="pol-modal__panel">
                <h2 class="h5">Excluir cargo</h2>
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn pol-btn--ghost" type="button" @click="confirmarId = null">Cancelar</button>
                    <button class="btn pol-btn--danger" type="button" :disabled="excluindoId !== null" @click="remover(confirmarId!).finally(() => (confirmarId = null))">Excluir</button>
                </div>
            </div>
        </div>
    </article>
</template>
