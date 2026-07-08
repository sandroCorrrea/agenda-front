import { DetalheParticipacaoUseCase } from "@/application/use-cases/Participacao/DetalheParticipacaoUseCase";
import { ListarParticipacaoUseCase } from "@/application/use-cases/Participacao/ListarParticipacaoUseCase";
import { SalvarAnaliseParticipacaoUseCase } from "@/application/use-cases/Participacao/SalvarAnaliseParticipacaoUseCase";
import { GetParticipacaoOpcoesUseCase } from "@/application/use-cases/Participacao/GetParticipacaoOpcoesUseCase";
import { ParticipacaoAnaliseRequestDTO } from "@/application/dto/Participacao/ParticipacaoAnaliseRequestDTO";
import type { ParticipacaoListagemQueryDTO } from "@/application/dto/Participacao/ParticipacaoListagemQueryDTO";
import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import { exercicioPadraoParticipacao } from "@/shared/utils/participacaoLabels";
import axios from "axios";
import { computed, inject, reactive, ref } from "vue";

const POR_PAGINA = 15;

export type ParticipacaoFiltrosState = {
    exercicio: string;
    instrumento: string;
    status: string;
    prioridade: string;
    localidade_atendida: string;
    participacao_funcao_id: string;
    ibge: string;
};

export type ParticipacaoAnaliseFormState = {
    funcao: string;
    subfuncao: string;
    programa: string;
    natureza_despesa: string;
    categoria_economica: string;
    possui_previsao_ppa: string;
    compativel_ldo: string;
    fonte_recurso: string;
    atende: string;
    parecer_tecnico: string;
    status: string;
};

function filtrosIniciais(): ParticipacaoFiltrosState {
    return {
        exercicio: String(exercicioPadraoParticipacao()),
        instrumento: "LOA",
        status: "",
        prioridade: "",
        localidade_atendida: "",
        participacao_funcao_id: "",
        ibge: ""
    };
}

function analiseInicial(item?: ParticipacaoPostResponseDTO | null): ParticipacaoAnaliseFormState {
    const a = item?.analise;
    const boolToSelect = (v: boolean | null | undefined) => {
        if (v === true) return "true";
        if (v === false) return "false";
        return "";
    };

    return {
        funcao: a?.funcao ?? item?.funcao?.nome ?? "",
        subfuncao: a?.subfuncao ?? "",
        programa: a?.programa ?? "",
        natureza_despesa: a?.naturezaDespesa ?? "",
        categoria_economica: a?.categoriaEconomica ?? "",
        possui_previsao_ppa: boolToSelect(a?.possuiPrevisaoPpa),
        compativel_ldo: boolToSelect(a?.compativelLdo),
        fonte_recurso: a?.fonteRecurso ?? "",
        atende: boolToSelect(a?.atende),
        parecer_tecnico: a?.parecerTecnico ?? "",
        status: item?.status ?? "em_analise"
    };
}

function mensagemErroHttp(e: unknown, fallback: string): string {
    if (axios.isAxiosError(e)) {
        const status = e.response?.status;
        const data = e.response?.data as { message?: string } | undefined;
        if (status === 403) {
            return (
                data?.message ??
                "Acesso restrito a administradores."
            );
        }
        if (status === 401) {
            return "Sessão expirada. Faça login novamente.";
        }
        return data?.message ?? fallback;
    }
    return fallback;
}

export function useParticipacaoAdmin() {
    const repo = inject<IParticipacaoRepository | null>("IParticipacaoRepository", null);
    if (!repo) throw new Error("IParticipacaoRepository not found");

    const listarCaso = new ListarParticipacaoUseCase(repo);
    const detalheCaso = new DetalheParticipacaoUseCase(repo);
    const analiseCaso = new SalvarAnaliseParticipacaoUseCase(repo);
    const opcoesCaso = new GetParticipacaoOpcoesUseCase(repo);

    const opcoes = ref<ParticipacaoOpcoesResponseDTO | null>(null);
    const itens = ref<ParticipacaoPostResponseDTO[]>([]);
    const detalhe = ref<ParticipacaoPostResponseDTO | null>(null);
    const filtros = reactive<ParticipacaoFiltrosState>(filtrosIniciais());
    const analiseForm = reactive<ParticipacaoAnaliseFormState>(analiseInicial());

    const carregandoLista = ref(false);
    const carregandoDetalhe = ref(false);
    const salvandoAnalise = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);

    const paginaAtual = ref(1);
    const porPagina = ref(POR_PAGINA);
    const totalRegistros = ref(0);

    const totalPaginas = computed(() =>
        Math.max(1, Math.ceil(totalRegistros.value / porPagina.value) || 1)
    );

    async function carregarOpcoes() {
        try {
            opcoes.value = await opcoesCaso.execute();
        } catch {
            /* opções são auxiliares na listagem */
        }
    }

    function montarQuery(page: number): ParticipacaoListagemQueryDTO {
        const q: ParticipacaoListagemQueryDTO = {
            page,
            per_page: porPagina.value
        };
        if (filtros.exercicio) q.exercicio = Number(filtros.exercicio);
        if (filtros.instrumento) q.instrumento = filtros.instrumento;
        if (filtros.status) q.status = filtros.status;
        if (filtros.prioridade) q.prioridade = filtros.prioridade;
        if (filtros.localidade_atendida) {
            q.localidade_atendida = filtros.localidade_atendida;
        }
        if (filtros.participacao_funcao_id) {
            q.participacao_funcao_id = Number(filtros.participacao_funcao_id);
        }
        if (filtros.ibge.trim()) {
            q.ibge = filtros.ibge.trim();
        }
        return q;
    }

    async function carregarLista(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute(montarQuery(page));
            itens.value = resp.participacao;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA;
        } catch (e: unknown) {
            erro.value = mensagemErroHttp(e, "Não foi possível carregar as contribuições.");
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function carregarDetalhe(id: number) {
        carregandoDetalhe.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            detalhe.value = await detalheCaso.execute(id);
            Object.assign(analiseForm, analiseInicial(detalhe.value));
        } catch (e: unknown) {
            detalhe.value = null;
            erro.value = mensagemErroHttp(e, "Não foi possível carregar o detalhe.");
            throw e;
        } finally {
            carregandoDetalhe.value = false;
        }
    }

    async function salvarAnalise(id: number) {
        salvandoAnalise.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            const parseBool = (v: string): boolean | null => {
                if (v === "true") return true;
                if (v === "false") return false;
                return null;
            };

            const dto = new ParticipacaoAnaliseRequestDTO(
                analiseForm.funcao.trim() || null,
                analiseForm.subfuncao.trim() || null,
                analiseForm.programa.trim() || null,
                analiseForm.natureza_despesa || null,
                analiseForm.categoria_economica || null,
                parseBool(analiseForm.possui_previsao_ppa),
                parseBool(analiseForm.compativel_ldo),
                analiseForm.fonte_recurso.trim() || null,
                parseBool(analiseForm.atende),
                analiseForm.parecer_tecnico.trim() || null,
                analiseForm.status || null
            );

            detalhe.value = await analiseCaso.execute(id, dto);
            Object.assign(analiseForm, analiseInicial(detalhe.value));
            sucesso.value = "Análise técnica salva com sucesso.";
        } catch (e: unknown) {
            erro.value = mensagemErroHttp(e, "Não foi possível salvar a análise técnica.");
            throw e;
        } finally {
            salvandoAnalise.value = false;
        }
    }

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas.value) return;
        await carregarLista(page);
    }

    function limparFiltros() {
        Object.assign(filtros, filtrosIniciais());
    }

    return {
        opcoes,
        itens,
        detalhe,
        filtros,
        analiseForm,
        carregandoLista,
        carregandoDetalhe,
        salvandoAnalise,
        erro,
        sucesso,
        paginaAtual,
        porPagina,
        totalRegistros,
        totalPaginas,
        carregarOpcoes,
        carregarLista,
        carregarDetalhe,
        salvarAnalise,
        irParaPagina,
        limparFiltros
    };
}
