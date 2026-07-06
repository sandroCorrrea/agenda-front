import type {
    EmpresaListagemDTO,
    IMatrizRepository
} from "@/domain/repositories/IMatrizRepository";
import type { VerificarEmpresaLocalResult } from "@/application/dto/Empresa/VerificarEmpresaLocalResult";

export class BuscarEmpresaPorCnpjUseCase {
    constructor(private repository: IMatrizRepository) {}

    async execute(cnpjSemMascara: string): Promise<EmpresaListagemDTO | null> {
        return this.repository.buscarEmpresaPorCnpj(cnpjSemMascara);
    }

    async verificarAntesVinculo(
        cnpjSemMascara: string
    ): Promise<VerificarEmpresaLocalResult> {
        const empresa = await this.repository.buscarEmpresaPorCnpj(cnpjSemMascara);
        if (empresa) {
            return {
                existeLocalmente: true,
                empresa,
                empresaId: empresa.id
            };
        }
        return {
            existeLocalmente: false,
            empresa: null,
            empresaId: null
        };
    }
}
