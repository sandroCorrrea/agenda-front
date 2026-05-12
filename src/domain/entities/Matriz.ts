import type { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import type { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";

export class Matriz {
    constructor(
        public id: number,
        public nome: string,
        public apelido: string,
        public cnpj: string,
        public cep: string,
        public rua: string,
        public bairro: string,
        public cidade: string,
        public numero: string,
        public uf: string,
        public telefone: string,
        public celular: string,
        public email: string,
        public inscricao_estadual: string,
        public tipo_empresa: string,
        public data_situacao_uf: string,
        public situacao_cnpj: string,
        public situacao_ie: string,
        public cnae: string,
        public atividades_principais: ReceitaWsAtividadeDTO[],
        public atividades_secundarias: ReceitaWsAtividadeDTO[],
        public qsa: ReceitaWsSocioDTO[]
    ) {}
}
