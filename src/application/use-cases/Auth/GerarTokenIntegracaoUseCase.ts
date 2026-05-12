import type { TokenIntegracaoResponseDTO } from "@/application/dto/Auth/TokenIntegracaoResponseDTO";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";

export class GerarTokenIntegracaoUseCase {
    constructor(private repository: IAuthRepository) {}

    execute(): Promise<TokenIntegracaoResponseDTO> {
        return this.repository.gerarTokenIntegracao();
    }
}
