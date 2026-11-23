import type { ISicomRepository } from "@/domain/repositories/ISicomRepository";

export class ValidarRemessaSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(manual: File, remessa: File) {
        return this.repository.validarRemessa(manual, remessa);
    }
}

export class ConsultarEmentarioSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(remessa: File, ementario: File) {
        return this.repository.consultarEmentario(remessa, ementario);
    }
}

export class GerarRelatorioSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(remessa: File, ementario: File) {
        return this.repository.gerarRelatorio(remessa, ementario);
    }
}

export class GravarHistoricoSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(remessas: File[], ementario: File) {
        return this.repository.gravarHistorico(remessas, ementario);
    }
}

export class ListarHistoricoSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(municipio?: string) {
        return this.repository.listarHistorico(municipio);
    }
}

export class DetalharHistoricoSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(id: number) {
        return this.repository.detalharHistorico(id);
    }
}

export class ExcluirHistoricoSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(id: number) {
        return this.repository.excluirHistorico(id);
    }
}

export class PreverSicomUseCase {
    constructor(private repository: ISicomRepository) {}
    execute(municipio: string, horizonte: number) {
        return this.repository.prever(municipio, horizonte);
    }
}
