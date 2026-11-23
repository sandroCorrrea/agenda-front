import { ref } from "vue";
import axios from "axios";
import { BaixarReceitaOrcamentariaUseCase } from "@/application/use-cases/Casp/ReceitaOrcamentariaUseCases";
import { GerarRelatorioSicomUseCase } from "@/application/use-cases/Sicom/SicomUseCases";
import type { ReceitaOrcamentariaArquivo } from "@/domain/casp/receitaOrcamentaria";
import type { SicomRelatorioResposta } from "@/domain/sicom/relatorio";
import { useReceitaOrcamentariaRepository } from "@/presentation/composables/Casp/useReceitaOrcamentariaRepository";
import { useSicomRepository } from "@/presentation/composables/Sicom/useSicomRepository";
import { extensaoAceita } from "@/shared/utils/sicomValidacao";

const MENSAGEM_TECNICA = "Não foi possível gerar o relatório.";
const TIPO_PLANILHA = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function mensagemFalha(erro: unknown): string {
    if (axios.isAxiosError(erro)) return MENSAGEM_TECNICA;
    if (erro instanceof Error && erro.message.trim()) return erro.message;
    return MENSAGEM_TECNICA;
}

export function useSicomRelatorio() {
    const gerarRelatorio = new GerarRelatorioSicomUseCase(useSicomRepository());
    const baixarReceita = new BaixarReceitaOrcamentariaUseCase(useReceitaOrcamentariaRepository());
    const gerando = ref(false);
    const resultado = ref<SicomRelatorioResposta | null>(null);
    const falhaTecnica = ref<string | null>(null);
    const campo = ref<string | null>(null);

    function limpar() {
        resultado.value = null;
        falhaTecnica.value = null;
        campo.value = null;
    }

    async function gerar(remessa: File, receita: ReceitaOrcamentariaArquivo) {
        resultado.value = null;
        falhaTecnica.value = null;
        campo.value = null;
        gerando.value = true;
        try {
            const baixado = await baixarReceita.execute(receita.id, receita.nomeOriginal);
            const nome = baixado.filename || receita.nomeOriginal;
            const arquivo = new File([baixado.blob], nome, { type: baixado.blob.type || TIPO_PLANILHA });
            if (!extensaoAceita(arquivo.name, ".xlsx")) {
                campo.value = "O ementário precisa ser um arquivo XLSX.";
                return;
            }
            const resposta = await gerarRelatorio.execute(remessa, arquivo);
            if (resposta.status == null) {
                falhaTecnica.value = MENSAGEM_TECNICA;
                return;
            }
            resultado.value = resposta;
        } catch (erro: unknown) {
            resultado.value = null;
            falhaTecnica.value = mensagemFalha(erro);
        } finally {
            gerando.value = false;
        }
    }

    return { gerando, resultado, falhaTecnica, campo, gerar, limpar };
}
