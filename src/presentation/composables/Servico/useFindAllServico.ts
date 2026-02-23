import {inject, ref} from "vue";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";
import { FindAllServicoUseCase } from "@/application/use-cases/Servico/FindAllServicoUseCase";

export function useFindAllServico() {
    const repo = inject<IServicoRepository>('IServicoRepository');
    if (!repo) throw new Error('IServicoRepository not provided');

    const useCase = new FindAllServicoUseCase(repo);
    const servicos = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function findAll(page = 1, per_page = 10) {
        loading.value = true;
        error.value = null;

        try {
            const result = await useCase.execute(page, per_page);

            if (Array.isArray(result)) {
                servicos.value = result;
            } else if (result && 'data' in result && Array.isArray((result as any).data)) {
                servicos.value = (result as any).data;
            } else {
                servicos.value = [];
            }

            return servicos.value;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
            return [];
        } finally {
            loading.value = false;
        }
    }

    return {
        findAll,
        servicos,
        loading,
        error
    };
}
