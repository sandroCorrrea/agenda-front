import { ref } from "vue";
import { ValidarRemessaSicomUseCase } from "@/application/use-cases/Sicom/SicomUseCases";
import type { SicomValidacaoResposta } from "@/domain/sicom/validacao";
import { useSicomRepository } from "@/presentation/composables/Sicom/useSicomRepository";
import { extensaoAceita } from "@/shared/utils/sicomValidacao";

const MENSAGEM_TECNICA = "Não foi possível validar a remessa.";

export function useSicomValidacao() {
    const validarRemessa = new ValidarRemessaSicomUseCase(useSicomRepository());
    const validando = ref(false);
    const resultado = ref<SicomValidacaoResposta | null>(null);
    const falhaTecnica = ref<string | null>(null);
    const campos = ref<{ manual?: string; remessa?: string }>({});

    async function validar(manual: File, remessa: File) {
        resultado.value = null;
        falhaTecnica.value = null;
        const recusa: { manual?: string; remessa?: string } = {};
        if (!extensaoAceita(manual.name, ".pdf")) {
            recusa.manual = "O manual precisa estar no formato PDF.";
        }
        if (!extensaoAceita(remessa.name, ".zip")) {
            recusa.remessa = "A remessa precisa ser um arquivo ZIP.";
        }
        campos.value = recusa;
        if (recusa.manual || recusa.remessa) return;

        validando.value = true;
        try {
            const resposta = await validarRemessa.execute(manual, remessa);
            if (resposta.status == null) {
                falhaTecnica.value = MENSAGEM_TECNICA;
                return;
            }
            resultado.value = resposta;
        } catch (erro: unknown) {
            resultado.value = null;
            const mensagem = erro instanceof Error ? erro.message : "";
            falhaTecnica.value =
                mensagem.startsWith("Defina VITE_MANUAL_API_URL") || mensagem.startsWith("VITE_MANUAL_API_URL inválida")
                    ? mensagem
                    : MENSAGEM_TECNICA;
        } finally {
            validando.value = false;
        }
    }

    function limpar() {
        resultado.value = null;
        falhaTecnica.value = null;
        campos.value = {};
    }

    return { validando, resultado, falhaTecnica, campos, validar, limpar };
}
