import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { PessoaPerfilDTO } from "@/application/dto/Pessoa/PessoaPerfilDTO";

export class ObterPessoaPerfilUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(pessoaId: number): Promise<PessoaPerfilDTO> {
        return this.repository.findById(pessoaId);
    }
}
