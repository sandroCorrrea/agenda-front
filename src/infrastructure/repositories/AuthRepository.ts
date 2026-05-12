import type { AxiosInstance } from "axios";
import type { IAuthRepository } from "@/domain/repositories/IAuthRepository";
import type { LoginPostRequestDTO } from "@/application/dto/Auth/LoginPostRequestDTO";
import type { LoginResponse } from "@/application/dto/Auth/LoginPostResponseDTO";
import { TokenIntegracaoResponseDTO } from "@/application/dto/Auth/TokenIntegracaoResponseDTO";
import {
    LoginPostResponseDTO,
    UsuarioAutenticadoDTO
} from "@/application/dto/Auth/LoginPostResponseDTO";

export class AuthRepository implements IAuthRepository {
    constructor(private api: AxiosInstance) {}

    async login(dto: LoginPostRequestDTO): Promise<LoginPostResponseDTO> {
        const res = await this.api.post<LoginResponse>("/auth/login", {
            cpf: dto.cpf,
            senha: dto.senha
        });
        const data = res.data;
        return new LoginPostResponseDTO(
            data.token,
            data.token_type,
            new UsuarioAutenticadoDTO(
                data.usuario.id,
                data.usuario.pessoa_id,
                data.usuario.tipo_usuario
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
}
