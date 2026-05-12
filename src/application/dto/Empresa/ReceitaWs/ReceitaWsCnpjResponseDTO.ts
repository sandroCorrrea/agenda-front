import type { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import type { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import type { ReceitaWsSimplesDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSimplesDTO";
import type { ReceitaWsSimeiDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSimeiDTO";
import type { ReceitaWsBillingDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsBillingDTO";

export type ReceitaWsStatus = "OK" | "ERROR" | string;

export class ReceitaWsCnpjResponseDTO {
    constructor(
        public status: ReceitaWsStatus,
        public message: string | null,

        public abertura: string | null,
        public situacao: string | null,
        public tipo: string | null,
        public nome: string | null,
        public fantasia: string | null,
        public porte: string | null,
        public naturezaJuridica: string | null,
        public atividadePrincipal: ReceitaWsAtividadeDTO[],
        public atividadesSecundarias: ReceitaWsAtividadeDTO[],
        public qsa: ReceitaWsSocioDTO[],

        public logradouro: string | null,
        public numero: string | null,
        public municipio: string | null,
        public bairro: string | null,
        public uf: string | null,
        public cep: string | null,
        public email: string | null,
        public telefone: string | null,
        public dataSituacao: string | null,
        public cnpj: string | null,

        public ultimaAtualizacao: string | null,

        public complemento: string | null,
        public efr: string | null,
        public motivoSituacao: string | null,
        public situacaoEspecial: string | null,
        public dataSituacaoEspecial: string | null,
        public capitalSocial: string | null,

        public simples: ReceitaWsSimplesDTO | null,
        public simei: ReceitaWsSimeiDTO | null,
        public billing: ReceitaWsBillingDTO | null
    ) {}
}

