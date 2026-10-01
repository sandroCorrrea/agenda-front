import { computed, ref } from "vue";
import type { PesquisaPerguntasSalvarDTO, PesquisaSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import {
    AtualizarPesquisaUseCase,
    AtualizarStatusPesquisaUseCase,
    CriarPesquisaUseCase,
    ExcluirPesquisaUseCase,
    ListarCandidatosUseCase,
    ListarCargosUseCase,
    ListarEleicoesUseCase,
    ListarMunicipiosPoliticaUseCase,
    ListarPesquisasUseCase,
    ObterPesquisaUseCase,
    SalvarPerguntasPesquisaUseCase
} from "@/application/use-cases/Politica/PoliticaUseCases";
import type {
    Candidato,
    Cargo,
    Eleicao,
    MunicipioPolitica,
    PesquisaDetalhe,
    PesquisaResumo
} from "@/domain/politica/tipos";
import { usePoliticaRepository } from "@/presentation/composables/Politica/usePoliticaRepository";
import { lerErroApi } from "@/shared/utils/apiMensagem";

const POR_PAGINA = 12;

export function usePesquisasAdmin() {
    const repo = usePoliticaRepository();
    const listar = new ListarPesquisasUseCase(repo);
    const obter = new ObterPesquisaUseCase(repo);
    const criar = new CriarPesquisaUseCase(repo);
    const atualizar = new AtualizarPesquisaUseCase(repo);
    const excluir = new ExcluirPesquisaUseCase(repo);
    const statusCaso = new AtualizarStatusPesquisaUseCase(repo);
    const perguntasCaso = new SalvarPerguntasPesquisaUseCase(repo);
    const eleicoesCaso = new ListarEleicoesUseCase(repo);
    const cargosCaso = new ListarCargosUseCase(repo);
    const municipiosCaso = new ListarMunicipiosPoliticaUseCase(repo);
    const candidatosCaso = new ListarCandidatosUseCase(repo);

    const itens = ref<PesquisaResumo[]>([]);
    const detalhe = ref<PesquisaDetalhe | null>(null);
    const eleicoes = ref<Eleicao[]>([]);
    const cargos = ref<Cargo[]>([]);
    const municipios = ref<MunicipioPolitica[]>([]);
    const candidatos = ref<Candidato[]>([]);
    const carregando = ref(false);
    const salvando = ref(false);
    const excluindoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const campos = ref<Record<string, string>>({});
    const q = ref("");
    const status = ref("");
    const tipo = ref("");
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
                tipo: tipo.value || undefined
            });
            itens.value = resp.itens;
            total.value = resp.total;
            pagina.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível carregar as pesquisas.").mensagem;
        } finally {
            carregando.value = false;
        }
    }

    async function carregarApoio() {
        const tarefas = await Promise.allSettled([
            eleicoesCaso.execute({ page: 1, per_page: 100 }),
            cargosCaso.execute({ page: 1, per_page: 100 }),
            municipiosCaso.execute()
        ]);
        if (tarefas[0].status === "fulfilled") eleicoes.value = tarefas[0].value.itens;
        if (tarefas[1].status === "fulfilled") cargos.value = tarefas[1].value.itens;
        if (tarefas[2].status === "fulfilled") municipios.value = tarefas[2].value;
        const falha = tarefas.find((item) => item.status === "rejected");
        if (falha && falha.status === "rejected" && !erro.value) {
            erro.value = lerErroApi(falha.reason, "Não foi possível carregar as listas da pesquisa.").mensagem;
        }
    }

    async function carregarCandidatos(eleicaoId: number) {
        const resp = await candidatosCaso.execute({
            eleicao_id: eleicaoId,
            page: 1,
            per_page: 100
        });
        candidatos.value = resp.itens;
        return resp.itens;
    }

    async function abrir(id: number) {
        carregando.value = true;
        erro.value = null;
        try {
            detalhe.value = await obter.execute(id);
            if (detalhe.value.eleicao?.id) {
                await carregarCandidatos(detalhe.value.eleicao.id);
            }
            return detalhe.value;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível abrir a pesquisa.").mensagem;
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar(dto: PesquisaSalvarDTO, id?: number) {
        salvando.value = true;
        erro.value = null;
        campos.value = {};
        try {
            detalhe.value = id ? await atualizar.execute(id, dto) : await criar.execute(dto);
            sucesso.value = id ? "Pesquisa atualizada." : "Pesquisa criada em rascunho.";
            return detalhe.value;
        } catch (e: unknown) {
            const lido = lerErroApi(e, "Não foi possível salvar a pesquisa.");
            erro.value = lido.mensagem;
            campos.value = lido.campos;
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    async function salvarPerguntas(id: number, dto: PesquisaPerguntasSalvarDTO) {
        salvando.value = true;
        erro.value = null;
        try {
            detalhe.value = await perguntasCaso.execute(id, dto);
            sucesso.value = "Perguntas gravadas.";
            return detalhe.value;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível gravar as perguntas.").mensagem;
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    async function mudarStatus(id: number, novo: string) {
        salvando.value = true;
        erro.value = null;
        try {
            detalhe.value = await statusCaso.execute(id, novo);
            sucesso.value = "Status atualizado.";
            return detalhe.value;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível alterar o status.").mensagem;
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
            return true;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível excluir a pesquisa.").mensagem;
            return false;
        } finally {
            excluindoId.value = null;
        }
    }

    return {
        itens,
        detalhe,
        eleicoes,
        cargos,
        municipios,
        candidatos,
        carregando,
        salvando,
        excluindoId,
        erro,
        sucesso,
        campos,
        q,
        status,
        tipo,
        pagina,
        total,
        totalPaginas,
        carregar,
        carregarApoio,
        carregarCandidatos,
        abrir,
        salvar,
        salvarPerguntas,
        mudarStatus,
        remover
    };
}
