import type { EmpresaVinculoStatusUpdateResponseDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class RejeitarVinculoEmpresaUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(
        vinculoId: number,
        justificativa: string
    ): Promise<EmpresaVinculoStatusUpdateResponseDTO> {
        return this.repository.rejeitarVinculo(vinculoId, justificativa);
    }
}
