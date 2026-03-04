import { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import { inject, ref } from "vue";

export function useFindCategoriaByIdBlogPostagem() {
    const repoInject = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository');
    if (!repoInject) throw new Error('IBlogPostagemRepository not found');
    const repo: IBlogPostagemRepository = repoInject;

    const findAllCategorias = ref<BlogPostagem[]>([]);
    const loadind = ref(false);
    const error = ref<string | null>(null);
    
    async function findCategoriaByIdBlogPostagem(id: number) {
        loadind.value = true;
        error.value = null;

        try {
            const result = await repo.findByCategoriaId(id);
            findAllCategorias.value = result;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loadind.value = false;
        }
    }

    return {
        findCategoriaByIdBlogPostagem,
        findAllCategorias
    }
}
