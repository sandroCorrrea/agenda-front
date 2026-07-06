import type { EmpresaListagemDTO } from "@/domain/repositories/IMatrizRepository";

export type VerificarEmpresaLocalResult = {
    existeLocalmente: boolean;
    empresa: EmpresaListagemDTO | null;
    empresaId: number | null;
};
