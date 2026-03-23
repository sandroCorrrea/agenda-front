import { inject, ref } from "vue";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import { FindAllBlogPostagemUseCase } from "@/application/use-cases/BlogPostagem/FindAllBlogPostagemUseCase";

export function useFindAllBlogPostagem() {
    const repoInjected = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository', null);
    if (!repoInjected) throw new Error('IBlogPostagemRepository not found');

    const repo: IBlogPostagemRepository = repoInjected;
    const casoUso = new FindAllBlogPostagemUseCase(repo);

    const blogPostagem = ref<BlogPostagem[]>([]);
    const total = ref(0);
    const currentPage = ref(1);
    const perPage = ref(10);
    const lastPage = ref(1);

    const loading = ref(false);
    const error = ref<string | null>(null);
    const url = import.meta.env.VITE_STORAGE_BASE_URL;

    async function findAll(page = 1, per_page = perPage.value, nome?: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await casoUso.execute(page, per_page, nome);
            blogPostagem.value = result.data;
            total.value = result.total;
            currentPage.value = result.pagina;
            perPage.value = result.porPagina;
            lastPage.value = result.lastPage;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findAll,
        blogPostagem,
        total,
        currentPage,
        perPage,
        lastPage,
        loading,
        error,
        url
    }
}
