import { computed, inject, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { ObterPessoaPerfilUseCase } from "@/application/use-cases/Pessoa/ObterPessoaPerfilUseCase";
import { AtualizarContatoPessoaUseCase } from "@/application/use-cases/Pessoa/AtualizarContatoPessoaUseCase";
import { AtualizarSenhaUsuarioUseCase } from "@/application/use-cases/Usuario/AtualizarSenhaUsuarioUseCase";
import { PessoaContatoUpdateDTO } from "@/application/dto/Pessoa/PessoaContatoUpdateDTO";
import { UsuarioSenhaUpdateDTO } from "@/application/dto/Usuario/UsuarioSenhaUpdateDTO";
import type { PessoaPerfilDTO } from "@/application/dto/Pessoa/PessoaPerfilDTO";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { IUsuarioRepository } from "@/domain/repositories/IUsuarioRepository";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function useEditarClienteFisica() {
    const route = useRoute();
    const repoPessoa = inject<IPessoaRepository>("IPessoaRepository");
    const repoUsuario = inject<IUsuarioRepository>("IUsuarioRepository");
    if (!repoPessoa) throw new Error("IPessoaRepository not provided");
    if (!repoUsuario) throw new Error("IUsuarioRepository not provided");

    const obterCaso = new ObterPessoaPerfilUseCase(repoPessoa);
    const contatoCaso = new AtualizarContatoPessoaUseCase(repoPessoa);
    const senhaCaso = new AtualizarSenhaUsuarioUseCase(repoUsuario);

    const pessoaId = computed(() => Number(route.params.id));

    const carregando = ref(false);
    const salvandoContato = ref(false);
    const salvandoSenha = ref(false);
    const erro = ref<string | null>(null);
    const sucessoContato = ref<string | null>(null);
    const sucessoSenha = ref<string | null>(null);
    const erroContato = ref<string | null>(null);
    const erroSenha = ref<string | null>(null);
    const erroSenhaCampos = ref<{
        senha_atual?: string;
        nova_senha?: string;
        nova_senha_confirmation?: string;
    }>({});
    const naoEncontrado = ref(false);
    const perfil = ref<PessoaPerfilDTO | null>(null);

    const formContato = reactive({
        email: "",
        celular: ""
    });

    const formSenha = reactive({
        senha_atual: "",
        nova_senha: "",
        nova_senha_confirmation: ""
    });

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        naoEncontrado.value = false;
        try {
            const id = pessoaId.value;
            if (!id || Number.isNaN(id)) {
                naoEncontrado.value = true;
                return;
            }
            const data = await obterCaso.execute(id);
            perfil.value = data;
            formContato.email = data.email ?? "";
            formContato.celular = data.celular ?? "";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                if (e.response?.status === 404) {
                    naoEncontrado.value = true;
                } else {
                    const d = e.response?.data as ErroResponseDTO | undefined;
                    erro.value = d?.message ?? "Nao foi possivel carregar o cliente.";
                }
            } else {
                erro.value = "Nao foi possivel carregar o cliente.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function salvarContato() {
        const id = pessoaId.value;
        if (!id || Number.isNaN(id)) return;
        salvandoContato.value = true;
        erroContato.value = null;
        sucessoContato.value = null;
        try {
            const atualizado = await contatoCaso.execute(
                id,
                new PessoaContatoUpdateDTO(formContato.email.trim(), formContato.celular)
            );
            perfil.value = atualizado;
            formContato.email = atualizado.email ?? "";
            formContato.celular = atualizado.celular ?? "";
            sucessoContato.value = "Contato atualizado com sucesso.";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO & {
                    errors?: Record<string, string[]>;
                };
                erroContato.value =
                    d?.errors?.email?.[0] ||
                    d?.errors?.celular?.[0] ||
                    d?.message ||
                    "Nao foi possivel atualizar o contato.";
            } else {
                erroContato.value = "Nao foi possivel atualizar o contato.";
            }
            throw e;
        } finally {
            salvandoContato.value = false;
        }
    }

    async function salvarSenha() {
        const usuarioId = perfil.value?.usuario?.id;
        if (!usuarioId) {
            erroSenha.value = "Este cliente nao possui usuario vinculado.";
            return;
        }
        salvandoSenha.value = true;
        erroSenha.value = null;
        erroSenhaCampos.value = {};
        sucessoSenha.value = null;
        try {
            await senhaCaso.execute(
                usuarioId,
                new UsuarioSenhaUpdateDTO(
                    formSenha.senha_atual,
                    formSenha.nova_senha,
                    formSenha.nova_senha_confirmation
                )
            );
            sucessoSenha.value = "Senha atualizada com sucesso.";
            formSenha.senha_atual = "";
            formSenha.nova_senha = "";
            formSenha.nova_senha_confirmation = "";
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const d = e.response?.data as ErroResponseDTO & {
                    errors?: Record<string, string[]>;
                };
                if (status === 422 && d?.errors) {
                    erroSenhaCampos.value = {
                        senha_atual: d.errors.senha_atual?.[0],
                        nova_senha: d.errors.nova_senha?.[0],
                        nova_senha_confirmation:
                            d.errors.nova_senha_confirmation?.[0]
                    };
                }
                erroSenha.value =
                    d?.message || "Nao foi possivel atualizar a senha.";
            } else {
                erroSenha.value = "Nao foi possivel atualizar a senha.";
            }
            throw e;
        } finally {
            salvandoSenha.value = false;
        }
    }

    return {
        pessoaId,
        perfil,
        formContato,
        formSenha,
        carregando,
        salvandoContato,
        salvandoSenha,
        erro,
        erroContato,
        erroSenha,
        erroSenhaCampos,
        sucessoContato,
        sucessoSenha,
        naoEncontrado,
        carregar,
        salvarContato,
        salvarSenha
    };
}
