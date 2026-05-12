import type { UsuarioPerfilDTO } from "@/application/dto/Usuario/UsuarioPerfilDTO";

/** Dados da pessoa retornados por GET /pessoa/{id} (uso em tela de perfil). */
export class PessoaPerfilDTO {
    constructor(
        public readonly id: number,
        public nome: string,
        public cpf: string,
        public dataNascimento: Date,
        public email: string,
        public celular: string,
        public usuario: UsuarioPerfilDTO | null
    ) {}
}
