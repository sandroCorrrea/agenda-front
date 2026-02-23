import { inject, ref } from "vue";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";

export function useFindAllAviso() {
    const repoInjected = inject<IAvisoRepository | null>('IAvisoRepository', null);
    if (!repoInjected) throw new Error('IAvisoRepository not found');
    const repo: IAvisoRepository = repoInjected;

    const avisos = ref<any[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function findAll(page = 1, per_page = 50, nome?: string) {
        loading.value = true;
        error.value = null;

        try {
            const result = await repo.findAll(page, per_page, nome);

            if (Array.isArray(result)) {
                avisos.value = result;
            } else if (result && 'data' in result && Array.isArray((result as any).data)) {
                avisos.value = (result as any).data;
            } else {
                avisos.value = [];
            }
            return avisos.value;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
        } finally {
            loading.value = false;
        }
    }

    return {
        findAll,
        avisos,
        loading,
        error
    }
}