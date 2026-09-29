import { describe, expect, it } from "vitest";
import { nomeArquivoDoContentDisposition } from "./contentDispositionFilename";

describe("nomeArquivoDoContentDisposition", () => {
    it("usa o fallback quando o header está ausente", () => {
        expect(nomeArquivoDoContentDisposition(undefined, "relatorio-participacao-popular.pdf")).toBe(
            "relatorio-participacao-popular.pdf"
        );
    });

    it("lê filename entre aspas", () => {
        expect(
            nomeArquivoDoContentDisposition(
                'attachment; filename="relatorio-participacao-popular-caratinga-3113404-2026-09-29_194925.pdf"',
                "fallback.pdf"
            )
        ).toBe("relatorio-participacao-popular-caratinga-3113404-2026-09-29_194925.pdf");
    });

    it("prefere filename* UTF-8 e decodifica o valor", () => {
        expect(
            nomeArquivoDoContentDisposition(
                "attachment; filename=\"relatorio.pdf\"; filename*=UTF-8''relatorio-participacao-popular-2-municipios-2026-09-29_194925.pdf",
                "fallback.pdf"
            )
        ).toBe("relatorio-participacao-popular-2-municipios-2026-09-29_194925.pdf");
    });
});
