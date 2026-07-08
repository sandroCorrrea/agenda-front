import type { AxiosInstance } from "axios";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import type { LoginResponse } from "@/application/dto/Auth/LoginPostResponseDTO";
import type { ApiMessageResponseDTO } from "@/application/dto/Auth/ApiMessageResponseDTO";
import type { RedefinirSenhaComTokenDTO } from "@/application/dto/Auth/RedefinirSenhaComTokenDTO";
import { TokenIntegracaoResponseDTO } from "@/application/dto/Auth/TokenIntegracaoResponseDTO";
import {
    LoginPostResponseDTO,
    UsuarioAutenticadoDTO
} from "@/application/dto/Auth/LoginPostResponseDTO";

export class AuthRepository implements IAuthRepository {
    constructor(private api: AxiosInstance) {}

    async login(dto: LoginPostRequestDTO): Promise<LoginPostResponseDTO> {
        const res = await this.api.post<LoginResponse>(
            "/auth/login",
            {
                cpf: dto.cpf,
                senha: dto.senha
            },
            { skipAuth: true }
        );
        const data = res.data;
        return new LoginPostResponseDTO(
            data.token,
            data.token_type,
            new UsuarioAutenticadoDTO(
                data.usuario.id,
                data.usuario.pessoa_id,
                data.usuario.tipo_usuario,
                data.usuario.perfil_administrador ?? null
            ),
            data.expires_in
        );
    }

    async logout(): Promise<void> {
        await this.api.post("/auth/logout");
    }

    async gerarTokenIntegracao(): Promise<TokenIntegracaoResponseDTO> {
        const res = await this.api.post<{
            token: string;
            token_type: string;
        }>("/auth/token/integracao");
        return new TokenIntegracaoResponseDTO(
            res.data.token,
            res.data.token_type
        );
    }

    async solicitarRecuperacaoSenha(
        email: string
    ): Promise<ApiMessageResponseDTO> {
        const res = await this.api.post<ApiMessageResponseDTO>(
            "/auth/senha/recuperacao",
            { email },
            { skipAuth: true }
        );
        return res.data;
    }

    async redefinirSenhaComToken(
        dto: RedefinirSenhaComTokenDTO
    ): Promise<ApiMessageResponseDTO> {
        const res = await this.api.post<ApiMessageResponseDTO>(
            "/auth/senha/redefinir",
            {
                token: dto.token,
                nova_senha: dto.nova_senha,
                nova_senha_confirmation: dto.nova_senha_confirmation
            },
            { skipAuth: true }
        );
        return res.data;
    }
}
