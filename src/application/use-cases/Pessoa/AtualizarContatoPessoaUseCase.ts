import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { PessoaContatoUpdateDTO } from "@/application/dto/Pessoa/PessoaContatoUpdateDTO";
import type { PessoaPerfilDTO } from "@/application/dto/Pessoa/PessoaPerfilDTO";

export class AtualizarContatoPessoaUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(
        pessoaId: number,
        dto: PessoaContatoUpdateDTO
    ): Promise<PessoaPerfilDTO> {
        return this.repository.atualizarContato(pessoaId, dto);
    }
}
