import { ParticipacaoRelatorioRequestDTO } from "@/application/dto/Participacao/ParticipacaoRelatorioRequestDTO";
import type { ParticipacaoRelatorioPdfDTO } from "@/application/dto/Participacao/ParticipacaoRelatorioPdfDTO";
import { useParticipacaoRelatorio } from "@/presentation/composables/Participacao/useParticipacaoRelatorio";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import { ParticipacaoRelatorioErro } from "@/shared/errors/ParticipacaoRelatorioErro";
import { dispararDownloadBlob } from "@/shared/utils/downloadBlob";
import { createApp } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/utils/downloadBlob", () => ({
    dispararDownloadBlob: vi.fn()
}));

function montar(repo: Pick<IParticipacaoRepository, "gerarRelatorioPdf">) {
    const app = createApp({ render: () => null });
    app.provide("IParticipacaoRepository", repo);
    return app.runWithContext(() => useParticipacaoRelatorio());
}

describe("useParticipacaoRelatorio", () => {
    beforeEach(() => {
        vi.mocked(dispararDownloadBlob).mockReset();
    });

    it("não chama a API quando a contabilidade não seleciona município", async () => {
        const gerarRelatorioPdf = vi.fn();
        const api = montar({ gerarRelatorioPdf });

        await api.gerarRelatorio(false);

        expect(gerarRelatorioPdf).not.toHaveBeenCalled();
        expect(api.erroRelatorio.value).toBe(
            "Selecione ao menos um município para gerar o relatório."
        );
        expect(api.gerandoRelatorio.value).toBe(false);
    });

    it("baixa o PDF e confirma o sucesso", async () => {
        const blob = new Blob(["%PDF"], { type: "application/pdf" });
        const gerarRelatorioPdf = vi.fn(
            async (_dto: ParticipacaoRelatorioRequestDTO): Promise<ParticipacaoRelatorioPdfDTO> => ({
                blob,
                filename: "relatorio-participacao-popular-caratinga-3113404.pdf"
            })
        );
        const api = montar({ gerarRelatorioPdf });
        api.municipiosRelatorio.value = ["3113404", "3113404", "3170578"];

        await api.gerarRelatorio(false, ["3113404", "3170578"]);

        expect(gerarRelatorioPdf).toHaveBeenCalledTimes(1);
        const dto = gerarRelatorioPdf.mock.calls[0]?.[0];
        expect(dto).toBeInstanceOf(ParticipacaoRelatorioRequestDTO);
        expect(dto?.municipios).toEqual(["3113404", "3170578"]);
        expect(dispararDownloadBlob).toHaveBeenCalledWith(
            blob,
            "relatorio-participacao-popular-caratinga-3113404.pdf"
        );
        expect(api.sucessoRelatorio.value).toBe("Relatório gerado com sucesso.");
        expect(api.erroRelatorio.value).toBeNull();
        expect(api.gerandoRelatorio.value).toBe(false);
    });

    it("prefeitura envia o DTO sem municípios mesmo com seleção local", async () => {
        const gerarRelatorioPdf = vi.fn(
            async (_dto: ParticipacaoRelatorioRequestDTO): Promise<ParticipacaoRelatorioPdfDTO> => ({
                blob: new Blob(["%PDF"]),
                filename: "relatorio.pdf"
            })
        );
        const api = montar({ gerarRelatorioPdf });
        api.municipiosRelatorio.value = ["3113404"];

        await api.gerarRelatorio(true, ["3113404"]);

        expect(gerarRelatorioPdf.mock.calls[0]?.[0]?.municipios).toBeUndefined();
    });

    it("ignora códigos que não vieram da lista da API", async () => {
        const gerarRelatorioPdf = vi.fn(
            async (_dto: ParticipacaoRelatorioRequestDTO): Promise<ParticipacaoRelatorioPdfDTO> => ({
                blob: new Blob(["%PDF"]),
                filename: "relatorio.pdf"
            })
        );
        const api = montar({ gerarRelatorioPdf });
        api.municipiosRelatorio.value = ["3113404", "9999999"];

        await api.gerarRelatorio(false, ["3113404"]);

        expect(gerarRelatorioPdf.mock.calls[0]?.[0]?.municipios).toEqual(["3113404"]);
    });

    it("exibe a mensagem do erro 422 lida do Blob", async () => {
        const gerarRelatorioPdf = vi.fn(async () => {
            throw new ParticipacaoRelatorioErro(422, "O município informado não está cadastrado.", {
                "municipios.0": ["O município informado não está cadastrado."]
            });
        });
        const api = montar({ gerarRelatorioPdf });
        api.municipiosRelatorio.value = ["3113404"];

        await api.gerarRelatorio(false);

        expect(dispararDownloadBlob).not.toHaveBeenCalled();
        expect(api.erroRelatorio.value).toBe("O município informado não está cadastrado.");
        expect(api.sucessoRelatorio.value).toBeNull();
        expect(api.gerandoRelatorio.value).toBe(false);
    });

    it("ignora o segundo clique enquanto a geração está em andamento", async () => {
        let liberar: (valor: ParticipacaoRelatorioPdfDTO) => void = () => undefined;
        const pendente = new Promise<ParticipacaoRelatorioPdfDTO>((resolve) => {
            liberar = resolve;
        });
        const gerarRelatorioPdf = vi.fn(() => pendente);
        const api = montar({ gerarRelatorioPdf });
        api.municipiosRelatorio.value = ["3113404"];

        const primeira = api.gerarRelatorio(false);
        const segunda = api.gerarRelatorio(false);

        expect(gerarRelatorioPdf).toHaveBeenCalledTimes(1);
        expect(api.gerandoRelatorio.value).toBe(true);

        liberar({ blob: new Blob(["%PDF"]), filename: "relatorio.pdf" });
        await Promise.all([primeira, segunda]);

        expect(gerarRelatorioPdf).toHaveBeenCalledTimes(1);
        expect(api.gerandoRelatorio.value).toBe(false);
        expect(api.sucessoRelatorio.value).toBe("Relatório gerado com sucesso.");
    });
});
