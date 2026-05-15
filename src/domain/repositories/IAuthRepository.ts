import type { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import type { LoginPostResponseDTO } from "@/application/dto/Auth/LoginPostResponseDTO";
import type { TokenIntegracaoResponseDTO } from "@/application/dto/Auth/TokenIntegracaoResponseDTO";
import type { RedefinirSenhaComTokenDTO } from "@/application/dto/Auth/RedefinirSenhaComTokenDTO";
import type { ApiMessageResponseDTO } from "@/application/dto/Auth/ApiMessageResponseDTO";

export interface IAuthRepository {
    login(dto: LoginPostRequestDTO): Promise<LoginPostResponseDTO>;
    logout(): Promise<void>;
    gerarTokenIntegracao(): Promise<TokenIntegracaoResponseDTO>;
    solicitarRecuperacaoSenha(email: string): Promise<ApiMessageResponseDTO>;
    redefinirSenhaComToken(
        dto: RedefinirSenhaComTokenDTO
    ): Promise<ApiMessageResponseDTO>;
}
