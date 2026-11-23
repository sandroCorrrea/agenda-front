import { describe, expect, it } from "vitest";
import { mapEnvioReceita, mapListaReceita } from "@/infrastructure/repositories/casp/receitaOrcamentariaMappers";

const arquivo = {
    id: 2,
    apelido: "Março",
    nomeOriginal: "receita-marco.xlsx",
    tamanhoBytes: 1681,
    quantidadeAbas: 2,
    quantidadeLinhas: 2,
    situacao: "processado",
    tratamento: {
        abas: [
            {
                nome: "Receita",
                linhas: 2,
                colunas: 3,
                primeiraLinha: ["Código", "", "Previsto"]
            },
            {
                nome: "Vazia",
                linhas: 0,
                colunas: 0,
                primeiraLinha: []
            }
        ]
    },
    criadoEm: "2026-11-16T18:03:26+00:00",
    downloadUrl: "/api/casp/receita-orcamentaria/2/download"
};

describe("mapeamento da receita orçamentária", () => {
    it("preserva a célula em branco e o apelido nulo", () => {
        const lista = mapListaReceita({
            arquivos: [{ ...arquivo, apelido: null }],
            total: 1,
            pagina: 1,
            porPagina: 20
        });

        expect(lista.total).toBe(1);
        expect(lista.arquivos[0]?.apelido).toBeNull();
        expect(lista.arquivos[0]?.tratamento.abas[0]?.primeiraLinha).toEqual(["Código", "", "Previsto"]);
        expect(lista.arquivos[0]?.tratamento.abas[1]).toMatchObject({ linhas: 0, primeiraLinha: [] });
    });

    it("lê o envio com a mensagem e as abas", () => {
        const envio = mapEnvioReceita({
            message: "Arquivo de receita orçamentária tratado e armazenado.",
            arquivo
        });

        expect(envio.message).toBe("Arquivo de receita orçamentária tratado e armazenado.");
        expect(envio.arquivo).toMatchObject({
            id: 2,
            apelido: "Março",
            nomeOriginal: "receita-marco.xlsx",
            tamanhoBytes: 1681,
            quantidadeAbas: 2,
            quantidadeLinhas: 2,
            situacao: "processado",
            downloadUrl: "/api/casp/receita-orcamentaria/2/download"
        });
    });

    it("devolve lista vazia quando a API não traz arquivos", () => {
        expect(mapListaReceita({ arquivos: [], total: 0, pagina: 1, porPagina: 20 })).toEqual({
            arquivos: [],
            total: 0,
            pagina: 1,
            porPagina: 20
        });
    });
});
