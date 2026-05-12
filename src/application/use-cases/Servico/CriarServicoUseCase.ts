import type { ServicoPostRequestDTO } from "@/application/dto/Servico/ServicoPostRequestDTO";
import type { Servico } from "@/domain/entities/Servico";
import type { IServicoRepository } from "@/domain/repositories/IServicoRepository";

export class CriarServicoUseCase {
    constructor(private repository: IServicoRepository) {}

    execute(dto: ServicoPostRequestDTO): Promise<Servico> {
        return this.repository.create(dto);
    }
}
