<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { RiArrowLeftLine, RiGovernmentLine, RiSave3Line } from "@remixicon/vue";
import type { EleicaoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type { EleicaoStatus, EleicaoTipo } from "@/domain/politica/tipos";
import { useEleicoesAdmin } from "@/presentation/composables/Politica/useEleicoesAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { formatarDataCurta, paraCampoData, STATUS_ELEICAO, TIPOS_ELEICAO } from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const router = useRouter();
const editando = route.name === "AdministradorPoliticaEleicaoEditar";
const id = editando ? Number(route.params.id) : 0;
const { podeAtualizar: podeSincronizar } = usePermissaoMenu("admin.politica_candidatos");
const { erro, sucesso, campos, salvando, buscarPorId, salvar, subirArquivo, enfileirar } = useEleicoesAdmin();

const form = reactive({
    nome: "",
    ano: "",
    tipo: "municipal" as EleicaoTipo,
    dataInicio: "",
    dataFim: "",
    status: "rascunho" as EleicaoStatus
});
const possuiArquivo = ref(false);
const sincronizadoEm = ref<string | null>(null);
const arquivo = ref<File | null>(null);
const erroLocal = ref<string | null>(null);

onMounted(async () => {
    if (!editando) return;
    const eleicao = await buscarPorId(id);
    form.nome = eleicao.nome;
    form.ano = String(eleicao.ano || "");
    form.tipo = eleicao.tipo as EleicaoTipo;
    form.dataInicio = paraCampoData(eleicao.dataInicio);
    form.dataFim = paraCampoData(eleicao.dataFim);
    form.status = eleicao.status as EleicaoStatus;
    possuiArquivo.value = eleicao.possuiArquivo;
    sincronizadoEm.value = eleicao.sincronizadoEm;
});

function dto(): EleicaoSalvarDTO {
    return {
        nome: form.nome.trim(),
        ano: Number(form.ano),
        tipo: form.tipo,
        data_inicio: form.dataInicio || null,
        data_fim: form.dataFim || null,
        status: form.status
    };
}

async function aoSalvar() {
    erroLocal.value = null;
    if (!form.nome.trim() || !form.ano) {
        erroLocal.value = "Informe o nome e o ano da eleição.";
        return;
    }
    try {
        const eleicao = await salvar(dto(), editando ? id : undefined);
        if (!editando) {
            await router.replace({ name: "AdministradorPoliticaEleicaoEditar", params: { id: eleicao.id } });
            return;
        }
        possuiArquivo.value = eleicao.possuiArquivo;
        sincronizadoEm.value = eleicao.sincronizadoEm;
    } catch {
        return;
    }
}

async function aoArquivo() {
    erroLocal.value = null;
    if (!arquivo.value) return;
    if (!arquivo.value.name.toLowerCase().match(/\.csv$|\.txt$/)) {
        erroLocal.value = "Envie um arquivo CSV.";
        return;
    }
    if (arquivo.value.size > 50 * 1024 * 1024) {
        erroLocal.value = "O CSV pode ter no máximo 50 MB.";
        return;
    }
    try {
        const resp = await subirArquivo(id, arquivo.value);
        possuiArquivo.value = resp.possuiArquivo ?? true;
        arquivo.value = null;
    } catch {
        return;
    }
}

async function aoSincronizar() {
    try {
        await enfileirar(id);
    } catch {
        return;
    }
}
</script>

<template>
    <article class="pol-page min-vh-100 py-4">
        <div class="container" style="max-width: 860px">
            <RouterLink :to="{ name: 'AdministradorPoliticaEleicoes' }" class="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-bold">
                <RiArrowLeftLine /> Voltar para eleições
            </RouterLink>
            <div class="d-flex gap-3 mb-3">
                <div class="pol-badge pol-badge--on"><RiGovernmentLine /></div>
                <div>
                    <h1 class="h3 mb-1">{{ editando ? "Editar eleição" : "Nova eleição" }}</h1>
                    <p class="text-muted mb-0">O ano é informado por você. O arquivo de candidatos entra na fila e não consulta o TSE agora.</p>
                </div>
            </div>

            <div v-if="erro || erroLocal" class="pol-alert pol-alert--erro mb-3">{{ erro || erroLocal }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>

            <form class="card border-0 shadow-sm pol-panel mb-3" @submit.prevent="aoSalvar">
                <div class="card-body row g-3">
                    <div class="col-md-8">
                        <label class="form-label">Nome</label>
                        <input v-model="form.nome" class="form-control" maxlength="160" :class="{ 'is-invalid': campos.nome }" />
                        <div v-if="campos.nome" class="invalid-feedback d-block">{{ campos.nome }}</div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Ano</label>
                        <input v-model="form.ano" class="form-control" type="number" min="1900" max="2200" placeholder="Ano" :class="{ 'is-invalid': campos.ano }" />
                        <div v-if="campos.ano" class="invalid-feedback d-block">{{ campos.ano }}</div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Tipo</label>
                        <select v-model="form.tipo" class="form-select">
                            <option v-for="item in TIPOS_ELEICAO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Início</label>
                        <input v-model="form.dataInicio" class="form-control" type="date" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Fim</label>
                        <input v-model="form.dataFim" class="form-control" type="date" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Status</label>
                        <select v-model="form.status" class="form-select">
                            <option v-for="item in STATUS_ELEICAO" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-12 text-end">
                        <button class="btn pol-btn" type="submit" :disabled="salvando">
                            <RiSave3Line class="me-1" /> {{ salvando ? "Salvando…" : "Salvar eleição" }}
                        </button>
                    </div>
                </div>
            </form>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <h2 class="h5">Candidatos oficiais</h2>
                    <p class="text-muted">
                        CSV enviado: <strong>{{ possuiArquivo ? "sim" : "não" }}</strong>.
                        Última sincronização: <strong>{{ formatarDataCurta(sincronizadoEm) }}</strong>.
                    </p>
                    <div class="row g-3 align-items-end">
                        <div class="col-md-7">
                            <label class="form-label">Arquivo CSV (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" @change="arquivo = ($event.target as HTMLInputElement).files?.[0] ?? null" />
                        </div>
                        <div class="col-md-5 d-flex gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivo || salvando" @click="aoArquivo">Enviar CSV</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!possuiArquivo || salvando"
                                @click="aoSincronizar"
                            >
                                Sincronizar candidatos
                            </button>
                        </div>
                    </div>
                    <p class="small text-muted mt-3 mb-0">
                        Sincronizar coloca o trabalho na fila e responde na hora. O CSV não termina nesta tela e não há integração ao vivo com o TSE.
                    </p>
                </div>
            </section>
        </div>
    </article>
</template>
