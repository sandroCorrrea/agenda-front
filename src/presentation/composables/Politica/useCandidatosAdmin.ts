import { computed, ref } from "vue";
import type { CandidatoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import {
    AtualizarCandidatoUseCase,
    CriarCandidatoUseCase,
    ExcluirCandidatoUseCase,
    ListarCandidatosUseCase,
    ListarEleicoesUseCase,
    ListarCargosUseCase,
    ListarMunicipiosPoliticaUseCase,
    ListarPartidosUseCase,
    ObterCandidatoUseCase
} from "@/application/use-cases/Politica/PoliticaUseCases";
import type { Candidato, Cargo, Eleicao, MunicipioPolitica, Partido } from "@/domain/politica/tipos";
import { usePoliticaRepository } from "@/presentation/composables/Politica/usePoliticaRepository";
import { lerErroApi } from "@/shared/utils/apiMensagem";

const POR_PAGINA = 12;

export function useCandidatosAdmin() {
    const repo = usePoliticaRepository();
    const listar = new ListarCandidatosUseCase(repo);
    const obter = new ObterCandidatoUseCase(repo);
    const criar = new CriarCandidatoUseCase(repo);
    const atualizar = new AtualizarCandidatoUseCase(repo);
    const excluir = new ExcluirCandidatoUseCase(repo);

    const itens = ref<Candidato[]>([]);
    const carregando = ref(false);
    const salvando = ref(false);
    const excluindoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const campos = ref<Record<string, string>>({});
    const q = ref("");
    const eleicaoId = ref("");
    const cargoId = ref("");
    const partidoId = ref("");
    const status = ref("");
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
                eleicao_id: eleicaoId.value ? Number(eleicaoId.value) : undefined,
                cargo_id: cargoId.value ? Number(cargoId.value) : undefined,
                partido_id: partidoId.value ? Number(partidoId.value) : undefined,
                status: status.value || undefined
            });
            itens.value = resp.itens;
            total.value = resp.total;
            pagina.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível carregar os candidatos.").mensagem;
        } finally {
            carregando.value = false;
        }
    }

    async function buscarPorId(id: number) {
        return obter.execute(id);
    }

    async function salvar(dto: CandidatoSalvarDTO, id?: number) {
        salvando.value = true;
        erro.value = null;
        campos.value = {};
        try {
            const candidato = id ? await atualizar.execute(id, dto) : await criar.execute(dto);
            sucesso.value = id ? "Candidato atualizado." : "Candidato cadastrado.";
            return candidato;
        } catch (e: unknown) {
            const lido = lerErroApi(e, "Não foi possível salvar o candidato.");
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
            erro.value = lerErroApi(e, "Não foi possível excluir o candidato.").mensagem;
        } finally {
            excluindoId.value = null;
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
        eleicaoId,
        cargoId,
        partidoId,
        status,
        pagina,
        total,
        totalPaginas,
        carregar,
        buscarPorId,
        salvar,
        remover
    };
}

export function useOpcoesCandidato() {
    const repo = usePoliticaRepository();
    const eleicoesCaso = new ListarEleicoesUseCase(repo);
    const cargosCaso = new ListarCargosUseCase(repo);
    const partidosCaso = new ListarPartidosUseCase(repo);
    const municipiosCaso = new ListarMunicipiosPoliticaUseCase(repo);
    const candidatosCaso = new ListarCandidatosUseCase(repo);

    const eleicoes = ref<Eleicao[]>([]);
    const cargos = ref<Cargo[]>([]);
    const partidos = ref<Partido[]>([]);
    const municipios = ref<MunicipioPolitica[]>([]);
    const erroOpcoes = ref<string | null>(null);

    async function carregarOpcoes() {
        erroOpcoes.value = null;
        const tarefas = await Promise.allSettled([
            eleicoesCaso.execute({ page: 1, per_page: 100 }),
            cargosCaso.execute({ page: 1, per_page: 100 }),
            partidosCaso.execute({ page: 1, per_page: 100, status: "ativo" }),
            municipiosCaso.execute()
        ]);
        if (tarefas[0].status === "fulfilled") eleicoes.value = tarefas[0].value.itens;
        if (tarefas[1].status === "fulfilled") cargos.value = tarefas[1].value.itens;
        if (tarefas[2].status === "fulfilled") partidos.value = tarefas[2].value.itens;
        if (tarefas[3].status === "fulfilled") municipios.value = tarefas[3].value;
        const falha = tarefas.find((item) => item.status === "rejected");
        if (falha && falha.status === "rejected") {
            erroOpcoes.value = lerErroApi(falha.reason, "Algumas listas auxiliares não carregaram.").mensagem;
        }
    }

    async function candidatosDaEleicao(eleicaoId: number) {
        const resp = await candidatosCaso.execute({
            eleicao_id: eleicaoId,
            page: 1,
            per_page: 100,
            status: "ativo"
        });
        return resp.itens;
    }

    return { eleicoes, cargos, partidos, municipios, erroOpcoes, carregarOpcoes, candidatosDaEleicao };
}
