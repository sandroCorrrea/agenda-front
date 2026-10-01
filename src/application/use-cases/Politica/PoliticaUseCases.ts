import type {
    CandidatoSalvarDTO,
    CargoSalvarDTO,
    EleicaoSalvarDTO,
    PartidoSalvarDTO,
    PesquisaPerguntasSalvarDTO,
    PesquisaRespostaSalvarDTO,
    PesquisaSalvarDTO
} from "@/application/dto/Politica/PoliticaRequestDTO";
import type { IPoliticaRepository } from "@/domain/repositories/IPoliticaRepository";
import type { PoliticaListaQuery, ResultadoFiltro } from "@/domain/politica/tipos";

export class ObterPesquisaPublicaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(token: string) {
        return this.repository.obterPesquisaPublica(token);
    }
}

export class EnviarRespostaPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(token: string, dto: PesquisaRespostaSalvarDTO) {
        return this.repository.enviarResposta(token, dto);
    }
}

export class ListarEleicoesUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(query?: PoliticaListaQuery) {
        return this.repository.listarEleicoes(query);
    }
}

export class ObterEleicaoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.obterEleicao(id);
    }
}

export class CriarEleicaoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(dto: EleicaoSalvarDTO) {
        return this.repository.criarEleicao(dto);
    }
}

export class AtualizarEleicaoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, dto: EleicaoSalvarDTO) {
        return this.repository.atualizarEleicao(id, dto);
    }
}

export class ExcluirEleicaoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.excluirEleicao(id);
    }
}

export class EnviarArquivoEleicaoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, arquivo: File) {
        return this.repository.enviarArquivoEleicao(id, arquivo);
    }
}

export class SincronizarEleicaoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.sincronizarEleicao(id);
    }
}

export class ListarCargosUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(query?: PoliticaListaQuery) {
        return this.repository.listarCargos(query);
    }
}

export class CriarCargoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(dto: CargoSalvarDTO) {
        return this.repository.criarCargo(dto);
    }
}

export class AtualizarCargoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, dto: CargoSalvarDTO) {
        return this.repository.atualizarCargo(id, dto);
    }
}

export class ExcluirCargoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.excluirCargo(id);
    }
}

export class ListarPartidosUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(query?: PoliticaListaQuery) {
        return this.repository.listarPartidos(query);
    }
}

export class CriarPartidoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(dto: PartidoSalvarDTO) {
        return this.repository.criarPartido(dto);
    }
}

export class AtualizarPartidoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, dto: PartidoSalvarDTO) {
        return this.repository.atualizarPartido(id, dto);
    }
}

export class ExcluirPartidoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.excluirPartido(id);
    }
}

export class ListarCandidatosUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(query?: PoliticaListaQuery) {
        return this.repository.listarCandidatos(query);
    }
}

export class ObterCandidatoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.obterCandidato(id);
    }
}

export class CriarCandidatoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(dto: CandidatoSalvarDTO) {
        return this.repository.criarCandidato(dto);
    }
}

export class AtualizarCandidatoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, dto: CandidatoSalvarDTO) {
        return this.repository.atualizarCandidato(id, dto);
    }
}

export class ExcluirCandidatoUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.excluirCandidato(id);
    }
}

export class ListarMunicipiosPoliticaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute() {
        return this.repository.listarMunicipios();
    }
}

export class ListarPesquisasUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(query?: PoliticaListaQuery) {
        return this.repository.listarPesquisas(query);
    }
}

export class ObterPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.obterPesquisa(id);
    }
}

export class CriarPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(dto: PesquisaSalvarDTO) {
        return this.repository.criarPesquisa(dto);
    }
}

export class AtualizarPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, dto: PesquisaSalvarDTO) {
        return this.repository.atualizarPesquisa(id, dto);
    }
}

export class ExcluirPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number) {
        return this.repository.excluirPesquisa(id);
    }
}

export class AtualizarStatusPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, status: string) {
        return this.repository.atualizarStatusPesquisa(id, status);
    }
}

export class SalvarPerguntasPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, dto: PesquisaPerguntasSalvarDTO) {
        return this.repository.salvarPerguntas(id, dto);
    }
}

export class ObterResultadosPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, filtro?: ResultadoFiltro) {
        return this.repository.obterResultados(id, filtro);
    }
}

export class ExportarCsvPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, filtro?: ResultadoFiltro) {
        return this.repository.exportarCsv(id, filtro);
    }
}

export class ExportarPdfPesquisaUseCase {
    constructor(private repository: IPoliticaRepository) {}
    execute(id: number, filtro?: ResultadoFiltro) {
        return this.repository.exportarPdf(id, filtro);
    }
}
