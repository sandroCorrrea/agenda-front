import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";

export class ListarHomeCarrosselPublicoUseCase {
    constructor(private repository: IHomeCarrosselImagemRepository) {}

    execute(limit?: number): Promise<HomeCarrosselImagem[]> {
        return this.repository.listPublic(limit);
    }
}
