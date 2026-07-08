import type { TipoUsuario } from "@/domain/types/TipoUsuario";
import type { PerfilAdministrador } from "@/domain/types/PerfilAdministrador";

export class UsuarioPostRequestDTO {
    constructor(
        public senha: string,
        public senha_confirmation: string,
        public tipo_usuario: TipoUsuario,
        public perfil_administrador?: PerfilAdministrador | null
    ) {}
}
