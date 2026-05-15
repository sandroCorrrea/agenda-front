import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { ApiMessageResponseDTO } from "@/application/dto/Auth/ApiMessageResponseDTO";

export class SolicitarRecuperacaoSenhaUseCase {
    constructor(private repository: IAuthRepository) {}

    execute(email: string): Promise<ApiMessageResponseDTO> {
        return this.repository.solicitarRecuperacaoSenha(email);
    }
}
