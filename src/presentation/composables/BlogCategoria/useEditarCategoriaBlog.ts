import { computed, inject, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import { ObterBlogCategoriaPorIdUseCase } from "@/application/use-cases/BlogCategoria/ObterBlogCategoriaPorIdUseCase";
import { AtualizarBlogCategoriaUseCase } from "@/application/use-cases/BlogCategoria/AtualizarBlogCategoriaUseCase";
import { BlogCategoriaUpdateRequestDTO } from "@/application/dto/BlogCategoria/BlogCategoriaUpdateRequestDTO";
import type { BlogCategoria } from "@/domain/entities/BlogCategoria";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useEditarCategoriaBlog() {
    const route = useRoute();
    const repo = inject<IBlogCategoriaRepository>("IBlogCategoriaRepository");
    if (!repo) throw new Error("IBlogCategoriaRepository not provided");

    const obterCaso = new ObterBlogCategoriaPorIdUseCase(repo);
    const atualizarCaso = new AtualizarBlogCategoriaUseCase(repo);

    const categoriaId = computed(() => Number(route.params.id));
    const carregando = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const naoEncontrado = ref(false);
    const erroCampos = ref<Record<string, string>>({});
    const categoriaAtual = ref<BlogCategoria | null>(null);

    const form = reactive({
        nome: "",
        descricao: "",
        status: "" as "" | "ativo" | "inativo"
    });

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            const id = categoriaId.value;
            if (!id || Number.isNaN(id)) {
                naoEncontrado.value = true;
                return;
            }
            const data = await obterCaso.execute(id);
            categoriaAtual.value = data;
            form.nome = data.nome ?? "";
            form.descricao = data.descricao ?? "";
            form.status = data.ativo ? "ativo" : "inativo";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Categoria não encontrada.";
                } else {
                    erro.value = d?.message ?? "Não foi possível carregar a categoria.";
                }
            } else {
                erro.value = "Não foi possível carregar a categoria.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar() {
        const id = categoriaId.value;
        if (!id || Number.isNaN(id)) return;
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const atualizado = await atualizarCaso.execute(
                id,
                new BlogCategoriaUpdateRequestDTO(
                    form.nome.trim(),
                    form.descricao.trim(),
                    form.status || undefined
                )
            );
            categoriaAtual.value = atualizado;
            sucesso.value = "Categoria atualizada com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Categoria não encontrada.";
                } else if (status === 422) {
                    erroCampos.value = {
                        nome: d?.errors?.nome?.[0] ?? "",
                        descricao: d?.errors?.descricao?.[0] ?? "",
                        status: d?.errors?.status?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível salvar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível atualizar a categoria.";
                }
            } else {
                erro.value = "Não foi possível atualizar a categoria.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    return {
        categoriaId,
        categoriaAtual,
        form,
        carregando,
        salvando,
        erro,
        sucesso,
        naoEncontrado,
        erroCampos,
        carregar,
        salvar
    };
}
