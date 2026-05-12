import { ref, watch } from "vue";
import { cepMask, onlyNumbers } from "@/shared/utils/masks";

/** Campos mínimos do formulário para preenchimento a partir do ViaCEP. */
export type FormComCepEndereco = {
    cep: string;
    rua: string;
    bairro: string;
    cidade: string;
    uf: string;
};

/**
 * Máscara de CEP, busca ViaCEP e preenchimento de logradouro/bairro/cidade/UF.
 * Dispara busca automática (debounce) quando o CEP tem 8 dígitos.
 */
export function useViaCepEndereco(form: FormComCepEndereco) {
    const carregandoCep = ref(false);
    const erroCep = ref<string | null>(null);

    function aoDigitarCep(e: Event) {
        const input = e.target as HTMLInputElement;
        form.cep = cepMask(input.value);
    }

    async function buscarCep() {
        const cep = onlyNumbers(form.cep);
        if (cep.length !== 8) return;
        carregandoCep.value = true;
        erroCep.value = null;
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!res.ok) throw new Error("Falha na consulta.");
            const data = (await res.json()) as {
                erro?: boolean;
                logradouro?: string;
                bairro?: string;
                localidade?: string;
                uf?: string;
            };
            if (data.erro) {
                erroCep.value = "CEP não encontrado.";
                return;
            }
            form.rua = data.logradouro ?? "";
            form.bairro = data.bairro ?? "";
            form.cidade = data.localidade ?? "";
            form.uf = (data.uf ?? "").toUpperCase();
        } catch {
            erroCep.value = "Não foi possível consultar o CEP.";
        } finally {
            carregandoCep.value = false;
        }
    }

    let debounceId: ReturnType<typeof setTimeout> | null = null;
    watch(
        () => onlyNumbers(form.cep),
        (n) => {
            if (debounceId) clearTimeout(debounceId);
            if (n.length !== 8) return;
            debounceId = setTimeout(() => {
                debounceId = null;
                void buscarCep();
            }, 450);
        }
    );

    return {
        carregandoCep,
        erroCep,
        aoDigitarCep,
        buscarCep
    };
}
