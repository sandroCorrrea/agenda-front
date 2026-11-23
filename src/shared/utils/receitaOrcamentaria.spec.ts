import { describe, expect, it } from "vitest";
import {
    apelidoNormalizado,
    celulaPrevia,
    erroDeEnvio,
    formatarEnviadoEm,
    formatarTamanhoArquivo,
    mensagemArquivoCliente,
    mensagemListaVazia,
    rotuloApelido,
    rotuloSituacao,
    textoBusca
} from "@/shared/utils/receitaOrcamentaria";

describe("rótulos da receita orçamentária", () => {
    it("mostra o tamanho em KB até 1 MB e em MB a partir disso", () => {
        expect(formatarTamanhoArquivo(1681)).toBe("1,6 KB");
        expect(formatarTamanhoArquivo(1024 * 1024 - 1)).toMatch(/ KB$/);
        expect(formatarTamanhoArquivo(1024 * 1024)).toBe("1,0 MB");
        expect(formatarTamanhoArquivo(20 * 1024 * 1024)).toBe("20,0 MB");
    });

    it("traduz apelido vazio e a situação conhecida", () => {
        expect(rotuloApelido(null)).toBe("Sem apelido");
        expect(rotuloApelido("  ")).toBe("Sem apelido");
        expect(rotuloApelido("Março")).toBe("Março");
        expect(rotuloSituacao("processado")).toBe("Processado");
    });

    it("troca célula em branco por traço e escolhe o estado vazio da lista", () => {
        expect(celulaPrevia("")).toBe("—");
        expect(celulaPrevia("Código")).toBe("Código");
        expect(mensagemListaVazia("")).toBe("Nenhuma receita orçamentária enviada.");
        expect(mensagemListaVazia("Março")).toBe("Nenhum arquivo encontrado para esta busca.");
    });

    it("recusa extensão e tamanho no cliente e ignora apelido em branco", () => {
        expect(mensagemArquivoCliente(null)).toBe("Envie o arquivo da receita orçamentária.");
        expect(mensagemArquivoCliente(new File(["a"], "receita.csv"))).toBe("O arquivo deve ser do tipo .xlsx.");
        const grande = new File(["a"], "receita.xlsx");
        Object.defineProperty(grande, "size", { value: 20 * 1024 * 1024 + 1 });
        expect(mensagemArquivoCliente(grande)).toBe("O arquivo deve ter no máximo 20 MB.");
        expect(mensagemArquivoCliente(new File(["a"], "receita.xlsx"))).toBeNull();
        expect(apelidoNormalizado("   ")).toEqual({});
        expect(apelidoNormalizado(" Março ")).toEqual({ apelido: "Março" });
        expect(apelidoNormalizado("a".repeat(121)).erro).toBe("O apelido deve ter no máximo 120 caracteres.");
    });

    it("limita a busca e formata a data no fuso local", () => {
        expect(textoBusca("  Março  ")).toBe("Março");
        expect(textoBusca("a".repeat(180))).toHaveLength(160);
        expect(textoBusca("   ")).toBeUndefined();
        const iso = "2026-11-16T18:03:26+00:00";
        expect(formatarEnviadoEm(iso)).toBe(
            new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }).format(new Date(iso))
        );
        expect(formatarEnviadoEm("sem-data")).toBe("—");
    });

    it("separa erro de campo, erro geral e arquivo grande demais", () => {
        expect(
            erroDeEnvio({
                status: 422,
                mensagem: "Dados inválidos",
                campos: { arquivo: "O arquivo deve ser do tipo .xlsx." }
            })
        ).toEqual({
            erroEnvio: null,
            campos: { arquivo: "O arquivo deve ser do tipo .xlsx." }
        });
        expect(
            erroDeEnvio({
                status: 422,
                mensagem: "A planilha não possui linhas de dados.",
                campos: {}
            }).erroEnvio
        ).toBe("A planilha não possui linhas de dados.");
        expect(erroDeEnvio({ status: 413, mensagem: "post_max_size", campos: {} }).erroEnvio).toBe(
            "O arquivo é grande demais. O limite desta tela é 20 MB."
        );
    });
});
