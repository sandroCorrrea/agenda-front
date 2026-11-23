import { computed, ref } from "vue";
import {
    BaixarReceitaOrcamentariaUseCase,
    EnviarReceitaOrcamentariaUseCase,
    ListarReceitaOrcamentariaUseCase
} from "@/application/use-cases/Casp/ReceitaOrcamentariaUseCases";
import type { ReceitaOrcamentariaArquivo } from "@/domain/casp/receitaOrcamentaria";
import { useReceitaOrcamentariaRepository } from "@/presentation/composables/Casp/useReceitaOrcamentariaRepository";
import { dispararDownloadBlob } from "@/shared/utils/downloadBlob";
import { lerErroApi } from "@/shared/utils/apiMensagem";
import {
    POR_PAGINA_RECEITA,
    apelidoNormalizado,
    erroDeEnvio,
    mensagemArquivoCliente,
    textoBusca
} from "@/shared/utils/receitaOrcamentaria";

export function useReceitaOrcamentaria() {
    const repo = useReceitaOrcamentariaRepository();
    const listar = new ListarReceitaOrcamentariaUseCase(repo);
    const enviarPlanilha = new EnviarReceitaOrcamentariaUseCase(repo);
    const baixarPlanilha = new BaixarReceitaOrcamentariaUseCase(repo);

    const arquivos = ref<ReceitaOrcamentariaArquivo[]>([]);
    const carregando = ref(false);
    const enviando = ref(false);
    const progresso = ref<number | null>(null);
    const baixandoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const erroEnvio = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const campos = ref<Record<string, string>>({});
    const q = ref("");
    const buscaAtiva = ref("");
    const pagina = ref(1);
    const total = ref(0);
    const porPagina = ref(POR_PAGINA_RECEITA);
    const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / (porPagina.value || 1))));

    let pedido = 0;

    async function carregar(page = 1) {
        const atual = ++pedido;
        carregando.value = true;
        erro.value = null;
        try {
            const busca = textoBusca(q.value);
            const resp = await listar.execute({
                q: busca,
                page,
                per_page: porPagina.value
            });
            if (atual !== pedido) return;
            arquivos.value = resp.arquivos;
            total.value = resp.total;
            pagina.value = resp.pagina || page;
            porPagina.value = resp.porPagina || POR_PAGINA_RECEITA;
            buscaAtiva.value = busca ?? "";
        } catch (e: unknown) {
            if (atual !== pedido) return;
            erro.value = lerErroApi(e, "Não foi possível carregar as receitas orçamentárias.").mensagem;
        } finally {
            if (atual === pedido) carregando.value = false;
        }
    }

    async function enviar(arquivo: File | null, apelidoInformado: string): Promise<boolean> {
        sucesso.value = null;
        erroEnvio.value = null;
        const erroArquivo = mensagemArquivoCliente(arquivo);
        const apelido = apelidoNormalizado(apelidoInformado);
        if (erroArquivo || apelido.erro || !arquivo) {
            campos.value = {
                ...(erroArquivo ? { arquivo: erroArquivo } : {}),
                ...(apelido.erro ? { apelido: apelido.erro } : {})
            };
            return false;
        }

        campos.value = {};
        enviando.value = true;
        progresso.value = null;
        try {
            const resp = await enviarPlanilha.execute(arquivo, apelido.apelido, (percentual) => {
                progresso.value = percentual;
            });
            sucesso.value = resp.message;
            await carregar(pagina.value || 1);
            return true;
        } catch (e: unknown) {
            aplicarErroEnvio(e);
            return false;
        } finally {
            enviando.value = false;
            progresso.value = null;
        }
    }

    function aplicarErroEnvio(erroDesconhecido: unknown) {
        const lido = erroDeEnvio(lerErroApi(erroDesconhecido, "Não foi possível enviar a planilha."));
        erroEnvio.value = lido.erroEnvio;
        campos.value = lido.campos;
    }

    async function baixar(arquivo: ReceitaOrcamentariaArquivo) {
        baixandoId.value = arquivo.id;
        erro.value = null;
        try {
            const resp = await baixarPlanilha.execute(arquivo.id, arquivo.nomeOriginal);
            dispararDownloadBlob(resp.blob, resp.filename);
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível baixar o arquivo.").mensagem;
        } finally {
            baixandoId.value = null;
        }
    }

    return {
        arquivos,
        carregando,
        enviando,
        progresso,
        baixandoId,
        erro,
        erroEnvio,
        sucesso,
        campos,
        q,
        buscaAtiva,
        pagina,
        total,
        porPagina,
        totalPaginas,
        carregar,
        enviar,
        baixar
    };
}
