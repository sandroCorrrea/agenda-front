import { inject, ref } from "vue";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import type { IUsuarioRepository } from "@/domain/repositories/IUsuarioRepository";
import { ObterPessoaPerfilUseCase } from "@/application/use-cases/Pessoa/ObterPessoaPerfilUseCase";
import { AtualizarContatoPessoaUseCase } from "@/application/use-cases/Pessoa/AtualizarContatoPessoaUseCase";
import { AtualizarSenhaUsuarioUseCase } from "@/application/use-cases/Usuario/AtualizarSenhaUsuarioUseCase";
import { AtualizarImagemUsuarioUseCase } from "@/application/use-cases/Usuario/AtualizarImagemUsuarioUseCase";
import type { PessoaPerfilDTO } from "@/application/dto/Pessoa/PessoaPerfilDTO";
import { UsuarioSenhaUpdateDTO } from "@/application/dto/Usuario/UsuarioSenhaUpdateDTO";
import { PessoaContatoUpdateDTO } from "@/application/dto/Pessoa/PessoaContatoUpdateDTO";
import axios from "axios";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

export function usePessoaPerfil() {
    const repoPessoa = inject<IPessoaRepository>("IPessoaRepository");
    const repoUsuario = inject<IUsuarioRepository>("IUsuarioRepository");
    if (!repoPessoa) throw new Error("IPessoaRepository not provided");
    if (!repoUsuario) throw new Error("IUsuarioRepository not provided");

    const obterCaso = new ObterPessoaPerfilUseCase(repoPessoa);
    const contatoCaso = new AtualizarContatoPessoaUseCase(repoPessoa);
    const senhaCaso = new AtualizarSenhaUsuarioUseCase(repoUsuario);
    const imagemCaso = new AtualizarImagemUsuarioUseCase(repoUsuario);

    const carregando = ref(false);
    const salvandoContato = ref(false);
    const salvandoSenha = ref(false);
    const salvandoImagem = ref(false);
    const erro = ref<string | null>(null);
    const erroContato = ref<string | null>(null);
    const erroSenha = ref<string | null>(null);
    const erroSenhaCampos = ref<{
        senha_atual?: string;
        nova_senha?: string;
        nova_senha_confirmation?: string;
    }>({});
    const erroImagem = ref<string | null>(null);
    const sucessoContato = ref(false);
    const sucessoSenha = ref(false);
    const sucessoImagem = ref(false);
    const perfil = ref<PessoaPerfilDTO | null>(null);

    async function carregar(pessoaId: number) {
        carregando.value = true;
        erro.value = null;
        sucessoContato.value = false;
        sucessoSenha.value = false;
        sucessoImagem.value = false;
        try {
            perfil.value = await obterCaso.execute(pessoaId);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO;
                erro.value =
                    d?.message ?? "Não foi possível carregar seus dados.";
            } else {
                erro.value = "Erro ao carregar o perfil.";
            }
            throw e;
        } finally {
            carregando.value = false;
        }
    }

    async function atualizarContato(
        pessoaId: number,
        dto: PessoaContatoUpdateDTO
    ) {
        salvandoContato.value = true;
        erroContato.value = null;
        sucessoContato.value = false;
        try {
            perfil.value = await contatoCaso.execute(pessoaId, dto);
            sucessoContato.value = true;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO & {
                    errors?: Record<string, string[]>;
                };
                erroContato.value =
                    d?.errors?.email?.[0] ||
                    d?.errors?.celular?.[0] ||
                    d?.message ||
                    "Não foi possível salvar e-mail e celular.";
            } else {
                erroContato.value = "Erro ao atualizar contato.";
            }
            throw e;
        } finally {
            salvandoContato.value = false;
        }
    }

    async function alterarSenha(
        usuarioId: number,
        dto: UsuarioSenhaUpdateDTO
    ) {
        salvandoSenha.value = true;
        erroSenha.value = null;
        erroSenhaCampos.value = {};
        sucessoSenha.value = false;
        try {
            const usuarioAtualizado = await senhaCaso.execute(usuarioId, dto);
            if (perfil.value?.usuario) {
                perfil.value.usuario.tipoUsuario = usuarioAtualizado.tipoUsuario;
                perfil.value.usuario.status = usuarioAtualizado.status;
                perfil.value.usuario.img = usuarioAtualizado.img;
            }
            sucessoSenha.value = true;
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
                    erroSenha.value = d?.message ?? "Dados inválidos.";
                } else if (status === 422 && d?.message) {
                    erroSenha.value = d.message;
                    if (
                        d.message ===
                        "A nova senha deve ser diferente da senha atual."
                    ) {
                        erroSenhaCampos.value.nova_senha = d.message;
                    }
                } else if (status === 401) {
                    erroSenha.value = d?.message ?? "Senha atual inválida.";
                } else {
                    erroSenha.value =
                        d?.message ||
                        "Não foi possível atualizar a senha. Tente novamente.";
                }
            } else {
                erroSenha.value =
                    "Não foi possível atualizar a senha. Tente novamente.";
            }
            throw e;
        } finally {
            salvandoSenha.value = false;
        }
    }

    async function enviarImagem(usuarioId: number, arquivo: File) {
        salvandoImagem.value = true;
        erroImagem.value = null;
        sucessoImagem.value = false;
        try {
            const novaUrl = await imagemCaso.execute(usuarioId, arquivo);
            if (perfil.value?.usuario) {
                perfil.value.usuario.img = novaUrl;
            }
            sucessoImagem.value = true;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO & {
                    errors?: Record<string, string[]>;
                };
                erroImagem.value =
                    d?.errors?.imagem?.[0] ||
                    d?.errors?.img?.[0] ||
                    d?.message ||
                    "Não foi possível enviar a imagem.";
            } else {
                erroImagem.value = "Erro ao enviar a imagem.";
            }
            throw e;
        } finally {
            salvandoImagem.value = false;
        }
    }

    return {
        carregar,
        atualizarContato,
        alterarSenha,
        enviarImagem,
        perfil,
        carregando,
        salvandoContato,
        salvandoSenha,
        salvandoImagem,
        erro,
        erroContato,
        erroSenha,
        erroSenhaCampos,
        erroImagem,
        sucessoContato,
        sucessoSenha,
        sucessoImagem
    };
}
