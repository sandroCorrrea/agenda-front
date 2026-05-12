import { inject, ref } from "vue";
import axios from "axios";
import type { IProtocoloRepository } from "@/domain/repositories/IProtocoloRepository";
import type {
    ClienteOption,
    EmpresaOption,
    EnderecoDestinatarioResponse,
    Protocolo
} from "@/domain/entities/Protocolo";
import { ObterProtocoloPorIdUseCase } from "@/application/use-cases/Protocolo/ObterProtocoloPorIdUseCase";
import { AtualizarProtocoloUseCase } from "@/application/use-cases/Protocolo/AtualizarProtocoloUseCase";
import { ProtocoloPayloadDTO } from "@/application/dto/Protocolo/ProtocoloPayloadDTO";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useEditarProtocolo() {
    const repoInject = inject<IProtocoloRepository>("IProtocoloRepository");
    if (!repoInject) throw new Error("IProtocoloRepository not provided");
    const repo: IProtocoloRepository = repoInject;

    const auth = useAuthStore();
    const obterCaso = new ObterProtocoloPorIdUseCase(repo);
    const atualizarCaso = new AtualizarProtocoloUseCase(repo);

    const protocoloAtual = ref<Protocolo | null>(null);
    const carregando = ref(false);
    const salvando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const naoEncontrado = ref(false);
    const erroCampos = ref<Record<string, string>>({});
    const empresasDestinatario = ref<EmpresaOption[]>([]);
    const clientesDestinatario = ref<ClienteOption[]>([]);
    const carregandoDestinatarios = ref(false);
    const erroDestinatarios = ref<string | null>(null);
    const carregandoEnderecoDestinatario = ref(false);
    const erroEnderecoDestinatario = ref<string | null>(null);

    async function carregar(id: number) {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            protocoloAtual.value = await obterCaso.execute(id);
        } catch (e: unknown) {
            if (axios.isAxiosError(e) && e.response?.status === 404) {
                naoEncontrado.value = true;
                erro.value = "Registro não encontrado.";
            } else {
                erro.value = "Não foi possível carregar o protocolo.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvar(id: number, payload: ProtocoloPayloadDTO) {
        salvando.value = true;
        erro.value = null;
        sucesso.value = null;
        erroCampos.value = {};
        try {
            protocoloAtual.value = await atualizarCaso.execute(id, payload);
            sucesso.value = "Protocolo atualizado com sucesso.";
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
                } else if (status === 404) {
                    naoEncontrado.value = true;
                    erro.value = "Registro não encontrado.";
                } else if (status === 403) {
                    erro.value = "Você não tem permissão para esta ação.";
                } else if (status != null && status >= 500) {
                    erro.value = "Não foi possível salvar agora. Tente novamente.";
                } else {
                    erro.value = d?.message ?? "Não foi possível atualizar o protocolo.";
                }
            } else {
                erro.value = "Não foi possível atualizar o protocolo.";
            }
            throw e;
        } finally {
            salvando.value = false;
        }
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

    function montarPayload(raw: {
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
    }): ProtocoloPayloadDTO {
        const adminId = auth.usuario?.id;
        if (!adminId) throw new Error("Administrador não identificado.");
        return new ProtocoloPayloadDTO(
            raw.destinatario_tipo,
            raw.destinatario_tipo === "fisica" ? raw.destinatario_usuario_id : null,
            raw.destinatario_tipo === "juridica" ? raw.destinatario_empresa_id : null,
            adminId,
            raw.titulo,
            raw.descricao,
            raw.ano,
            raw.data_para_entrega,
            raw.cep_destinatario,
            raw.rua_destinatario,
            raw.bairro_destinatario,
            raw.cidade_destinatario
        );
    }

    return {
        protocoloAtual,
        carregando,
        salvando,
        erro,
        sucesso,
        naoEncontrado,
        erroCampos,
        empresasDestinatario,
        clientesDestinatario,
        carregandoDestinatarios,
        erroDestinatarios,
        carregandoEnderecoDestinatario,
        erroEnderecoDestinatario,
        carregar,
        salvar,
        carregarDestinatarios,
        carregarEnderecoDestinatario,
        montarPayload
    };
}
