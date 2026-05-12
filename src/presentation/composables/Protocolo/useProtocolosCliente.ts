import { computed, inject, onUnmounted, reactive, ref, watch } from "vue";
import axios from "axios";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type { Protocolo } from "@/domain/entities/Protocolo";
import { ListarProtocolosPorUsuarioUseCase } from "@/application/use-cases/Protocolo/ListarProtocolosPorUsuarioUseCase";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import type { ProtocoloUsuarioListQuery } from "@/application/dto/Protocolo/ProtocoloUsuarioListagemQuery";

const POR_PAGINA_PADRAO = 10;
const DEBOUNCE_TITULO_MS = 400;

export type ErroListagemCliente =
    | { kind: "401"; message: string }
    | { kind: "403"; message: string }
    | { kind: "404"; message: string }
    | { kind: "422"; message: string; campos: Record<string, string> }
    | { kind: "5xx"; message: string }
    | { kind: "rede"; message: string }
    | { kind: "desconhecido"; message: string };

function parseErroListagem(e: unknown): ErroListagemCliente | null {
    if (!axios.isAxiosError(e)) {
        return { kind: "desconhecido", message: "Não foi possível carregar os protocolos." };
    }
    if (axios.isCancel(e)) {
        return null;
    }
    const status = e.response?.status;
    const data = e.response?.data as ErroResponseDTO | undefined;
    const msg = (data?.message as string | undefined)?.trim() || "Não foi possível carregar os protocolos.";

    if (e.code === "ERR_NETWORK" || !e.response) {
        return { kind: "rede", message: "Sem conexão ou servidor indisponível. Verifique a rede e tente novamente." };
    }

    if (status === 401) {
        return { kind: "401", message: msg };
    }
    if (status === 403) {
        return { kind: "403", message: msg };
    }
    if (status === 404) {
        return { kind: "404", message: msg };
    }
    if (status === 422) {
        const errors = (data?.errors ?? {}) as Record<string, string[] | undefined>;
        const campos: Record<string, string> = {};
        for (const [k, v] of Object.entries(errors)) {
            if (v?.[0]) campos[k] = v[0];
        }
        return { kind: "422", message: data?.message ?? "Dados inválidos.", campos };
    }
    if (status != null && status >= 500) {
        return { kind: "5xx", message: "O servidor encontrou um erro. Tente novamente em instantes." };
    }
    return { kind: "desconhecido", message: msg };
}

export function useProtocolosCliente() {
    const repo = inject<IProtocoloRepository>("IProtocoloRepository");
    if (!repo) throw new Error("IProtocoloRepository not provided");

    const auth = useAuthStore();
    const caso = new ListarProtocolosPorUsuarioUseCase(repo);

    const protocolos = ref<Protocolo[]>([]);
    const carregando = ref(false);
    const erro = ref<ErroListagemCliente | null>(null);
    const totalRegistros = ref(0);
    const paginaAtual = ref(1);
    const porPagina = ref(POR_PAGINA_PADRAO);

    /** Formulário (draft) — Aplicar / Limpar / debounce de título */
    const filtros = reactive({
        titulo: ""
    });

    /** Valores efetivos na última busca (debounce de título) */
    const filtrosAtivos = reactive({
        titulo: ""
    });

    let abortAtual: AbortController | null = null;
    let requestSeq = 0;
    let debounceTituloTimer: ReturnType<typeof setTimeout> | null = null;

    function montarQuery(page: number): Partial<ProtocoloUsuarioListQuery> {
        const q: Partial<ProtocoloUsuarioListQuery> = {
            page,
            per_page: porPagina.value
        };
        const tit = filtrosAtivos.titulo.trim();
        if (tit) q.titulo = tit;
        return q;
    }

    async function buscar(page: number) {
        const uid = auth.usuario?.id;
        if (uid == null) {
            erro.value = { kind: "desconhecido", message: "Sessão inválida. Faça login novamente." };
            return;
        }

        if (abortAtual) {
            abortAtual.abort();
        }
        abortAtual = new AbortController();
        const signal = abortAtual.signal;
        const seq = ++requestSeq;

        carregando.value = true;
        erro.value = null;

        try {
            const query = montarQuery(page);
            const resp = await caso.execute(uid, query, signal);

            if (seq !== requestSeq) return;

            protocolos.value = resp.protocolo;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (
                axios.isCancel(e) ||
                (axios.isAxiosError(e) && (e.code === "ERR_CANCELED" || e.code === "ECONNABORTED"))
            ) {
                return;
            }
            if (seq !== requestSeq) return;
            const parsed = parseErroListagem(e);
            if (parsed) erro.value = parsed;
            protocolos.value = [];
            totalRegistros.value = 0;
        } finally {
            if (seq === requestSeq) {
                carregando.value = false;
            }
        }
    }

    function cancelarDebounceTitulo() {
        if (debounceTituloTimer != null) {
            clearTimeout(debounceTituloTimer);
            debounceTituloTimer = null;
        }
    }

    function aplicarFiltros() {
        cancelarDebounceTitulo();
        filtrosAtivos.titulo = filtros.titulo;
        void buscar(1);
    }

    function limparFiltros() {
        cancelarDebounceTitulo();
        filtros.titulo = "";
        filtrosAtivos.titulo = "";
        porPagina.value = POR_PAGINA_PADRAO;
        void buscar(1);
    }

    watch(
        () => filtros.titulo,
        (novo, antigo) => {
            if (novo === antigo) return;
            cancelarDebounceTitulo();
            debounceTituloTimer = setTimeout(() => {
                debounceTituloTimer = null;
                filtrosAtivos.titulo = filtros.titulo;
                void buscar(1);
            }, DEBOUNCE_TITULO_MS);
        }
    );

    const totalPaginas = computed(() =>
        Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)))
    );

    const listaVazia = computed(
        () => !carregando.value && erro.value == null && protocolos.value.length === 0
    );

    async function irParaPagina(p: number) {
        if (p < 1 || p > totalPaginas.value) return;
        await buscar(p);
    }

    async function alterarPorPagina(n: number) {
        if (![10, 20, 50, 100].includes(n)) return;
        porPagina.value = n;
        await buscar(1);
    }

    function tentarNovamente() {
        void buscar(paginaAtual.value);
    }

    onUnmounted(() => {
        if (debounceTituloTimer != null) clearTimeout(debounceTituloTimer);
        if (abortAtual) abortAtual.abort();
    });

    return {
        filtros,
        filtrosAtivos,
        protocolos,
        carregando,
        erro,
        listaVazia,
        totalRegistros,
        paginaAtual,
        porPagina,
        totalPaginas,
        aplicarFiltros,
        limparFiltros,
        irParaPagina,
        alterarPorPagina,
        tentarNovamente,
        buscarInicial: () => buscar(1)
    };
}
