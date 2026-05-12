export class EmpresaListagemAtividadeDTO {
    constructor(
        public id: number | undefined,
        public code: string,
        public text: string,
        public tipo: "principal" | "secundaria"
    ) {}
}
