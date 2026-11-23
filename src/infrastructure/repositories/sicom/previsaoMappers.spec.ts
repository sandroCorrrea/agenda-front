import { describe, expect, it } from "vitest";
import { mapPrevisao } from "@/infrastructure/repositories/sicom/previsaoMappers";

describe("previsaoMappers", () => {
    it("aceita previsão sem exercício futuro quando o método é insuficiente", () => {
        const resposta = mapPrevisao({
            status: "previsto",
            mensagem: "O município 02002 tem apenas o exercício 2025. Grave outro ano para prever o seguinte.",
            metodo: "insuficiente",
            totais: { historico: [{ exercicio: 2025, receitaLiquida: 10 }], previsoes: [], metodo: "insuficiente" },
            despesas: [{ codigo: "1", metodo: "insuficiente", variacaoPercentual: null, previsao: [] }]
        });

        expect(resposta.status).toBe("previsto");
        expect(resposta.totais?.previsoes).toEqual([]);
        expect(resposta.metodo).toBe("insuficiente");
        expect(resposta.despesas[0]?.variacaoPercentual).toBeNull();
    });

    it("descarta status de outra rota e método desconhecido", () => {
        expect(mapPrevisao({ status: "gerado", metodo: "media" }).status).toBeNull();
        const resposta = mapPrevisao({
            status: "previsto",
            metodo: "media",
            despesas: [{ codigo: "1", metodo: "media", ultimoValor: "54214600" }]
        });
        expect(resposta.metodo).toBeNull();
        expect(resposta.despesas[0]?.metodo).toBeNull();
        expect(resposta.despesas[0]?.ultimoValor).toBeNull();
    });
});
