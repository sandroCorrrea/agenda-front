import { CriarParticipacaoUseCase } from "@/application/use-cases/Participacao/CriarParticipacaoUseCase";
import { GetParticipacaoOpcoesUseCase } from "@/application/use-cases/Participacao/GetParticipacaoOpcoesUseCase";
import { ParticipacaoPostRequestDTO } from "@/application/dto/Participacao/ParticipacaoPostRequestDTO";
import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { ParticipacaoPostResponseDTO } from "@/application/dto/Participacao/ParticipacaoPostResponseDTO";
import type { IParticipacaoRepository } from "@/domain/repositories/IParticipacaoRepository";
import { exercicioPadraoParticipacao } from "@/shared/utils/participacaoLabels";
import axios from "axios";
import { inject, reactive, ref } from "vue";

export type ParticipacaoFormState = {
    nome: string;
    bairro_comunidade: string;
    faixa_etaria: string;
    sexo: string;
    email: string;
    telefone: string;
    localidade_atendida: string;
    localidade_descricao: string;
    participacao_funcao_id: number | null;
    tipo_demanda: string;
    problema: string;
    solucao: string;
    beneficios: string;
    publico_beneficiado: string[];
    prioridade: string;
    abrangencia: string;
    deseja_info_audiencia: boolean;
    autoriza_lgpd: boolean;
    aceite_viabilidade: boolean;
    instrumento: string;
    exercicio: number;
};

function formInicial(): ParticipacaoFormState {
    return {
        nome: "",
        bairro_comunidade: "",
        faixa_etaria: "",
        sexo: "",
        email: "",
        telefone: "",
        localidade_atendida: "",
        localidade_descricao: "",
        participacao_funcao_id: null,
        tipo_demanda: "",
        problema: "",
        solucao: "",
        beneficios: "",
        publico_beneficiado: [],
        prioridade: "",
        abrangencia: "",
        deseja_info_audiencia: false,
        autoriza_lgpd: false,
        aceite_viabilidade: false,
        instrumento: "LOA",
        exercicio: exercicioPadraoParticipacao()
    };
}

function extrairErrosCampo(errors: Record<string, string[]> | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!errors) return out;
    for (const [campo, msgs] of Object.entries(errors)) {
        if (!msgs?.[0]) continue;
        // Laravel pode retornar "publico_beneficiado.0" para arrays
        const chave = campo.includes(".") ? campo.split(".")[0]! : campo;
        if (!out[chave]) out[chave] = msgs[0];
    }
    return out;
}

export function useParticipacaoForm() {
    const repo = inject<IParticipacaoRepository | null>("IParticipacaoRepository", null);
    if (!repo) throw new Error("IParticipacaoRepository not found");

    const getOpcoesCaso = new GetParticipacaoOpcoesUseCase(repo);
    const criarCaso = new CriarParticipacaoUseCase(repo);

    const opcoes = ref<ParticipacaoOpcoesResponseDTO | null>(null);
    const carregandoOpcoes = ref(false);
    const enviando = ref(false);
    const erroGeral = ref<string | null>(null);
    const errosCampo = reactive<Record<string, string>>({});
    const resultado = ref<ParticipacaoPostResponseDTO | null>(null);
    const form = reactive<ParticipacaoFormState>(formInicial());

    function limparErros() {
        erroGeral.value = null;
        for (const key of Object.keys(errosCampo)) {
            delete errosCampo[key];
        }
    }

    function resetarFormulario() {
        Object.assign(form, formInicial());
        resultado.value = null;
        limparErros();
    }

    async function carregarOpcoes() {
        carregandoOpcoes.value = true;
        erroGeral.value = null;
        try {
            opcoes.value = await getOpcoesCaso.execute();
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const data = e.response?.data as { message?: string } | undefined;
                erroGeral.value =
                    data?.message ?? "Não foi possível carregar as opções do formulário.";
            } else {
                erroGeral.value = "Não foi possível carregar as opções do formulário.";
            }
            throw e;
        } finally {
            carregandoOpcoes.value = false;
        }
    }

    function validarCliente(): boolean {
        limparErros();
        let ok = true;

        const exigir = (campo: string, condicao: boolean, msg: string) => {
            if (!condicao) {
                errosCampo[campo] = msg;
                ok = false;
            }
        };

        exigir(
            "bairro_comunidade",
            form.bairro_comunidade.trim().length > 0,
            "Informe o bairro ou comunidade rural."
        );
        exigir("faixa_etaria", Boolean(form.faixa_etaria), "Selecione a faixa etária.");
        exigir(
            "localidade_atendida",
            Boolean(form.localidade_atendida),
            "Selecione a localidade atendida."
        );
        exigir(
            "participacao_funcao_id",
            form.participacao_funcao_id != null && form.participacao_funcao_id > 0,
            "Selecione a área temática."
        );
        exigir("tipo_demanda", Boolean(form.tipo_demanda), "Selecione o tipo da demanda.");
        exigir("problema", form.problema.trim().length >= 10, "Descreva o problema (mín. 10 caracteres).");
        exigir("solucao", form.solucao.trim().length >= 10, "Descreva a solução (mín. 10 caracteres).");
        exigir(
            "beneficios",
            form.beneficios.trim().length >= 10,
            "Descreva os benefícios (mín. 10 caracteres)."
        );
        exigir(
            "publico_beneficiado",
            form.publico_beneficiado.length > 0,
            "Selecione ao menos um público beneficiado."
        );
        exigir("prioridade", Boolean(form.prioridade), "Selecione o grau de prioridade.");
        exigir("abrangencia", Boolean(form.abrangencia), "Selecione a abrangência.");
        exigir("autoriza_lgpd", form.autoriza_lgpd === true, "É necessário autorizar o tratamento dos dados (LGPD).");
        exigir(
            "aceite_viabilidade",
            form.aceite_viabilidade === true,
            "É necessário declarar ciência sobre a viabilidade."
        );

        if (form.deseja_info_audiencia) {
            const emailOk = /\S+@\S+\.\S+/.test(form.email.trim());
            exigir(
                "email",
                emailOk,
                "Informe o e-mail para receber informações sobre a audiência pública."
            );
        } else if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
            errosCampo.email = "Informe um e-mail válido.";
            ok = false;
        }

        return ok;
    }

    async function enviar(): Promise<ParticipacaoPostResponseDTO | null> {
        if (!validarCliente()) {
            erroGeral.value = "Revise os campos destacados antes de enviar.";
            return null;
        }

        enviando.value = true;
        limparErros();
        try {
            const dto = new ParticipacaoPostRequestDTO(
                form.bairro_comunidade.trim(),
                form.faixa_etaria,
                form.localidade_atendida,
                Number(form.participacao_funcao_id),
                form.tipo_demanda,
                form.problema.trim(),
                form.solucao.trim(),
                form.beneficios.trim(),
                [...form.publico_beneficiado],
                form.prioridade,
                form.abrangencia,
                true,
                true,
                form.nome.trim() || null,
                form.sexo || null,
                form.email.trim() || null,
                form.telefone.trim() || null,
                form.localidade_descricao.trim() || null,
                form.deseja_info_audiencia,
                form.instrumento || "LOA",
                form.exercicio || exercicioPadraoParticipacao()
            );

            const criado = await criarCaso.execute(dto);
            resultado.value = criado;
            return criado;
        } catch (e: unknown) {
            if (axios.isAxiosError(e)) {
                const status = e.response?.status;
                const data = e.response?.data as
                    | { message?: string; errors?: Record<string, string[]> }
                    | undefined;

                if (status === 429) {
                    erroGeral.value =
                        "Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.";
                } else {
                    Object.assign(errosCampo, extrairErrosCampo(data?.errors));
                    erroGeral.value =
                        data?.message ??
                        "Não foi possível registrar a proposta. Verifique os dados e tente novamente.";
                }
            } else {
                erroGeral.value = "Não foi possível registrar a proposta.";
            }
            return null;
        } finally {
            enviando.value = false;
        }
    }

    return {
        form,
        opcoes,
        carregandoOpcoes,
        enviando,
        erroGeral,
        errosCampo,
        resultado,
        carregarOpcoes,
        enviar,
        resetarFormulario,
        limparErros
    };
}
