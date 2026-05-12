export class EnderecoResponseDTO {
    constructor(
        public id: number,
        public usuarioId: number,
        public cep: string,
        public logradouro: string,
        public numero: string,
        public complemento: string,
        public unidade: string,
        public bairro: string,
        public localidade: string,
        public uf: string,
        public estado: string,
        public regiao: string,
        public ibge: string,
        public gia: string,
        public ddd: string,
        public siafi: string,
        public createdAt: string
    ) {}
}
