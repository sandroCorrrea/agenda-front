<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { RiArrowLeftLine, RiGovernmentLine, RiSave3Line } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import PoliticaCandidatoCartao from "@/presentation/components/Politica/PoliticaCandidatoCartao.vue";
import PoliticaImportacaoOverlay from "@/presentation/components/Politica/PoliticaImportacaoOverlay.vue";
import type { EleicaoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import type { EleicaoStatus, EleicaoTipo, VagaEleicao } from "@/domain/politica/tipos";
import { useEleicoesAdmin } from "@/presentation/composables/Politica/useEleicoesAdmin";
import { usePermissaoMenu } from "@/presentation/composables/Menu/usePermissaoMenu";
import { formatarDataCurta, formatarTetoGasto, paraCampoData, STATUS_ELEICAO, TIPOS_ELEICAO } from "@/shared/utils/politicaLabels";
import { lerConsultaCandArquivo, type LeituraConsultaCand } from "@/shared/utils/consultaCand";
import { lerConsultaCandComplementarArquivo, type LeituraConsultaCandComplementar } from "@/shared/utils/consultaCandComplementar";
import { lerBemCandidatoArquivo, type LeituraBemCandidato } from "@/shared/utils/bemCandidato";
import { lerConsultaColigacaoArquivo, type LeituraConsultaColigacao } from "@/shared/utils/consultaColigacao";
import { lerConsultaVagasArquivo, type LeituraConsultaVagas } from "@/shared/utils/consultaVagas";
import { lerMotivoCassacaoArquivo, type LeituraMotivoCassacao } from "@/shared/utils/motivoCassacao";
import { lerRedeSocialArquivo, type LeituraRedeSocial } from "@/shared/utils/redeSocialCandidato";
import { lerHistoricoCandidaturaArquivo, type LeituraHistoricoCandidatura } from "@/shared/utils/historicoCandidatura";
import "@/presentation/assets/styles/politica-admin.css";

const route = useRoute();
const router = useRouter();
const editando = route.name === "AdministradorPoliticaEleicaoEditar";
const id = editando ? Number(route.params.id) : 0;
const { podeAtualizar: podeSincronizar } = usePermissaoMenu("admin.politica_candidatos");
const { erro, sucesso, campos, salvando, buscarPorId, salvar, subirArquivo, enfileirar, subirComplementar, enfileirarComplementar, subirBens, enfileirarBens, subirColigacao, enfileirarColigacao, subirVagas, enfileirarVagas, subirMotivos, enfileirarMotivos, subirRedes, enfileirarRedes, subirHistorico, enfileirarHistorico, subirFotos, enfileirarFotos } = useEleicoesAdmin();

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
const possuiArquivoComplementar = ref(false);
const complementarEm = ref<string | null>(null);
const possuiArquivoBens = ref(false);
const bensEm = ref<string | null>(null);
const possuiArquivoColigacao = ref(false);
const coligacaoEm = ref<string | null>(null);
const possuiArquivoVagas = ref(false);
const vagasEm = ref<string | null>(null);
const vagas = ref<VagaEleicao[]>([]);
const arquivo = ref<File | null>(null);
const leitura = ref<LeituraConsultaCand | null>(null);
const nomeArquivo = ref<string | null>(null);
const arquivoComplementar = ref<File | null>(null);
const leituraComplementar = ref<LeituraConsultaCandComplementar | null>(null);
const nomeComplementar = ref<string | null>(null);
const arquivoBens = ref<File | null>(null);
const leituraBens = ref<LeituraBemCandidato | null>(null);
const nomeBens = ref<string | null>(null);
const arquivoColigacao = ref<File | null>(null);
const leituraColigacao = ref<LeituraConsultaColigacao | null>(null);
const nomeColigacao = ref<string | null>(null);
const arquivoVagas = ref<File | null>(null);
const leituraVagas = ref<LeituraConsultaVagas | null>(null);
const nomeVagas = ref<string | null>(null);
const possuiArquivoMotivos = ref(false);
const motivosEm = ref<string | null>(null);
const arquivoMotivos = ref<File | null>(null);
const leituraMotivos = ref<LeituraMotivoCassacao | null>(null);
const nomeMotivos = ref<string | null>(null);
const possuiArquivoRedes = ref(false);
const redesEm = ref<string | null>(null);
const arquivoRedes = ref<File | null>(null);
const leituraRedes = ref<LeituraRedeSocial | null>(null);
const nomeRedes = ref<string | null>(null);
const possuiArquivoHistorico = ref(false);
const historicoEm = ref<string | null>(null);
const arquivoHistorico = ref<File | null>(null);
const leituraHistorico = ref<LeituraHistoricoCandidatura | null>(null);
const nomeHistorico = ref<string | null>(null);
const possuiArquivoFotos = ref(false);
const fotosEm = ref<string | null>(null);
const arquivoFotos = ref<File | null>(null);
const nomeFotos = ref<string | null>(null);
const faseImportacao = ref<"idle" | "lendo" | "enviando" | "enfileirando" | "lendo-complementar" | "enviando-complementar" | "aplicando-complementar" | "lendo-bens" | "enviando-bens" | "aplicando-bens" | "lendo-coligacao" | "enviando-coligacao" | "aplicando-coligacao" | "lendo-vagas" | "enviando-vagas" | "aplicando-vagas" | "lendo-motivos" | "enviando-motivos" | "aplicando-motivos" | "lendo-redes" | "enviando-redes" | "aplicando-redes" | "lendo-historico" | "enviando-historico" | "aplicando-historico" | "enviando-fotos" | "aplicando-fotos">("idle");
const erroLocal = ref<string | null>(null);
const importando = computed(() => faseImportacao.value !== "idle");
const arquivoOverlay = computed(() => {
    if (faseImportacao.value.includes("fotos")) return nomeFotos.value;
    if (faseImportacao.value.includes("historico")) return nomeHistorico.value;
    if (faseImportacao.value.includes("redes")) return nomeRedes.value;
    if (faseImportacao.value.includes("motivos")) return nomeMotivos.value;
    if (faseImportacao.value.includes("vagas")) return nomeVagas.value;
    if (faseImportacao.value.includes("coligacao")) return nomeColigacao.value;
    if (faseImportacao.value.includes("bens")) return nomeBens.value;
    if (faseImportacao.value.includes("complementar")) return nomeComplementar.value;
    return nomeArquivo.value;
});
const textoImportacao = computed(() => {
    if (faseImportacao.value === "lendo") {
        return {
            titulo: "Lendo o arquivo",
            mensagem: "A prévia das candidaturas está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando") {
        return {
            titulo: "Enviando o arquivo",
            mensagem: "O CSV está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "lendo-complementar") {
        return {
            titulo: "Lendo o complementar",
            mensagem: "A prévia das informações está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-complementar") {
        return {
            titulo: "Enviando o complementar",
            mensagem: "O CSV complementar está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-complementar") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "As informações entram na fila e continuam no servidor. Os candidatos não são atualizados nesta tela."
        };
    }
    if (faseImportacao.value === "lendo-bens") {
        return {
            titulo: "Lendo os bens",
            mensagem: "A prévia dos bens está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-bens") {
        return {
            titulo: "Enviando os bens",
            mensagem: "O CSV de bens está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-bens") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "Os bens entram na fila e continuam no servidor. A ficha não é atualizada nesta tela."
        };
    }
    if (faseImportacao.value === "lendo-coligacao") {
        return {
            titulo: "Lendo as coligações",
            mensagem: "A prévia das legendas está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-coligacao") {
        return {
            titulo: "Enviando as coligações",
            mensagem: "O CSV de coligações está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-coligacao") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "As coligações entram na fila e continuam no servidor. A ficha não é atualizada nesta tela."
        };
    }
    if (faseImportacao.value === "lendo-vagas") {
        return {
            titulo: "Lendo as vagas",
            mensagem: "A prévia dos cargos está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-vagas") {
        return {
            titulo: "Enviando as vagas",
            mensagem: "O CSV de vagas está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-vagas") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "As vagas entram na fila e continuam no servidor. A lista oficial não muda nesta tela."
        };
    }
    if (faseImportacao.value === "lendo-motivos") {
        return {
            titulo: "Lendo os motivos",
            mensagem: "A prévia dos fundamentos está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-motivos") {
        return {
            titulo: "Enviando os motivos",
            mensagem: "O CSV de motivos está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-motivos") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "Os motivos entram na fila e continuam no servidor. A ficha não é atualizada nesta tela."
        };
    }
    if (faseImportacao.value === "lendo-redes") {
        return {
            titulo: "Lendo as redes",
            mensagem: "A prévia dos links está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-redes") {
        return {
            titulo: "Enviando as redes",
            mensagem: "O CSV de redes sociais está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-redes") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "As redes entram na fila e continuam no servidor. A ficha não é atualizada nesta tela."
        };
    }
    if (faseImportacao.value === "lendo-historico") {
        return {
            titulo: "Lendo o histórico",
            mensagem: "A prévia das candidaturas anteriores está sendo montada neste navegador."
        };
    }
    if (faseImportacao.value === "enviando-historico") {
        return {
            titulo: "Enviando o histórico",
            mensagem: "O CSV de histórico está sendo gravado nesta eleição."
        };
    }
    if (faseImportacao.value === "aplicando-historico") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "O histórico entra na fila e continua no servidor. A ficha não é atualizada nesta tela."
        };
    }
    if (faseImportacao.value === "enviando-fotos") {
        return {
            titulo: "Enviando as fotos",
            mensagem: "O ZIP está sendo gravado nesta eleição. As imagens não são abertas neste navegador."
        };
    }
    if (faseImportacao.value === "aplicando-fotos") {
        return {
            titulo: "Pedindo a aplicação",
            mensagem: "As fotos entram na fila e continuam no servidor. A ficha não é atualizada nesta tela."
        };
    }
    return {
        titulo: "Pedindo a leitura",
        mensagem: "A importação entra na fila e continua no servidor. Os candidatos não aparecem todos nesta tela."
    };
});

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
    possuiArquivoComplementar.value = eleicao.possuiArquivoComplementar;
    complementarEm.value = eleicao.complementarEm;
    possuiArquivoBens.value = eleicao.possuiArquivoBens;
    bensEm.value = eleicao.bensEm;
    possuiArquivoColigacao.value = eleicao.possuiArquivoColigacao;
    coligacaoEm.value = eleicao.coligacaoEm;
    possuiArquivoVagas.value = eleicao.possuiArquivoVagas;
    vagasEm.value = eleicao.vagasEm;
    vagas.value = eleicao.vagas;
    possuiArquivoMotivos.value = eleicao.possuiArquivoMotivos;
    motivosEm.value = eleicao.motivosEm;
    possuiArquivoRedes.value = eleicao.possuiArquivoRedes;
    redesEm.value = eleicao.redesEm;
    possuiArquivoHistorico.value = eleicao.possuiArquivoHistorico;
    historicoEm.value = eleicao.historicoEm;
    possuiArquivoFotos.value = eleicao.possuiArquivoFotos;
    fotosEm.value = eleicao.fotosEm;
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
        possuiArquivoComplementar.value = eleicao.possuiArquivoComplementar;
        complementarEm.value = eleicao.complementarEm;
        possuiArquivoBens.value = eleicao.possuiArquivoBens;
        bensEm.value = eleicao.bensEm;
        possuiArquivoColigacao.value = eleicao.possuiArquivoColigacao;
        coligacaoEm.value = eleicao.coligacaoEm;
        possuiArquivoVagas.value = eleicao.possuiArquivoVagas;
        vagasEm.value = eleicao.vagasEm;
        vagas.value = eleicao.vagas;
        possuiArquivoMotivos.value = eleicao.possuiArquivoMotivos;
        motivosEm.value = eleicao.motivosEm;
        possuiArquivoRedes.value = eleicao.possuiArquivoRedes;
        redesEm.value = eleicao.redesEm;
        possuiArquivoHistorico.value = eleicao.possuiArquivoHistorico;
        historicoEm.value = eleicao.historicoEm;
        possuiArquivoFotos.value = eleicao.possuiArquivoFotos;
        fotosEm.value = eleicao.fotosEm;
    } catch {
        return;
    }
}

async function aoEscolherArquivo(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivo.value = escolhido;
    leitura.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeArquivo.value = escolhido.name;
    faseImportacao.value = "lendo";
    try {
        leitura.value = await lerConsultaCandArquivo(escolhido);
        if (leitura.value.erro) erroLocal.value = leitura.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoArquivo() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivo.value) return;
    if (!arquivo.value.name.toLowerCase().match(/\.csv$|\.txt$/)) {
        erroLocal.value = "Envie um arquivo CSV.";
        return;
    }
    if (arquivo.value.size > 50 * 1024 * 1024) {
        erroLocal.value = "O CSV pode ter no máximo 50 MB.";
        return;
    }
    faseImportacao.value = "enviando";
    try {
        const resp = await subirArquivo(id, arquivo.value);
        possuiArquivo.value = resp.possuiArquivo ?? true;
        arquivo.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoSincronizar() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "enfileirando";
    try {
        await enfileirar(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

function arquivoValido(escolhido: File): boolean {
    if (!escolhido.name.toLowerCase().match(/\.csv$|\.txt$/)) {
        erroLocal.value = "Envie um arquivo CSV.";
        return false;
    }
    if (escolhido.size > 50 * 1024 * 1024) {
        erroLocal.value = "O CSV pode ter no máximo 50 MB.";
        return false;
    }
    return true;
}

function zipValido(escolhido: File): boolean {
    if (!escolhido.name.toLowerCase().endsWith(".zip")) {
        erroLocal.value = "Envie um arquivo ZIP.";
        return false;
    }
    if (escolhido.size > 64 * 1024 * 1024) {
        erroLocal.value = "O ZIP pode ter no máximo 64 MB.";
        return false;
    }
    return true;
}

function tamanhoArquivo(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
    }
    if (bytes >= 1024) {
        return `${Math.round(bytes / 1024).toLocaleString("pt-BR")} KB`;
    }
    return `${bytes} B`;
}

async function aoEscolherComplementar(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoComplementar.value = escolhido;
    leituraComplementar.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeComplementar.value = escolhido.name;
    faseImportacao.value = "lendo-complementar";
    try {
        leituraComplementar.value = await lerConsultaCandComplementarArquivo(escolhido);
        if (leituraComplementar.value.erro) erroLocal.value = leituraComplementar.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarComplementar() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoComplementar.value) return;
    if (!arquivoValido(arquivoComplementar.value)) return;
    faseImportacao.value = "enviando-complementar";
    try {
        const resp = await subirComplementar(id, arquivoComplementar.value);
        possuiArquivoComplementar.value = resp.possuiArquivoComplementar ?? true;
        arquivoComplementar.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarComplementar() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-complementar";
    try {
        await enfileirarComplementar(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEscolherBens(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoBens.value = escolhido;
    leituraBens.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeBens.value = escolhido.name;
    faseImportacao.value = "lendo-bens";
    try {
        leituraBens.value = await lerBemCandidatoArquivo(escolhido);
        if (leituraBens.value.erro) erroLocal.value = leituraBens.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarBens() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoBens.value) return;
    if (!arquivoValido(arquivoBens.value)) return;
    faseImportacao.value = "enviando-bens";
    try {
        const resp = await subirBens(id, arquivoBens.value);
        possuiArquivoBens.value = resp.possuiArquivoBens ?? true;
        arquivoBens.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarBens() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-bens";
    try {
        await enfileirarBens(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEscolherColigacao(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoColigacao.value = escolhido;
    leituraColigacao.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeColigacao.value = escolhido.name;
    faseImportacao.value = "lendo-coligacao";
    try {
        leituraColigacao.value = await lerConsultaColigacaoArquivo(escolhido);
        if (leituraColigacao.value.erro) erroLocal.value = leituraColigacao.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarColigacao() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoColigacao.value) return;
    if (!arquivoValido(arquivoColigacao.value)) return;
    faseImportacao.value = "enviando-coligacao";
    try {
        const resp = await subirColigacao(id, arquivoColigacao.value);
        possuiArquivoColigacao.value = resp.possuiArquivoColigacao ?? true;
        arquivoColigacao.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarColigacao() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-coligacao";
    try {
        await enfileirarColigacao(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEscolherVagas(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoVagas.value = escolhido;
    leituraVagas.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeVagas.value = escolhido.name;
    faseImportacao.value = "lendo-vagas";
    try {
        leituraVagas.value = await lerConsultaVagasArquivo(escolhido);
        if (leituraVagas.value.erro) erroLocal.value = leituraVagas.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarVagas() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoVagas.value) return;
    if (!arquivoValido(arquivoVagas.value)) return;
    faseImportacao.value = "enviando-vagas";
    try {
        const resp = await subirVagas(id, arquivoVagas.value);
        possuiArquivoVagas.value = resp.possuiArquivoVagas ?? true;
        arquivoVagas.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarVagas() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-vagas";
    try {
        await enfileirarVagas(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEscolherMotivos(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoMotivos.value = escolhido;
    leituraMotivos.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeMotivos.value = escolhido.name;
    faseImportacao.value = "lendo-motivos";
    try {
        leituraMotivos.value = await lerMotivoCassacaoArquivo(escolhido);
        if (leituraMotivos.value.erro) erroLocal.value = leituraMotivos.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarMotivos() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoMotivos.value) return;
    if (!arquivoValido(arquivoMotivos.value)) return;
    faseImportacao.value = "enviando-motivos";
    try {
        const resp = await subirMotivos(id, arquivoMotivos.value);
        possuiArquivoMotivos.value = resp.possuiArquivoMotivos ?? true;
        arquivoMotivos.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarMotivos() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-motivos";
    try {
        await enfileirarMotivos(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEscolherRedes(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoRedes.value = escolhido;
    leituraRedes.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeRedes.value = escolhido.name;
    faseImportacao.value = "lendo-redes";
    try {
        leituraRedes.value = await lerRedeSocialArquivo(escolhido);
        if (leituraRedes.value.erro) erroLocal.value = leituraRedes.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarRedes() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoRedes.value) return;
    if (!arquivoValido(arquivoRedes.value)) return;
    faseImportacao.value = "enviando-redes";
    try {
        const resp = await subirRedes(id, arquivoRedes.value);
        possuiArquivoRedes.value = resp.possuiArquivoRedes ?? true;
        arquivoRedes.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarRedes() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-redes";
    try {
        await enfileirarRedes(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEscolherHistorico(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoHistorico.value = escolhido;
    leituraHistorico.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    nomeHistorico.value = escolhido.name;
    faseImportacao.value = "lendo-historico";
    try {
        leituraHistorico.value = await lerHistoricoCandidaturaArquivo(escolhido);
        if (leituraHistorico.value.erro) erroLocal.value = leituraHistorico.value.erro;
    } catch {
        erroLocal.value = "Não foi possível ler este arquivo.";
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoEnviarHistorico() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoHistorico.value) return;
    if (!arquivoValido(arquivoHistorico.value)) return;
    faseImportacao.value = "enviando-historico";
    try {
        const resp = await subirHistorico(id, arquivoHistorico.value);
        possuiArquivoHistorico.value = resp.possuiArquivoHistorico ?? true;
        arquivoHistorico.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarHistorico() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-historico";
    try {
        await enfileirarHistorico(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

function aoEscolherFotos(evento: Event) {
    const escolhido = (evento.target as HTMLInputElement).files?.[0] ?? null;
    arquivoFotos.value = null;
    nomeFotos.value = null;
    erroLocal.value = null;
    if (!escolhido || faseImportacao.value !== "idle") return;
    if (!zipValido(escolhido)) return;
    arquivoFotos.value = escolhido;
    nomeFotos.value = escolhido.name;
}

async function aoEnviarFotos() {
    erroLocal.value = null;
    if (faseImportacao.value !== "idle" || !arquivoFotos.value) return;
    if (!zipValido(arquivoFotos.value)) return;
    faseImportacao.value = "enviando-fotos";
    try {
        const resp = await subirFotos(id, arquivoFotos.value);
        possuiArquivoFotos.value = resp.possuiArquivoFotos ?? true;
        arquivoFotos.value = null;
        nomeFotos.value = null;
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}

async function aoAplicarFotos() {
    if (faseImportacao.value !== "idle") return;
    faseImportacao.value = "aplicando-fotos";
    try {
        await enfileirarFotos(id);
    } catch {
        return;
    } finally {
        faseImportacao.value = "idle";
    }
}
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <RouterLink :to="{ name: 'AdministradorPoliticaEleicoes' }" class="d-inline-flex align-items-center gap-1 mb-3 text-decoration-none fw-bold">
                <RiArrowLeftLine /> Voltar para eleições
            </RouterLink>
            <AdminPageHero
                :title="editando ? 'Editar eleição' : 'Nova eleição'"
                subtitle="Baixe o consulta_cand no Portal de Dados Abertos do TSE e envie o arquivo aqui. O site não consulta o TSE ao vivo."
            >
                <template #icon><RiGovernmentLine /></template>
            </AdminPageHero>

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
                        <button class="btn pol-btn" type="submit" :disabled="salvando || importando">
                            <RiSave3Line class="me-1" /> {{ salvando && !importando ? "Salvando…" : "Salvar eleição" }}
                        </button>
                    </div>
                </div>
            </form>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel">
                <div class="card-body">
                    <div class="d-flex flex-wrap justify-content-between gap-2 mb-2">
                        <h2 class="h5 mb-0">Arquivo consulta_cand</h2>
                        <RouterLink class="fw-bold text-decoration-none" :to="{ name: 'AdministradorPoliticaCandidatoCadastro' }">
                            Cadastrar um candidato
                        </RouterLink>
                    </div>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivo ? "sim" : "não" }}</strong>.
                        Última leitura: <strong>{{ formatarDataCurta(sincronizadoEm) }}</strong>.
                    </p>
                    <div class="pol-alert pol-alert--aviso mb-3">
                        O arquivo do TSE traz CPF, e-mail, título e nascimento. Esta ferramenta não grava nem mostra esses campos. Entram número, nome, nome de urna, cargo, partido, UF e a ficha pública (gênero, instrução, ocupação, agremiação).
                    </div>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">consulta_cand_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherArquivo" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivo || importando || salvando || Boolean(leitura?.erro)" @click="aoArquivo">Enviar arquivo</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!possuiArquivo || importando || salvando"
                                @click="aoSincronizar"
                            >
                                Ler candidatos
                            </button>
                        </div>
                    </div>
                    <div v-if="leitura && !leitura.erro && !importando" class="mt-3">
                        <p class="mb-2">
                            <strong>{{ leitura.total }}</strong> candidaturas
                            <template v-if="leitura.ano"> · {{ leitura.ano }}</template>
                            <template v-if="leitura.ufArquivo"> · {{ leitura.ufArquivo }}</template>
                            <template v-if="leitura.eleicao"> · {{ leitura.eleicao }}</template>
                        </p>
                        <p v-if="leitura.semCargo" class="small text-muted">{{ leitura.semCargo }} linhas sem cargo reconhecido ficarão de fora da leitura.</p>
                        <div class="pol-urna-grade">
                            <PoliticaCandidatoCartao
                                v-for="(pessoa, indice) in leitura.previa"
                                :key="`${pessoa.numero}-${indice}`"
                                :numero="pessoa.numero"
                                :nome-urna="pessoa.nomeUrna"
                                :nome="pessoa.nome"
                                :partido="pessoa.partido"
                                :cargo="pessoa.cargo"
                                :uf="pessoa.uf"
                                :detalhe="pessoa.detalhe"
                            />
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia das primeiras candidaturas. Envie o arquivo e depois peça a leitura: ela entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Informações complementares</h2>
                    <p class="text-muted">Arquivo consulta_cand_complementar do Portal de Dados Abertos. Ele completa o candidato já lido e não cria candidatura nova.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoComplementar ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(complementarEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar o complementar.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">consulta_cand_complementar_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherComplementar" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoComplementar || importando || salvando || Boolean(leituraComplementar?.erro)" @click="aoEnviarComplementar">Enviar complementar</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoComplementar && !possuiArquivoComplementar) || importando || salvando || Boolean(leituraComplementar?.erro)"
                                @click="aoAplicarComplementar"
                            >
                                Aplicar complementar
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraComplementar && !leituraComplementar.erro && !importando" class="mt-3">
                        <p class="mb-2"><strong>{{ leituraComplementar.total }}</strong> linhas. Este arquivo não traz nome nem número de urna.</p>
                        <div class="pol-urna-grade">
                            <article v-for="(linha, indice) in leituraComplementar.previa" :key="indice" class="pol-urna-card">
                                <div class="pol-urna-card__corpo">
                                    <strong>{{ linha.julgamento || "Julgamento não informado" }}</strong>
                                    <small>Inserido na urna: {{ linha.inseridoUrna || "—" }}</small>
                                    <span v-if="linha.municipioNascimento">{{ linha.municipioNascimento }}</span>
                                    <span v-if="linha.etniaIndigena">Etnia indígena: {{ linha.etniaIndigena }}</span>
                                </div>
                            </article>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia das primeiras linhas. Envie o arquivo e depois aplique: a atualização entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Bens declarados</h2>
                    <p class="text-muted">Arquivo bem_candidato do Portal de Dados Abertos. Vários bens podem pertencer ao mesmo candidato. Quem não está no arquivo não é criado e não perde bens já gravados.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoBens ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(bensEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar os bens.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">bem_candidato_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherBens" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoBens || importando || salvando || Boolean(leituraBens?.erro)" @click="aoEnviarBens">Enviar bens</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoBens && !possuiArquivoBens) || importando || salvando || Boolean(leituraBens?.erro)"
                                @click="aoAplicarBens"
                            >
                                Aplicar bens
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraBens && !leituraBens.erro && !importando" class="mt-3">
                        <p class="mb-2">
                            <strong>{{ leituraBens.total }}</strong> bens
                            · <strong>{{ leituraBens.candidaturas }}</strong> candidaturas
                            · soma da prévia <strong>{{ formatarTetoGasto(leituraBens.soma) }}</strong>
                        </p>
                        <div class="pol-urna-grade">
                            <article v-for="(bem, indice) in leituraBens.previa" :key="indice" class="pol-urna-card">
                                <span class="pol-urna-card__num">{{ bem.ordem || "—" }}</span>
                                <div class="pol-urna-card__corpo">
                                    <strong>{{ bem.tipo || "Tipo não informado" }}</strong>
                                    <span v-if="bem.descricao" class="pol-bem-desc">{{ bem.descricao }}</span>
                                    <small>{{ formatarTetoGasto(bem.valor) || "Valor não informado" }}</small>
                                </div>
                            </article>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia dos primeiros bens, não dos candidatos. O valor é o declarado do bem. Envie o arquivo e depois aplique: a gravação entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Coligações</h2>
                    <p class="text-muted">Arquivo consulta_coligacao do Portal de Dados Abertos. Cada linha é a legenda de um partido em um cargo. Quem já é candidato desse partido, cargo e UF recebe a legenda. Quem não está no arquivo não é criado e não perde a coligação já gravada.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoColigacao ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(coligacaoEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar as coligações.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">consulta_coligacao_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherColigacao" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoColigacao || importando || salvando || Boolean(leituraColigacao?.erro)" @click="aoEnviarColigacao">Enviar coligações</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoColigacao && !possuiArquivoColigacao) || importando || salvando || Boolean(leituraColigacao?.erro)"
                                @click="aoAplicarColigacao"
                            >
                                Aplicar coligações
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraColigacao && !leituraColigacao.erro && !importando" class="mt-3">
                        <p class="mb-2">
                            <strong>{{ leituraColigacao.total }}</strong> linhas
                            · {{ leituraColigacao.coligacoes }} coligações
                            · {{ leituraColigacao.federacoes }} federações
                            · {{ leituraColigacao.isolados }} partidos isolados
                        </p>
                        <div class="pol-urna-grade">
                            <article v-for="(legenda, indice) in leituraColigacao.previa" :key="indice" class="pol-urna-card">
                                <div class="pol-urna-card__corpo">
                                    <strong>{{ legenda.nome || legenda.tipo || "Legenda" }}</strong>
                                    <small>{{ [legenda.partido, legenda.cargo, legenda.nome ? legenda.tipo : ""].filter(Boolean).join(" · ") }}</small>
                                    <span v-if="legenda.composicao" class="pol-bem-desc">{{ legenda.composicao }}</span>
                                    <span v-if="legenda.situacao">{{ legenda.situacao }}</span>
                                </div>
                            </article>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia das primeiras legendas, não dos candidatos. Envie o arquivo e depois aplique: a gravação entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Vagas</h2>
                    <p class="text-muted">Arquivo consulta_vagas do Portal de Dados Abertos. Cada linha diz quantas vagas o cargo tem na unidade eleitoral. A lista vale para a eleição inteira. Uma nova aplicação substitui a lista anterior.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoVagas ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(vagasEm) }}</strong>.
                    </p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">consulta_vagas_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherVagas" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoVagas || importando || salvando || Boolean(leituraVagas?.erro)" @click="aoEnviarVagas">Enviar vagas</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="(!arquivoVagas && !possuiArquivoVagas) || importando || salvando || Boolean(leituraVagas?.erro)"
                                @click="aoAplicarVagas"
                            >
                                Aplicar vagas
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraVagas && !leituraVagas.erro && !importando" class="mt-3">
                        <p class="mb-2"><strong>{{ leituraVagas.linhas.length }}</strong> cargos. Cada quantidade vale só para o próprio cargo.</p>
                        <div class="table-responsive">
                            <table class="table pol-table mb-0">
                                <thead>
                                    <tr><th>Cargo</th><th>UF</th><th>Unidade</th><th>Quantidade</th></tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(linha, indice) in leituraVagas.linhas" :key="indice">
                                        <td>{{ linha.cargo || "—" }}</td>
                                        <td>{{ linha.uf || "—" }}</td>
                                        <td>{{ linha.unidade || "—" }}</td>
                                        <td>{{ linha.quantidade || "—" }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia neste navegador. A tabela oficial só muda depois que a fila termina e a eleição é aberta de novo.</p>
                    </div>
                    <div v-if="vagas.length" class="mt-3">
                        <h3 class="h6">Lista gravada</h3>
                        <div class="table-responsive">
                            <table class="table pol-table mb-0">
                                <thead>
                                    <tr><th>Cargo</th><th>UF</th><th>Unidade eleitoral</th><th>Quantidade</th><th>Posse</th></tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(vaga, indice) in vagas" :key="`${vaga.cargoCodigo}-${indice}`">
                                        <td>{{ vaga.cargoNome || vaga.cargoCodigo }}</td>
                                        <td>{{ vaga.uf || "—" }}</td>
                                        <td>{{ vaga.unidadeEleitoral || vaga.siglaUe || "—" }}</td>
                                        <td>{{ vaga.quantidade }}</td>
                                        <td>{{ vaga.posse || "—" }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Motivos de cassação</h2>
                    <p class="text-muted">Arquivo de motivos do Portal de Dados Abertos. Cada linha é um fundamento ligado ao sequencial do candidato. A mesma pessoa pode ter mais de um. Quem não está no arquivo não é criado e não perde motivos já gravados. Este envio não muda o status do candidato.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoMotivos ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(motivosEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar os motivos.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">motivo_cassacao_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherMotivos" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoMotivos || importando || salvando || Boolean(leituraMotivos?.erro)" @click="aoEnviarMotivos">Enviar motivos</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoMotivos && !possuiArquivoMotivos) || importando || salvando || Boolean(leituraMotivos?.erro)"
                                @click="aoAplicarMotivos"
                            >
                                Aplicar motivos
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraMotivos && !leituraMotivos.erro && !importando" class="mt-3">
                        <p class="mb-2">
                            <strong>{{ leituraMotivos.linhas }}</strong> linhas
                            · {{ leituraMotivos.sequenciais }} sequenciais
                        </p>
                        <div class="pol-urna-grade">
                            <article v-for="(motivo, indice) in leituraMotivos.previa" :key="indice" class="pol-urna-card">
                                <div class="pol-urna-card__corpo">
                                    <strong>{{ motivo.descricao || "Motivo" }}</strong>
                                    <small v-if="motivo.tipo">{{ motivo.tipo }}</small>
                                    <span v-if="motivo.processo">Processo {{ motivo.processo }}</span>
                                </div>
                            </article>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia dos primeiros fundamentos, neste navegador. Envie o arquivo e depois aplique: a gravação entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Redes sociais</h2>
                    <p class="text-muted">Arquivo rede_social_candidato do Portal de Dados Abertos. Cada linha é um link ou um texto de rede do candidato, na ordem em que ele declarou. Quem não está no arquivo não é criado e não perde redes já gravadas.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoRedes ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(redesEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar as redes sociais.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">rede_social_candidato_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherRedes" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoRedes || importando || salvando || Boolean(leituraRedes?.erro)" @click="aoEnviarRedes">Enviar redes</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoRedes && !possuiArquivoRedes) || importando || salvando || Boolean(leituraRedes?.erro)"
                                @click="aoAplicarRedes"
                            >
                                Aplicar redes
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraRedes && !leituraRedes.erro && !importando" class="mt-3">
                        <p class="mb-2">
                            <strong>{{ leituraRedes.linhas }}</strong> linhas
                            · {{ leituraRedes.sequenciais }} sequenciais
                        </p>
                        <div class="pol-urna-grade">
                            <article v-for="(rede, indice) in leituraRedes.previa" :key="indice" class="pol-urna-card">
                                <div class="pol-urna-card__corpo">
                                    <strong class="pol-bem-texto">{{ rede.url || "Rede" }}</strong>
                                    <small v-if="rede.ordem">Ordem {{ rede.ordem }}</small>
                                </div>
                            </article>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia dos primeiros textos, neste navegador. Envie o arquivo e depois aplique: a gravação entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Histórico de candidaturas</h2>
                    <p class="text-muted">Arquivo de histórico do Portal de Dados Abertos. Cada linha é uma candidatura anterior da pessoa que concorre agora. Dois turnos aparecem em duas linhas. Quem não está no arquivo não é criado e não perde o histórico já gravado. Este envio não muda o status nem o partido atuais.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoHistorico ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(historicoEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar o histórico.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">historico_candidatura_ANO_UF.csv (até 50 MB)</label>
                            <input class="form-control" type="file" accept=".csv,.txt,text/csv" :disabled="importando || salvando" @change="aoEscolherHistorico" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoHistorico || importando || salvando || Boolean(leituraHistorico?.erro)" @click="aoEnviarHistorico">Enviar histórico</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoHistorico && !possuiArquivoHistorico) || importando || salvando || Boolean(leituraHistorico?.erro)"
                                @click="aoAplicarHistorico"
                            >
                                Aplicar histórico
                            </button>
                        </div>
                    </div>
                    <div v-if="leituraHistorico && !leituraHistorico.erro && !importando" class="mt-3">
                        <p class="mb-2">
                            <strong>{{ leituraHistorico.linhas }}</strong> linhas
                            · {{ leituraHistorico.sequenciais }} sequenciais atuais
                        </p>
                        <div class="pol-urna-grade">
                            <article v-for="(linha, indice) in leituraHistorico.previa" :key="indice" class="pol-urna-card">
                                <div class="pol-urna-card__corpo">
                                    <strong>{{ [linha.ano, linha.cargo].filter(Boolean).join(" · ") || "Candidatura" }}</strong>
                                    <small>{{ [linha.turno ? `turno ${linha.turno}` : "", linha.unidade, linha.sigla, linha.resultado].filter(Boolean).join(" · ") }}</small>
                                </div>
                            </article>
                        </div>
                        <p class="small text-muted mt-2 mb-0">Prévia das primeiras candidaturas anteriores, neste navegador. Envie o arquivo e depois aplique: a gravação entra na fila e não termina nesta tela.</p>
                    </div>
                </div>
            </section>

            <section v-if="editando" class="card border-0 shadow-sm pol-panel mt-3">
                <div class="card-body">
                    <h2 class="h5 mb-1">Fotos dos candidatos</h2>
                    <p class="text-muted">ZIP de fotos divulgáveis do Portal de Dados Abertos. O nome F + UF + sequencial liga a imagem ao candidato já importado. Quem não está no pacote não perde a foto. Este envio não muda o status.</p>
                    <p class="text-muted">
                        Arquivo no servidor: <strong>{{ possuiArquivoFotos ? "sim" : "não" }}</strong>.
                        Última aplicação: <strong>{{ formatarDataCurta(fotosEm) }}</strong>.
                    </p>
                    <p v-if="!sincronizadoEm" class="small text-muted">Leia os candidatos antes de aplicar as fotos.</p>
                    <div class="row g-3 align-items-end">
                        <div class="col-lg-7">
                            <label class="form-label">foto_candANO_UF_div.zip (até 64 MB)</label>
                            <input class="form-control" type="file" accept=".zip,application/zip" :disabled="importando || salvando" @change="aoEscolherFotos" />
                        </div>
                        <div class="col-lg-5 d-flex flex-wrap gap-2">
                            <button class="btn pol-btn--ghost" type="button" :disabled="!arquivoFotos || importando || salvando" @click="aoEnviarFotos">Enviar fotos</button>
                            <button
                                v-if="podeSincronizar"
                                class="btn pol-btn"
                                type="button"
                                :disabled="!sincronizadoEm || (!arquivoFotos && !possuiArquivoFotos) || importando || salvando"
                                @click="aoAplicarFotos"
                            >
                                Aplicar fotos
                            </button>
                        </div>
                    </div>
                    <p v-if="arquivoFotos && !importando" class="small text-muted mt-3 mb-0">
                        {{ arquivoFotos.name }} · {{ tamanhoArquivo(arquivoFotos.size) }}. O ZIP segue inteiro para o servidor. As fotos só entram na ficha depois que a fila termina.
                    </p>
                </div>
            </section>
        </div>
        <PoliticaImportacaoOverlay
            v-if="importando"
            :titulo="textoImportacao.titulo"
            :mensagem="textoImportacao.mensagem"
            :arquivo="arquivoOverlay"
        />
    </article>
</template>
