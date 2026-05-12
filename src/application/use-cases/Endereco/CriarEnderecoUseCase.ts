import type { EnderecoCreateDTO } from "@/application/dto/Endereco/EnderecoCreateDTO";
import type { IEnderecoRepository } from "@/domain/repositories/IEnderecoRepository";

export class CriarEnderecoUseCase {
    constructor(private repository: IEnderecoRepository) {}

    execute(dto: EnderecoCreateDTO): Promise<void> {
        return this.repository.criar(dto);
    }
}
