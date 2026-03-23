import { inject, ref } from "vue";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import { FindAllBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/FindAllBlogPostagemUseCase";

export function useFindRecentBlogPostagem() {
    const repoInjected = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository', null);
    if (!repoInjected) throw new Error('IBlogPostagemRepository not found');

    const repo: IBlogPostagemRepository = repoInjected;
    const casoUso = new FindAllBlogPostagemUseCase(repo);

    const blogPostagemRecent = ref<BlogPostagem[]>([]);

    const loading = ref(false);
    const error = ref<string | null>(null);
    const url = import.meta.env.VITE_STORAGE_BASE_URL;

    async function findAllRecent(page = 0, per_page = 3) {
        loading.value = true;
        error.value = null;

        try {
            const result = await casoUso.execute(page, per_page);
            blogPostagemRecent.value = result.data;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findAllRecent,
        blogPostagemRecent,
        loading,
        error,
        url
    }
}
