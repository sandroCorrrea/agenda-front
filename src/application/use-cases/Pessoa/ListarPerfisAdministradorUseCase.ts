import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { PerfilAdministradorOpcaoDTO } from "@/application/dto/Pessoa/PerfilAdministradorOpcaoDTO";

export class ListarPerfisAdministradorUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(): Promise<PerfilAdministradorOpcaoDTO[]> {
        return this.repository.listarPerfisAdministrador();
    }
}
