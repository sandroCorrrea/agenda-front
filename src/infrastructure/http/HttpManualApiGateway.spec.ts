import { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";
import { HttpManualApiGateway } from "@/infrastructure/http/HttpManualApiGateway";

const BASE = "http://127.0.0.1:8765";

function resposta(status: number, corpo: unknown): Response {
    return new Response(JSON.stringify(corpo), {
        status,
        headers: { "Content-Type": "application/json" }
    });
}

describe("HttpManualApiGateway", () => {
    it("envia o arquivo sem credencial, sem Authorization e sem Content-Type fixo", async () => {
        const buscar = vi.fn().mockResolvedValue(resposta(200, { status: "valido" }));
        const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(new AbortController().signal);
        const gateway = new HttpManualApiGateway(buscar, BASE);

        await gateway.post(
            "/api/remessas",
            [{ nome: "manual", arquivo: new File(["pdf"], "manual.pdf") }],
            [200]
        );

        const [url, init] = buscar.mock.calls[0] as [URL, RequestInit];
        expect(url.toString()).toBe("http://127.0.0.1:8765/api/remessas");
        expect(init.credentials).toBe("omit");
        expect(init.redirect).toBe("error");
        expect(init.headers).toEqual({ Accept: "application/json" });
        expect(init.body).toBeInstanceOf(FormData);
        expect((init.body as FormData).getAll("manual")).toHaveLength(1);
        expect(timeout).toHaveBeenCalledWith(90_000);
        timeout.mockRestore();
    });

    it("trata 401 como falha técnica e não repete o POST", async () => {
        const buscar = vi.fn().mockResolvedValue(resposta(401, { mensagem: "nao" }));
        const gateway = new HttpManualApiGateway(buscar, BASE);

        await expect(
            gateway.post("/api/remessas/historico", [{ nome: "remessa", arquivo: new File(["z"], "a.zip") }], [200])
        ).rejects.toBeInstanceOf(AxiosError);
        expect(buscar).toHaveBeenCalledTimes(1);
    });

    it("não chama rota fora do contrato", async () => {
        const buscar = vi.fn();
        const gateway = new HttpManualApiGateway(buscar, BASE);

        await expect(gateway.get("/api/saude", undefined, [200])).rejects.toBeInstanceOf(AxiosError);
        expect(buscar).not.toHaveBeenCalled();
    });

    it("registra pedido e resposta sem o corpo nem os arquivos", async () => {
        const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
        const buscar = vi.fn().mockResolvedValue(
            resposta(200, {
                status: "valido",
                mensagem: "Remessa válida.",
                totalErros: 0,
                erros: [{ mensagem: "nao registrar" }],
                resultados: [{ arquivo: "IDE.CSV" }]
            })
        );
        const gateway = new HttpManualApiGateway(buscar, BASE);

        await gateway.post(
            "/api/remessas",
            [
                { nome: "manual", arquivo: new File(["conteudo-pdf"], "2025_consolidado.pdf") },
                { nome: "remessa", arquivo: new File(["conteudo-zip"], "IP_02002_2025.zip") }
            ],
            [200, 400, 413, 422]
        );

        const linhas = info.mock.calls.map((chamada) => chamada[1] as Record<string, unknown>);
        expect(info.mock.calls.every((chamada) => chamada[0] === "[manual-api]")).toBe(true);
        expect(linhas.map((linha) => linha.evento)).toEqual(["pedido", "resposta"]);
        expect(linhas[0]).toMatchObject({
            url: "http://127.0.0.1:8765/api/remessas",
            caminho: "/api/remessas",
            arquivos: "manual=2025_consolidado.pdf:12;remessa=IP_02002_2025.zip:12"
        });
        expect(linhas[1]).toMatchObject({
            http: 200,
            aceito: true,
            status: "valido",
            totalErros: 0,
            mensagem: "Remessa válida."
        });
        expect(JSON.stringify(linhas)).not.toContain("conteudo-pdf");
        expect(JSON.stringify(linhas)).not.toContain("nao registrar");
        expect(JSON.stringify(linhas)).not.toContain("Authorization");
        info.mockRestore();
    });

    it("registra falha de rede e relança a falha técnica", async () => {
        const erro = vi.spyOn(console, "error").mockImplementation(() => undefined);
        const buscar = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
        const gateway = new HttpManualApiGateway(buscar, BASE);

        await expect(
            gateway.post("/api/remessas", [{ nome: "manual", arquivo: new File(["a"], "manual.pdf") }], [200])
        ).rejects.toBeInstanceOf(AxiosError);

        expect(erro).toHaveBeenCalledWith(
            "[manual-api]",
            expect.objectContaining({ evento: "falha-rede", nome: "TypeError", mensagem: "Failed to fetch" })
        );
        erro.mockRestore();
    });
});
