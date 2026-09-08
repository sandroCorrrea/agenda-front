import type { UsuarioAutenticadoDTO } from "@/application/dto/Auth/LoginPostResponseDTO";
import { PerfilAdministrador } from "@/domain/types/PerfilAdministrador";
import { TipoUsuario } from "@/domain/types/TipoUsuario";

export const PERFIL_ADMINISTRADOR_LABELS: Record<PerfilAdministrador, string> = {
    [PerfilAdministrador.CONTABILIDADE]: "Contabilidade",
    [PerfilAdministrador.PREFEITURA]: "Prefeitura"
};

export const ROTAS_ADMIN_PREFEITURA = new Set<string>([
    "AdministradorParticipacao",
    "AdministradorParticipacaoDetalhe",
    "AdministradorParticipacaoLink",
    "AdministradorPerfil"
]);

export function isAdministrador(user: UsuarioAutenticadoDTO | null | undefined): boolean {
    return user?.tipo_usuario === TipoUsuario.ADMINISTRADOR;
}

export function isContabilidade(user: UsuarioAutenticadoDTO | null | undefined): boolean {
    return (
        isAdministrador(user) &&
        user?.perfil_administrador === PerfilAdministrador.CONTABILIDADE
    );
}

export function isPrefeitura(user: UsuarioAutenticadoDTO | null | undefined): boolean {
    return (
        isAdministrador(user) &&
        user?.perfil_administrador === PerfilAdministrador.PREFEITURA
    );
}

export function canAccessPainelContabilidade(
    user: UsuarioAutenticadoDTO | null | undefined
): boolean {
    return isContabilidade(user);
}

export function canAccessParticipacaoAdmin(
    user: UsuarioAutenticadoDTO | null | undefined
): boolean {
    return isContabilidade(user) || isPrefeitura(user);
}

export function labelPerfilAdministrador(
    perfil: string | null | undefined
): string {
    if (!perfil) return "—";
    return (
        PERFIL_ADMINISTRADOR_LABELS[perfil as PerfilAdministrador] ?? perfil
    );
}

export function destinoAdminAposLogin(
    user: UsuarioAutenticadoDTO
): { name: string } {
    if (isPrefeitura(user)) {
        return { name: "AdministradorParticipacao" };
    }
    return { name: "AdministradorPainel" };
}

/** Destino pós-login priorizando o menu dinâmico da API. */
export function destinoAposMenu(
    destino: { rota_nome: string; path: string } | null | undefined,
    user: UsuarioAutenticadoDTO | null | undefined
): { name?: string; path?: string } {
    if (destino?.rota_nome) {
        return { name: destino.rota_nome };
    }
    if (destino?.path) {
        return { path: destino.path };
    }
    if (user?.tipo_usuario === TipoUsuario.CLIENTE) {
        return { name: "ClienteProtocolos" };
    }
    if (isContabilidade(user)) {
        return { name: "AdministradorPainel" };
    }
    return { name: "SemAcesso" };
}

export function sessaoAdminLegadaSemPerfil(
    user: UsuarioAutenticadoDTO | null | undefined
): boolean {
    return isAdministrador(user) && !user?.perfil_administrador;
}
