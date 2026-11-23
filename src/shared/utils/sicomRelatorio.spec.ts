import { describe, expect, it } from "vitest";
import type { SicomRelatorioFonte } from "@/domain/sicom/relatorio";
import {
    classificacaoDespesa,
    complementoFonte,
    filtrarFontes,
    formatarReais,
    formatarReaisAbsoluto,
    rotuloDeducao,
    subtituloReceita,
    tituloFonte,
    tituloNatureza,
    tomRelatorio
} from "@/shared/utils/sicomRelatorio";

describe("apresentação do relatório", () => {
    it("formata reais sem dividir por cem e marca o sinal do resultado", () => {
        expect(formatarReais(54214600).replace(/\s/g, " ")).toBe("R$ 54.214.600,00");
        expect(formatarReais(120000).replace(/\s/g, " ")).toBe("R$ 120.000,00");
        expect(formatarReais(0).replace(/\s/g, " ")).toBe("R$ 0,00");
        expect(formatarReais(-500000, true)).toContain("500.000,00");
        expect(formatarReais(-500000, true)).toContain("-");
        expect(formatarReais(1200, true).startsWith("+")).toBe(true);
        expect(formatarReaisAbsoluto(-3800000).replace(/\s/g, " ")).toBe("R$ 3.800.000,00");
    });

    it("escolhe a faixa pelo total e pela fonte descoberta", () => {
        expect(tomRelatorio({ situacao: "equilibrado", fontesDesequilibradas: 0 })).toBe("ok");
        expect(tomRelatorio({ situacao: "equilibrado", fontesDesequilibradas: 1 })).toBe("aviso");
        expect(tomRelatorio({ situacao: "deficit", fontesDesequilibradas: 0 })).toBe("erro");
        expect(tomRelatorio({ situacao: "superavit", fontesDesequilibradas: 0 })).toBe("superavit");
    });

    it("mostra o código quando o nome falta e não escreve detalhe nulo", () => {
        expect(tituloFonte({ nome: null, fonte: "1899000" })).toBe("1899000");
        expect(complementoFonte({ nome: null, fonte: "1899000", bloco: "Outras vinculações", detalhamento: null })).toBe(
            "Outras vinculações"
        );
        expect(complementoFonte({ nome: "Livre", fonte: "1500000", bloco: "Recursos não vinculados", detalhamento: "010" })).toBe(
            "1500000 · Recursos não vinculados · detalhe 010"
        );
        expect(tituloNatureza(null, "319011")).toBe("319011");
        expect(subtituloReceita({ nome: "IPTU", codigo: "11125001", codigoConta: "11125000" })).toBe("11125001 · conta 11125000");
    });

    it("mantém a ordem original da busca e o rótulo da dedução", () => {
        const fontes: SicomRelatorioFonte[] = [
            {
                fonte: "1600000",
                nome: "Convênios",
                grupo: null,
                especificacao: null,
                detalhamento: null,
                bloco: null,
                receitaBruta: null,
                deducoes: null,
                receitaLiquida: 1,
                despesaFixada: 2,
                resultado: -1,
                situacao: "deficit",
                receitas: [],
                despesas: []
            },
            {
                fonte: "1500000",
                nome: "Livre",
                grupo: null,
                especificacao: null,
                detalhamento: null,
                bloco: null,
                receitaBruta: null,
                deducoes: null,
                receitaLiquida: 1,
                despesaFixada: 1,
                resultado: 0,
                situacao: "equilibrado",
                receitas: [],
                despesas: []
            }
        ];

        expect(filtrarFontes(fontes, "livre").map((item) => item.fonte)).toEqual(["1500000"]);
        expect(filtrarFontes(fontes, "").map((item) => item.fonte)).toEqual(["1600000", "1500000"]);
        expect(classificacaoDespesa({
            categoria: "Despesas correntes",
            grupo: "Pessoal e encargos sociais",
            modalidade: "Aplicações diretas"
        })).toBe("Despesas correntes · Pessoal e encargos sociais · Aplicações diretas");
        expect(rotuloDeducao({ descricao: null, identificador: "95" })).toBe("Identificador 95");
        expect(rotuloDeducao({ descricao: "Dedução para a formação do FUNDEB", identificador: "95" })).toBe(
            "Dedução para a formação do FUNDEB"
        );
    });
});
