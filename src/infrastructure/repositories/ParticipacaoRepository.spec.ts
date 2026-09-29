import { ParticipacaoRelatorioRequestDTO } from "@/application/dto/Participacao/ParticipacaoRelatorioRequestDTO";
import { ParticipacaoRepository } from "@/infrastructure/repositories/ParticipacaoRepository";
import { ParticipacaoRelatorioErro } from "@/shared/errors/ParticipacaoRelatorioErro";
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it, vi } from "vitest";

function repositorioComPost(post: ReturnType<typeof vi.fn>) {
    return new ParticipacaoRepository({ post } as unknown as AxiosInstance);
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

describe("ParticipacaoRepository.gerarRelatorioPdf", () => {
    it("envia municípios da contabilidade e lê o nome do Content-Disposition", async () => {
        const post = vi.fn().mockResolvedValue({
            data: new Blob(["%PDF"], { type: "application/pdf" }),
            headers: {
                "content-type": "application/pdf",
                "content-disposition":
                    'attachment; filename="relatorio-participacao-popular-caratinga-3113404-2026-09-29_194925.pdf"'
            }
        });
        const repo = repositorioComPost(post);

        const resultado = await repo.gerarRelatorioPdf(
            new ParticipacaoRelatorioRequestDTO(["3113404"])
        );

        expect(post).toHaveBeenCalledWith(
            "/participacao/relatorio",
            { municipios: ["3113404"] },
            expect.objectContaining({
                responseType: "blob",
                headers: { Accept: "application/pdf, application/json" }
            })
        );
        expect(resultado.filename).toBe(
            "relatorio-participacao-popular-caratinga-3113404-2026-09-29_194925.pdf"
        );
        expect(resultado.blob).toBeInstanceOf(Blob);
    });

    it("envia corpo vazio quando não há municípios", async () => {
        const post = vi.fn().mockResolvedValue({
            data: new Blob(["%PDF"], { type: "application/pdf" }),
            headers: { "content-type": "application/pdf" }
        });
        const repo = repositorioComPost(post);

        const resultado = await repo.gerarRelatorioPdf(new ParticipacaoRelatorioRequestDTO());

        expect(post).toHaveBeenCalledWith(
            "/participacao/relatorio",
            {},
            expect.anything()
        );
        expect(resultado.filename).toBe("relatorio-participacao-popular.pdf");
    });

    it("lê a primeira mensagem de errors de um Blob 422", async () => {
        const post = vi.fn().mockRejectedValue(
            erroAxios(
                422,
                blobJson({
                    message: "Dados inválidos",
                    errors: {
                        "municipios.0": ["O município informado não está cadastrado."]
                    }
                })
            )
        );
        const repo = repositorioComPost(post);

        await expect(
            repo.gerarRelatorioPdf(new ParticipacaoRelatorioRequestDTO(["0000000"]))
        ).rejects.toMatchObject({
            status: 422,
            message: "O município informado não está cadastrado.",
            errors: {
                "municipios.0": ["O município informado não está cadastrado."]
            }
        });
        await expect(
            repo.gerarRelatorioPdf(new ParticipacaoRelatorioRequestDTO(["0000000"]))
        ).rejects.toBeInstanceOf(ParticipacaoRelatorioErro);
    });

    it("usa a mensagem de negócio 422 quando o Blob não traz errors", async () => {
        const post = vi.fn().mockRejectedValue(
            erroAxios(422, blobJson({ message: "Selecione ao menos um município para gerar o relatório." }))
        );
        const repo = repositorioComPost(post);

        await expect(repo.gerarRelatorioPdf(new ParticipacaoRelatorioRequestDTO())).rejects.toMatchObject({
            status: 422,
            message: "Selecione ao menos um município para gerar o relatório."
        });
    });

    it("usa a mensagem padrão de 429 quando o corpo não é JSON", async () => {
        const post = vi.fn().mockRejectedValue(erroAxios(429, new Blob(["limite"], { type: "text/plain" })));
        const repo = repositorioComPost(post);

        await expect(repo.gerarRelatorioPdf(new ParticipacaoRelatorioRequestDTO(["3113404"]))).rejects.toMatchObject({
            status: 429,
            message: "Muitas solicitações. Aguarde um minuto e tente novamente."
        });
    });

    it("mapeia falha de rede para a mensagem genérica", async () => {
        const post = vi.fn().mockRejectedValue(new axios.AxiosError("Network Error"));
        const repo = repositorioComPost(post);

        await expect(repo.gerarRelatorioPdf(new ParticipacaoRelatorioRequestDTO())).rejects.toMatchObject({
            message: "Não foi possível gerar o relatório."
        });
    });
});
