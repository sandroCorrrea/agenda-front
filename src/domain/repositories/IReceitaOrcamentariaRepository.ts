import type {
    ReceitaOrcamentariaConsulta,
    ReceitaOrcamentariaDownload,
    ReceitaOrcamentariaEnvio,
    ReceitaOrcamentariaLista
} from "@/domain/casp/receitaOrcamentaria";

export interface IReceitaOrcamentariaRepository {
    listar(consulta: ReceitaOrcamentariaConsulta): Promise<ReceitaOrcamentariaLista>;
    enviar(
        arquivo: File,
        apelido?: string,
        aoProgresso?: (percentual: number) => void
    ): Promise<ReceitaOrcamentariaEnvio>;
    baixar(id: number, nomeOriginal: string): Promise<ReceitaOrcamentariaDownload>;
}
