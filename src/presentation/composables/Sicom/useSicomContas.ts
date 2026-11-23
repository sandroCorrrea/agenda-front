import { ref } from "vue";
import axios from "axios";
import { BaixarReceitaOrcamentariaUseCase } from "@/application/use-cases/Casp/ReceitaOrcamentariaUseCases";
import { ConsultarEmentarioSicomUseCase } from "@/application/use-cases/Sicom/SicomUseCases";
import type { ReceitaOrcamentariaArquivo } from "@/domain/casp/receitaOrcamentaria";
import type { SicomContasResposta } from "@/domain/sicom/contas";
import { useReceitaOrcamentariaRepository } from "@/presentation/composables/Casp/useReceitaOrcamentariaRepository";
import { useSicomRepository } from "@/presentation/composables/Sicom/useSicomRepository";
import { extensaoAceita } from "@/shared/utils/sicomValidacao";

const MENSAGEM_TECNICA = "Não foi possível consultar o ementário.";
const TIPO_PLANILHA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function mensagemFalha(erro: unknown): string {
    if (axios.isAxiosError(erro)) return MENSAGEM_TECNICA;
    if (erro instanceof Error && erro.message.trim()) return erro.message;
    return MENSAGEM_TECNICA;
}

export function useSicomContas() {
    const consultarEmentario = new ConsultarEmentarioSicomUseCase(useSicomRepository());
    const baixarReceita = new BaixarReceitaOrcamentariaUseCase(useReceitaOrcamentariaRepository());
    const consultando = ref(false);
    const resultado = ref<SicomContasResposta | null>(null);
    const falhaTecnica = ref<string | null>(null);
    const campo = ref<string | null>(null);

    function limpar() {
        resultado.value = null;
        falhaTecnica.value = null;
        campo.value = null;
    }

    async function consultarEnviada(remessa: File, receita: ReceitaOrcamentariaArquivo) {
        resultado.value = null;
        falhaTecnica.value = null;
        campo.value = null;
        consultando.value = true;
        try {
            const baixado = await baixarReceita.execute(receita.id, receita.nomeOriginal);
            const nome = baixado.filename || receita.nomeOriginal;
            const arquivo = new File([baixado.blob], nome, { type: baixado.blob.type || TIPO_PLANILHA });
            if (!extensaoAceita(arquivo.name, ".xlsx")) {
                campo.value = "O ementário precisa ser um arquivo XLSX.";
                return;
            }
            const resposta = await consultarEmentario.execute(remessa, arquivo);
            if (resposta.status == null) {
                falhaTecnica.value = MENSAGEM_TECNICA;
                return;
            }
            resultado.value = resposta;
        } catch (erro: unknown) {
            resultado.value = null;
            falhaTecnica.value = mensagemFalha(erro);
        } finally {
            consultando.value = false;
        }
    }

    return { consultando, resultado, falhaTecnica, campo, consultarEnviada, limpar };
}
