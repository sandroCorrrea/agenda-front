import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import type { HomeCarrosselImagemUpdateRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemUpdateRequestDTO";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";

export class AtualizarHomeCarrosselImagemUseCase {
    constructor(private repository: IHomeCarrosselImagemRepository) {}

    execute(
        id: number,
        dto: HomeCarrosselImagemUpdateRequestDTO
    ): Promise<HomeCarrosselImagem> {
        return this.repository.update(id, dto);
    }
}
