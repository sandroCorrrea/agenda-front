import type { TipoUsuario } from "@/domain/types/TipoUsuario";

export class UsuarioPostRequestDTO {
    constructor(
        public senha: string,
        public senha_confirmation: string,
        public tipo_usuario: TipoUsuario
    ) {}
}
