import { inject, ref } from "vue";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { PersistPessoaUseCase } from "@/application/use-cases/Pessoa/PersistPessoaUseCase";
import type { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import type { Pessoa } from "@/domain/entities/Pessoa";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function usePersistPessoa() {
    const repo = inject<IPessoaRepository>('IPessoaRepository');
    if (!repo) throw new Error('IPessoaRepository not provided');

    const useCase = new PersistPessoaUseCase(repo);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const pessoaEntity = ref<Pessoa | null>(null);

    async function persit(dto: PessoaPostRequestDTO) {
        loading.value = true;
        error.value = null;
        try {
            pessoaEntity.value = await useCase.execute(dto);
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as ErroResponseDTO;
                error.value = 
                    data?.errors?.mensagem?.[0] ||
                    data?.errors?.email?.[0] ||
                    data?.errors?.nome?.[0] ||
                    data?.errors?.cpf?.[0] ||
                    data?.errors?.data_nascimento?.[0] ||
                    data?.errors?.celular?.[0] ||
                    data?.errors?.['usuario.senha']?.[0] ||
                    data?.errors?.['usuario.senha_confirmation']?.[0] ||
                    data?.errors?.['usuario.tipo_usuario']?.[0] ||
                    data?.errors?.senha?.[0] ||
                    data?.message ||
                    'Erro ao enviar mensagem de contato';

            } else {
                error.value = err?.message || 'Erro ao persistir pessoa';
            }
        } finally {
            loading.value = false;
        }
    };

    return {
        persit,
        loading,
        error,
        pessoaEntity
    };
}
