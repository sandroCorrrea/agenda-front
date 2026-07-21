import type {
    CriarVinculoAdminRequestDTO,
    EmpresaVinculoPostResponseDTO
} from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class CriarVinculoAdminUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(payload: CriarVinculoAdminRequestDTO): Promise<EmpresaVinculoPostResponseDTO> {
        return this.repository.criarVinculoAdmin(payload);
    }
}
