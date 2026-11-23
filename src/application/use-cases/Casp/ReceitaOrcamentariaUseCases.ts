import type {
    ReceitaOrcamentariaConsulta
} from "@/domain/casp/receitaOrcamentaria";
import type { IReceitaOrcamentariaRepository } from "@/domain/repositories/IReceitaOrcamentariaRepository";

export class ListarReceitaOrcamentariaUseCase {
    constructor(private repository: IReceitaOrcamentariaRepository) {}
    execute(consulta: ReceitaOrcamentariaConsulta) {
        return this.repository.listar(consulta);
    }
}

export class EnviarReceitaOrcamentariaUseCase {
    constructor(private repository: IReceitaOrcamentariaRepository) {}
    execute(arquivo: File, apelido?: string, aoProgresso?: (percentual: number) => void) {
        return this.repository.enviar(arquivo, apelido, aoProgresso);
    }
}

export class BaixarReceitaOrcamentariaUseCase {
    constructor(private repository: IReceitaOrcamentariaRepository) {}
    execute(id: number, nomeOriginal: string) {
        return this.repository.baixar(id, nomeOriginal);
    }
}
