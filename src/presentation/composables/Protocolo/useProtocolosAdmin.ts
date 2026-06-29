import { computed, inject, reactive, ref } from "vue";
import axios from "axios";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type {
    ClienteOption,
    EmpresaOption,
    EnderecoDestinatarioResponse,
    Protocolo
} from "@/domain/entities/Protocolo";
import { ListarProtocolosPaginadoUseCase } from "@/application/use-cases/Protocolo/ListarProtocolosPaginadoUseCase";
import { CriarProtocoloUseCase } from "@/application/use-cases/Protocolo/CriarProtocoloUseCase";
import { ExcluirProtocoloUseCase } from "@/application/use-cases/Protocolo/ExcluirProtocoloUseCase";
import { ObterProtocoloPorIdUseCase } from "@/application/use-cases/Protocolo/ObterProtocoloPorIdUseCase";
import { ProtocoloPayloadDTO } from "@/application/dto/Protocolo/ProtocoloPayloadDTO";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";
import { dispararDownloadBlob } from "@/shared/utils/downloadBlob";
import { sanitizeProtocoloUsuarioQuery } from "@/shared/utils/protocoloUsuarioQuery";

const POR_PAGINA_PADRAO = 10;

/** `v-model` em input type="number" pode ser string ou number; evita `.trim()` em number. */
function normalizarAnoFiltro(ano: string | number): number | undefined {
    if (ano === "" || ano === null || ano === undefined) return undefined;
    const texto = String(ano).trim();
    if (!texto) return undefined;
    const n = Number(texto);
    return Number.isFinite(n) ? n : undefined;
}

export function useProtocolosAdmin() {
    const repoInject = inject<IProtocoloRepository>("IProtocoloRepository");
    if (!repoInject) throw new Error("IProtocoloRepository not provided");
    const repo: IProtocoloRepository = repoInject;

    const auth = useAuthStore();
    const listarCaso = new ListarProtocolosPaginadoUseCase(repo);
    const criarCaso = new CriarProtocoloUseCase(repo);
    const excluirCaso = new ExcluirProtocoloUseCase(repo);
    const obterCaso = new ObterProtocoloPorIdUseCase(repo);

    const protocolos = ref<Protocolo[]>([]);
    const carregandoLista = ref(false);
    const carregandoDetalhe = ref(false);
    const criando = ref(false);
    const excluindoId = ref<number | null>(null);
    const baixandoPdfId = ref<number | null>(null);

    const paginaAtual = ref(1);
    const totalRegistros = ref(0);
    const porPagina = ref(POR_PAGINA_PADRAO);

    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});

    const modalExcluirId = ref<number | null>(null);
    const modalDetalheId = ref<number | null>(null);
    const protocoloDetalhe = ref<Protocolo | null>(null);
    const empresasDestinatario = ref<EmpresaOption[]>([]);
    const clientesDestinatario = ref<ClienteOption[]>([]);
    const carregandoDestinatarios = ref(false);
    const erroDestinatarios = ref<string | null>(null);
    const carregandoEnderecoDestinatario = ref(false);
    const erroEnderecoDestinatario = ref<string | null>(null);

    const filtros = reactive({
        titulo: "",
        /** Input type="number" pode devolver number no v-model. */
        ano: "" as string | number,
        destinatario_tipo: "" as "" | "fisica" | "juridica",
        cpf: "",
        cnpj: "",
        descricao: ""
    });

    const protocoloExclusaoNome = computed(() => {
        const id = modalExcluirId.value;
        if (id == null) return "";
        return (
            protocolos.value.find((p) => p.id === id)?.titulo?.trim() ||
            "Protocolo sem título"
        );
    });

    function normalizarPayload(payload: {
        destinatario_tipo: "fisica" | "juridica";
        destinatario_usuario_id: number | null;
        destinatario_empresa_id: number | null;
        titulo: string | null;
        descricao: string;
        ano: number;
        data_para_entrega: string;
        cep_destinatario: string;
        rua_destinatario: string;
        bairro_destinatario: string;
        cidade_destinatario: string;
    }) {
        const administrador = auth.usuario?.id;
        if (!administrador) throw new Error("Administrador não identificado.");
        return new ProtocoloPayloadDTO(
            payload.destinatario_tipo,
            payload.destinatario_tipo === "fisica" ? payload.destinatario_usuario_id : null,
            payload.destinatario_tipo === "juridica" ? payload.destinatario_empresa_id : null,
            administrador,
            payload.titulo,
            payload.descricao,
            payload.ano,
            payload.data_para_entrega,
            payload.cep_destinatario,
            payload.rua_destinatario,
            payload.bairro_destinatario,
            payload.cidade_destinatario
        );
    }

    async function carregarDestinatarios(tipo: "fisica" | "juridica") {
        carregandoDestinatarios.value = true;
        erroDestinatarios.value = null;
        try {
            if (tipo === "juridica") {
                clientesDestinatario.value = [];
                empresasDestinatario.value = await repo.listDestinatarioEmpresas();
            } else {
                empresasDestinatario.value = [];
                clientesDestinatario.value = await repo.listDestinatarioClientes();
            }
        } catch {
            erroDestinatarios.value =
                tipo === "juridica"
                    ? "Não foi possível carregar empresas."
                    : "Não foi possível carregar clientes.";
            if (tipo === "juridica") empresasDestinatario.value = [];
            else clientesDestinatario.value = [];
        } finally {
            carregandoDestinatarios.value = false;
        }
    }

    async function carregarEnderecoDestinatario(
        tipo: "fisica" | "juridica",
        id: number
    ): Promise<EnderecoDestinatarioResponse | null> {
        carregandoEnderecoDestinatario.value = true;
        erroEnderecoDestinatario.value = null;
        try {
            if (tipo === "juridica") {
                return await repo.getEnderecoDestinatarioByEmpresaId(id);
            }
            return await repo.getEnderecoDestinatarioByUsuarioId(id);
        } catch {
            erroEnderecoDestinatario.value =
                "Não foi possível carregar endereço automaticamente.";
            return null;
        } finally {
            carregandoEnderecoDestinatario.value = false;
        }
    }

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resp = await listarCaso.execute(
                sanitizeProtocoloUsuarioQuery({
                    page,
                    per_page: porPagina.value,
                    titulo: filtros.titulo,
                    ano: normalizarAnoFiltro(filtros.ano),
                    destinatario_tipo: filtros.destinatario_tipo || undefined,
                    cpf: filtros.cpf,
                    cnpj: filtros.cnpj,
                    descricao: filtros.descricao
                })
            );
            protocolos.value = resp.protocolo;
            totalRegistros.value = resp.total;
            paginaAtual.value = resp.pagina;
            porPagina.value = resp.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO & {
                    errors?: Record<string, string[]>;
                };
                erro.value =
                    d?.errors?.ano?.[0] ||
                    d?.message ||
                    "Não foi possível carregar os protocolos.";
            } else {
                erro.value = "Não foi possível carregar os protocolos.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function carregarDetalhe(id: number) {
        carregandoDetalhe.value = true;
        try {
            protocoloDetalhe.value = await obterCaso.execute(id);
            modalDetalheId.value = id;
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 404) {
                erro.value = "Protocolo não encontrado.";
                await carregar(paginaAtual.value);
            } else {
                erro.value = "Não foi possível carregar o detalhe do protocolo.";
            }
        } finally {
            carregandoDetalhe.value = false;
        }
    }

    function fecharDetalhe() {
        modalDetalheId.value = null;
        protocoloDetalhe.value = null;
    }

    async function criar(payload: {
        destinatario_tipo: "fisica" | "juridica";
        destinatario_usuario_id: number | null;
        destinatario_empresa_id: number | null;
        titulo: string | null;
        descricao: string;
        ano: number;
        data_para_entrega: string;
        cep_destinatario: string;
        rua_destinatario: string;
        bairro_destinatario: string;
        cidade_destinatario: string;
    }) {
        criando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            const dto = normalizarPayload(payload);
            await criarCaso.execute(dto);
            sucesso.value = "Protocolo criado com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO | undefined;
                const errors = (d?.errors ?? {}) as Record<string, string[] | undefined>;
                if (status === 422) {
                    erroCampos.value = {
                        destinatario_tipo: errors.destinatario_tipo?.[0] ?? "",
                        destinatario_usuario_id: errors.destinatario_usuario_id?.[0] ?? "",
                        destinatario_empresa_id: errors.destinatario_empresa_id?.[0] ?? "",
                        administrador_usuario_id: errors.administrador_usuario_id?.[0] ?? "",
                        titulo: errors.titulo?.[0] ?? "",
                        descricao: errors.descricao?.[0] ?? "",
                        ano: errors.ano?.[0] ?? "",
                        data_para_entrega: errors.data_para_entrega?.[0] ?? "",
                        cep_destinatario: errors.cep_destinatario?.[0] ?? "",
                        rua_destinatario: errors.rua_destinatario?.[0] ?? "",
                        bairro_destinatario: errors.bairro_destinatario?.[0] ?? "",
                        cidade_destinatario: errors.cidade_destinatario?.[0] ?? ""
                    };
                    erro.value = d?.message ?? "Dados inválidos.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível criar agora. Tente novamente.";
                } else if (status === 403) {
                    erro.value = "Você não tem permissão para esta ação.";
                } else {
                    erro.value = d?.message ?? "Não foi possível criar o protocolo.";
                }
            } else {
                erro.value = (e as Error).message || "Não foi possível criar o protocolo.";
            }
            throw e;
        } finally {
            criando.value = false;
        }
    }

    function abrirModalExcluir(id: number) {
        modalExcluirId.value = id;
    }

    function fecharModalExcluir() {
        if (excluindoId.value !== null) return;
        modalExcluirId.value = null;
    }

    async function confirmarExclusao() {
        const id = modalExcluirId.value;
        if (id == null) return;
        excluindoId.value = id;
        erro.value = null;
        sucesso.value = null;
        const paginaAntes = paginaAtual.value;
        try {
            await excluirCaso.execute(id);
            sucesso.value = "Protocolo excluído com sucesso.";
            await carregar(paginaAntes);
            if (protocolos.value.length === 0 && paginaAntes > 1) {
                await carregar(paginaAntes - 1);
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 404) {
                    erro.value = "Registro não encontrado.";
                    await carregar(paginaAntes);
                } else if (status === 403) {
                    erro.value = "Você não tem permissão para esta ação.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível excluir agora. Tente novamente.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Não foi possível excluir o protocolo.";
                }
            } else {
                erro.value = "Não foi possível excluir o protocolo.";
            }
        } finally {
            excluindoId.value = null;
            modalExcluirId.value = null;
        }
    }

    function limparFiltros() {
        filtros.titulo = "";
        filtros.ano = "";
        filtros.destinatario_tipo = "";
        filtros.cpf = "";
        filtros.cnpj = "";
        filtros.descricao = "";
    }

    const totalPaginas = () => Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)));

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas()) return;
        await carregar(page);
    }

    async function baixarPdf(id: number) {
        baixandoPdfId.value = id;
        erro.value = null;
        try {
            const { blob, filename } = await repo.downloadPdf(id);
            dispararDownloadBlob(blob, filename);
        } catch (e: unknown) {
            if (e instanceof Error) {
                erro.value = e.message;
            } else if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                if (status === 403) {
                    erro.value = "Sem permissão para gerar o PDF.";
                } else if (status === 404) {
                    erro.value = "Protocolo não encontrado.";
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Não foi possível baixar o PDF.";
                }
            } else {
                erro.value = "Não foi possível baixar o PDF.";
            }
        } finally {
            baixandoPdfId.value = null;
        }
    }

    return {
        filtros,
        protocolos,
        carregandoLista,
        carregandoDetalhe,
        carregandoDestinatarios,
        carregandoEnderecoDestinatario,
        criando,
        excluindoId,
        baixandoPdfId,
        paginaAtual,
        totalRegistros,
        porPagina,
        erro,
        sucesso,
        erroCampos,
        modalExcluirId,
        protocoloExclusaoNome,
        modalDetalheId,
        protocoloDetalhe,
        empresasDestinatario,
        clientesDestinatario,
        erroDestinatarios,
        erroEnderecoDestinatario,
        carregar,
        limparFiltros,
        carregarDestinatarios,
        carregarEnderecoDestinatario,
        carregarDetalhe,
        fecharDetalhe,
        criar,
        abrirModalExcluir,
        fecharModalExcluir,
        confirmarExclusao,
        totalPaginas,
        irParaPagina,
        baixarPdf
    };
}
