import { inject, ref } from "vue";
import axios from "axios";
import { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import { UsuarioPostRequestDTO } from "@/application/dto/Usuario/UsuarioPostRequestDTO";
import { PersistPessoaUseCase } from "@/application/use-cases/Pessoa/PersistPessoaUseCase";
import { ListarAdministradoresUseCase } from "@/application/use-cases/Pessoa/ListarAdministradoresUseCase";
import { AtualizarStatusAdministradorUseCase } from "@/application/use-cases/Pessoa/AtualizarStatusAdministradorUseCase";
import type { PessoaAdministradorDTO } from "@/application/dto/Pessoa/PessoaAdministradorDTO";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { TipoUsuario } from "@/domain/types/TipoUsuario";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useAdministradores() {
    const repo = inject<IPessoaRepository>("IPessoaRepository");
    if (!repo) throw new Error("IPessoaRepository not provided");

    const criarCaso = new PersistPessoaUseCase(repo);
    const listarCaso = new ListarAdministradoresUseCase(repo);
    const statusCaso = new AtualizarStatusAdministradorUseCase(repo);

    const lista = ref<PessoaAdministradorDTO[]>([]);
    const carregandoLista = ref(false);
    const criando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const atualizandoStatusId = ref<number | null>(null);

    async function carregar() {
        carregandoLista.value = true;
        erro.value = null;
        try {
            lista.value = await listarCaso.execute();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                erro.value = d?.message ?? "Nao foi possivel listar administradores.";
            } else {
                erro.value = "Nao foi possivel listar administradores.";
            }
            throw e;
        } finally {
            carregandoLista.value = false;
        }
    }

    async function criar(payload: {
        nome: string;
        cpf: string;
        data_nascimento: string;
        email: string;
        celular: string;
        senha: string;
        senha_confirmation: string;
    }) {
        criando.value = true;
        erro.value = null;
        sucesso.value = null;
        try {
            await criarCaso.execute(
                new PessoaPostRequestDTO(
                    payload.nome,
                    payload.cpf,
                    payload.data_nascimento,
                    payload.email,
                    payload.celular,
                    new UsuarioPostRequestDTO(
                        payload.senha,
                        payload.senha_confirmation,
                        TipoUsuario.ADMINISTRADOR
                    )
                )
            );
            sucesso.value = "Administrador criado com sucesso.";
            await carregar();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                erro.value =
                    d?.errors?.nome?.[0] ||
                    d?.errors?.cpf?.[0] ||
                    d?.errors?.email?.[0] ||
                    d?.errors?.celular?.[0] ||
                    d?.errors?.["usuario.senha"]?.[0] ||
                    d?.errors?.["usuario.senha_confirmation"]?.[0] ||
                    d?.message ||
                    "Nao foi possivel criar administrador.";
            } else {
                erro.value = "Nao foi possivel criar administrador.";
            }
            throw e;
        } finally {
            criando.value = false;
        }
    }

    async function atualizarStatus(
        usuarioId: number,
        status: "ativo" | "inativo" | "bloqueado"
    ) {
        atualizandoStatusId.value = usuarioId;
        erro.value = null;
        sucesso.value = null;
        try {
            await statusCaso.execute(usuarioId, status);
            sucesso.value = "Status atualizado com sucesso.";
            const idx = lista.value.findIndex((i) => i.usuario.id === usuarioId);
            if (idx >= 0) {
                const item = lista.value[idx];
                if (item) item.usuario.status = status;
            }
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                erro.value =
                    d?.message ?? "Nao foi possivel atualizar o status.";
            } else {
                erro.value = "Nao foi possivel atualizar o status.";
            }
            throw e;
        } finally {
            atualizandoStatusId.value = null;
        }
    }

    return {
        lista,
        carregandoLista,
        criando,
        erro,
        sucesso,
        atualizandoStatusId,
        carregar,
        criar,
        atualizarStatus
    };
}
