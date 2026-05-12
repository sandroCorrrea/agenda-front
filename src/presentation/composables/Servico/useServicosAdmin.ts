import { computed, inject, ref } from "vue";
import axios from "axios";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import type { Servico } from "@/domain/entities/Servico";
import { ListarServicosPaginadoUseCase } from "@/application/use-cases/Servico/ListarServicosPaginadoUseCase";
import { CriarServicoUseCase } from "@/application/use-cases/Servico/CriarServicoUseCase";
import { ExcluirServicoUseCase } from "@/application/use-cases/Servico/ExcluirServicoUseCase";
import { ServicoPostRequestDTO } from "@/application/dto/Servico/ServicoPostRequestDTO";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const POR_PAGINA_PADRAO = 8;

export function useServicosAdmin() {
    const repo = inject<IServicoRepository>("IServicoRepository");
    if (!repo) throw new Error("IServicoRepository not provided");

    const listarCaso = new ListarServicosPaginadoUseCase(repo);
    const criarCaso = new CriarServicoUseCase(repo);
    const excluirCaso = new ExcluirServicoUseCase(repo);

    const servicos = ref<Servico[]>([]);
    const carregandoLista = ref(false);
    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const nomeFiltro = ref("");
    const criando = ref(false);
    const excluindoId = ref<number | null>(null);
    const modalExcluirId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});

    const servicoExclusaoNome = computed(() => {
        const id = modalExcluirId.value;
        if (id == null) return "";
        return servicos.value.find((s) => s.id === id)?.nome ?? "";
    });

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute({
                page,
                per_page: porPagina.value,
                nome: nomeFiltro.value.trim() || undefined
            });
            servicos.value = resp.data;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erro.value = d?.message ?? "Não foi possível carregar os serviços.";
            } else {
                erro.value = "Não foi possível carregar os serviços.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    function aplicarFiltro() {
        void carregar(1);
    }

    async function criar(payload: {
        nome: string;
        descricao: string | null;
        status?: "ativo" | "inativo";
    }) {
        criando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            await criarCaso.execute(
                new ServicoPostRequestDTO(
                    payload.nome,
                    payload.descricao,
                    payload.status ?? "ativo"
                )
            );
            sucesso.value = "Serviço cadastrado com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                const errors = (d?.errors ?? {}) as Record<string, string[] | undefined>;
                if (status === 422) {
                    erroCampos.value = {
                        nome: errors.nome?.[0] ?? "",
                        descricao: errors.descricao?.[0] ?? "",
                        status: errors.status?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível cadastrar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível cadastrar o serviço.";
                }
            } else {
                erro.value = "Não foi possível cadastrar o serviço.";
            }
            throw e;
        } finally {
            criando.value = false;
        }
    }

    function abrirModalExcluir(id: number) {
        modalExcluirId.value = id;
    }

    function fecharModalExcluir() {
        if (excluindoId.value !== null) return;
        modalExcluirId.value = null;
    }

    async function executarExclusao(id: number) {
        excluindoId.value = id;
        erro.value = null;
        sucesso.value = null;
        const paginaAntes = paginaAtual.value;
        try {
            await excluirCaso.execute(id);
            sucesso.value = "Serviço excluído com sucesso.";
            await carregar(paginaAntes);
            if (servicos.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 404) {
                    erro.value = "Serviço não encontrado.";
                    await carregar(paginaAntes);
                    if (servicos.value.length === 0 && paginaAntes > 1) {
                        await carregar(paginaAntes - 1);
                    }
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível excluir agora. Tente novamente.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Não foi possível excluir o serviço.";
                }
            } else {
                erro.value = "Não foi possível excluir o serviço.";
            }
        } finally {
            excluindoId.value = null;
        }
    }

    async function confirmarExclusao() {
        const id = modalExcluirId.value;
        if (id == null) return;
        try {
            await executarExclusao(id);
        } finally {
            modalExcluirId.value = null;
        }
    }

    const totalPaginas = () =>
        Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)));

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas()) return;
        await carregar(page);
    }

    return {
        servicos,
        carregandoLista,
        paginaAtual,
        totalRegistros,
        porPagina,
        nomeFiltro,
        criando,
        excluindoId,
        modalExcluirId,
        servicoExclusaoNome,
        erro,
        sucesso,
        erroCampos,
        carregar,
        aplicarFiltro,
        criar,
        abrirModalExcluir,
        fecharModalExcluir,
        confirmarExclusao,
        totalPaginas,
        irParaPagina
    };
}
