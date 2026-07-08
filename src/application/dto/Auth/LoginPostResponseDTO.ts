import type { PerfilAdministrador } from "@/domain/types/PerfilAdministrador";

export class UsuarioAutenticadoDTO {
    constructor(
        public id: number,
        public pessoa_id: number,
        public tipo_usuario: string,
        public perfil_administrador?: PerfilAdministrador | null
    ) {}
}

/** Resposta JSON do POST /auth/login. `expires_in` é opcional (segundos até expirar o token). */
export type LoginResponse = {
    token: string;
    token_type: string;
    usuario: {
        id: number;
        pessoa_id: number;
        tipo_usuario: string;
        perfil_administrador?: PerfilAdministrador | null;
    };
    expires_in?: number;
};

export class LoginPostResponseDTO {
    constructor(
        public token: string,
        public token_type: string,
        public usuario: UsuarioAutenticadoDTO,
        public expires_in?: number
    ) {}
}
