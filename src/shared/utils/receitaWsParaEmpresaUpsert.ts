import { EmpresaUpsertDTO } from "@/application/dto/Empresa/EmpresaUpsertDTO";
import type { ReceitaWsCnpjResponseDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsCnpjResponseDTO";
import { ReceitaWsAtividadeDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsAtividadeDTO";
import { ReceitaWsSocioDTO } from "@/application/dto/Empresa/ReceitaWs/ReceitaWsSocioDTO";
import { onlyNumbers } from "@/shared/utils/masks";

function emailParaCadastro(emailReceita: string | null | undefined, cnpj: string): string {
    const bruto = emailReceita?.trim() ?? "";
    if (/\S+@\S+\.\S+/.test(bruto)) return bruto;
    const sufixo = cnpj || "empresa";
    return `contato@${sufixo}.com.br`;
}

/** Monta payload de POST /empresa a partir da consulta Receita WS (mesmo padrão do admin). */
export function receitaWsParaEmpresaUpsert(
    cnpjResp: ReceitaWsCnpjResponseDTO
): EmpresaUpsertDTO {
    const cnpj = onlyNumbers(cnpjResp.cnpj ?? "");

    const atividadesPrincipais = (cnpjResp.atividadePrincipal ?? [])
        .filter((a) => a.code.trim() || a.text.trim())
        .map((a) => new ReceitaWsAtividadeDTO(a.code.trim(), a.text.trim()));

    const atividadesSecundarias = (cnpjResp.atividadesSecundarias ?? [])
        .filter((a) => a.code.trim() || a.text.trim())
        .map((a) => new ReceitaWsAtividadeDTO(a.code.trim(), a.text.trim()));

    const qsa = (cnpjResp.qsa ?? [])
        .filter((q) => q.nome.trim() || q.qual.trim())
        .map((q) => new ReceitaWsSocioDTO(q.nome.trim(), q.qual.trim()));

    const cnae = atividadesPrincipais[0]?.code ?? "";

    return new EmpresaUpsertDTO(
        (cnpjResp.nome ?? "").trim(),
        (cnpjResp.fantasia ?? cnpjResp.nome ?? "").trim(),
        cnpj,
        onlyNumbers(cnpjResp.cep ?? ""),
        (cnpjResp.logradouro ?? "").trim(),
        (cnpjResp.numero ?? "").trim() || "S/N",
        (cnpjResp.bairro ?? "").trim(),
        (cnpjResp.municipio ?? "").trim(),
        (cnpjResp.uf ?? "").trim().toUpperCase(),
        onlyNumbers(cnpjResp.telefone ?? ""),
        "",
        emailParaCadastro(cnpjResp.email, cnpj),
        "",
        (cnpjResp.tipo ?? "").trim(),
        (cnpjResp.dataSituacao ?? "").trim(),
        (cnpjResp.situacao ?? "").trim(),
        "",
        cnae,
        atividadesPrincipais.length
            ? atividadesPrincipais
            : [new ReceitaWsAtividadeDTO("", "")],
        atividadesSecundarias,
        qsa,
        {
            origem_preenchimento: "cnpj_api",
            cnpj_consultado_em: new Date().toISOString()
        }
    );
}
