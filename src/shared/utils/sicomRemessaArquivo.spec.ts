import { describe, expect, it } from "vitest";
import { lerArquivoRemessa } from "@/shared/utils/sicomRemessaArquivo";

describe("lerArquivoRemessa", () => {
    it("lê instrumento, código e ano de um ZIP IP", () => {
        expect(lerArquivoRemessa("IP_02002_2023.zip")).toEqual({
            tipo: "Instrumento de Planejamento",
            codigoMunicipio: "02002",
            ano: 2023
        });
    });

    it("ignora maiúsculas e caminho", () => {
        expect(lerArquivoRemessa("pasta/ip_02002_2024.ZIP")?.ano).toBe(2024);
    });

    it("não inventa tipo para outro prefixo", () => {
        expect(lerArquivoRemessa("REC_02002_2023.zip")).toBeNull();
        expect(lerArquivoRemessa(null)).toBeNull();
    });
});
