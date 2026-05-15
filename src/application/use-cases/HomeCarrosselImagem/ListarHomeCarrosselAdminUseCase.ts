import type { HomeCarrosselImagemListagemResponseDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemListagemResponseDTO";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";

export class ListarHomeCarrosselAdminUseCase {
    constructor(private repository: IHomeCarrosselImagemRepository) {}

    execute(params?: {
        page?: number;
        per_page?: number;
        ativo?: boolean | null;
        titulo?: string | null;
    }): Promise<HomeCarrosselImagemListagemResponseDTO> {
        return this.repository.listAdmin(params);
    }
}
