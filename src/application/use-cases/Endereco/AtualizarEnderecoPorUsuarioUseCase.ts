import type { EnderecoUpdateDTO } from "@/application/dto/Endereco/EnderecoUpdateDTO";
import type { IEnderecoRepository } from "@/domain/repositories/IEnderecoRepository";

export class AtualizarEnderecoPorUsuarioUseCase {
    constructor(private repository: IEnderecoRepository) {}

    execute(usuarioId: number, dto: EnderecoUpdateDTO): Promise<void> {
        return this.repository.atualizarPorUsuario(usuarioId, dto);
    }
}
