import { computed, inject, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import { FindBlogPostagemByIdUseCase } from "@/application/use-cases/BlogPostagem/FindBlogPostagemByIdUseCase";
import { AtualizarBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/AtualizarBlogPostagemUseCase";
import { BlogPostagemUpdateRequestDTO } from "@/application/dto/BlogPostagem/BlogPostagemUpdateRequestDTO";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { BlogCategoria } from "@/domain/entities/BlogCategoria";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useEditarPostagemBlog() {
    const route = useRoute();
    const auth = useAuthStore();
    const repo = inject<IBlogPostagemRepository>("IBlogPostagemRepository");
    const repoCategoria = inject<IBlogCategoriaRepository>("IBlogCategoriaRepository");
    if (!repo) throw new Error("IBlogPostagemRepository not provided");
    if (!repoCategoria) throw new Error("IBlogCategoriaRepository not provided");
    const repoCategoriaOk: IBlogCategoriaRepository = repoCategoria;

    const obterCaso = new FindBlogPostagemByIdUseCase(repo);
    const atualizarCaso = new AtualizarBlogPostagemUseCase(repo);

    const postagemId = computed(() => Number(route.params.id));
    const carregando = ref(false);
    const carregandoCategorias = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const naoEncontrado = ref(false);
    const erroCampos = ref<Record<string, string>>({});
    const postagemAtual = ref<BlogPostagem | null>(null);
    const categorias = ref<BlogCategoria[]>([]);
    const usuarioIdEnvio = ref<number | null>(null);

    const form = reactive({
        nome: "",
        descricao: "",
        categoria_id: "",
        status: "" as "" | "ativo" | "inativo",
        imagem: null as File | null,
        arquivo: null as File | null
    });

    async function carregarCategorias() {
        carregandoCategorias.value = true;
        try {
            /* API limita per_page a 100; acima disso retorna 422 e a tela de edição não carrega a postagem. */
            categorias.value = await repoCategoriaOk.findAll(1, 100);
        } finally {
            carregandoCategorias.value = false;
        }
    }

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            const id = postagemId.value;
            if (!id || Number.isNaN(id)) {
                naoEncontrado.value = true;
                return;
            }
            const data = await obterCaso.execute(id);
            postagemAtual.value = data;
            form.nome = data.nome ?? "";
            form.descricao = data.descricao ?? "";
            const cat = data.categoria as { id?: number } | undefined;
            form.categoria_id = cat?.id != null ? String(cat.id) : "";
            form.status =
                String(data.status ?? "").toLowerCase() === "ativo"
                    ? "ativo"
                    : String(data.status ?? "").toLowerCase() === "inativo"
                      ? "inativo"
                      : "";
            form.imagem = null;
            form.arquivo = null;
            usuarioIdEnvio.value =
                data.usuario?.id ?? auth.usuario?.id ?? null;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Postagem não encontrada.";
                } else {
                    erro.value = d?.message ?? "Não foi possível carregar a postagem.";
                }
            } else {
                erro.value = "Não foi possível carregar a postagem.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar() {
        const id = postagemId.value;
        if (!id || Number.isNaN(id)) return;
        const uid = usuarioIdEnvio.value ?? auth.usuario?.id;
        if (!uid) {
            erro.value = "Não foi possível identificar o usuário da postagem.";
            return;
        }
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const atualizado = await atualizarCaso.execute(
                id,
                new BlogPostagemUpdateRequestDTO(
                    form.nome.trim(),
                    form.descricao.trim(),
                    Number(form.categoria_id),
                    uid,
                    form.status || undefined,
                    form.imagem,
                    form.arquivo
                )
            );
            postagemAtual.value = atualizado;
            usuarioIdEnvio.value = atualizado.usuario?.id ?? uid;
            form.imagem = null;
            form.arquivo = null;
            form.status =
                String(atualizado.status ?? "").toLowerCase() === "ativo"
                    ? "ativo"
                    : String(atualizado.status ?? "").toLowerCase() === "inativo"
                      ? "inativo"
                      : "";
            sucesso.value = "Postagem atualizada com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                const errors = (d?.errors ?? {}) as Record<string, string[] | undefined>;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Postagem não encontrada.";
                } else if (status === 422) {
                    erroCampos.value = {
                        nome: errors.nome?.[0] ?? "",
                        descricao: errors.descricao?.[0] ?? "",
                        categoria_id: errors.categoria_id?.[0] ?? "",
                        usuario_id: errors.usuario_id?.[0] ?? "",
                        status: errors.status?.[0] ?? "",
                        imagem: errors.imagem?.[0] ?? "",
                        arquivo: errors.arquivo?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível salvar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível atualizar a postagem.";
                }
            } else {
                erro.value = "Não foi possível atualizar a postagem.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    return {
        postagemId,
        postagemAtual,
        categorias,
        form,
        carregando,
        carregandoCategorias,
        salvando,
        erro,
        sucesso,
        naoEncontrado,
        erroCampos,
        carregar,
        carregarCategorias,
        salvar
    };
}
