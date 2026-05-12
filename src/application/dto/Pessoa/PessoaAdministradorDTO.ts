import type { UsuarioPerfilDTO } from "@/application/dto/Usuario/UsuarioPerfilDTO";

export class PessoaAdministradorDTO {
    constructor(
        public id: number,
        public nome: string,
        public cpf: string,
        public dataNascimento: Date,
        public email: string,
        public celular: string,
        public usuario: UsuarioPerfilDTO
    ) {}
}
