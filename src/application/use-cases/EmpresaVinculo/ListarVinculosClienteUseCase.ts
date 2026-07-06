import type { EmpresaVinculoListagemResponseDTO } from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class ListarVinculosClienteUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(page: number): Promise<EmpresaVinculoListagemResponseDTO> {
        return this.repository.listarVinculosCliente(page);
    }
}
