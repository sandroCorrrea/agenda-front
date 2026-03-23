import type { ContatoPostRequestDTO } from "@/application/dto/Contato/ContatoPostRequestDTO";
import type { Contato } from "@/domain/entities/Contato";
import type { IContatoRepository } from "@/domain/repositories/IContatoRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import axios from "axios";
import { ref, inject } from "vue";
import { PersistContatoUseCase } from "@/application/use-cases/Contato/PersistContatoUseCase";

export function usePersistContato() {
    const repoInject = inject<IContatoRepository | null>('IContatoRepository', null);
    if (!repoInject) throw new Error('IContatoRepository not found');
    const repo: IContatoRepository = repoInject;
    const casoUso = new PersistContatoUseCase(repo);
    const loading = ref(false);
    const resultContato = ref<Contato | null>(null);
    const error = ref<string | null>(null);

    async function persistContato(dto: ContatoPostRequestDTO) {
        loading.value = true;
        error.value = null;
        try {
            const result = await casoUso.execute(dto);
            resultContato.value = result;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as ErroResponseDTO;
                error.value = 
                    data?.errors?.mensagem?.[0] ||
                    data?.errors?.email?.[0] ||
                    data?.errors?.nome?.[0] ||
                    data?.message ||
                    'Erro ao enviar mensagem de contato'
            } else {
                error.value = err?.message ? String(err.message) : null;
            }
        } finally {
            loading.value = false;
        }
    }

    function limparResultadoContato() {
        resultContato.value = null;
        error.value = null;
    }

    return {
        persistContato,
        loading,
        error,
        resultContato,
        limparResultadoContato
    }
}
