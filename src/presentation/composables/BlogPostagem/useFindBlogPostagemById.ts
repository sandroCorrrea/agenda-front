import { inject, ref } from "vue";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import { FindBlogPostagemByIdUseCase } from "@/application/use-cases/BlogPostagem/FindBlogPostagemByIdUseCase";

export function useFindBlogPostagemById() {
    const repoInjected = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository', null);
    if (!repoInjected) throw new Error('IBlogPostagemRepository not found');
    const repo: IBlogPostagemRepository = repoInjected;
    const casoUso = new FindBlogPostagemByIdUseCase(repo);

    const blogPostagem = ref<BlogPostagem | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function findById(id: number) {
        loading.value = true;
        error.value = null;

        try {
            blogPostagem.value = await casoUso.execute(id);
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        blogPostagem,
        findById,
        loading,
        error
    };
}
