import { inject, ref } from "vue";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { PersistPessoaUseCase } from "@/application/use-cases/Pessoa/PersistPessoaUseCase";

export function usePersistPessoa() {
    const repo = inject<IPessoaRepository>('IPessoaRepository');
    if (!repo) throw new Error('IPessoaRepository not provided');

    const useCase = new PersistPessoaUseCase(repo);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function create(input: {
        id: number;
        nome: string;
        cpf: string;
        dataNascimento: Date;
        email: string;
        celular: string;
    }) {
        loading.value = true;
        error.value = null;

        try {
            const payload = {
                ...input,
                dataNascimento: input.dataNascimento instanceof Date
                    ? input.dataNascimento
                    : new Date(input.dataNascimento)
            };
            return await useCase.execute(payload);
        } catch (err: any) {
            error.value = err?.message || 'Erro ao persistir pessoa';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {create, loading, error};
}
