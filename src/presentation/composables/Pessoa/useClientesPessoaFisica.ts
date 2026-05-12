import { inject, ref } from "vue";
import axios from "axios";
import { PessoaPostRequestDTO } from "@/application/dto/Pessoa/PessoaPostRequestDTO";
import { UsuarioPostRequestDTO } from "@/application/dto/Usuario/UsuarioPostRequestDTO";
import { PersistPessoaUseCase } from "@/application/use-cases/Pessoa/PersistPessoaUseCase";
import { ListarPessoasUseCase } from "@/application/use-cases/Pessoa/ListarPessoasUseCase";
import type { PessoaListagemDTO } from "@/application/dto/Pessoa/PessoaListagemDTO";
import type { IPessoaRepository } from "@/domain/repositories/IPessoaRepository";
import { TipoUsuario } from "@/domain/types/TipoUsuario";
import type { ErroResponseDTO } from "@/domain/types/ErroResponseDTO";

const POR_PAGINA_PADRAO = 6;

export function useClientesPessoaFisica() {
    const repo = inject<IPessoaRepository>("IPessoaRepository");
    if (!repo) throw new Error("IPessoaRepository not provided");

    const persistirCaso = new PersistPessoaUseCase(repo);
    const listarCaso = new ListarPessoasUseCase(repo);

    const lista = ref<PessoaListagemDTO[]>([]);
    const carregandoLista = ref(false);
    const criando = ref(false);
    const erro = ref<string | null>(null);
    const sucesso = ref<string | null>(null);
    const erroCampos = ref<Record<string, string>>({});

    const paginaAtual = ref(1);
    const porPagina = ref(POR_PAGINA_PADRAO);
    const totalRegistros = ref(0);

    async function carregar(page = 1) {
        carregandoLista.value = true;
        erro.value = null;
        try {
            const resposta = await listarCaso.execute({
                page,
                per_page: porPagina.value
            });
            lista.value = resposta.pessoa;
            totalRegistros.value = resposta.total;
            paginaAtual.value = resposta.pagina;
            porPagina.value = resposta.porPagina || POR_PAGINA_PADRAO;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erro.value =
                    d?.message ?? "Nao foi possivel listar clientes pessoa fisica.";
            } else {
                erro.value = "Nao foi possivel listar clientes pessoa fisica.";
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
        erroCampos.value = {};
        try {
            await persistirCaso.execute(
                new PessoaPostRequestDTO(
                    payload.nome,
                    payload.cpf,
                    payload.data_nascimento,
                    payload.email,
                    payload.celular,
                    new UsuarioPostRequestDTO(
                        payload.senha,
                        payload.senha_confirmation,
                        TipoUsuario.CLIENTE
                    )
                )
            );
            sucesso.value = "Cliente pessoa fisica criado com sucesso.";
            await carregar(1);
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const d = e.response?.data as ErroResponseDTO | undefined;
                erroCampos.value = {
                    nome: d?.errors?.nome?.[0] ?? "",
                    cpf: d?.errors?.cpf?.[0] ?? "",
                    data_nascimento: d?.errors?.data_nascimento?.[0] ?? "",
                    email: d?.errors?.email?.[0] ?? "",
                    celular: d?.errors?.celular?.[0] ?? "",
                    senha: d?.errors?.["usuario.senha"]?.[0] ?? "",
                    senha_confirmation:
                        d?.errors?.["usuario.senha_confirmation"]?.[0] ?? ""
                };
                erro.value =
                    erroCampos.value.nome ||
                    erroCampos.value.cpf ||
                    erroCampos.value.email ||
                    erroCampos.value.celular ||
                    erroCampos.value.senha ||
                    erroCampos.value.senha_confirmation ||
                    d?.message ||
                    "Nao foi possivel criar cliente pessoa fisica.";
            } else {
                erro.value = "Nao foi possivel criar cliente pessoa fisica.";
            }
            throw e;
        } finally {
            criando.value = false;
        }
    }

    const totalPaginas = () =>
        Math.max(1, Math.ceil(totalRegistros.value / (porPagina.value || 1)));

    async function irParaPagina(page: number) {
        if (page < 1 || page > totalPaginas()) return;
        await carregar(page);
    }

    return {
        lista,
        carregandoLista,
        criando,
        erro,
        sucesso,
        erroCampos,
        paginaAtual,
        porPagina,
        totalRegistros,
        totalPaginas,
        carregar,
        criar,
        irParaPagina
    };
}
