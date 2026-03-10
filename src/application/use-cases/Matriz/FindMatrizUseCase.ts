import type { Matriz } from "@/domain/entities/Matriz";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";

export class FindMatrizUseCase {
    constructor(
        private respository: IMatrizRepository
    ) {}

    async execute(): Promise<Matriz>
    {
        return this.respository.find();
    }
}
