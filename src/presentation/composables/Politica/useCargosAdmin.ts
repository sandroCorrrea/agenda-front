import { computed, ref } from "vue";
import type { CargoSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import {
    AtualizarCargoUseCase,
    CriarCargoUseCase,
    ExcluirCargoUseCase,
    ListarCargosUseCase
} from "@/application/use-cases/Politica/PoliticaUseCases";
import type { Cargo } from "@/domain/politica/tipos";
import { usePoliticaRepository } from "@/presentation/composables/Politica/usePoliticaRepository";
import { lerErroApi } from "@/shared/utils/apiMensagem";

const POR_PAGINA = 12;

export function useCargosAdmin() {
    const repo = usePoliticaRepository();
    const listar = new ListarCargosUseCase(repo);
    const criar = new CriarCargoUseCase(repo);
    const atualizar = new AtualizarCargoUseCase(repo);
    const excluir = new ExcluirCargoUseCase(repo);

    const itens = ref<Cargo[]>([]);
    const carregando = ref(false);
    const salvando = ref(false);
    const excluindoId = ref<number | null>(null);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const campos = ref<Record<string, string>>({});
    const q = ref("");
    const pagina = ref(1);
    const total = ref(0);
    const porPagina = ref(POR_PAGINA);
    const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / (porPagina.value || 1))));

    async function carregar(page = 1) {
        carregando.value = true;
        erro.value = null;
        try {
            const resp = await listar.execute({
                page,
                per_page: porPagina.value,
                q: q.value.trim() || undefined
            });
            itens.value = resp.itens;
            total.value = resp.total;
            pagina.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA;
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível carregar os cargos.").mensagem;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar(dto: CargoSalvarDTO, id?: number) {
        salvando.value = true;
        erro.value = null;
        campos.value = {};
        try {
            const cargo = id ? await atualizar.execute(id, dto) : await criar.execute(dto);
            sucesso.value = id ? "Cargo atualizado." : "Cargo cadastrado.";
            await carregar(id ? pagina.value : 1);
            return cargo;
        } catch (e: unknown) {
            const lido = lerErroApi(e, "Não foi possível salvar o cargo.");
            erro.value = lido.mensagem;
            campos.value = lido.campos;
            throw e;
        } finally {
            salvando.value = false;
        }
    }

    async function remover(id: number) {
        excluindoId.value = id;
        erro.value = null;
        try {
            const resp = await excluir.execute(id);
            sucesso.value = resp.message;
            await carregar(pagina.value);
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Não foi possível excluir o cargo.").mensagem;
        } finally {
            excluindoId.value = null;
        }
    }

    return {
        itens,
        carregando,
        salvando,
        excluindoId,
        erro,
        sucesso,
        campos,
        q,
        pagina,
        total,
        totalPaginas,
        carregar,
        salvar,
        remover
    };
}
