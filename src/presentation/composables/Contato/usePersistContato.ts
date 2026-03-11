import type { ContatoPostRequestDTO } from "@/application/dto/Contato/ContatoPostRequestDTO";
import type { Contato } from "@/domain/entities/Contato";
import type { IContatoRepository } from "@/domain/repositories/IContatoRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import axios from "axios";
import { ref, inject } from "vue";

export function usePersistContato() {
    const repoInject = inject<IContatoRepository | null>('IContatoRepository', null);
    if (!repoInject) throw new Error('IContatoRepository not found');
    const repo: IContatoRepository = repoInject;
    const loading = ref(false);
    const resultContato = ref<Contato | null>(null);
    const error = ref<string | null>(null);

    async function persistContato(dto: ContatoPostRequestDTO) {
        loading.value = true;
        try {
            const result = repo.persist(dto);
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

    return {
        persistContato,
        loading,
        error,
        resultContato
    }
}
