import type { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import type { EmpresaListagemDTO } from "@/domain/repositories/IMatrizRepository";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";

export class AtualizarEmpresaUseCase {
    constructor(private repository: IMatrizRepository) {}

    execute(
        id: number,
        dto: EmpresaUpsertDTO
    ): Promise<EmpresaListagemDTO> {
        return this.repository.atualizarEmpresa(id, dto);
    }
}
