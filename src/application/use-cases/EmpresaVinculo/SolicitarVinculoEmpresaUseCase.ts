import type { EmpresaVinculoPostResponseDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class SolicitarVinculoEmpresaUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(empresaId: number): Promise<EmpresaVinculoPostResponseDTO> {
        return this.repository.solicitarVinculo(empresaId);
    }
}
