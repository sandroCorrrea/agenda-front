import type { ParticipacaoAnaliseDTO } from "@/application/dto/Participacao/ParticipacaoAnaliseDTO";
import type { ParticipacaoAnaliseRequestDTO } from "@/application/dto/Participacao/ParticipacaoAnaliseRequestDTO";
import type { ParticipacaoConsultaPublicaItemDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaItemDTO";
import type { ParticipacaoConsultaPublicaQueryDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaQueryDTO";
import { ParticipacaoConsultaPublicaResponseDTO } from "@/application/dto/Participacao/ParticipacaoConsultaPublicaResponseDTO";
import type { ParticipacaoFuncaoDTO } from "@/application/dto/Participacao/ParticipacaoFuncaoDTO";
import type { ParticipacaoListagemQueryDTO } from "@/application/dto/Participacao/ParticipacaoListagemQueryDTO";
import { ParticipacaoListagemResponseDTO } from "@/application/dto/Participacao/ParticipacaoListagemResponseDTO";
import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { ParticipacaoFormularioLinkDTO } from "@/application/dto/Participacao/ParticipacaoFormularioLinkDTO";
import type { ParticipacaoMunicipioDTO } from "@/application/dto/Participacao/ParticipacaoMunicipioDTO";
import type { ParticipacaoPostRequestDTO } from "@/application/dto/Participacao/ParticipacaoPostRequestDTO";
import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";
import type { ParticipacaoValueLabelDTO } from "@/application/dto/Participacao/ParticipacaoValueLabelDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import type { AxiosInstance } from "axios";

export class ParticipacaoRepository implements IParticipacaoRepository {
    constructor(private api: AxiosInstance) {}

    async getOpcoes(): Promise<ParticipacaoOpcoesResponseDTO> {
        const resp = await this.api.get<ParticipacaoOpcoesResponseDTO>(
            "/participacao/opcoes",
            { skipAuth: true }
        );
        return this.mapOpcoes(resp.data);
    }

    async obterMunicipio(municipioToken: string): Promise<ParticipacaoMunicipioDTO> {
        const resp = await this.api.get<Record<string, unknown>>(
            `/participacao/municipio/${encodeURIComponent(municipioToken)}`,
            { skipAuth: true }
        );
        return {
            ibge: String(resp.data.ibge ?? ""),
            localidade: String(resp.data.localidade ?? ""),
            uf: String(resp.data.uf ?? "")
        };
    }

    async obterLinkFormulario(): Promise<ParticipacaoFormularioLinkDTO> {
        const resp = await this.api.get<Record<string, unknown>>(
            "/participacao/link-formulario"
        );
        return {
            linkFormulario: String(
                resp.data.linkFormulario ?? resp.data.link_formulario ?? ""
            ),
            municipioToken: String(
                resp.data.municipioToken ?? resp.data.municipio_token ?? ""
            ),
            ibge: String(resp.data.ibge ?? ""),
            localidade: String(resp.data.localidade ?? ""),
            uf: String(resp.data.uf ?? "")
        };
    }

    async criar(dto: ParticipacaoPostRequestDTO): Promise<ParticipacaoPostResponseDTO> {
        const resp = await this.api.post<Record<string, unknown>>(
            "/participacao",
            this.limparPayload(dto),
            { skipAuth: true }
        );
        return this.mapParticipacao(resp.data);
    }

    async consultarPublico(
        query: ParticipacaoConsultaPublicaQueryDTO
    ): Promise<ParticipacaoConsultaPublicaResponseDTO> {
        const params: Record<string, string | number> = {};
        if (query.protocolo != null) params.protocolo = query.protocolo;
        if (query.email) params.email = query.email;

        const resp = await this.api.get<Record<string, unknown>>("/participacao/consulta", {
            params,
            skipAuth: true
        });

        const listaRaw = (resp.data.participacao ?? []) as Record<string, unknown>[];
        return new ParticipacaoConsultaPublicaResponseDTO(
            listaRaw.map((item) => this.mapConsultaPublica(item))
        );
    }

    async listar(
        params?: ParticipacaoListagemQueryDTO
    ): Promise<ParticipacaoListagemResponseDTO> {
        const resp = await this.api.get<Record<string, unknown>>("/participacao", {
            params
        });
        const listaRaw = (resp.data.participacao ?? []) as Record<string, unknown>[];
        return new ParticipacaoListagemResponseDTO(
            listaRaw.map((item) => this.mapParticipacao(item)),
            Number(resp.data.total ?? 0),
            Number(resp.data.pagina ?? 1),
            Number(resp.data.porPagina ?? 15)
        );
    }

    async detalhe(id: number): Promise<ParticipacaoPostResponseDTO> {
        const resp = await this.api.get<Record<string, unknown>>(`/participacao/${id}`);
        return this.mapParticipacao(resp.data);
    }

    async salvarAnalise(
        id: number,
        dto: ParticipacaoAnaliseRequestDTO
    ): Promise<ParticipacaoPostResponseDTO> {
        const resp = await this.api.put<Record<string, unknown>>(
            `/participacao/${id}/analise`,
            this.limparPayload(dto)
        );
        return this.mapParticipacao(resp.data);
    }

    private limparPayload<T extends object>(dto: T): Record<string, unknown> {
        const out: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(dto)) {
            if (value === undefined) continue;
            out[key] = value;
        }
        return out;
    }

    private mapOpcoes(raw: ParticipacaoOpcoesResponseDTO): ParticipacaoOpcoesResponseDTO {
        return {
            faixaEtaria: this.mapValueLabels(raw.faixaEtaria),
            sexo: this.mapValueLabels(raw.sexo),
            localidadeAtendida: this.mapValueLabels(raw.localidadeAtendida),
            tipoDemanda: this.mapValueLabels(raw.tipoDemanda),
            publicoBeneficiado: this.mapValueLabels(raw.publicoBeneficiado),
            prioridade: this.mapValueLabels(raw.prioridade),
            abrangencia: this.mapValueLabels(raw.abrangencia),
            funcao: (raw.funcao ?? []).map((f) => ({
                id: Number(f.id),
                codigo: String(f.codigo ?? ""),
                nome: String(f.nome ?? "")
            }))
        };
    }

    private mapValueLabels(
        items: ParticipacaoValueLabelDTO[] | undefined
    ): ParticipacaoValueLabelDTO[] {
        return (items ?? []).map((item) => ({
            value: String(item.value ?? ""),
            label: String(item.label ?? "")
        }));
    }

    private mapConsultaPublica(raw: Record<string, unknown>): ParticipacaoConsultaPublicaItemDTO {
        const funcaoRaw = raw.funcao as Record<string, unknown> | null | undefined;
        const problema =
            this.nullableString(raw.problemaResumo) ?? this.nullableString(raw.problema);
        const solucao =
            this.nullableString(raw.solucaoResumo) ?? this.nullableString(raw.solucao);

        return {
            id: Number(raw.id),
            instrumento: String(raw.instrumento ?? ""),
            exercicio: Number(raw.exercicio ?? 0),
            ibge: this.nullableString(raw.ibge),
            status: String(raw.status ?? "pendente"),
            bairroComunidade: String(raw.bairroComunidade ?? ""),
            localidadeAtendida: String(raw.localidadeAtendida ?? ""),
            localidadeDescricao: this.nullableString(raw.localidadeDescricao),
            prioridade: String(raw.prioridade ?? ""),
            tipoDemanda: String(raw.tipoDemanda ?? ""),
            publicoBeneficiado: this.mapPublicoBeneficiado(raw.publicoBeneficiado),
            problemaResumo: problema ? this.resumirTexto(problema) : null,
            solucaoResumo: solucao ? this.resumirTexto(solucao) : null,
            funcao: funcaoRaw ? this.mapFuncao(funcaoRaw) : null,
            registradoEm:
                this.nullableString(raw.registradoEm) ??
                this.nullableString(raw.createdAt) ??
                this.nullableString(raw.created_at)
        };
    }

    private resumirTexto(texto: string, max = 160): string {
        const limpo = texto.trim();
        if (limpo.length <= max) return limpo;
        return `${limpo.slice(0, max).trimEnd()}…`;
    }

    private mapParticipacao(raw: Record<string, unknown>): ParticipacaoPostResponseDTO {
        const funcaoRaw = raw.funcao as Record<string, unknown> | null | undefined;
        const analiseRaw = raw.analise as Record<string, unknown> | null | undefined;

        return {
            id: Number(raw.id),
            instrumento: String(raw.instrumento ?? ""),
            exercicio: Number(raw.exercicio ?? 0),
            ibge: this.nullableString(raw.ibge),
            bairroComunidade: String(raw.bairroComunidade ?? ""),
            faixaEtaria: String(raw.faixaEtaria ?? ""),
            localidadeAtendida: String(raw.localidadeAtendida ?? ""),
            participacaoFuncaoId: Number(raw.participacaoFuncaoId ?? 0),
            tipoDemanda: String(raw.tipoDemanda ?? ""),
            problema: String(raw.problema ?? ""),
            solucao: String(raw.solucao ?? ""),
            beneficios: String(raw.beneficios ?? ""),
            publicoBeneficiado: this.mapPublicoBeneficiado(raw.publicoBeneficiado),
            prioridade: String(raw.prioridade ?? ""),
            abrangencia: String(raw.abrangencia ?? ""),
            desejaInfoAudiencia: Boolean(raw.desejaInfoAudiencia),
            autorizaLgpd: Boolean(raw.autorizaLgpd),
            aceiteViabilidade: Boolean(raw.aceiteViabilidade),
            status: String(raw.status ?? "pendente"),
            nome: this.nullableString(raw.nome),
            sexo: this.nullableString(raw.sexo),
            email: this.nullableString(raw.email),
            telefone: this.nullableString(raw.telefone),
            localidadeDescricao: this.nullableString(raw.localidadeDescricao),
            funcao: funcaoRaw ? this.mapFuncao(funcaoRaw) : null,
            analise: analiseRaw ? this.mapAnalise(analiseRaw) : null
        };
    }

    private mapFuncao(raw: Record<string, unknown>): ParticipacaoFuncaoDTO {
        return {
            id: Number(raw.id),
            codigo: String(raw.codigo ?? ""),
            nome: String(raw.nome ?? "")
        };
    }

    private mapAnalise(raw: Record<string, unknown>): ParticipacaoAnaliseDTO {
        return {
            id: Number(raw.id),
            participacaoId: Number(raw.participacaoId ?? 0),
            funcao: this.nullableString(raw.funcao),
            subfuncao: this.nullableString(raw.subfuncao),
            programa: this.nullableString(raw.programa),
            naturezaDespesa: this.nullableString(raw.naturezaDespesa),
            categoriaEconomica: this.nullableString(raw.categoriaEconomica),
            possuiPrevisaoPpa:
                raw.possuiPrevisaoPpa == null ? null : Boolean(raw.possuiPrevisaoPpa),
            compativelLdo:
                raw.compativelLdo == null ? null : Boolean(raw.compativelLdo),
            fonteRecurso: this.nullableString(raw.fonteRecurso),
            atende: raw.atende == null ? null : Boolean(raw.atende),
            parecerTecnico: this.nullableString(raw.parecerTecnico),
            usuarioAnaliseId:
                raw.usuarioAnaliseId == null ? null : Number(raw.usuarioAnaliseId)
        };
    }

    private mapPublicoBeneficiado(value: unknown): string[] {
        const out: string[] = [];
        const push = (texto: string) => {
            const limpo = texto.trim();
            if (!limpo) return;
            if (limpo.includes(",")) {
                for (const parte of limpo.split(",")) {
                    const v = parte.trim();
                    if (v && !out.includes(v)) out.push(v);
                }
                return;
            }
            if (!out.includes(limpo)) out.push(limpo);
        };

        if (Array.isArray(value)) {
            for (const item of value) push(String(item ?? ""));
            return out;
        }
        if (typeof value === "string" && value.trim()) {
            push(value);
        }
        return out;
    }

    private nullableString(value: unknown): string | null {
        if (value == null || value === "") return null;
        return String(value);
    }
}
