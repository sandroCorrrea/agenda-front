import type { ContatoPostRequestDTO } from "@/application/dto/Contato/ContatoPostRequestDTO";
import type { Contato } from "@/domain/entities/Contato";
import type { IContatoRepository } from "@/domain/repositories/IContatoRepository";

export class PersistContatoUseCase {
    constructor (
        private repository: IContatoRepository
    ) {}

    async execute(dto: ContatoPostRequestDTO): Promise<Contato>
    {
        return await this.repository.persist(dto);
    }
}
