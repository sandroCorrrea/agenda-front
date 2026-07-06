import type { CertificadoDigitalPostResponseDTO } from "@/application/dto/EmpresaVinculo/CertificadoDigitalPostResponseDTO";
import type { IEmpresaVinculoRepository } from "@/domain/repositories/IEmpresaVinculoRepository";

export class EnviarCertificadoDigitalVinculoUseCase {
    constructor(private repository: IEmpresaVinculoRepository) {}

    execute(
        vinculoId: number,
        certificado: File,
        senhaCertificado: string
    ): Promise<CertificadoDigitalPostResponseDTO> {
        return this.repository.enviarCertificadoDigital(
            vinculoId,
            certificado,
            senhaCertificado
        );
    }
}
