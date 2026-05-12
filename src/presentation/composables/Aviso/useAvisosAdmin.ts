import { computed, inject, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";
import { CriarAvisoUseCase } from "@/application/use-cases/Aviso/CriarAvisoUseCase";
import { ListarAvisosPaginadoUseCase } from "@/application/use-cases/Aviso/ListarAvisosPaginadoUseCase";
import { ExcluirAvisoUseCase } from "@/application/use-cases/Aviso/ExcluirAvisoUseCase";
import { AvisoPostRequestDTO } from "@/application/dto/Aviso/AvisoPostRequestDTO";
import type { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const POR_PAGINA_PADRAO = 6;

export function useAvisosAdmin() {
    const repo = inject<IAvisoRepository>("IAvisoRepository");
    if (!repo) throw new Error("IAvisoRepository not provided");

    const auth = useAuthStore();
    const criarCaso = new CriarAvisoUseCase(repo);
    const listarCaso = new ListarAvisosPaginadoUseCase(repo);
    const excluirCaso = new ExcluirAvisoUseCase(repo);

    const avisos = ref<AvisoListagemDTO[]>([]);
    const carregandoLista = ref(false);
    const criando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});

    const paginaAtual = ref(1);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const totalRegistros = ref(0);
    const excluindoId = ref<number | null>(null);
    /** Quando definido, o modal de confirmação de exclusão está aberto para esse ID. */
    const modalExcluirId = ref<number | null>(null);

    const avisoExclusaoNome = computed(() => {
        const id = modalExcluirId.value;
        if (id == null) return "";
        return avisos.value.find((a) => a.id === id)?.nome ?? "";
    });

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute({
                page,
                per_page: porPagina.value
            });
            avisos.value = resp.aviso;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erro.value = d?.message ?? "Nao foi possivel carregar os avisos.";
            } else {
                erro.value = "Nao foi possivel carregar os avisos.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function criar(payload: {
        nome: string;
        descricao: string;
    }) {
        const usuarioId = auth.usuario?.id;
        if (!usuarioId) {
            erro.value = "Usuario administrador nao identificado na sessao.";
            return;
        }
        criando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const criado = await criarCaso.execute(
                new AvisoPostRequestDTO(payload.nome, payload.descricao, usuarioId)
            );
            sucesso.value = "Aviso criado com sucesso.";
            avisos.value = [criado, ...avisos.value];
            totalRegistros.value += 1;
            if (avisos.value.length > porPagina.value) {
                avisos.value = avisos.value.slice(0, porPagina.value);
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erroCampos.value = {
                    nome: d?.errors?.nome?.[0] ?? "",
                    descricao:
                        d?.errors?.descricao?.[0] ??
                        d?.errors?.mensagem?.[0] ??
                        "",
                    usuario_id: d?.errors?.usuario_id?.[0] ?? ""
                };
                erro.value =
                    erroCampos.value.nome ||
                    erroCampos.value.descricao ||
                    erroCampos.value.usuario_id ||
                    d?.message ||
                    "Nao foi possivel criar o aviso.";
            } else {
                erro.value = "Nao foi possivel criar o aviso.";
            }
            throw e;
        } finally {
            criando.value = false;
        }
    }

    const totalPaginas = () =>
        Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)));

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas()) return;
        await carregar(page);
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
            sucesso.value = "Aviso excluído com sucesso.";
            await carregar(paginaAntes);
            if (avisos.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 404) {
                    erro.value = "Aviso não encontrado";
                    await carregar(paginaAntes);
                    if (avisos.value.length === 0 && paginaAntes > 1) {
                        await carregar(paginaAntes - 1);
                    }
                } else if (status != null && status >= 500) {
                    erro.value =
                        "Não foi possível excluir agora. Tente novamente.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value =
                        d?.message ?? "Não foi possível excluir o aviso.";
                }
            } else {
                erro.value = "Não foi possível excluir o aviso.";
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

    return {
        avisos,
        carregandoLista,
        criando,
        excluindoId,
        modalExcluirId,
        avisoExclusaoNome,
        erro,
        sucesso,
        erroCampos,
        paginaAtual,
        totalRegistros,
        carregar,
        criar,
        abrirModalExcluir,
        fecharModalExcluir,
        confirmarExclusao,
        totalPaginas,
        irParaPagina
    };
}
