import type { ClienteOpcaoVinculoAdminDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class ListarClientesOpcoesVinculoAdminUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(): Promise<ClienteOpcaoVinculoAdminDTO[]> {
        return this.repository.listarClientesOpcoesAdmin();
    }
}
