import { computed, ref } from "vue";
import type { PesquisaRespostaSalvarDTO } from "@/application/dto/Politica/PoliticaRequestDTO";
import {
    EnviarRespostaPesquisaUseCase,
    ObterPesquisaPublicaUseCase
} from "@/application/use-cases/Politica/PoliticaUseCases";
import type { PesquisaDetalhe } from "@/domain/politica/tipos";
import { usePoliticaRepository } from "@/presentation/composables/Politica/usePoliticaRepository";
import { lerErroApi, tokenInvalido } from "@/shared/utils/apiMensagem";
import {
    chaveRascunhoPesquisa,
    chaveSessaoPesquisa,
    inferirEstrategia,
    resolverSessaoId,
    novoUuid
} from "@/shared/utils/politicaSessao";

export type RespostaLocal = {
    opcaoId: number | null;
    opcaoIds: number[];
    valorTexto: string;
    valorNumerico: number | null;
};

export type RascunhoPublico = {
    ibge: string | null;
    etapa: number;
    respostas: Record<string, RespostaLocal>;
    concluida: boolean;
    protocolo: number | null;
    mensagem: string | null;
};

function rascunhoVazio(): RascunhoPublico {
    return {
        ibge: null,
        etapa: 0,
        respostas: {},
        concluida: false,
        protocolo: null,
        mensagem: null
    };
}

export function usePesquisaPublica(token: () => string) {
    const repo = usePoliticaRepository();
    const obter = new ObterPesquisaPublicaUseCase(repo);
    const enviar = new EnviarRespostaPesquisaUseCase(repo);

    const pesquisa = ref<PesquisaDetalhe | null>(null);
    const rascunho = ref<RascunhoPublico>(rascunhoVazio());
    const sessaoId = ref("");
    const tokenAcesso = ref<string | null>(null);
    const carregando = ref(true);
    const enviando = ref(false);
    const erro = ref<string | null>(null);
    const bloqueio = ref<string | null>(null);

    const estrategia = computed(() =>
        inferirEstrategia(pesquisa.value?.sessaoSugerida ?? null, tokenAcesso.value)
    );

    function lerArmazenado() {
        try {
            const bruto = sessionStorage.getItem(chaveRascunhoPesquisa(token()));
            rascunho.value = bruto ? { ...rascunhoVazio(), ...JSON.parse(bruto) } : rascunhoVazio();
        } catch {
            rascunho.value = rascunhoVazio();
        }
        sessaoId.value = sessionStorage.getItem(chaveSessaoPesquisa(token())) ?? "";
    }

    function persistir() {
        sessionStorage.setItem(chaveRascunhoPesquisa(token()), JSON.stringify(rascunho.value));
        if (sessaoId.value) sessionStorage.setItem(chaveSessaoPesquisa(token()), sessaoId.value);
    }

    function prepararSessao(sugerida: string | null) {
        const armazenada = sessionStorage.getItem(chaveSessaoPesquisa(token()));
        if (rascunho.value.concluida && estrategia.value === "nenhuma") {
            sessaoId.value = novoUuid();
            rascunho.value = rascunhoVazio();
        } else {
            sessaoId.value = resolverSessaoId({
                armazenada,
                sessaoSugerida: sugerida,
                estrategia: estrategia.value
            });
        }
        persistir();
    }

    async function carregar() {
        carregando.value = true;
        erro.value = null;
        lerArmazenado();
        try {
            pesquisa.value = await obter.execute(token());
            tokenAcesso.value = pesquisa.value.tokenAcesso;
            prepararSessao(pesquisa.value.sessaoSugerida);
        } catch (e: unknown) {
            erro.value = lerErroApi(e, "Esta pesquisa não está disponível.").mensagem;
        } finally {
            carregando.value = false;
        }
    }

    function respostaDe(perguntaId: number): RespostaLocal {
        return (
            rascunho.value.respostas[String(perguntaId)] ?? {
                opcaoId: null,
                opcaoIds: [],
                valorTexto: "",
                valorNumerico: null
            }
        );
    }

    function definirResposta(perguntaId: number, resposta: RespostaLocal) {
        rascunho.value.respostas[String(perguntaId)] = resposta;
        persistir();
    }

    function definirIbge(ibge: string | null) {
        rascunho.value.ibge = ibge;
        persistir();
    }

    function definirEtapa(etapa: number) {
        rascunho.value.etapa = etapa;
        persistir();
    }

    function montarPayload(concluida: boolean, aceite: boolean): PesquisaRespostaSalvarDTO {
        const respostas = Object.entries(rascunho.value.respostas).flatMap(([id, resposta]) => {
            const perguntaId = Number(id);
            if (!Number.isFinite(perguntaId)) return [];
            const item: PesquisaRespostaSalvarDTO["respostas"][number] = { pergunta_id: perguntaId };
            if (resposta.opcaoIds.length > 1) item.opcao_ids = resposta.opcaoIds;
            else if (resposta.opcaoId != null) item.opcao_id = resposta.opcaoId;
            else if (resposta.opcaoIds.length === 1) item.opcao_id = resposta.opcaoIds[0];
            if (resposta.valorTexto.trim()) item.valor_texto = resposta.valorTexto.trim();
            if (resposta.valorNumerico != null && Number.isFinite(resposta.valorNumerico)) {
                item.valor_numerico = resposta.valorNumerico;
            }
            const temConteudo =
                item.opcao_id != null ||
                (item.opcao_ids?.length ?? 0) > 0 ||
                item.valor_texto != null ||
                item.valor_numerico != null;
            return temConteudo ? [item] : [];
        });

        return {
            sessao_id: sessaoId.value,
            concluida,
            aceite_privacidade: aceite,
            ibge: rascunho.value.ibge,
            token_acesso: tokenAcesso.value,
            respostas
        };
    }

    function marcarConcluida(mensagem: string | null, protocolo?: number | null) {
        rascunho.value.concluida = true;
        rascunho.value.mensagem = mensagem;
        rascunho.value.protocolo = protocolo ?? rascunho.value.protocolo;
        if (estrategia.value === "nenhuma") {
            sessionStorage.removeItem(chaveSessaoPesquisa(token()));
        }
        persistir();
    }

    async function enviarResposta(concluida: boolean, aceite = false, silencioso = false) {
        enviando.value = true;
        if (!silencioso) erro.value = null;
        try {
            const resp = await postar(concluida, aceite);
            if (concluida) marcarConcluida(resp.message, resp.protocolo);
            return resp;
        } catch (e: unknown) {
            const lido = lerErroApi(e, "Não foi possível enviar a resposta.");
            if (lido.status === 409) {
                marcarConcluida(lido.mensagem);
                return null;
            }
            if (!silencioso) erro.value = lido.mensagem;
            throw e;
        } finally {
            enviando.value = false;
        }
    }

    async function postar(concluida: boolean, aceite: boolean) {
        try {
            return await enviar.execute(token(), montarPayload(concluida, aceite));
        } catch (e: unknown) {
            const lido = lerErroApi(e, "Não foi possível enviar a resposta.");
            if (!tokenInvalido(lido)) throw e;
            pesquisa.value = await obter.execute(token());
            tokenAcesso.value = pesquisa.value.tokenAcesso;
            return enviar.execute(token(), montarPayload(concluida, aceite));
        }
    }

    return {
        pesquisa,
        rascunho,
        sessaoId,
        carregando,
        enviando,
        erro,
        bloqueio,
        estrategia,
        carregar,
        respostaDe,
        definirResposta,
        definirIbge,
        definirEtapa,
        enviarResposta,
        persistir
    };
}
