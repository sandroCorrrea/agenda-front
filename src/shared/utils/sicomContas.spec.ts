import { describe, expect, it } from "vitest";
import type { SicomContaDicionario } from "@/domain/sicom/contas";
import { filtrarDicionario, partesCaminho, seloDesdobramento, textoSemVinculo } from "@/shared/utils/sicomContas";

function conta(parcial: Partial<SicomContaDicionario>): SicomContaDicionario {
    return {
        codigoInformado: null,
        codigoConta: null,
        desdobramento: null,
        rotuloDesdobramento: null,
        especificacao: null,
        descricao: null,
        status: null,
        caminho: null,
        classificacao: [],
        conta: {},
        ocorrencias: [],
        ...parcial
    };
}

describe("apresentação do ementário", () => {
    it("monta o selo só com o que veio no JSON", () => {
        expect(seloDesdobramento(conta({ desdobramento: "1", rotuloDesdobramento: "Principal" }))).toBe("1 · Principal");
        expect(seloDesdobramento(conta({ desdobramento: "1", rotuloDesdobramento: null }))).toBe("desdobramento 1");
        expect(seloDesdobramento(conta({ desdobramento: null, rotuloDesdobramento: null }))).toBeNull();
    });

    it("usa a classificação quando o caminho vem vazio", () => {
        expect(
            partesCaminho(
                conta({
                    caminho: "",
                    classificacao: [
                        { nivel: "Origem", codigo: "11000000", nome: "Impostos" },
                        { nivel: "Espécie", codigo: "11100000", nome: "Impostos" }
                    ]
                })
            )
        ).toEqual(["Impostos", "Impostos"]);
    });

    it("filtra por arquivo e por nome sem diferenciar maiúsculas", () => {
        const lista = [
            conta({
                especificacao: "Imposto sobre a Propriedade",
                ocorrencias: [{ arquivo: "REC.CSV", linha: 1, nomeNaRemessa: "Principal", valor: "1,00", registro: [], detalhes: [] }]
            }),
            conta({
                especificacao: "Outra conta",
                ocorrencias: [{ arquivo: "DSP.CSV", linha: 2, nomeNaRemessa: null, valor: null, registro: [], detalhes: [] }]
            })
        ];

        expect(filtrarDicionario(lista, "propriedade", "REC.CSV")).toHaveLength(1);
        expect(filtrarDicionario(lista, "principal", "DSP.CSV")).toHaveLength(0);
    });

    it("descreve a linha sem conta", () => {
        expect(
            textoSemVinculo({
                linha: 40,
                codigoInformado: "99999999",
                registro: ["10", "99999999", "Conta que não está na portaria", "10,00"]
            })
        ).toBe("Linha 40 · código 99999999 · sem conta neste ementário. Conta que não está na portaria");
    });
});
