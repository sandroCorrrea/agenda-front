import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import { inject, ref } from "vue";

export function useFindBlogPostagemByNome() {
    const repoInject = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository');
    if (!repoInject) throw new Error('IBlogPostagemRepository not found');
    const repo: IBlogPostagemRepository = repoInject;

    const loading = ref(false);
    const error = ref<string | null>(null);
    const findAllNome = ref<BlogPostagem[]>([]);

    async function findBlogPostagemByNome(nome: string) {
        loading.value = true;
    
        const result = await repo.findByNome(nome);

        try {
            findAllNome.value = result;

        } catch (err: any) {
            error.value = err?.message ?? String(err) ?? null;
        } finally {
            loading.value = false;
        }
    }
    return {
        findBlogPostagemByNome,
        findAllNome,
        loading
    }
};
