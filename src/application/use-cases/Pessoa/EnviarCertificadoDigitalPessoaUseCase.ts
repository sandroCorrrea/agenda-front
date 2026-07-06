import type { CertificadoDigitalPostResponseDTO } from "@/application/dto/EmpresaVinculo/CertificadoDigitalPostResponseDTO";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";

export class EnviarCertificadoDigitalPessoaUseCase {
    constructor(private repository: IPessoaRepository) {}

    execute(
        pessoaId: number,
        certificado: File,
        senhaCertificado: string
    ): Promise<CertificadoDigitalPostResponseDTO> {
        return this.repository.enviarCertificadoDigital(
            pessoaId,
            certificado,
            senhaCertificado
        );
    }
}
