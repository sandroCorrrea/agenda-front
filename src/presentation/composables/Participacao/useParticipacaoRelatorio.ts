import { ParticipacaoRelatorioRequestDTO } from "@/application/dto/Participacao/ParticipacaoRelatorioRequestDTO";
import { GerarRelatorioParticipacaoPdfUseCase } from "@/application/use-cases/Participacao/GerarRelatorioParticipacaoPdfUseCase";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import { dispararDownloadBlob } from "@/shared/utils/downloadBlob";
import { inject, ref, type Ref } from "vue";

export function useParticipacaoRelatorio() {
    const repo = inject<IParticipacaoRepository | null>("IParticipacaoRepository", null);
    if (!repo) throw new Error("IParticipacaoRepository not found");

    const caso = new GerarRelatorioParticipacaoPdfUseCase(repo);

    const gerandoRelatorio = ref(false);
    const erroRelatorio = ref<string | null>(null);
    const sucessoRelatorio = ref<string | null>(null);
    const municipiosRelatorio = ref<string[]>([]);

    async function gerarRelatorio(
        ehPrefeitura: boolean,
        codigosPermitidos?: readonly string[]
    ) {
        if (gerandoRelatorio.value) return;

        erroRelatorio.value = null;
        sucessoRelatorio.value = null;

        const dto = ehPrefeitura
            ? new ParticipacaoRelatorioRequestDTO()
            : dtoContabilidade(municipiosRelatorio, codigosPermitidos);

        if (!ehPrefeitura && (!dto.municipios || dto.municipios.length === 0)) {
            erroRelatorio.value = "Selecione ao menos um município para gerar o relatório.";
            return;
        }

        gerandoRelatorio.value = true;
        try {
            const { blob, filename } = await caso.execute(dto);
            dispararDownloadBlob(blob, filename);
            sucessoRelatorio.value = "Relatório gerado com sucesso.";
        } catch (e: unknown) {
            erroRelatorio.value =
                e instanceof Error ? e.message : "Não foi possível gerar o relatório.";
        } finally {
            gerandoRelatorio.value = false;
        }
    }

    return {
        gerandoRelatorio,
        erroRelatorio,
        sucessoRelatorio,
        municipiosRelatorio,
        gerarRelatorio
    };
}

function dtoContabilidade(
    municipiosRelatorio: Ref<string[]>,
    codigosPermitidos?: readonly string[]
): ParticipacaoRelatorioRequestDTO {
    const unicos = [
        ...new Set(municipiosRelatorio.value.map((codigo) => codigo.trim()).filter(Boolean))
    ];
    const permitidos = codigosPermitidos ? new Set(codigosPermitidos) : null;
    const municipios = permitidos
        ? unicos.filter((codigo) => permitidos.has(codigo))
        : unicos;
    return new ParticipacaoRelatorioRequestDTO(municipios);
}
