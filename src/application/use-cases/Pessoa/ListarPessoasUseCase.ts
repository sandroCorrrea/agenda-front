import type { PessoaListagemResponseDTO } from "@/application/dto/Pessoa/PessoaListagemResponseDTO";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";

export class ListarPessoasUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(params?: {
        page?: number;
        per_page?: number;
    }): Promise<PessoaListagemResponseDTO> {
        return this.repository.listarPessoas(params);
    }
}
