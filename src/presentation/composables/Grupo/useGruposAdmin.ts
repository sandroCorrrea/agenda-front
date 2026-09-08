import { inject, reactive, ref } from "vue";
import axios from "axios";
import type { IGrupoRepository } from "@/domain/repositories/IGrupoRepository";
import type { IMenuRepository } from "@/domain/repositories/IMenuRepository";
import {
    AdicionarMembrosGrupoUseCase,
    AtualizarGrupoUseCase,
    CriarGrupoUseCase,
    ExcluirGrupoUseCase,
    ListarGruposUseCase,
    ListarUsuariosElegiveisGrupoUseCase,
    ObterGrupoUseCase,
    RemoverMembroGrupoUseCase,
    SincronizarPermissoesGrupoUseCase
} from "@/application/use-cases/Grupo/GrupoUseCases";
import { ListarCatalogoMenuUseCase } from "@/application/use-cases/Menu/ListarCatalogoMenuUseCase";
import type {
    GrupoDetalheDTO,
    GrupoListagemItemDTO,
    GrupoPermissaoSyncItemDTO,
    GrupoUpsertRequestDTO,
    UsuarioElegivelDTO
} from "@/application/dto/Grupo/GrupoAcessoDTO";
import type { MenuModuloCatalogoDTO } from "@/application/dto/Menu/MenuSessaoDTO";

function mensagemErro(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as {
            message?: string;
            errors?: Record<string, string[]>;
        };
        const primeiroErro = data?.errors
            ? Object.values(data.errors)[0]?.[0]
            : undefined;
        return primeiroErro || data?.message || fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

export function useGruposAdmin() {
    const grupoRepo = inject<IGrupoRepository | null>("IGrupoRepository", null);
    const menuRepo = inject<IMenuRepository | null>("IMenuRepository", null);
    if (!grupoRepo) throw new Error("IGrupoRepository not provided");
    if (!menuRepo) throw new Error("IMenuRepository not provided");

    const listarGrupos = new ListarGruposUseCase(grupoRepo);
    const obterGrupo = new ObterGrupoUseCase(grupoRepo);
    const criarGrupo = new CriarGrupoUseCase(grupoRepo);
    const atualizarGrupo = new AtualizarGrupoUseCase(grupoRepo);
    const excluirGrupo = new ExcluirGrupoUseCase(grupoRepo);
    const syncPermissoes = new SincronizarPermissoesGrupoUseCase(grupoRepo);
    const addMembros = new AdicionarMembrosGrupoUseCase(grupoRepo);
    const remMembro = new RemoverMembroGrupoUseCase(grupoRepo);
    const listarElegiveis = new ListarUsuariosElegiveisGrupoUseCase(grupoRepo);
    const listarCatalogo = new ListarCatalogoMenuUseCase(menuRepo);

    const lista = ref<GrupoListagemItemDTO[]>([]);
    const detalhe = ref<GrupoDetalheDTO | null>(null);
    const catalogo = ref<MenuModuloCatalogoDTO[]>([]);
    const elegiveis = ref<UsuarioElegivelDTO[]>([]);

    const carregandoLista = ref(false);
    const carregandoDetalhe = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);

    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(15);
    const ultimaPagina = ref(1);

    const elegiveisMeta = reactive({
        page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        q: "",
        tipo: "todos" as "cliente" | "prefeitura" | "todos"
    });

    async function carregarLista(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const res = await listarGrupos.execute({
                page,
                per_page: porPagina.value
            });
            lista.value = res.data ?? [];
            paginaAtual.value = res.meta?.current_page ?? page;
            totalRegistros.value = res.meta?.total ?? lista.value.length;
            ultimaPagina.value = res.meta?.last_page ?? 1;
            porPagina.value = res.meta?.per_page ?? 15;
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível listar os grupos.");
            throw err;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function carregarDetalhe(id: number) {
        carregandoDetalhe.value = true;
        erro.value = null;
        try {
            detalhe.value = await obterGrupo.execute(id);
            return detalhe.value;
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível carregar o grupo.");
            throw err;
        } finally {
            carregandoDetalhe.value = false;
        }
    }

    async function carregarCatalogo() {
        try {
            catalogo.value = await listarCatalogo.execute(true);
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível carregar o catálogo.");
            throw err;
        }
    }

    async function criar(dto: GrupoUpsertRequestDTO) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            const criado = await criarGrupo.execute(dto);
            sucesso.value = "Grupo criado com sucesso.";
            return criado;
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível criar o grupo.");
            throw err;
        } finally {
            salvando.value = false;
        }
    }

    async function atualizar(id: number, dto: GrupoUpsertRequestDTO) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            const atualizado = await atualizarGrupo.execute(id, dto);
            detalhe.value = {
                ...atualizado,
                membros: detalhe.value?.membros ?? atualizado.membros ?? [],
                permissoes: detalhe.value?.permissoes ?? atualizado.permissoes ?? []
            };
            sucesso.value = "Grupo atualizado com sucesso.";
            return atualizado;
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível atualizar o grupo.");
            throw err;
        } finally {
            salvando.value = false;
        }
    }

    async function excluir(id: number) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            await excluirGrupo.execute(id);
            sucesso.value = "Grupo excluído.";
            await carregarLista(paginaAtual.value);
        } catch (err) {
            erro.value = mensagemErro(
                err,
                "Não foi possível excluir o grupo. Remova os membros antes."
            );
            throw err;
        } finally {
            salvando.value = false;
        }
    }

    async function salvarPermissoes(
        id: number,
        permissoes: GrupoPermissaoSyncItemDTO[]
    ) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            const listaPerm = await syncPermissoes.execute(id, permissoes);
            if (detalhe.value) {
                detalhe.value = { ...detalhe.value, permissoes: listaPerm };
            }
            sucesso.value = "Permissões salvas.";
            return listaPerm;
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível salvar as permissões.");
            throw err;
        } finally {
            salvando.value = false;
        }
    }

    async function carregarElegiveis(page = 1) {
        try {
            const res = await listarElegiveis.execute({
                q: elegiveisMeta.q || undefined,
                tipo: elegiveisMeta.tipo,
                somente_sem_grupo: 1,
                page,
                per_page: elegiveisMeta.per_page
            });
            elegiveis.value = res.data ?? [];
            elegiveisMeta.page = res.meta?.current_page ?? page;
            elegiveisMeta.total = res.meta?.total ?? 0;
            elegiveisMeta.last_page = res.meta?.last_page ?? 1;
        } catch (err) {
            erro.value = mensagemErro(
                err,
                "Não foi possível listar usuários elegíveis."
            );
            throw err;
        }
    }

    async function adicionarMembros(id: number, usuarioIds: number[]) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            await addMembros.execute(id, usuarioIds);
            await carregarDetalhe(id);
            sucesso.value = "Membros adicionados.";
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível adicionar membros.");
            throw err;
        } finally {
            salvando.value = false;
        }
    }

    async function removerMembro(grupoId: number, usuarioId: number) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            await remMembro.execute(grupoId, usuarioId);
            await carregarDetalhe(grupoId);
            sucesso.value = "Membro removido.";
        } catch (err) {
            erro.value = mensagemErro(err, "Não foi possível remover o membro.");
            throw err;
        } finally {
            salvando.value = false;
        }
    }

    return {
        lista,
        detalhe,
        catalogo,
        elegiveis,
        elegiveisMeta,
        carregandoLista,
        carregandoDetalhe,
        salvando,
        erro,
        sucesso,
        paginaAtual,
        totalRegistros,
        ultimaPagina,
        carregarLista,
        carregarDetalhe,
        carregarCatalogo,
        criar,
        atualizar,
        excluir,
        salvarPermissoes,
        carregarElegiveis,
        adicionarMembros,
        removerMembro
    };
}
