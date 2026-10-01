import { describe, expect, it } from "vitest";
import { mapPesquisaDetalhe, mapResultado } from "@/infrastructure/repositories/politica/politicaMappers";
import { inferirEstrategia, resolverSessaoId } from "@/shared/utils/politicaSessao";

describe("sessão da pesquisa pública", () => {
    it("reaproveita a sessão guardada e só usa a sugestão da API quando ainda não há uma", () => {
        expect(inferirEstrategia("uuid-api", null)).toBe("sessao");
        expect(
            resolverSessaoId({
                armazenada: "uuid-local",
                sessaoSugerida: "uuid-api",
                estrategia: "sessao",
                gerar: () => "novo"
            })
        ).toBe("uuid-local");
        expect(
            resolverSessaoId({
                armazenada: null,
                sessaoSugerida: "uuid-api",
                estrategia: "sessao",
                gerar: () => "novo"
            })
        ).toBe("uuid-api");
    });

    it("trata token de acesso como estratégia própria e gera uuid se não houver sessão", () => {
        expect(inferirEstrategia(null, "abc")).toBe("token");
        expect(
            resolverSessaoId({
                armazenada: null,
                sessaoSugerida: null,
                estrategia: "token",
                gerar: () => "gerado"
            })
        ).toBe("gerado");
    });
});

describe("mapeamento da pesquisa", () => {
    it("separa municípios públicos em objetos e mantém o ibge", () => {
        const detalhe = mapPesquisaDetalhe({
            nome: "Intenção",
            tipo: "interna",
            status: "publicada",
            publica: true,
            municipios: [{ ibge: "3113404", nome: "Caratinga", uf: "MG" }],
            perguntas: [
                {
                    id: 1,
                    tipo: "escala",
                    titulo: "Nota",
                    obrigatoria: true,
                    ordem: 0,
                    escala: { min: 0, max: 10 },
                    opcoes: []
                }
            ],
            sessaoSugerida: "11111111-1111-4111-8111-111111111111"
        });

        expect(detalhe.municipios[0]?.nome).toBe("Caratinga");
        expect(detalhe.municipiosIbge).toEqual(["3113404"]);
        expect(detalhe.perguntas[0]?.escala).toEqual({ min: 0, max: 10 });
        expect(detalhe.id).toBeNull();
    });

    it("preserva total e percentual do resultado sem recalcular", () => {
        const resultado = mapResultado({
            aviso: "Estes números são o resultado da coleta.",
            pesquisa: { id: 4, nome: "Turno", tipo: "interna", status: "publicada", eleicao: "Municipal" },
            totalRespostas: 10,
            respostasConcluidas: 8,
            respostasIncompletas: 2,
            percentualConclusao: 80,
            perguntas: [
                {
                    id: 1,
                    titulo: "Voto",
                    tipo: "candidato",
                    opcoes: [{ opcaoId: 9, rotulo: "10 - Ana", candidatoId: 3, total: 5, percentual: 62.5 }]
                }
            ]
        });

        expect(resultado.aviso).toContain("coleta");
        expect(resultado.perguntas[0]?.opcoes[0]?.percentual).toBe(62.5);
        expect(resultado.perguntas[0]?.opcoes[0]?.total).toBe(5);
    });
});
