import type { EmpresaVinculoStatusUpdateResponseDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class AprovarVinculoEmpresaUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(vinculoId: number): Promise<EmpresaVinculoStatusUpdateResponseDTO> {
        return this.repository.aprovarVinculo(vinculoId);
    }
}
