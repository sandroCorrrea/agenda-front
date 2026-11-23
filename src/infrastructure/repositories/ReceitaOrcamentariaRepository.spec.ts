import { ReceitaOrcamentariaRepository } from "@/infrastructure/repositories/ReceitaOrcamentariaRepository";
import { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";

function repositorio(metodos: Partial<AxiosInstance>) {
    return new ReceitaOrcamentariaRepository(metodos as AxiosInstance);
}

function blobJson(payload: unknown): Blob {
    return new Blob([JSON.stringify(payload)], { type: "application/json" });
}

function erroAxios(status: number, data: unknown): AxiosError {
    const error = new AxiosError("Request failed");
    error.response = {
        status,
        data,
        statusText: "",
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig
    };
    return error;
}

describe("ReceitaOrcamentariaRepository", () => {
    it("lista com a busca e omite q vazio", async () => {
        const get = vi.fn().mockResolvedValue({
            data: { arquivos: [], total: 0, pagina: 1, porPagina: 20 }
        });
        const repo = repositorio({ get });

        await repo.listar({ q: " Março ", page: 1, per_page: 20 });
        await repo.listar({ q: "   ", page: 2, per_page: 20 });

        expect(get).toHaveBeenNthCalledWith(1, "/casp/receita-orcamentaria", {
            params: { q: "Março", page: 1, per_page: 20 }
        });
        expect(get).toHaveBeenNthCalledWith(2, "/casp/receita-orcamentaria", {
            params: { q: undefined, page: 2, per_page: 20 }
        });
    });

    it("envia o xlsx sem Content-Type e sem apelido em branco", async () => {
        const post = vi.fn().mockResolvedValue({
            data: {
                message: "Arquivo de receita orçamentária tratado e armazenado.",
                arquivo: { id: 2, apelido: null, situacao: "processado", tratamento: { abas: [] } }
            }
        });
        const repo = repositorio({ post });
        const arquivo = new File(["abc"], "receita-marco.xlsx");
        const progresso: number[] = [];

        await repo.enviar(arquivo, "   ", (valor) => progresso.push(valor));

        const [url, corpo, config] = post.mock.calls[0] as [
            string,
            FormData,
            { headers?: unknown; onUploadProgress: (evento: { loaded: number; total?: number }) => void }
        ];
        expect(url).toBe("/casp/receita-orcamentaria");
        expect(corpo.get("arquivo")).toBeInstanceOf(Blob);
        expect(corpo.get("apelido")).toBeNull();
        expect(config.headers).toBeUndefined();
        config.onUploadProgress({ loaded: 1, total: 4 });
        config.onUploadProgress({ loaded: 1 });
        expect(progresso).toEqual([25]);
    });

    it("inclui o apelido aparado", async () => {
        const post = vi.fn().mockResolvedValue({
            data: { message: "ok", arquivo: { id: 1, tratamento: { abas: [] } } }
        });
        const repo = repositorio({ post });

        await repo.enviar(new File(["abc"], "receita.xlsx"), " Março ");

        const corpo = post.mock.calls[0]?.[1] as FormData | undefined;
        expect(corpo?.get("apelido")).toBe("Março");
    });

    it("baixa pelo id autenticado e lê o filename", async () => {
        const get = vi.fn().mockResolvedValue({
            data: new Blob(["xlsx"], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            }),
            headers: {
                "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "content-disposition": 'attachment; filename="receita-marco.xlsx"'
            }
        });
        const repo = repositorio({ get });

        const resultado = await repo.baixar(2, "reserva.xlsx");

        expect(get).toHaveBeenCalledWith("/casp/receita-orcamentaria/2/download", {
            responseType: "blob"
        });
        expect(resultado.filename).toBe("receita-marco.xlsx");
        expect(resultado.blob).toBeInstanceOf(Blob);
    });

    it("lê a message de um erro 404 devolvido como Blob", async () => {
        const get = vi.fn().mockRejectedValue(
            erroAxios(404, blobJson({ message: "Arquivo de receita orçamentária não encontrado." }))
        );
        const repo = repositorio({ get });

        await expect(repo.baixar(9, "reserva.xlsx")).rejects.toThrow(
            "Arquivo de receita orçamentária não encontrado."
        );
    });

    it("usa a mensagem padrão quando o blob de erro não é JSON", async () => {
        const get = vi.fn().mockRejectedValue(erroAxios(500, new Blob(["falha"], { type: "text/plain" })));
        const repo = repositorio({ get });

        await expect(repo.baixar(9, "reserva.xlsx")).rejects.toThrow("Não foi possível baixar o arquivo.");
    });
});
