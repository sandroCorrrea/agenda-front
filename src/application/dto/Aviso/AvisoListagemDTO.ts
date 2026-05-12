import type { AvisoUsuarioDTO } from "./AvisoUsuarioDTO";

export class AvisoListagemDTO {
    constructor(
        public id: number,
        public nome: string,
        public descricao: string,
        public expiracao: string,
        public usuario: AvisoUsuarioDTO | null
    ) {}
}
