/** Dados públicos do usuário (sem senha) vindos de GET /pessoa/{id}. */
export class UsuarioPerfilDTO {
    constructor(
        public readonly id: number,
        public readonly pessoaId: number,
        public tipoUsuario: string,
        public status: string,
        public img: string | null
    ) {}
}
