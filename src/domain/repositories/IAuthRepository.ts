import type { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import type { LoginPostResponseDTO } from "@/application/dto/Auth/LoginPostResponseDTO";
import type { TokenIntegracaoResponseDTO } from "@/application/dto/Auth/TokenIntegracaoResponseDTO";

export interface IAuthRepository {
    login(dto: LoginPostRequestDTO): Promise<LoginPostResponseDTO>;
    logout(): Promise<void>;
    gerarTokenIntegracao(): Promise<TokenIntegracaoResponseDTO>;
}
