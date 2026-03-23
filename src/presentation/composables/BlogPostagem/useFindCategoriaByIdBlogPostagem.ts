import { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import { inject, ref } from "vue";
import { FindCategoriaByIdBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/FindCategoriaByIdBlogPostagemUseCase";

export function useFindCategoriaByIdBlogPostagem() {
    const repoInject = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository');
    if (!repoInject) throw new Error('IBlogPostagemRepository not found');
    const repo: IBlogPostagemRepository = repoInject;
    const casoUso = new FindCategoriaByIdBlogPostagemUseCase(repo);

    const findAllCategorias = ref<BlogPostagem[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    
    async function findCategoriaByIdBlogPostagem(id: number) {
        loading.value = true;
        error.value = null;

        try {
            const result = await casoUso.execute(id);
            findAllCategorias.value = result;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findCategoriaByIdBlogPostagem,
        findAllCategorias,
        loading,
        error
    }
}
