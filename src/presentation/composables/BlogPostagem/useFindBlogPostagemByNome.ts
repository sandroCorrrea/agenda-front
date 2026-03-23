import type { BlogPostagem } from "@/domain/entities/BlogPostagem";
import type { IBlogPostagemRepository } from "@/domain/repositories/IBlogPostagemRepository";
import { inject, ref } from "vue";
import { FindBlogPostagemByNomeUseCase } from "@/application/use-cases/BlogPostagem/FindBlogPostagemByNomeUseCase";

export function useFindBlogPostagemByNome() {
    const repoInject = inject<IBlogPostagemRepository | null>('IBlogPostagemRepository');
    if (!repoInject) throw new Error('IBlogPostagemRepository not found');
    const repo: IBlogPostagemRepository = repoInject;
    const casoUso = new FindBlogPostagemByNomeUseCase(repo);

    const loading = ref(false);
    const error = ref<string | null>(null);
    const findAllNome = ref<BlogPostagem[]>([]);

    async function findBlogPostagemByNome(nome: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await casoUso.execute(nome);
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
        loading,
        error
    }
};
