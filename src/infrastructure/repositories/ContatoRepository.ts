import type { ContatoPostRequestDTO } from "@/application/dto/Contato/ContatoPostRequestDTO";
import { Contato } from "@/domain/entities/Contato";
import type { IContatoRepository } from "@/domain/repositories/IContatoRepository";
import type { AxiosInstance } from "axios";

export class ContatoRepository implements IContatoRepository {
    constructor(
        private api: AxiosInstance
    ) { }

    async persist(dto: ContatoPostRequestDTO): Promise<Contato> {
        try {
            const result = await this.api.post<Contato>(
                '/contato',
                dto
            );
            return result.data;
        } catch (error) {
            throw error
        }
    }
}
