import type { EnderecoResponseDTO } from "@/application/dto/Endereco/EnderecoResponseDTO";
import type { IEnderecoRepository } from "@/domain/repositories/IEnderecoRepository";

export class ObterEnderecoPorUsuarioUseCase {
    constructor(private repository: IEnderecoRepository) {}

    execute(usuarioId: number): Promise<EnderecoResponseDTO | null> {
        return this.repository.obterPorUsuario(usuarioId);
    }
}
