import axios from "axios";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import type { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import type { ReceitaWsSimplesDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSimplesDTO";
import type { ReceitaWsSimeiDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSimeiDTO";
import type { ReceitaWsBillingDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsBillingDTO";
import { ReceitaWsAtividadeDTO as ReceitaWsAtividade } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import { ReceitaWsSocioDTO as ReceitaWsSocio } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import { ReceitaWsSimplesDTO as ReceitaWsSimples } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSimplesDTO";
import { ReceitaWsSimeiDTO as ReceitaWsSimei } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSimeiDTO";
import { ReceitaWsBillingDTO as ReceitaWsBilling } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsBillingDTO";
import {
    ReceitaWsCnpjResponseDTO,
    type ReceitaWsStatus
} from "@/application/dto/Empresa/ReceitaWs/ReceitaWsCnpjResponseDTO";

type ReceitaWsRawAtividade = { code?: string; text?: string };
type ReceitaWsRawSocio = { nome?: string; qual?: string };

function mapAtividades(raw: unknown): ReceitaWsAtividadeDTO[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((x) => x as ReceitaWsRawAtividade)
        .filter((x) => Boolean(x?.code) && Boolean(x?.text))
        .map((x) => new ReceitaWsAtividade(String(x.code), String(x.text)));
}

function mapQsa(raw: unknown): ReceitaWsSocioDTO[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((x) => x as ReceitaWsRawSocio)
        .filter((x) => Boolean(x?.nome) && Boolean(x?.qual))
        .map((x) => new ReceitaWsSocio(String(x.nome), String(x.qual)));
}

export async function buscarReceitaWsCnpj(
    cnpjSemMascara: string
): Promise<ReceitaWsCnpjResponseDTO> {
    const numero = cnpjSemMascara.replace(/\D/g, "");
    if (numero.length !== 14) {
        throw new Error("CNPJ deve conter 14 digitos.");
    }

    try {
        const auth = useAuthStore();
        const api = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL ?? import.meta.env.BASE_URL,
            headers: {
                Accept: "application/json"
            }
        });
        if (auth.token) {
            api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
        }
        const res = await api.get<Record<string, any>>(`/cnpj/${numero}`);
        const data = res.data;

        const status: ReceitaWsStatus = (data.status as ReceitaWsStatus) ?? "";
        const message: string | null =
            typeof data.message === "string" ? data.message : null;

        const atividadePrincipal = mapAtividades(data.atividade_principal);
        const atividadesSecundarias = mapAtividades(
            data.atividades_secundarias
        );
        const qsa = mapQsa(data.qsa);

        if (status !== "OK") {
            throw new Error(message ?? "CNPJ nao encontrado.");
        }

        const simplesRaw = data.simples;
        const simeiRaw = data.simei;
        const billingRaw = data.billing;

        const simples: ReceitaWsSimplesDTO | null =
            simplesRaw && typeof simplesRaw === "object"
                ? new ReceitaWsSimples(
                      Boolean(simplesRaw.optante),
                      simplesRaw.data_opcao ?? null,
                      simplesRaw.data_exclusao ?? null,
                      String(simplesRaw.ultima_atualizacao ?? "")
                  )
                : null;

        const simei: ReceitaWsSimeiDTO | null =
            simeiRaw && typeof simeiRaw === "object"
                ? new ReceitaWsSimei(
                      Boolean(simeiRaw.optante),
                      simeiRaw.data_opcao ?? null,
                      simeiRaw.data_exclusao ?? null,
                      String(simeiRaw.ultima_atualizacao ?? "")
                  )
                : null;

        const billing: ReceitaWsBillingDTO | null =
            billingRaw && typeof billingRaw === "object"
                ? new ReceitaWsBilling(
                      Boolean(billingRaw.free),
                      Boolean(billingRaw.database)
                  )
                : null;

        return new ReceitaWsCnpjResponseDTO(
            status,
            message,
            data.abertura ?? null,
            data.situacao ?? null,
            data.tipo ?? null,
            data.nome ?? null,
            data.fantasia ?? null,
            data.porte ?? null,
            data.natureza_juridica ?? null,
            atividadePrincipal,
            atividadesSecundarias,
            qsa,
            data.logradouro ?? null,
            data.numero ?? null,
            data.municipio ?? null,
            data.bairro ?? null,
            data.uf ?? null,
            data.cep ?? null,
            data.email ?? null,
            data.telefone ?? null,
            data.data_situacao ?? null,
            data.cnpj ?? null,
            data.ultima_atualizacao ?? null,
            data.complemento ?? null,
            data.efr ?? null,
            data.motivo_situacao ?? null,
            data.situacao_especial ?? null,
            data.data_situacao_especial ?? null,
            data.capital_social ?? null,
            simples,
            simei,
            billing
        );
    } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
            const status = e.response?.status;
            const message =
                (e.response?.data as { message?: string } | undefined)?.message ??
                null;
            if (status === 401) {
                throw new Error(message ?? "Sessão expirada. Faça login novamente.");
            }
            if (status === 403) {
                throw new Error(
                    message ??
                        "Você não tem permissão para consultar CNPJ."
                );
            }
            if (status === 422) {
                throw new Error(message ?? "CNPJ inválido.");
            }
            if (status === 502 || status === 504) {
                throw new Error(
                    message ??
                        "Serviço de consulta de CNPJ indisponível no momento."
                );
            }
            throw new Error(message ?? "Falha ao consultar CNPJ.");
        }
        throw e instanceof Error ? e : new Error("Falha ao consultar CNPJ.");
    }
}

