import { computed, ref } from "vue";
import type { ResultadoFiltro } from "@/domain/politica/tipos";
import type { PesquisaResultado } from "@/domain/politica/tipos";
import {
    ExportarCsvPesquisaUseCase,
    ExportarPdfPesquisaUseCase,
    ListarCargosUseCase,
    ListarMunicipiosPoliticaUseCase,
    ObterPesquisaUseCase,
    ObterResultadosPesquisaUseCase
} from "@/application/use-cases/Politica/PoliticaUseCases";
import type { Cargo, MunicipioPolitica, PesquisaDetalhe } from "@/domain/politica/tipos";
import { usePoliticaRepository } from "@/presentation/composables/Politica/usePoliticaRepository";
import { lerErroApi } from "@/shared/utils/apiMensagem";

export function useResultadosPolitica() {
    const repo = usePoliticaRepository();
    const obter = new ObterResultadosPesquisaUseCase(repo);
    const pesquisaCaso = new ObterPesquisaUseCase(repo);
    const municipiosCaso = new ListarMunicipiosPoliticaUseCase(repo);
    const cargosCaso = new ListarCargosUseCase(repo);
    const csvCaso = new ExportarCsvPesquisaUseCase(repo);
    const pdfCaso = new ExportarPdfPesquisaUseCase(repo);

    const resultado = ref<PesquisaResultado | null>(null);
    const pesquisa = ref<PesquisaDetalhe | null>(null);
    const municipios = ref<MunicipioPolitica[]>([]);
    const cargos = ref<Cargo[]>([]);
    const carregando = ref(false);
    const exportando = ref<"csv" | "pdf" | null>(null);
    const erro = ref<string | null>(null);
    const ibge = ref("");
    const cargoId = ref("");
    const perguntaId = ref("");
    const inicio = ref("");
    const fim = ref("");

    const filtro = computed<ResultadoFiltro>(() => ({
        ibge: ibge.value || undefined,
        cargo_id: cargoId.value ? Number(cargoId.value) : undefined,
        pergunta_id: perguntaId.value ? Number(perguntaId.value) : undefined,
        inicio: inicio.value || undefined,
        fim: fim.value || undefined
    }));

    async function carregar(id: number) {
        carregando.value = true;
        erro.value = null;
        try {
            const [res, det] = await Promise.all([
                obter.execute(id, filtro.value),
                pesquisa.value ? Promise.resolve(pesquisa.value) : pesquisaCaso.execute(id)
            ]);
            resultado.value = res;
            pesquisa.value = det;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível carregar os resultados.").mensagem;
        } finally {
            carregando.value = false;
        }
    }

    async function carregarFiltros() {
        const tarefas = await Promise.allSettled([
            municipiosCaso.execute(),
            cargosCaso.execute({ page: 1, per_page: 100 })
        ]);
        if (tarefas[0].status === "fulfilled") municipios.value = tarefas[0].value;
        if (tarefas[1].status === "fulfilled") cargos.value = tarefas[1].value.itens;
    }

    async function baixarCsv(id: number) {
        exportando.value = "csv";
        erro.value = null;
        try {
            const arquivo = await csvCaso.execute(id, filtro.value);
            dispararDownload(arquivo.blob, arquivo.filename);
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível baixar o CSV.").mensagem;
        } finally {
            exportando.value = null;
        }
    }

    async function abrirPdf(id: number) {
        exportando.value = "pdf";
        erro.value = null;
        try {
            const arquivo = await pdfCaso.execute(id, filtro.value);
            const url = URL.createObjectURL(arquivo.blob);
            window.open(url, "_blank", "noopener");
            window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível abrir o PDF.").mensagem;
        } finally {
            exportando.value = null;
        }
    }

    return {
        resultado,
        pesquisa,
        municipios,
        cargos,
        carregando,
        exportando,
        erro,
        ibge,
        cargoId,
        perguntaId,
        inicio,
        fim,
        carregar,
        carregarFiltros,
        baixarCsv,
        abrirPdf
    };
}

function dispararDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
