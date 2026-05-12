import type { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import type { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";

export class EmpresaUpsertDTO {
    constructor(
        public nome: string,
        public apelido: string,
        public cnpj: string,

        public cep: string,
        public rua: string,
        public numero: string,
        public bairro: string,
        public cidade: string,
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
        public qsa: ReceitaWsSocioDTO[],
        public meta?: {
            origem_preenchimento?: string;
            cnpj_consultado_em?: string | null;
        } | null
    ) {}
}

