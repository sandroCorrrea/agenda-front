import { describe, expect, it } from "vitest";
import type { SicomValidacaoOcorrencia } from "@/domain/sicom/validacao";
import {
    agruparErros,
    filtrarErros,
    ordenarErros,
    podeSeguirValidacao,
    textoIntervalo
} from "@/shared/utils/sicomValidacao";

function erro(parcial: Partial<SicomValidacaoOcorrencia>): SicomValidacaoOcorrencia {
    return {
        severity: "erro",
        arquivo: null,
        linha: null,
        coluna: null,
        campo: null,
        valor: null,
        mensagem: null,
        ...parcial
    };
}

describe("organização da validação SICOM", () => {
    it("ordena pela ordem dos resultados e deixa linha nula no topo do arquivo", () => {
        const lista = ordenarErros(
            [
                erro({ arquivo: "ORGAO.CSV", linha: 2, mensagem: "b" }),
                erro({ arquivo: "IDE.CSV", linha: 4, mensagem: "c" }),
                erro({ arquivo: "IDE.CSV", linha: null, mensagem: "a" }),
                erro({ arquivo: "DSP.CSV", linha: 1, mensagem: "d" })
            ],
            ["IDE.CSV", "ORGAO.CSV"]
        );

        expect(lista.map((item) => `${item.arquivo}:${item.linha ?? "null"}`)).toEqual([
            "IDE.CSV:null",
            "IDE.CSV:4",
            "ORGAO.CSV:2",
            "DSP.CSV:1"
        ]);
    });

    it("filtra sem diferenciar maiúsculas", () => {
        const lista = [
            erro({
                arquivo: "ORGAO.CSV",
                campo: "tipoOrgao",
                valor: "99",
                mensagem: "valor '99' não está entre os permitidos: 01, 02, 03, 04, 05, 08, 09"
            })
        ];

        expect(filtrarErros(lista, "PERMITIDOS", null)).toHaveLength(1);
        expect(filtrarErros(lista, "codmunicipio", "ORGAO.CSV")).toHaveLength(0);
    });

    it("agrupa a mesma mensagem no mesmo arquivo e lista as linhas", () => {
        const grupos = agruparErros([
            erro({ arquivo: "DSP.CSV", linha: 1, mensagem: "foram encontrados 11 campos" }),
            erro({ arquivo: "DSP.CSV", linha: 3, mensagem: "foram encontrados 11 campos" }),
            erro({ arquivo: "DSP.CSV", linha: 5, mensagem: "outro" })
        ]);

        expect(grupos).toHaveLength(2);
        expect(grupos[0]).toMatchObject({ quantidade: 2, linhas: [1, 3] });
    });

    it("libera seguir só com remessa válida e sem erros", () => {
        expect(podeSeguirValidacao({ status: "valido", erros: [] })).toBe(true);
        expect(podeSeguirValidacao({ status: "valido", erros: [erro({ mensagem: "falha" })] })).toBe(false);
        expect(podeSeguirValidacao({ status: "invalido", erros: [] })).toBe(false);
    });

    it("descreve a página de 20 em 412 erros", () => {
        expect(textoIntervalo(1, 412)).toBe("Mostrando 1–20 de 412");
        expect(textoIntervalo(21, 412)).toBe("Mostrando 401–412 de 412");
    });
});
