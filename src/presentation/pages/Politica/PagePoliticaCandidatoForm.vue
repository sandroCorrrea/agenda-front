<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { RiArrowLeftLine, RiSave3Line } from "@remixicon/vue";
import type { CandidatoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type { CandidatoStatus } from "@/domain/politica/tipos";
import { useCandidatosAdmin, useOpcoesCandidato } from "@/presentation/composables/Politica/useCandidatosAdmin";
import { STATUS_CANDIDATO } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const router = useRouter();
const editando = route.name === "AdministradorPoliticaCandidatoEditar";
const id = editando ? Number(route.params.id) : 0;
const { erro, sucesso, campos, salvando, buscarPorId, salvar } = useCandidatosAdmin();
const { eleicoes, cargos, partidos, municipios, erroOpcoes, carregarOpcoes } = useOpcoesCandidato();
const busca = ref("");

const form = reactive({
    eleicao_id: "",
    cargo_id: "",
    partido_id: "",
    ibge: "",
    uf: "",
    tse_id: "",
    numero: "",
    nome: "",
    nome_urna: "",
    foto_url: "",
    status: "ativo" as CandidatoStatus
});

const cidades = computed(() => {
    const q = busca.value.trim().toLowerCase();
    return municipios.value
        .filter((item) => !q || item.nome.toLowerCase().includes(q) || item.ibge.includes(q))
        .slice(0, 30);
});

function aoEscolherCidade() {
    const cidade = municipios.value.find((item) => item.ibge === form.ibge);
    form.uf = cidade?.uf ?? "";
}

onMounted(async () => {
    await carregarOpcoes();
    if (!editando) return;
    const candidato = await buscarPorId(id);
    form.eleicao_id = String(candidato.eleicaoId);
    form.cargo_id = String(candidato.cargoId);
    form.partido_id = candidato.partidoId ? String(candidato.partidoId) : "";
    form.ibge = candidato.ibge ?? "";
    form.uf = candidato.uf ?? "";
    form.tse_id = candidato.tseId ?? "";
    form.numero = candidato.numero;
    form.nome = candidato.nome;
    form.nome_urna = candidato.nomeUrna;
    form.foto_url = candidato.fotoUrl ?? "";
    form.status = candidato.status as CandidatoStatus;
});

async function aoSalvar() {
    const dto: CandidatoSalvarDTO = {
        eleicao_id: Number(form.eleicao_id),
        cargo_id: Number(form.cargo_id),
        partido_id: form.partido_id ? Number(form.partido_id) : null,
        ibge: form.ibge || null,
        uf: form.uf || null,
        tse_id: form.tse_id.trim() || null,
        numero: form.numero.trim(),
        nome: form.nome.trim(),
        nome_urna: form.nome_urna.trim(),
        foto_url: form.foto_url.trim() || null,
        status: form.status
    };
    try {
        await salvar(dto, editando ? id : undefined);
        await router.push({ name: "AdministradorPoliticaCandidatos" });
    } catch {
        return;
    }
}
</script>

<template>
    <article class="pol-page min-vh-100 py-4">
        <div class="container" style="max-width: 860px">
            <RouterLink :to="{ name: 'AdministradorPoliticaCandidatos' }" class="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-bold">
                <RiArrowLeftLine /> Voltar para candidatos
            </RouterLink>
            <h1 class="h3">{{ editando ? "Editar candidato" : "Novo candidato" }}</h1>
            <div v-if="erro || erroOpcoes" class="pol-alert pol-alert--erro mb-3">{{ erro || erroOpcoes }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>
            <form class="card border-0 shadow-sm pol-panel" @submit.prevent="aoSalvar">
                <div class="card-body row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Eleição</label>
                        <select v-model="form.eleicao_id" class="form-select" :class="{ 'is-invalid': campos.eleicao_id }">
                            <option value="">Selecione</option>
                            <option v-for="item in eleicoes" :key="item.id" :value="item.id">{{ item.ano }} · {{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Cargo</label>
                        <select v-model="form.cargo_id" class="form-select" :class="{ 'is-invalid': campos.cargo_id }">
                            <option value="">Selecione</option>
                            <option v-for="item in cargos" :key="item.id" :value="item.id">{{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Partido</label>
                        <select v-model="form.partido_id" class="form-select">
                            <option value="">Sem partido</option>
                            <option v-for="item in partidos" :key="item.id" :value="item.id">{{ item.numero }} · {{ item.sigla }}</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Status</label>
                        <select v-model="form.status" class="form-select">
                            <option v-for="item in STATUS_CANDIDATO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Município (IBGE)</label>
                        <input v-model="busca" class="form-control mb-2" type="search" placeholder="Buscar cidade já cadastrada" />
                        <select v-model="form.ibge" class="form-select" @change="aoEscolherCidade">
                            <option value="">Sem município</option>
                            <option v-for="item in cidades" :key="item.ibge" :value="item.ibge">
                                {{ item.nome }}{{ item.uf ? `/${item.uf}` : "" }} · {{ item.ibge }}
                            </option>
                        </select>
                        <small class="text-muted">UF: {{ form.uf || "—" }}</small>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Número</label>
                        <input v-model="form.numero" class="form-control" maxlength="10" :class="{ 'is-invalid': campos.numero }" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Nome de urna</label>
                        <input v-model="form.nome_urna" class="form-control" maxlength="120" :class="{ 'is-invalid': campos.nome_urna }" />
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Nome completo</label>
                        <input v-model="form.nome" class="form-control" maxlength="180" :class="{ 'is-invalid': campos.nome }" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">ID no TSE</label>
                        <input v-model="form.tse_id" class="form-control" maxlength="40" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">URL da foto</label>
                        <input v-model="form.foto_url" class="form-control" maxlength="500" />
                    </div>
                    <div class="col-12 text-end">
                        <button class="btn pol-btn" type="submit" :disabled="salvando"><RiSave3Line class="me-1" /> Salvar</button>
                    </div>
                </div>
            </form>
        </div>
    </article>
</template>
