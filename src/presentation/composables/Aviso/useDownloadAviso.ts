import { inject, ref } from "vue";
import type { IAvisoRepository } from "@/domain/repositories/IAvisoRepository";
import { DownloadAvisoPdfUseCase } from "@/application/use-cases/Aviso/DownloadAvisoPdfUseCase";

export function useDownloadAviso() {
    const repoInjected = inject<IAvisoRepository | null>('IAvisoRepository', null);
    if (!repoInjected) throw new Error('IAvisoRepository not found');
    const downloadUseCase = new DownloadAvisoPdfUseCase(repoInjected);

    const loading = ref(false);
    const error = ref<string | null>(null);

    async function download(aviso: number): Promise<Blob | null> {
        loading.value = true;
        error.value = null;

        try {
            const blob = await downloadUseCase.execute(aviso);
            return blob;
        } catch (err: any) {
            error.value = err?.message ?? String(err);
            return null;
        } finally {
            loading.value = false;
        }
    }

    return {
        download,
        loading,
        error
    }
}
