import type { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import type {
    EmpresaListagemDTO,
    IMatrizRepository
} from "@/domain/repositories/IMatrizRepository";

export class CriarEmpresaUseCase {
    constructor(private repository: IMatrizRepository) {}

    execute(dto: EmpresaUpsertDTO): Promise<EmpresaListagemDTO> {
        return this.repository.criarEmpresa(dto);
    }
}
