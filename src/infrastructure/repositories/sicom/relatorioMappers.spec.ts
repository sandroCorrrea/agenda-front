import { describe, expect, it } from "vitest";
import { mapRelatorio } from "@/infrastructure/repositories/sicom/relatorioMappers";

describe("mapeamento do relatório", () => {
    it("mantém reais, a frase pronta e o espaço da planilha", () => {
        const resposta = mapRelatorio({
            status: "gerado",
            mensagem: "A receita líquida prevista de R$ 54.214.600,00 cobre a despesa fixada de R$ 54.214.600,00.",
            exercicio: "2025",
            ementario: { arquivo: "ementario.xlsx", planilha: "ENR - 2025 ", totalContas: 1644 },
            resumo: {
                receitaBruta: 59856000,
                resultado: 0,
                situacao: "equilibrado",
                fontesDesequilibradas: 0
            },
            receitas: [{ codigo: "11125001", codigoConta: "11125000", nome: "IPTU — Principal", valor: 120000 }],
            cruzamento: [{ fonte: "1500000", nome: "Recursos não vinculados de impostos", resultado: 0, situacao: "equilibrado" }]
        });

        expect(resposta.status).toBe("gerado");
        expect(resposta.ementario?.planilha).toBe("ENR - 2025 ");
        expect(resposta.resumo?.receitaBruta).toBe(59856000);
        expect(resposta.resumo?.resultado).toBe(0);
        expect(resposta.receitas[0]?.valor).toBe(120000);
        expect(resposta.cruzamento[0]?.nome).toBe("Recursos não vinculados de impostos");
    });

    it("preserva a ordem e o nome nulo da fonte", () => {
        const resposta = mapRelatorio({
            status: "gerado",
            cruzamento: [
                { fonte: "1600000", nome: "Convênios", situacao: "deficit", resultado: -500000, detalhamento: null },
                { fonte: "1899000", nome: null, bloco: "Outras vinculações", situacao: "equilibrado" }
            ],
            avisos: ["A remessa não tem REC.CSV."]
        });

        expect(resposta.cruzamento.map((item) => item.fonte)).toEqual(["1600000", "1899000"]);
        expect(resposta.cruzamento[0]?.detalhamento).toBeNull();
        expect(resposta.cruzamento[1]?.nome).toBeNull();
        expect(resposta.avisos).toEqual(["A remessa não tem REC.CSV."]);
    });

    it("lê o erro sem montar resumo nem cruzamento", () => {
        const resposta = mapRelatorio({
            status: "erro",
            mensagem: "Requisição inválida. Envie os campos remessa (ZIP) e ementario (XLSX).",
            detalhes: ["ementario"]
        });

        expect(resposta.status).toBe("erro");
        expect(resposta.resumo).toBeNull();
        expect(resposta.cruzamento).toEqual([]);
        expect(resposta.avisos).toEqual([]);
        expect(resposta.detalhes).toEqual(["ementario"]);
    });

    it("aceita gerado sem uma das pontas", () => {
        const resposta = mapRelatorio({
            status: "gerado",
            mensagem: "A receita líquida prevista de R$ 0,00 cobre a despesa fixada de R$ 54.214.600,00.",
            resumo: { receitaLiquida: 0, despesaFixada: 54214600, resultado: -54214600, situacao: "deficit" },
            cruzamento: [],
            avisos: ["A remessa não tem REC.CSV."]
        });

        expect(resposta.status).toBe("gerado");
        expect(resposta.resumo?.situacao).toBe("deficit");
        expect(resposta.cruzamento).toEqual([]);
    });
});
