import type {
    ClienteOpcaoVinculoAdminDTO,
    CriarVinculoAdminRequestDTO,
    EmpresaOpcaoVinculoAdminDTO,
    EmpresaVinculoListagemResponseDTO,
    EmpresaVinculoPostResponseDTO,
    EmpresaVinculoStatusUpdateResponseDTO,
    ListarVinculosAdminParams
} from "@/application/dto/EmpresaVinculo/EmpresaVinculoResumoDTO";
import type { CertificadoDigitalPostResponseDTO } from "@/application/dto/EmpresaVinculo/CertificadoDigitalPostResponseDTO";

export interface IEmpresaVinculoRepository {
    listarVinculosCliente(page: number): Promise<EmpresaVinculoListagemResponseDTO>;
    solicitarVinculo(empresaId: number): Promise<EmpresaVinculoPostResponseDTO>;
    listarVinculosAdmin(
        params: ListarVinculosAdminParams
    ): Promise<EmpresaVinculoListagemResponseDTO>;
    listarClientesOpcoesAdmin(): Promise<ClienteOpcaoVinculoAdminDTO[]>;
    listarEmpresasOpcoesAdmin(): Promise<EmpresaOpcaoVinculoAdminDTO[]>;
    criarVinculoAdmin(
        payload: CriarVinculoAdminRequestDTO
    ): Promise<EmpresaVinculoPostResponseDTO>;
    aprovarVinculo(vinculoId: number): Promise<EmpresaVinculoStatusUpdateResponseDTO>;
    rejeitarVinculo(
        vinculoId: number,
        justificativa: string
    ): Promise<EmpresaVinculoStatusUpdateResponseDTO>;
    enviarCertificadoDigital(
        vinculoId: number,
        certificado: File,
        senhaCertificado: string
    ): Promise<CertificadoDigitalPostResponseDTO>;
}
