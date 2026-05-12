export class AvisoUsuarioDTO {
    constructor(
        public id: number,
        public pessoa_id: number,
        public tipo_usuario: string,
        public status: string,
        public img: string | null
    ) {}
}
