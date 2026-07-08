export interface PerfilAdministradorOpcaoDTO {
    value: string;
    label: string;
}

export class PerfisAdministradorResponseDTO {
    constructor(public perfis: PerfilAdministradorOpcaoDTO[]) {}
}
