import type {
    IGrupoRepository,
    ListarGruposParams,
    ListarUsuariosElegiveisParams
} from "@/domain/repositories/IGrupoRepository";
import type {
    GrupoPermissaoSyncItemDTO,
    GrupoUpsertRequestDTO
} from "@/application/dto/Grupo/GrupoAcessoDTO";

export class ListarGruposUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(params?: ListarGruposParams) {
        return this.repository.listar(params);
    }
}

export class ObterGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(id: number) {
        return this.repository.obter(id);
    }
}

export class CriarGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(dto: GrupoUpsertRequestDTO) {
        return this.repository.criar(dto);
    }
}

export class AtualizarGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(id: number, dto: GrupoUpsertRequestDTO) {
        return this.repository.atualizar(id, dto);
    }
}

export class ExcluirGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(id: number) {
        return this.repository.excluir(id);
    }
}

export class SincronizarPermissoesGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(id: number, permissoes: GrupoPermissaoSyncItemDTO[]) {
        return this.repository.sincronizarPermissoes(id, permissoes);
    }
}

export class ListarMembrosGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(id: number) {
        return this.repository.listarMembros(id);
    }
}

export class AdicionarMembrosGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(id: number, usuarioIds: number[]) {
        return this.repository.adicionarMembros(id, usuarioIds);
    }
}

export class RemoverMembroGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(grupoId: number, usuarioId: number) {
        return this.repository.removerMembro(grupoId, usuarioId);
    }
}

export class ListarUsuariosElegiveisGrupoUseCase {
    constructor(private repository: IGrupoRepository) {}
    execute(params?: ListarUsuariosElegiveisParams) {
        return this.repository.listarUsuariosElegiveis(params);
    }
}
