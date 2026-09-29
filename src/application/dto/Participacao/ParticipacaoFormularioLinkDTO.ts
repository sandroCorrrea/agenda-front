import type { ParticipacaoPrazoDTO } from "@/application/dto/Participacao/ParticipacaoPrazoDTO";

export interface ParticipacaoFormularioLinkDTO extends ParticipacaoPrazoDTO {
    linkFormulario: string;
    municipioToken: string;
    ibge: string;
    localidade: string;
    uf: string;
}
