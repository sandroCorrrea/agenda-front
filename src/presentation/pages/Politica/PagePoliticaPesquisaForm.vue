<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { RiArrowLeftLine, RiFileCopyLine, RiSurveyLine } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import type { PesquisaSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type { EstrategiaDuplicidade, PesquisaTipo } from "@/domain/politica/tipos";
import PesquisaEditorPerguntas from "@/presentation/components/Politica/PesquisaEditorPerguntas.vue";
import {
    perguntasDoDetalhe,
    perguntasParaDto,
    type PerguntaEditor
} from "@/presentation/components/Politica/pesquisaPerguntaEditor";
import { usePesquisasAdmin } from "@/presentation/composables/Politica/usePesquisasAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { tipoPerguntaPedeOpcoes } from "@/shared/utils/politicaLabels";
import {
    ESTRATEGIAS_DUPLICIDADE,
    linkPublicoPesquisa,
    paraApiDataHora,
    paraCampoData,
    paraCampoDataHora,
    rotuloAcaoStatus,
    rotuloStatusPesquisa,
    TIPOS_PESQUISA,
    transicoesStatus
} from "@/shared/utils/politicaLabels";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const router = useRouter();
const editando = computed(() => route.name === "AdministradorPoliticaPesquisaEditar");
const pesquisaId = computed(() => (editando.value ? Number(route.params.id) : 0));
const { podeAtualizar, podeExcluir } = usePermissaoMenu("admin.politica_pesquisas");
const { podeVisualizar: podeResultado } = usePermissaoMenu("admin.politica_resultados");
const {
    detalhe,
    eleicoes,
    cargos,
    municipios,
    candidatos,
    salvando,
    erro,
    sucesso,
    carregarApoio,
    carregarCandidatos,
    abrir,
    salvar,
    salvarPerguntas: gravarPerguntas,
    mudarStatus: alterarStatus,
    remover
} = usePesquisasAdmin();

const passo = ref(0);
const passos = ["Identidade", "Abrangência", "Metodologia", "Perguntas", "Publicação"];
const buscaCidade = ref("");
const buscaCandidato = ref("");
const copiado = ref(false);
const erroLocal = ref<string | null>(null);
const perguntas = ref<PerguntaEditor[]>([]);

const form = reactive({
    nome: "",
    descricao: "",
    eleicaoId: "",
    tipo: "interna" as PesquisaTipo,
    publica: false,
    estrategia: "sessao" as EstrategiaDuplicidade,
    inicioEm: "",
    fimEm: "",
    exibirRevisao: true,
    avisoPrivacidade: "",
    contratante: "",
    responsavel: "",
    populacaoAlvo: "",
    tamanhoAmostra: "",
    inicioColeta: "",
    fimColeta: "",
    planoAmostral: "",
    margemErro: "",
    intervaloConfianca: "",
    registroEleitoral: "",
    observacoes: ""
});
const municipiosSel = ref<string[]>([]);
const cargosSel = ref<number[]>([]);
const candidatosSel = ref<number[]>([]);

const statusAtual = computed(() => detalhe.value?.status ?? "rascunho");
const tokenAtual = computed(() => detalhe.value?.token ?? null);
const link = computed(() => linkPublicoPesquisa(tokenAtual.value, detalhe.value?.linkPublico ?? null));
const cidades = computed(() => {
    const q = buscaCidade.value.trim().toLowerCase();
    return municipios.value.filter((item) => !q || item.nome.toLowerCase().includes(q) || item.ibge.includes(q));
});
const candidatosOferecidos = computed(() => {
    const q = buscaCandidato.value.trim().toLowerCase();
    return candidatos.value.filter((candidato) => {
        if (cargosSel.value.length && !cargosSel.value.includes(candidato.cargoId)) return false;
        if (municipiosSel.value.length && candidato.ibge && !municipiosSel.value.includes(candidato.ibge)) return false;
        if (!q) return true;
        return (
            candidato.nomeUrna.toLowerCase().includes(q) ||
            candidato.nome.toLowerCase().includes(q) ||
            candidato.numero.includes(q)
        );
    });
});

function alternarNumero(lista: number[], id: number, marcado: boolean) {
    if (marcado) {
        if (!lista.includes(id)) lista.push(id);
        return;
    }
    const indice = lista.indexOf(id);
    if (indice >= 0) lista.splice(indice, 1);
}

function alternarTexto(lista: string[], valor: string, marcado: boolean) {
    if (marcado) {
        if (!lista.includes(valor)) lista.push(valor);
        return;
    }
    const indice = lista.indexOf(valor);
    if (indice >= 0) lista.splice(indice, 1);
}

function preencher(origem = detalhe.value) {
    if (!origem) return;
    form.nome = origem.nome;
    form.descricao = origem.descricao ?? "";
    form.eleicaoId = origem.eleicao?.id ? String(origem.eleicao.id) : "";
    form.tipo = (origem.tipo || "interna") as PesquisaTipo;
    form.publica = origem.publica;
    form.estrategia = (origem.estrategiaDuplicidade || "sessao") as EstrategiaDuplicidade;
    form.inicioEm = paraCampoDataHora(origem.inicioEm);
    form.fimEm = paraCampoDataHora(origem.fimEm);
    form.exibirRevisao = origem.exibirRevisao;
    form.avisoPrivacidade = origem.avisoPrivacidade ?? "";
    const metodo = origem.metodologia;
    form.contratante = metodo?.contratante ?? "";
    form.responsavel = metodo?.responsavel ?? "";
    form.populacaoAlvo = metodo?.populacaoAlvo ?? "";
    form.tamanhoAmostra = metodo?.tamanhoAmostra ? String(metodo.tamanhoAmostra) : "";
    form.inicioColeta = paraCampoData(metodo?.inicioColeta);
    form.fimColeta = paraCampoData(metodo?.fimColeta);
    form.planoAmostral = metodo?.planoAmostral ?? "";
    form.margemErro = metodo?.margemErro ?? "";
    form.intervaloConfianca = metodo?.intervaloConfianca ?? "";
    form.registroEleitoral = metodo?.registroEleitoral ?? "";
    form.observacoes = metodo?.observacoes ?? "";
    municipiosSel.value = [...origem.municipiosIbge];
    cargosSel.value = origem.cargos.map((cargo) => cargo.id).filter((item): item is number => item != null);
    candidatosSel.value = origem.candidatos.map((candidato) => candidato.id);
    perguntas.value = perguntasDoDetalhe(origem.perguntas);
}

function dto(): PesquisaSalvarDTO {
    return {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        eleicao_id: Number(form.eleicaoId),
        tipo: form.tipo,
        publica: form.publica,
        estrategia_duplicidade: form.estrategia,
        inicio_em: paraApiDataHora(form.inicioEm),
        fim_em: paraApiDataHora(form.fimEm),
        exibir_revisao: form.exibirRevisao,
        aviso_privacidade: form.avisoPrivacidade.trim() || null,
        municipios: municipiosSel.value,
        cargos: cargosSel.value,
        candidatos: [...candidatosSel.value],
        metodologia: {
            contratante: form.contratante.trim() || null,
            responsavel: form.responsavel.trim() || null,
            populacao_alvo: form.populacaoAlvo.trim() || null,
            tamanho_amostra: form.tamanhoAmostra.trim() ? Number(form.tamanhoAmostra) : null,
            inicio_coleta: form.inicioColeta || null,
            fim_coleta: form.fimColeta || null,
            plano_amostral: form.planoAmostral.trim() || null,
            margem_erro: form.margemErro.trim() || null,
            intervalo_confianca: form.intervaloConfianca.trim() || null,
            registro_eleitoral: form.registroEleitoral.trim() || null,
            observacoes: form.observacoes.trim() || null
        }
    };
}

async function salvarIdentidade() {
    erroLocal.value = null;
    if (!form.nome.trim() || !form.eleicaoId) {
        erroLocal.value = "Informe o nome e a eleição.";
        return;
    }
    if (form.tamanhoAmostra.trim() && Number(form.tamanhoAmostra) < 1) {
        erroLocal.value = "O tamanho da amostra precisa ser um número maior que zero.";
        return;
    }
    try {
        const salva = await salvar(dto(), editando.value ? pesquisaId.value : undefined);
        if (!editando.value && salva.id) {
            await router.replace({ name: "AdministradorPoliticaPesquisaEditar", params: { id: salva.id } });
        }
        preencher(salva);
    } catch {
        return;
    }
}

async function salvarPerguntas() {
    erroLocal.value = null;
    const invalida = perguntas.value.find((pergunta) => {
        if (!pergunta.titulo.trim()) return true;
        if (pergunta.tipo === "candidato") return false;
        if (!tipoPerguntaPedeOpcoes(pergunta.tipo)) return false;
        return pergunta.opcoes.length === 0 || pergunta.opcoes.some((opcao) => !opcao.rotulo.trim());
    });
    if (invalida) {
        erroLocal.value = "Cada pergunta precisa de título. Opções, quando o tipo exige, precisam de rótulo.";
        return;
    }
    try {
        const salva = await gravarPerguntas(pesquisaId.value, { perguntas: perguntasParaDto(perguntas.value) });
        preencher(salva);
    } catch {
        return;
    }
}

async function mudarStatus(status: string) {
    erroLocal.value = null;
    try {
        const salva = await alterarStatus(pesquisaId.value, status);
        preencher(salva);
    } catch {
        return;
    }
}

async function excluir() {
    const ok = await remover(pesquisaId.value);
    if (ok) await router.push({ name: "AdministradorPoliticaPesquisas" });
}

async function copiarLink() {
    if (!link.value) return;
    await navigator.clipboard.writeText(link.value);
    copiado.value = true;
}

watch(
    () => form.eleicaoId,
    async (valor, anterior) => {
        if (!valor) {
            candidatos.value = [];
            return;
        }
        try {
            await carregarCandidatos(Number(valor));
        } catch {
            return;
        }
        if (anterior && anterior !== valor) candidatosSel.value = [];
    }
);

onMounted(async () => {
    await carregarApoio();
    if (editando.value) {
        try {
            await abrir(pesquisaId.value);
            preencher();
        } catch {
            return;
        }
    }
});
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <RouterLink :to="{ name: 'AdministradorPoliticaPesquisas' }" class="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-bold">
                <RiArrowLeftLine /> Voltar para pesquisas
            </RouterLink>
            <AdminPageHero
                :title="editando ? form.nome || 'Editar pesquisa' : 'Nova pesquisa'"
                :subtitle="`Status: ${rotuloStatusPesquisa(statusAtual)}. O link só abre com a pesquisa publicada, pública e dentro do período.`"
            >
                <template #icon><RiSurveyLine /></template>
                <template v-if="editando && podeResultado" #actions>
                    <RouterLink class="btn" :to="{ name: 'AdministradorPoliticaResultados', params: { id: pesquisaId } }">
                        Resultados
                    </RouterLink>
                </template>
            </AdminPageHero>
            <div v-if="editando && link" class="pol-link mb-3">
                <code :title="link">{{ link }}</code>
                <button class="btn btn-sm pol-btn--ghost" type="button" @click="copiarLink">
                    <RiFileCopyLine /> {{ copiado ? "Copiado" : "Copiar" }}
                </button>
            </div>

            <div v-if="erro || erroLocal" class="pol-alert pol-alert--erro mb-3">{{ erro || erroLocal }}</div>
            <div v-if="sucesso" class="pol-alert pol-alert--ok mb-3">{{ sucesso }}</div>

            <nav class="pol-steps" aria-label="Passos da pesquisa">
                <button
                    v-for="(nome, indice) in passos"
                    :key="nome"
                    type="button"
                    :class="{ 'is-on': passo === indice, 'is-done': indice < passo }"
                    :disabled="!editando && indice > 0"
                    @click="passo = indice"
                >
                    <span>{{ indice + 1 }}</span>
                    {{ nome }}
                </button>
            </nav>

            <section v-if="passo === 0" class="card border-0 shadow-sm pol-panel">
                <form class="card-body row g-3" @submit.prevent="salvarIdentidade">
                    <div class="col-md-8">
                        <label class="form-label">Nome</label>
                        <input v-model="form.nome" class="form-control" maxlength="180" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Eleição</label>
                        <select v-model="form.eleicaoId" class="form-select">
                            <option value="">Selecione</option>
                            <option v-for="item in eleicoes" :key="item.id" :value="item.id">{{ item.ano }} · {{ item.nome }}</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Descrição</label>
                        <textarea v-model="form.descricao" class="form-control" rows="3" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Tipo</label>
                        <select v-model="form.tipo" class="form-select">
                            <option v-for="item in TIPOS_PESQUISA" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-md-8">
                        <label class="form-label">Duplicidade</label>
                        <select v-model="form.estrategia" class="form-select">
                            <option v-for="item in ESTRATEGIAS_DUPLICIDADE" :key="item.value" :value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Início</label>
                        <input v-model="form.inicioEm" class="form-control" type="datetime-local" />
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Fim</label>
                        <input v-model="form.fimEm" class="form-control" type="datetime-local" />
                    </div>
                    <div class="col-md-4 d-flex align-items-end gap-3">
                        <label class="form-check"><input v-model="form.publica" class="form-check-input" type="checkbox" /> <span class="form-check-label">Link público</span></label>
                        <label class="form-check"><input v-model="form.exibirRevisao" class="form-check-input" type="checkbox" /> <span class="form-check-label">Revisão</span></label>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Aviso de privacidade</label>
                        <textarea v-model="form.avisoPrivacidade" class="form-control" rows="4" />
                    </div>
                    <div class="col-12 text-end">
                        <button class="btn pol-btn" type="submit" :disabled="salvando || (!podeAtualizar && editando)">Salvar</button>
                    </div>
                </form>
            </section>

            <section v-else-if="passo === 1" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <h2 class="h6">Municípios</h2>
                            <input v-model="buscaCidade" class="form-control form-control-sm mb-2" placeholder="Buscar" />
                            <div class="pol-check-list">
                                <label v-for="cidade in cidades" :key="cidade.ibge">
                                    <input type="checkbox" :checked="municipiosSel.includes(cidade.ibge)" @change="alternarTexto(municipiosSel, cidade.ibge, ($event.target as HTMLInputElement).checked)" />
                                    <span>{{ cidade.nome }} <small>{{ cidade.uf }}</small></span>
                                </label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <h2 class="h6">Cargos</h2>
                            <div class="pol-check-list">
                                <label v-for="cargo in cargos" :key="cargo.id">
                                    <input type="checkbox" :checked="cargosSel.includes(cargo.id)" @change="alternarNumero(cargosSel, cargo.id, ($event.target as HTMLInputElement).checked)" />
                                    <span>{{ cargo.nome }}</span>
                                </label>
                            </div>
                        </div>
                        <div class="col-md-5">
                            <h2 class="h6">Candidatos da eleição</h2>
                            <input v-model="buscaCandidato" class="form-control form-control-sm mb-2" placeholder="Buscar candidato" />
                            <div class="pol-check-list">
                                <label v-for="candidato in candidatosOferecidos" :key="candidato.id">
                                    <input type="checkbox" :checked="candidatosSel.includes(candidato.id)" @change="alternarNumero(candidatosSel, candidato.id, ($event.target as HTMLInputElement).checked)" />
                                    <span>{{ candidato.numero }} · {{ candidato.nomeUrna }} <small>{{ candidato.partidoSigla }}</small></span>
                                </label>
                                <p v-if="candidatosOferecidos.length === 0" class="text-muted small m-2">Nenhum candidato desta eleição, cargo e município.</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-end mt-3">
                        <button class="btn pol-btn" type="button" :disabled="salvando" @click="salvarIdentidade">Salvar abrangência</button>
                    </div>
                </div>
            </section>

            <section v-else-if="passo === 2" class="card border-0 shadow-sm pol-panel">
                <form class="card-body row g-3" novalidate @submit.prevent="salvarIdentidade">
                    <div v-if="erro || erroLocal" class="col-12">
                        <div class="pol-alert pol-alert--erro">{{ erro || erroLocal }}</div>
                    </div>
                    <div v-if="form.tipo === 'divulgacao_publica'" class="col-12">
                        <div class="pol-alert pol-alert--aviso">
                            Para publicar uma divulgação pública, a API exige responsável, plano amostral e tamanho da amostra. Margem de erro e intervalo de confiança são texto informado pelo responsável — esta tela não calcula margem.
                        </div>
                    </div>
                    <div class="col-md-6"><label class="form-label">Contratante</label><input v-model="form.contratante" class="form-control" maxlength="180" /></div>
                    <div class="col-md-6"><label class="form-label">Responsável</label><input v-model="form.responsavel" class="form-control" maxlength="180" /></div>
                    <div class="col-md-8"><label class="form-label">População-alvo</label><input v-model="form.populacaoAlvo" class="form-control" /></div>
                    <div class="col-md-4"><label class="form-label">Tamanho da amostra</label><input v-model="form.tamanhoAmostra" class="form-control" inputmode="numeric" /></div>
                    <div class="col-md-3"><label class="form-label">Início da coleta</label><input v-model="form.inicioColeta" class="form-control" type="date" /></div>
                    <div class="col-md-3"><label class="form-label">Fim da coleta</label><input v-model="form.fimColeta" class="form-control" type="date" /></div>
                    <div class="col-md-3"><label class="form-label">Margem de erro</label><input v-model="form.margemErro" class="form-control" maxlength="40" /></div>
                    <div class="col-md-3"><label class="form-label">Intervalo de confiança</label><input v-model="form.intervaloConfianca" class="form-control" maxlength="40" /></div>
                    <div class="col-12"><label class="form-label">Plano amostral</label><textarea v-model="form.planoAmostral" class="form-control" rows="3" /></div>
                    <div class="col-md-6"><label class="form-label">Registro eleitoral</label><input v-model="form.registroEleitoral" class="form-control" maxlength="80" /></div>
                    <div class="col-12"><label class="form-label">Observações</label><textarea v-model="form.observacoes" class="form-control" rows="2" /></div>
                    <div class="col-12 text-end">
                        <button class="btn pol-btn" type="button" :disabled="salvando" @click="salvarIdentidade">Salvar metodologia</button>
                    </div>
                </form>
            </section>

            <section v-else-if="passo === 3" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <PesquisaEditorPerguntas v-model="perguntas" :cargos="cargos" :municipios="municipios" :candidatos="candidatos.filter((item) => candidatosSel.includes(item.id))" />
                    <div class="text-end mt-3">
                        <button class="btn pol-btn" type="button" :disabled="salvando" @click="salvarPerguntas">Gravar perguntas</button>
                    </div>
                </div>
            </section>

            <section v-else class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <h2 class="h5">Publicação</h2>
                    <p>O link público só abre quando a pesquisa está publicada, marcada como pública e dentro do período.</p>
                    <div class="pol-alert pol-alert--aviso mb-3">
                        Para publicar: aviso de privacidade e ao menos uma pergunta ativa.
                        <template v-if="form.tipo === 'divulgacao_publica'">
                            Divulgação pública também exige responsável, plano amostral e tamanho da amostra.
                        </template>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <button
                            v-for="destino in transicoesStatus(statusAtual)"
                            :key="destino"
                            class="btn pol-btn"
                            type="button"
                            :disabled="salvando || !podeAtualizar"
                            @click="mudarStatus(destino)"
                        >
                            {{ rotuloAcaoStatus(destino) }}
                        </button>
                        <button v-if="podeExcluir" class="btn pol-btn--danger" type="button" @click="excluir">Excluir</button>
                    </div>
                    <p class="small text-muted mt-3 mb-0">Se a exclusão for recusada porque já existe resposta, arquive a pesquisa.</p>
                </div>
            </section>
        </div>
    </article>
</template>
