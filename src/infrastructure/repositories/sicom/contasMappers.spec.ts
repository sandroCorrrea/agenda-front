import { describe, expect, it } from "vitest";
import { mapContas } from "@/infrastructure/repositories/sicom/contasMappers";

describe("mapeamento do ementário", () => {
    it("preserva planilha, valor com vírgula e desdobramento", () => {
        const resposta = mapContas({
            status: "vinculado",
            mensagem: "82 ocorrência(s) em REC.CSV vinculada(s) a 77 conta(s) do ementário.",
            ementario: { planilha: "ENR - 2025 ", totalContas: 1644, niveis: ["Categoria Econômica"] },
            totalContas: 77,
            totalOcorrencias: 82,
            dicionario: [
                {
                    codigoInformado: "11125001",
                    codigoConta: "11125000",
                    desdobramento: "1",
                    rotuloDesdobramento: "Principal",
                    especificacao: "Imposto sobre a Propriedade Predial e Territorial Urbana",
                    ocorrencias: [{ arquivo: "REC.CSV", linha: 1, valor: "120000,00", registro: ["10", "  "] }]
                }
            ]
        });

        expect(resposta.ementario?.planilha).toBe("ENR - 2025 ");
        expect(resposta.dicionario[0]?.ocorrencias[0]?.valor).toBe("120000,00");
        expect(resposta.dicionario[0]?.ocorrencias[0]?.registro).toEqual(["10", "  "]);
    });

    it("mantém status nulo da conta e não exige chaves fixas da planilha", () => {
        const resposta = mapContas({
            status: "vinculado",
            totalOcorrencias: 1,
            dicionario: [
                {
                    codigoInformado: "11180110",
                    codigoConta: "11180110",
                    desdobramento: null,
                    rotuloDesdobramento: null,
                    status: "Excluído",
                    conta: { NR: "11180110", "Norma Correspondente": null, "Código": "11180110" }
                }
            ]
        });

        expect(resposta.dicionario[0]?.status).toBe("Excluído");
        expect(resposta.dicionario[0]?.desdobramento).toBeNull();
        expect(resposta.dicionario[0]?.conta).toEqual({
            NR: "11180110",
            "Norma Correspondente": null,
            Código: "11180110"
        });
    });

    it("lê envio inválido sem procurar dicionário", () => {
        const resposta = mapContas({
            status: "erro",
            mensagem: "Requisição inválida. Envie os campos remessa (ZIP) e ementario (XLSX).",
            detalhes: ["ementario"]
        });

        expect(resposta.status).toBe("erro");
        expect(resposta.dicionario).toEqual([]);
        expect(resposta.arquivos).toEqual([]);
        expect(resposta.detalhes).toEqual(["ementario"]);
    });

    it("aceita vinculado sem contas", () => {
        const resposta = mapContas({
            status: "vinculado",
            mensagem: "Nenhum código da remessa foi encontrado neste ementário.",
            totalOcorrencias: 0,
            totalContas: 0,
            dicionario: [],
            arquivosSemCorrespondencia: [{ arquivo: "REC.CSV", mensagem: "Nenhum código deste arquivo consta no ementário." }]
        });

        expect(resposta.status).toBe("vinculado");
        expect(resposta.totalOcorrencias).toBe(0);
        expect(resposta.arquivosSemCorrespondencia[0]?.mensagem).toBe("Nenhum código deste arquivo consta no ementário.");
    });
});
