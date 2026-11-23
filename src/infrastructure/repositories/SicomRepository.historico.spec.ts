import { describe, expect, it, vi } from "vitest";
import type { ManualApiGateway } from "@/infrastructure/http/HttpManualApiGateway";
import { SicomRepository } from "@/infrastructure/repositories/SicomRepository";

describe("SicomRepository histórico", () => {
    it("envia cada ZIP no campo remessa e o XLSX uma vez em ementario", async () => {
        const post = vi.fn().mockResolvedValue({
            status: "salvo",
            mensagem: "5 instrumentos gravados.",
            total: 5,
            remessas: []
        });
        const http: ManualApiGateway = { post, get: vi.fn(), delete: vi.fn() };
        const repo = new SicomRepository(http);
        const zips = [0, 1, 2, 3, 4].map((indice) => new File(["a"], `IP_${indice}.zip`, { type: "application/zip" }));
        const planilha = new File(["b"], "ementario.xlsx");

        await repo.gravarHistorico(zips, planilha);

        const campos = post.mock.calls[0]?.[1] as { nome: string; arquivo: File }[];
        expect(post.mock.calls[0]?.[0]).toBe("/api/remessas/historico");
        expect(campos.filter((campo) => campo.nome === "remessa")).toHaveLength(5);
        expect(campos.filter((campo) => campo.nome === "ementario")).toHaveLength(1);
        expect(campos.find((campo) => campo.nome === "ementario")?.arquivo.name).toBe("ementario.xlsx");
    });
});
