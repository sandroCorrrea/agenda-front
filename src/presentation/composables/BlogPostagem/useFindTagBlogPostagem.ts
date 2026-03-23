import { inject, ref } from "vue";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { BlogPostagemTagGetResponse } from "@/application/dto/BlogPostagem/BlogPostagemTagGetResponse";
import { FindTagBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/FindTagBlogPostagemUseCase";

export function useFindTagBlogPostagem() {
    const repoInjected = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository', null);
    if (!repoInjected) throw new Error('IBlogPostagemRepository not found');

    const repo: IBlogPostagemRepository = repoInjected;
    const casoUso = new FindTagBlogPostagemUseCase(repo);

    const blogPostagemTag = ref<BlogPostagemTagGetResponse[]>([]);

    const loading = ref(false);
    const error = ref<string | null>(null);
    const url = import.meta.env.VITE_STORAGE_BASE_URL;

    async function findTag() {
        loading.value = true;
        error.value = null;

        try {
            const result = await casoUso.execute();
            blogPostagemTag.value = result;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findTag,
        blogPostagemTag,
        url,
        loading,
        error
    }
}
