import { computed, inject, ref } from "vue";
import axios from "axios";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { BlogCategoria } from "@/domain/entities/BlogCategoria";
import { FindAllBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/FindAllBlogPostagemUseCase";
import { CriarBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/CriarBlogPostagemUseCase";
import { ExcluirBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/ExcluirBlogPostagemUseCase";
import { BlogPostagemPostRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemPostRequestDTO";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const POR_PAGINA_PADRAO = 6;

export function usePostagensAdmin() {
    const repo = inject<IBlogPostagemRepository>("IBlogPostagemRepository");
    const repoCategoria = inject<IBlogCategoriaRepository>("IBlogCategoriaRepository");
    if (!repo) throw new Error("IBlogPostagemRepository not provided");
    if (!repoCategoria) throw new Error("IBlogCategoriaRepository not provided");
    const repoCategoriaOk: IBlogCategoriaRepository = repoCategoria;

    const auth = useAuthStore();
    const listarCaso = new FindAllBlogPostagemUseCase(repo);
    const criarCaso = new CriarBlogPostagemUseCase(repo);
    const excluirCaso = new ExcluirBlogPostagemUseCase(repo);

    const postagens = ref<BlogPostagem[]>([]);
    const categorias = ref<BlogCategoria[]>([]);
    const carregandoLista = ref(false);
    const carregandoCategorias = ref(false);
    const criando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});
    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const excluindoId = ref<number | null>(null);
    const modalExcluirId = ref<number | null>(null);

    const postagemExclusaoNome = computed(() => {
        const id = modalExcluirId.value;
        if (id == null) return "";
        return postagens.value.find((p) => p.id === id)?.nome ?? "";
    });

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute(page, porPagina.value);
            postagens.value = resp.data;
            totalRegistros.value = Number(resp.total ?? 0);
            paginaAtual.value = Number(resp.pagina ?? page);
            porPagina.value = Number(resp.porPagina ?? POR_PAGINA_PADRAO);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erro.value = d?.message ?? "Não foi possível carregar as postagens.";
            } else {
                erro.value = "Não foi possível carregar as postagens.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function carregarCategorias() {
        carregandoCategorias.value = true;
        try {
            categorias.value = await repoCategoriaOk.findAll(1, 100);
        } catch {
            categorias.value = [];
            throw new Error("Falha ao carregar categorias.");
        } finally {
            carregandoCategorias.value = false;
        }
    }

    async function criar(payload: {
        nome: string;
        descricao: string;
        categoria_id: number;
        imagem?: File | null;
        arquivo?: File | null;
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
            await criarCaso.execute(
                new BlogPostagemPostRequestDTO(
                    payload.nome,
                    payload.descricao,
                    payload.categoria_id,
                    usuarioId,
                    payload.imagem,
                    payload.arquivo
                )
            );
            sucesso.value = "Postagem cadastrada com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                const errors = (d?.errors ?? {}) as Record<string, string[] | undefined>;
                if (status === 422) {
                    erroCampos.value = {
                        nome: errors.nome?.[0] ?? "",
                        descricao: errors.descricao?.[0] ?? "",
                        categoria_id: errors.categoria_id?.[0] ?? "",
                        usuario_id: errors.usuario_id?.[0] ?? "",
                        imagem: errors.imagem?.[0] ?? "",
                        arquivo: errors.arquivo?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível cadastrar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível cadastrar a postagem.";
                }
            } else {
                erro.value = "Não foi possível cadastrar a postagem.";
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
            sucesso.value = "Postagem excluída com sucesso.";
            await carregar(paginaAntes);
            if (postagens.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 404) {
                    erro.value = "Postagem não encontrada.";
                    await carregar(paginaAntes);
                    if (postagens.value.length === 0 && paginaAntes > 1) {
                        await carregar(paginaAntes - 1);
                    }
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível excluir agora. Tente novamente.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Não foi possível excluir a postagem.";
                }
            } else {
                erro.value = "Não foi possível excluir a postagem.";
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
        postagens,
        categorias,
        carregandoLista,
        carregandoCategorias,
        criando,
        excluindoId,
        modalExcluirId,
        postagemExclusaoNome,
        erro,
        sucesso,
        erroCampos,
        paginaAtual,
        totalRegistros,
        carregar,
        carregarCategorias,
        criar,
        totalPaginas,
        irParaPagina,
        abrirModalExcluir,
        fecharModalExcluir,
        confirmarExclusao
    };
}
