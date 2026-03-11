import type { ContatoPostRequestDTO } from "@/application/dto/Contato/ContatoPostRequestDTO";
import type { Contato } from "../entities/Contato";

export interface IContatoRepository {
    persist(dto: ContatoPostRequestDTO): Promise<Contato>;
}
