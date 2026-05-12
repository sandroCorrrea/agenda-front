import type { PessoaAdministradorDTO } from "@/application/dto/Pessoa/PessoaAdministradorDTO";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";

export class ListarAdministradoresUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(): Promise<PessoaAdministradorDTO[]> {
        return this.repository.listarAdministradores();
    }
}
