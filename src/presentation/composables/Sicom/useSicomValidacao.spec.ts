import { effectScope } from "vue";
import { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const validarRemessa = vi.hoisted(() => vi.fn());

vi.mock("@/presentation/composables/Sicom/useSicomRepository", () => ({
    useSicomRepository: () => ({ validarRemessa })
}));

import { useSicomValidacao } from "@/presentation/composables/Sicom/useSicomValidacao";

function arquivos() {
    return [new File(["a"], "manual.pdf"), new File(["b"], "remessa.zip")] as const;
}

describe("useSicomValidacao", () => {
    beforeEach(() => {
        validarRemessa.mockReset();
    });

    it("mantém a frase genérica e registra a exceção", async () => {
        validarRemessa.mockRejectedValue(new AxiosError("falha"));
        const erro = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const escopo = effectScope();
        const tela = escopo.run(() => useSicomValidacao());
        if (!tela) throw new Error("composable");

        await tela.validar(...arquivos());

        expect(tela.falhaTecnica.value).toBe("Não foi possível validar a remessa.");
        expect(erro).toHaveBeenCalledWith(
            "[manual-api]",
            expect.objectContaining({ evento: "tela", motivo: "excecao", mensagem: "falha" })
        );
        erro.mockRestore();
        escopo.stop();
    });

    it("registra status ausente quando o JSON não traz status", async () => {
        validarRemessa.mockResolvedValue({ status: null, mensagem: "corpo sem status" });
        const erro = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const escopo = effectScope();
        const tela = escopo.run(() => useSicomValidacao());
        if (!tela) throw new Error("composable");

        await tela.validar(...arquivos());

        expect(tela.falhaTecnica.value).toBe("Não foi possível validar a remessa.");
        expect(erro).toHaveBeenCalledWith(
            "[manual-api]",
            expect.objectContaining({ evento: "tela", motivo: "status-ausente", mensagem: "corpo sem status" })
        );
        erro.mockRestore();
        escopo.stop();
    });
});
