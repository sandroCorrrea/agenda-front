import { computed, ref } from "vue";
import type { EleicaoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import {
    AtualizarEleicaoUseCase,
    CriarEleicaoUseCase,
    EnviarArquivoEleicaoUseCase,
    ExcluirEleicaoUseCase,
    ListarEleicoesUseCase,
    ObterEleicaoUseCase,
    SincronizarEleicaoUseCase
} from "@/application/use-cases/Politica/PoliticaUseCases";
import type { Eleicao } from "@/domain/politica/tipos";
import { usePoliticaRepository } from "@/presentation/composables/Politica/usePoliticaRepository";
import { lerErroApi } from "@/shared/utils/apiMensagem";

const POR_PAGINA = 12;

export function useEleicoesAdmin() {
    const repo = usePoliticaRepository();
    const listar = new ListarEleicoesUseCase(repo);
    const obter = new ObterEleicaoUseCase(repo);
    const criar = new CriarEleicaoUseCase(repo);
    const atualizar = new AtualizarEleicaoUseCase(repo);
    const excluir = new ExcluirEleicaoUseCase(repo);
    const enviarArquivo = new EnviarArquivoEleicaoUseCase(repo);
    const sincronizar = new SincronizarEleicaoUseCase(repo);

    const itens = ref<Eleicao[]>([]);
    const carregando = ref(false);
    const salvando = ref(false);
    const excluindoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const campos = ref<Record<string, string>>({});
    const q = ref("");
    const status = ref("");
    const tipo = ref("");
    const ano = ref("");
    const pagina = ref(1);
    const total = ref(0);
    const porPagina = ref(POR_PAGINA);

    const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / (porPagina.value || 1))));

    async function carregar(page = 1) {
        carregando.value = true;
        erro.value = null;
        try {
            const resp = await listar.execute({
                page,
                per_page: porPagina.value,
                q: q.value.trim() || undefined,
                status: status.value || undefined,
                tipo: tipo.value || undefined,
                ano: ano.value.trim() ? Number(ano.value) : undefined
            });
            itens.value = resp.itens;
            total.value = resp.total;
            pagina.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível carregar as eleições.").mensagem;
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function buscarPorId(id: number) {
        return obter.execute(id);
    }

    async function salvar(dto: EleicaoSalvarDTO, id?: number) {
        salvando.value = true;
        erro.value = null;
        campos.value = {};
        try {
            const eleicao = id ? await atualizar.execute(id, dto) : await criar.execute(dto);
            sucesso.value = id ? "Eleição atualizada." : "Eleição criada em rascunho.";
            return eleicao;
        } catch (e: unknown) {
            const lido = lerErroApi(e, "Não foi possível salvar a eleição.");
            erro.value = lido.mensagem;
            campos.value = lido.campos;
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    async function remover(id: number) {
        excluindoId.value = id;
        erro.value = null;
        try {
            const resp = await excluir.execute(id);
            sucesso.value = resp.message;
            await carregar(pagina.value);
            if (itens.value.length === 0 && pagina.value > 1) await carregar(pagina.value - 1);
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível excluir a eleição.").mensagem;
        } finally {
            excluindoId.value = null;
        }
    }

    async function subirArquivo(id: number, arquivo: File) {
        salvando.value = true;
        erro.value = null;
        try {
            const resp = await enviarArquivo.execute(id, arquivo);
            sucesso.value = resp.message;
            return resp;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível enviar o CSV.").mensagem;
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    async function enfileirar(id: number) {
        salvando.value = true;
        erro.value = null;
        try {
            const resp = await sincronizar.execute(id);
            sucesso.value = resp.message;
            return resp;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível enfileirar a sincronização.").mensagem;
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    return {
        itens,
        carregando,
        salvando,
        excluindoId,
        erro,
        sucesso,
        campos,
        q,
        status,
        tipo,
        ano,
        pagina,
        total,
        totalPaginas,
        carregar,
        buscarPorId,
        salvar,
        remover,
        subirArquivo,
        enfileirar
    };
}
