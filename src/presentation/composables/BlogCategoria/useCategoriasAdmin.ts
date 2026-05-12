import { inject, ref } from "vue";
import axios from "axios";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import { CriarBlogCategoriaUseCase } from "@/application/use-cases/BlogCategoria/CriarBlogCategoriaUseCase";
import { ListarBlogCategoriasPaginadoUseCase } from "@/application/use-cases/BlogCategoria/ListarBlogCategoriasPaginadoUseCase";
import { ExcluirBlogCategoriaUseCase } from "@/application/use-cases/BlogCategoria/ExcluirBlogCategoriaUseCase";
import { BlogCategoriaPostRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaPostRequestDTO";
import type { BlogCategoria } from "@/domain/entities/BlogCategoria";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const POR_PAGINA_PADRAO = 6;

export function useCategoriasAdmin() {
    const repo = inject<IBlogCategoriaRepository>("IBlogCategoriaRepository");
    if (!repo) throw new Error("IBlogCategoriaRepository not provided");

    const criarCaso = new CriarBlogCategoriaUseCase(repo);
    const listarCaso = new ListarBlogCategoriasPaginadoUseCase(repo);
    const excluirCaso = new ExcluirBlogCategoriaUseCase(repo);

    const categorias = ref<BlogCategoria[]>([]);
    const carregandoLista = ref(false);
    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const criando = ref(false);
    const excluindoId = ref<number | null>(null);
    const modalExcluirId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute({
                page,
                per_page: porPagina.value
            });
            categorias.value = resp.categoria;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erro.value = d?.message ?? "Não foi possível carregar as categorias.";
            } else {
                erro.value = "Não foi possível carregar as categorias.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function criar(payload: { nome: string; descricao: string }) {
        criando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            await criarCaso.execute(
                new BlogCategoriaPostRequestDTO(payload.nome, payload.descricao)
            );
            sucesso.value = "Categoria criada com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 422) {
                    erroCampos.value = {
                        nome: d?.errors?.nome?.[0] ?? "",
                        descricao: d?.errors?.descricao?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível criar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível criar a categoria.";
                }
            } else {
                erro.value = "Não foi possível criar a categoria.";
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

    async function confirmarExclusao() {
        const id = modalExcluirId.value;
        if (id == null) return;
        excluindoId.value = id;
        erro.value = null;
        sucesso.value = null;
        const paginaAntes = paginaAtual.value;
        try {
            await excluirCaso.execute(id);
            sucesso.value = "Categoria excluída com sucesso.";
            await carregar(paginaAntes);
            if (categorias.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
            modalExcluirId.value = null;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 404) {
                    erro.value = "Categoria não encontrada.";
                    await carregar(paginaAntes);
                    if (categorias.value.length === 0 && paginaAntes > 1) {
                        await carregar(paginaAntes - 1);
                    }
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível excluir agora. Tente novamente.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Não foi possível excluir a categoria.";
                }
            } else {
                erro.value = "Não foi possível excluir a categoria.";
            }
            modalExcluirId.value = null;
        } finally {
            excluindoId.value = null;
        }
    }

    const totalPaginas = () =>
        Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)));

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas()) return;
        await carregar(page);
    }

    return {
        categorias,
        carregandoLista,
        paginaAtual,
        totalRegistros,
        criando,
        excluindoId,
        modalExcluirId,
        erro,
        sucesso,
        erroCampos,
        carregar,
        criar,
        abrirModalExcluir,
        fecharModalExcluir,
        confirmarExclusao,
        totalPaginas,
        irParaPagina
    };
}
