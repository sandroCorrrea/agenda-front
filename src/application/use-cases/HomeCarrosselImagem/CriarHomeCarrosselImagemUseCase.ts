import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import type { HomeCarrosselImagemPostRequestDTO } from "@/application/dto/HomeCarrosselImagem/HomeCarrosselImagemPostRequestDTO";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";

export class CriarHomeCarrosselImagemUseCase {
    constructor(private repository: IHomeCarrosselImagemRepository) {}

    execute(dto: HomeCarrosselImagemPostRequestDTO): Promise<HomeCarrosselImagem> {
        return this.repository.create(dto);
    }
}
