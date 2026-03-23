import { inject, ref } from "vue";
import type { IBlogCategoriaRepository } from "@/domain/repositories/IBlogCategoriaRepository";
import { FindAllBlogCategoriaUseCase } from "@/application/use-cases/BlogCategoria/FindAllBlogCategoriaUseCase";

export function useFindAllBlogCategoria() {
    const repoInjected = inject<IBlogCategoriaRepository | null>('IBlogCategoriaRepository', null);
    if (!repoInjected) throw new Error('IBlogCategoriaRepository not found');
    const repo: IBlogCategoriaRepository = repoInjected;
    const casoUso = new FindAllBlogCategoriaUseCase(repo);

    const blogCategorias = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function findAll(page = 1, per_page = 50, nome?: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await casoUso.execute(page, per_page, nome);
            
            if (Array.isArray(result)) {
                blogCategorias.value = result;
            } else if (result && 'data' in result && Array.isArray((result as any).data)) {
                blogCategorias.value = (result as any).data;
            } else {
                blogCategorias.value = [];
            }
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findAll,
        blogCategorias,
        loading,
        error
    }
}