import type { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";

export class UpsertMatrizUseCase {
    constructor(private repository: IMatrizRepository) {}

    execute(dto: EmpresaUpsertDTO): Promise<void> {
        return this.repository.upsert(dto);
    }
}

