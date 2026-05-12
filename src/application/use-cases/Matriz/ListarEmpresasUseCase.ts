import type {
    EmpresasPaginadasResultado,
    ListarEmpresasParams
} from "@/domain/repositories/IMatrizRepository";
import type { IMatrizRepository } from "@/domain/repositories/IMatrizRepository";

export class ListarEmpresasUseCase {
    constructor(private repository: IMatrizRepository) {}

    execute(
        params?: ListarEmpresasParams
    ): Promise<EmpresasPaginadasResultado> {
        return this.repository.listarEmpresasPaginado(params);
    }
}
