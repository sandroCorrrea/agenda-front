import { describe, expect, it } from "vitest";
import { mapValidacao } from "@/infrastructure/repositories/sicom/validacaoMappers";

describe("mapeamento da validação SICOM", () => {
    it("preserva a mensagem e o valor com espaço", () => {
        const resposta = mapValidacao({
            status: "invalido",
            mensagem: "A remessa possui 1 erro(s) em relação ao manual.",
            totalErros: 1,
            totalAvisos: 0,
            erros: [
                {
                    severity: "erro",
                    arquivo: "IDE.CSV",
                    linha: 1,
                    coluna: 10,
                    campo: "nroLeiCUTE",
                    valor: " ",
                    mensagem: "é obrigatório e está vazio (quando contaUnicaTesouMunicipal = 1)"
                }
            ]
        });

        expect(resposta.erros[0]).toMatchObject({
            valor: " ",
            mensagem: "é obrigatório e está vazio (quando contaUnicaTesouMunicipal = 1)",
            coluna: 10
        });
    });

    it("aceita erro sem linha e sem os objetos de contexto", () => {
        const resposta = mapValidacao({
            status: "invalido",
            mensagem: "A remessa possui 1 erro(s) em relação ao manual.",
            totalErros: 1,
            totalAvisos: 0,
            erros: [
                {
                    severity: "erro",
                    arquivo: "IDE.CSV",
                    linha: null,
                    coluna: null,
                    campo: null,
                    valor: null,
                    mensagem: "Arquivo IDE exigido pelo manual não está na remessa."
                }
            ]
        });

        expect(resposta.manual).toBeNull();
        expect(resposta.remessa).toBeNull();
        expect(resposta.resultados).toEqual([]);
        expect(resposta.erros[0]?.linha).toBeNull();
        expect(resposta.erros[0]?.mensagem).toBe("Arquivo IDE exigido pelo manual não está na remessa.");
    });

    it("lê falha de envio só com mensagem e detalhes", () => {
        const resposta = mapValidacao({
            status: "erro",
            mensagem: "Requisição inválida. Envie os campos manual (PDF) e remessa (ZIP).",
            detalhes: ["remessa"]
        });

        expect(resposta.status).toBe("erro");
        expect(resposta.erros).toEqual([]);
        expect(resposta.resultados).toEqual([]);
        expect(resposta.detalhes).toEqual(["remessa"]);
    });

    it("mantém a ordem dos arquivos e a versão do manual", () => {
        const resposta = mapValidacao({
            status: "valido",
            mensagem: "Remessa válida de acordo com o manual.",
            manual: {
                arquivo: "2025_consolidado.pdf",
                versao: "Versão 14.0 - 2025",
                modulo: "Instrumentos de Planejamento",
                avisos: ["Página 4 sem tabela."]
            },
            remessa: { arquivo: "IP_02002_2025.zip", arquivos: ["IDE.CSV", "ORGAO.CSV"] },
            totalErros: 0,
            totalAvisos: 0,
            erros: [],
            avisos: [],
            resultados: [
                { arquivo: "IDE.CSV", leiaute: "IDE", linhas: 1, totalErros: 0, totalAvisos: 0 },
                { arquivo: "ORGAO.CSV", leiaute: "ORGAO", linhas: 2, totalErros: 0, totalAvisos: 0 }
            ]
        });

        expect(resposta.manual?.versao).toBe("Versão 14.0 - 2025");
        expect(resposta.manual?.avisos).toEqual(["Página 4 sem tabela."]);
        expect(resposta.resultados.map((item) => item.arquivo)).toEqual(["IDE.CSV", "ORGAO.CSV"]);
    });
});
