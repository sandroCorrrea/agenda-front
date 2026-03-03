import { inject, ref } from "vue";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";

export function useFindAllBlogCategoriaQtdPostagem() {
    const repoInjected = inject<IBlogCategoriaRepository | null>('IBlogCategoriaRepository');
    if (!repoInjected) throw new Error('IBlogCategoriaRepository not found');
    const repo: IBlogCategoriaRepository = repoInjected;

    const blogCategoriaQtdPostagem = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function findAllBlogCategoriaQtdPostagem() {
        loading.value = true;
        error.value = null;

        try {
            const result = await repo.findQtdPostagem();

            if (Array.isArray(result)) {
                blogCategoriaQtdPostagem.value = result;
            } else if (result && 'data' in result && Array.isArray((result as any).data)) {
                blogCategoriaQtdPostagem.value = (result as any).data;
            } else {
                blogCategoriaQtdPostagem.value = [];
            }
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findAllBlogCategoriaQtdPostagem,
        blogCategoriaQtdPostagem,
        loading,
        error
    }
}
