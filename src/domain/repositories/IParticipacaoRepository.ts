import type { ParticipacaoAnaliseRequestDTO } from "@/application/dto/Participacao/ParticipacaoAnaliseRequestDTO";
import type { ParticipacaoConsultaPublicaQueryDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaQueryDTO";
import type { ParticipacaoConsultaPublicaResponseDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaResponseDTO";
import type { ParticipacaoListagemQueryDTO } from "@/application/dto/Participacao/ParticipacaoListagemQueryDTO";
import type { ParticipacaoListagemResponseDTO } from "@/application/dto/Participacao/ParticipacaoListagemResponseDTO";
import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { ParticipacaoPostRequestDTO } from "@/application/dto/Participacao/ParticipacaoPostRequestDTO";
import type { ParticipacaoFormularioLinkDTO } from "@/application/dto/Participacao/ParticipacaoFormularioLinkDTO";
import type { ParticipacaoMunicipioDTO } from "@/application/dto/Participacao/ParticipacaoMunicipioDTO";
import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";

export interface IParticipacaoRepository {
    getOpcoes(): Promise<ParticipacaoOpcoesResponseDTO>;
    obterMunicipio(municipioToken: string): Promise<ParticipacaoMunicipioDTO>;
    obterLinkFormulario(): Promise<ParticipacaoFormularioLinkDTO>;
    criar(dto: ParticipacaoPostRequestDTO): Promise<ParticipacaoPostResponseDTO>;
    consultarPublico(
        query: ParticipacaoConsultaPublicaQueryDTO
    ): Promise<ParticipacaoConsultaPublicaResponseDTO>;
    listar(params?: ParticipacaoListagemQueryDTO): Promise<ParticipacaoListagemResponseDTO>;
    detalhe(id: number): Promise<ParticipacaoPostResponseDTO>;
    salvarAnalise(
        id: number,
        dto: ParticipacaoAnaliseRequestDTO
    ): Promise<ParticipacaoPostResponseDTO>;
}
