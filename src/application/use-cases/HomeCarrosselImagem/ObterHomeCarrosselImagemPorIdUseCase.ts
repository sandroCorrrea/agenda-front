import type { HomeCarrosselImagem } from "@/domain/entities/HomeCarrosselImagem";
import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";

export class ObterHomeCarrosselImagemPorIdUseCase {
    constructor(private repository: IHomeCarrosselImagemRepository) {}

    execute(id: number): Promise<HomeCarrosselImagem> {
        return this.repository.findById(id);
    }
}
