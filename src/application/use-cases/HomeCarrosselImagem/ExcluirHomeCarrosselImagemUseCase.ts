import type { IHomeCarrosselImagemRepository } from "@/domain/repositories/IHomeCarrosselImagemRepository";

export class ExcluirHomeCarrosselImagemUseCase {
    constructor(private repository: IHomeCarrosselImagemRepository) {}

    execute(id: number): Promise<void> {
        return this.repository.delete(id);
    }
}
