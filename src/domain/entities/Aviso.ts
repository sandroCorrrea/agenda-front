export class Aviso {
    constructor (
        public id: number,
        public nome: string,
        public descricao: string,
        public expiracao: Date
    ) {}
}
