import { describe, expect, it } from "vitest";
import {
    mapDetalheHistorico,
    mapExclusaoHistorico,
    mapGravacaoHistorico,
    mapListaHistorico
} from "@/infrastructure/repositories/sicom/historicoMappers";

describe("historicoMappers", () => {
    it("guarda um lote com exercício novo e exercício substituído", () => {
        const resposta = mapGravacaoHistorico({
            status: "salvo",
            mensagem: "2 instrumentos gravados.",
            total: 2,
            remessas: [
                { id: 1, municipio: "02002", exercicio: 2024, arquivo: "a.zip", substituido: false, receitaLiquida: 10 },
                { id: 2, municipio: "02002", exercicio: 2025, arquivo: "b.zip", substituido: true, receitaLiquida: "54214600" }
            ]
        });

        expect(resposta.status).toBe("salvo");
        expect(resposta.remessas[0]?.substituido).toBe(false);
        expect(resposta.remessas[1]?.substituido).toBe(true);
        expect(resposta.remessas[1]?.receitaLiquida).toBeNull();
    });

    it("aceita a lista vazia", () => {
        expect(mapListaHistorico({ status: "listado", municipios: [] }).municipios).toEqual([]);
    });

    it("mantém o identificador da dedução e o codigoConta nulo", () => {
        const resposta = mapDetalheHistorico({
            status: "detalhado",
            id: 9,
            receitas: [{ codigo: "17115111", codigoConta: null, nome: "FPM", valor: 10 }],
            deducoes: [{ codigo: "95", identificador: "95", nome: null, valor: 3 }]
        });

        expect(resposta.receitas[0]?.codigoConta).toBeNull();
        expect(resposta.deducoes[0]?.identificador).toBe("95");
    });

    it("reconhece a exclusão", () => {
        const resposta = mapExclusaoHistorico({
            status: "excluido",
            mensagem: "Instrumento excluído.",
            id: 5,
            municipio: "02002",
            exercicio: 2025
        });

        expect(resposta.status).toBe("excluido");
        expect(resposta.id).toBe(5);
    });

    it("rejeita valor em texto no lugar de reais", () => {
        const resposta = mapListaHistorico({
            status: "listado",
            municipios: [{ municipio: "02002", remessas: [{ id: 1, receitaLiquida: "54214600", exercicio: 2025 }] }]
        });

        expect(resposta.municipios[0]?.remessas[0]?.receitaLiquida).toBeNull();
    });
});
