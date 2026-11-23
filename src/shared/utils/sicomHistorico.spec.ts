import { describe, expect, it } from "vitest";
import { formatarGravadoEm, formatarVariacao, frasesGravacao, validarSelecaoHistorico } from "@/shared/utils/sicomHistorico";

describe("sicomHistorico", () => {
    it("mostra a data gravada sem converter fuso", () => {
        expect(formatarGravadoEm("2026-11-17 15:58:57")).toBe("17/11/2026 15:58");
    });

    it("mostra a variação como percentual já calculado", () => {
        expect(formatarVariacao(109.67)).toBe("+109,67%");
        expect(formatarVariacao(null)).toBe("—");
    });

    it("separa o aviso de substituição da faixa de exercício novo", () => {
        const frases = frasesGravacao("2 instrumentos gravados.", [
            { id: 1, municipio: "02002", exercicio: 2024, arquivo: "a.zip", substituido: false, receitaLiquida: 1, despesaFixada: 1, resultado: 0, contas: 1 },
            { id: 2, municipio: "02002", exercicio: 2025, arquivo: "b.zip", substituido: true, receitaLiquida: 1, despesaFixada: 1, resultado: 0, contas: 1 }
        ]);

        expect(frases.amarelas).toEqual(["O exercício 2025 do município 02002 foi atualizado."]);
        expect(frases.verdes).toEqual(["Exercício 2024 gravado."]);
    });

    it("recusa arquivo que não é ZIP e arquivo acima de 40 MB", () => {
        const pdf = new File(["a"], "notas.pdf");
        expect(validarSelecaoHistorico([pdf], "ementario.xlsx")).toBe("notas.pdf não é um ZIP.");
        const grande = new File(["a"], "IP_02002_2020.zip");
        Object.defineProperty(grande, "size", { value: 40 * 1024 * 1024 + 1 });
        expect(validarSelecaoHistorico([grande], "ementario.xlsx")).toBe("IP_02002_2020.zip passa de 40 MB.");
    });
});
