import { Matriz } from "@/domain/entities/Matriz";
import type {
    EmpresaListagemDTO,
    EmpresasPaginadasResultado,
    IMatrizRepository,
    ListarEmpresasParams
} from "@/domain/repositories/IMatrizRepository";
import type { AxiosInstance } from "axios";
import type { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import { EmpresaListagemAtividadeDTO } from "@/application/dto/Empresa/EmpresaListagemAtividadeDTO";
import { EmpresaListagemQsaDTO } from "@/application/dto/Empresa/EmpresaListagemQsaDTO";

type AtividadeJson = {
    id?: number;
    code?: string;
    text?: string;
    tipo?: string;
};
type QsaJson = { id?: number; nome?: string; qual?: string };
type EmpresaJson = {
    id: number;
    nome: string;
    apelido?: string | null;
    cnpj: string;
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    telefone?: string | null;
    celular?: string | null;
    email: string;
    inscricao_estadual?: string | null;
    tipo_empresa?: string | null;
    data_situacao_uf?: string | null;
    situacao_cnpj?: string | null;
    situacao_ie?: string | null;
    cnae?: string | null;
    atividades_principais?: AtividadeJson[];
    atividades_secundarias?: AtividadeJson[];
    qsa?: QsaJson[];
    created_at?: string;
    updated_at?: string;
};

export class MatrizRepository implements IMatrizRepository
{
    constructor(
        private api: AxiosInstance
    ) {}

    async find(): Promise<Matriz> {
        const resp = await this.api.get('/matriz');

        const data = resp.data;
        const atividadesPrincipais = Array.isArray(data.atividades_principais)
            ? (data.atividades_principais as AtividadeJson[])
                  .filter((a) => a?.code || a?.text)
                  .map(
                      (a) =>
                          new ReceitaWsAtividadeDTO(
                              String(a.code ?? ""),
                              String(a.text ?? "")
                          )
                  )
            : [];
        const atividadesSecundarias = Array.isArray(data.atividades_secundarias)
            ? (data.atividades_secundarias as AtividadeJson[])
                  .filter((a) => a?.code || a?.text)
                  .map(
                      (a) =>
                          new ReceitaWsAtividadeDTO(
                              String(a.code ?? ""),
                              String(a.text ?? "")
                          )
                  )
            : [];
        const qsa = Array.isArray(data.qsa)
            ? (data.qsa as QsaJson[])
                  .filter((q) => q?.nome || q?.qual)
                  .map(
                      (q) =>
                          new ReceitaWsSocioDTO(
                              String(q.nome ?? ""),
                              String(q.qual ?? "")
                          )
                  )
            : [];

        return new Matriz(
            data.id,
            data.nome,
            data.apelido,
            data.cnpj,
            data.cep,
            data.rua,
            data.bairro,
            data.cidade,
            data.numero,
            data.uf,
            data.telefone,
            data.celular,
            data.email,
            data.inscricao_estadual,
            data.tipo_empresa,
            data.data_situacao_uf,
            data.situacao_cnpj,
            data.situacao_ie,
            data.cnae,
            atividadesPrincipais,
            atividadesSecundarias,
            qsa
        );
    }

    private mapAtividadeJson(
        a: AtividadeJson,
        fallbackTipo: "principal" | "secundaria"
    ): EmpresaListagemAtividadeDTO {
        const tipoRaw = (a.tipo ?? "").toLowerCase();
        const tipo: "principal" | "secundaria" =
            tipoRaw === "principal" || tipoRaw === "secundaria"
                ? tipoRaw
                : fallbackTipo;
        return new EmpresaListagemAtividadeDTO(
            a.id,
            String(a.code ?? ""),
            String(a.text ?? ""),
            tipo
        );
    }

    private mapEmpresaJsonParaListagem(item: EmpresaJson): EmpresaListagemDTO {
        return {
            id: item.id,
            nome: item.nome,
            apelido: item.apelido ?? null,
            cnpj: item.cnpj,
            cep: item.cep,
            rua: item.rua,
            numero: item.numero,
            bairro: item.bairro,
            cidade: item.cidade,
            uf: item.uf,
            telefone: item.telefone ?? null,
            celular: item.celular ?? null,
            email: item.email,
            inscricao_estadual: item.inscricao_estadual ?? null,
            tipo_empresa: item.tipo_empresa ?? null,
            data_situacao_uf: item.data_situacao_uf ?? null,
            situacao_cnpj: item.situacao_cnpj ?? null,
            situacao_ie: item.situacao_ie ?? null,
            cnae: item.cnae ?? null,
            atividades_principais: Array.isArray(item.atividades_principais)
                ? item.atividades_principais
                      .filter((a) => a?.code || a?.text)
                      .map((a) => this.mapAtividadeJson(a, "principal"))
                : [],
            atividades_secundarias: Array.isArray(item.atividades_secundarias)
                ? item.atividades_secundarias
                      .filter((a) => a?.code || a?.text)
                      .map((a) => this.mapAtividadeJson(a, "secundaria"))
                : [],
            qsa: Array.isArray(item.qsa)
                ? item.qsa
                      .filter((q) => q?.nome || q?.qual)
                      .map(
                          (q) =>
                              new EmpresaListagemQsaDTO(
                                  q.id,
                                  String(q.nome ?? ""),
                                  String(q.qual ?? "")
                              )
                      )
                : [],
            created_at: item.created_at ?? "",
            updated_at: item.updated_at ?? ""
        };
    }

    async listarEmpresasPaginado(
        params?: ListarEmpresasParams
    ): Promise<EmpresasPaginadasResultado> {
        const query: Record<string, string | number> = {
            page: params?.page ?? 1
        };
        const nome = params?.nome?.trim();
        if (nome) query.nome = nome;

        const resp = await this.api.get<unknown>("/empresa", { params: query });
        const raw = resp.data;

        if (Array.isArray(raw)) {
            const data = raw.map((item) =>
                this.mapEmpresaJsonParaListagem(item as EmpresaJson)
            );
            return {
                data,
                total: data.length,
                pagina: 1,
                por_pagina: Math.max(data.length, 1)
            };
        }

        const body = raw as {
            data?: EmpresaJson[];
            total?: number;
            pagina?: number;
            por_pagina?: number;
        };
        const arr = Array.isArray(body.data) ? body.data : [];
        return {
            data: arr.map((item) => this.mapEmpresaJsonParaListagem(item)),
            total: Number(body.total) || 0,
            pagina: Number(body.pagina) || 1,
            por_pagina: Number(body.por_pagina) || 6
        };
    }

    async atualizarEmpresa(
        id: number,
        dto: EmpresaUpsertDTO
    ): Promise<EmpresaListagemDTO> {
        type PutResp = { message?: string; empresa: EmpresaJson };
        const resp = await this.api.put<PutResp>(`/empresa/${id}`, {
            nome: dto.nome,
            apelido: dto.apelido,
            cnpj: dto.cnpj,
            cep: dto.cep,
            rua: dto.rua,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            uf: dto.uf,
            telefone: dto.telefone,
            celular: dto.celular,
            email: dto.email,
            inscricao_estadual: dto.inscricao_estadual,
            tipo_empresa: dto.tipo_empresa,
            data_situacao_uf: dto.data_situacao_uf,
            situacao_cnpj: dto.situacao_cnpj,
            situacao_ie: dto.situacao_ie,
            cnae: dto.cnae,
            atividades_principais: dto.atividades_principais,
            atividades_secundarias: dto.atividades_secundarias,
            qsa: dto.qsa,
            meta: dto.meta
        });
        return this.mapEmpresaJsonParaListagem(resp.data.empresa);
    }

    async upsert(dto: EmpresaUpsertDTO): Promise<void> {
        await this.api.put("/matriz", {
            nome: dto.nome,
            apelido: dto.apelido,
            cnpj: dto.cnpj,

            cep: dto.cep,
            rua: dto.rua,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            uf: dto.uf,

            telefone: dto.telefone,
            celular: dto.celular,
            email: dto.email,

            inscricao_estadual: dto.inscricao_estadual,
            tipo_empresa: dto.tipo_empresa,
            data_situacao_uf: dto.data_situacao_uf,
            situacao_cnpj: dto.situacao_cnpj,
            situacao_ie: dto.situacao_ie,
            cnae: dto.cnae,

            atividades_principais: dto.atividades_principais,
            atividades_secundarias: dto.atividades_secundarias,
            qsa: dto.qsa,
            meta: dto.meta
        });
    }

    async criarEmpresa(dto: EmpresaUpsertDTO): Promise<void> {
        await this.api.post("/empresa", {
            nome: dto.nome,
            apelido: dto.apelido,
            cnpj: dto.cnpj,
            cep: dto.cep,
            rua: dto.rua,
            numero: dto.numero,
            bairro: dto.bairro,
            cidade: dto.cidade,
            uf: dto.uf,
            telefone: dto.telefone,
            celular: dto.celular,
            email: dto.email,
            inscricao_estadual: dto.inscricao_estadual,
            tipo_empresa: dto.tipo_empresa,
            data_situacao_uf: dto.data_situacao_uf,
            situacao_cnpj: dto.situacao_cnpj,
            situacao_ie: dto.situacao_ie,
            cnae: dto.cnae,
            atividades_principais: dto.atividades_principais,
            atividades_secundarias: dto.atividades_secundarias,
            qsa: dto.qsa,
            meta: dto.meta
        });
    }
}
