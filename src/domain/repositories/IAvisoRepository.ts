import type { Aviso } from "../entities/Aviso";
import type { AvisoListagemDTO } from "@/application/dto/Aviso/AvisoListagemDTO";
import type { AvisoListagemResponseDTO } from "@/application/dto/Aviso/AvisoListagemResponseDTO";
import type { AvisoPostRequestDTO } from "@/application/dto/Aviso/AvisoPostRequestDTO";
import type { AvisoUpdateRequestDTO } from "@/application/dto/Aviso/AvisoUpdateRequestDTO";

export interface IAvisoRepository {
    findAll(page: number, per_page: number, nome?: string): Promise<Array<Aviso>>;
    findById(id: number): Promise<AvisoListagemDTO>;
    create(dto: AvisoPostRequestDTO): Promise<AvisoListagemDTO>;
    update(id: number, dto: AvisoUpdateRequestDTO): Promise<AvisoListagemDTO>;
    delete(id: number): Promise<void>;
    listPaginated(params?: {
        page?: number;
        per_page?: number;
        usuario_id?: number;
    }): Promise<AvisoListagemResponseDTO>;
    downloadPdf(id: number): Promise<Blob>;
}