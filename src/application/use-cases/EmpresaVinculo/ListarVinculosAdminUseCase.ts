import type { EmpresaVinculoListagemResponseDTO, ListarVinculosAdminParams } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class ListarVinculosAdminUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(params: ListarVinculosAdminParams): Promise<EmpresaVinculoListagemResponseDTO> {
        return this.repository.listarVinculosAdmin(params);
    }
}
