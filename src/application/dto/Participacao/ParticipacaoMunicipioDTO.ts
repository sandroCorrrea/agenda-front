import type { ParticipacaoPrazoDTO } from "@/application/dto/Participacao/ParticipacaoPrazoDTO";

export interface ParticipacaoMunicipioDTO extends ParticipacaoPrazoDTO {
    ibge: string;
    localidade: string;
    uf: string;
}
