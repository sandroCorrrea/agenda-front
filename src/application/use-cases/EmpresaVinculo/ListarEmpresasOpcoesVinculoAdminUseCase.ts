import type { EmpresaOpcaoVinculoAdminDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class ListarEmpresasOpcoesVinculoAdminUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(): Promise<EmpresaOpcaoVinculoAdminDTO[]> {
        return this.repository.listarEmpresasOpcoesAdmin();
    }
}
