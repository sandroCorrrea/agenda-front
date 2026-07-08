import type { ParticipacaoOpcoesResponseDTO } from "@/application/dto/Participacao/ParticipacaoOpcoesResponseDTO";
import type { ParticipacaoValueLabelDTO } from "@/application/dto/Participacao/ParticipacaoValueLabelDTO";

export const STATUS_PARTICIPACAO_LABELS: Record<string, string> = {
    pendente: "Pendente",
    em_analise: "Em análise",
    atendida: "Atendida",
    nao_atendida: "Não atendida"
};

export const STATUS_PARTICIPACAO_DESCRICAO: Record<string, string> = {
    pendente:
        "Sua proposta foi recebida e aguarda início da análise técnica pela administração municipal.",
    em_analise:
        "A equipe técnica está avaliando a viabilidade e a aderência aos instrumentos de planejamento.",
    atendida:
        "A proposta foi considerada atendida no âmbito da análise técnica realizada pelo Município.",
    nao_atendida:
        "Após análise, a proposta não foi atendida neste momento, observadas a viabilidade técnica, jurídica e orçamentária."
};

export const STATUS_PARTICIPACAO_ORDEM = [
    "pendente",
    "em_analise",
    "atendida"
] as const;

export const NATUREZA_DESPESA_OPCOES: ParticipacaoValueLabelDTO[] = [
    { value: "custeio", label: "Custeio" },
    { value: "investimento", label: "Investimento" }
];

export const CATEGORIA_ECONOMICA_OPCOES: ParticipacaoValueLabelDTO[] = [
    { value: "corrente", label: "Corrente" },
    { value: "capital", label: "Capital" }
];

export const STATUS_ANALISE_OPCOES: ParticipacaoValueLabelDTO[] = [
    { value: "pendente", label: "Pendente" },
    { value: "em_analise", label: "Em análise" },
    { value: "atendida", label: "Atendida" },
    { value: "nao_atendida", label: "Não atendida" }
];

export function labelDeOpcao(
    opcoes: ParticipacaoValueLabelDTO[] | undefined,
    value: string | null | undefined
): string {
    if (!value) return "—";
    return opcoes?.find((o) => o.value === value)?.label ?? value;
}

export function labelFuncao(
    opcoes: ParticipacaoOpcoesResponseDTO | null,
    id: number | null | undefined
): string {
    if (!opcoes || id == null) return "—";
    const f = opcoes.funcao.find((item) => item.id === id);
    if (!f) return "—";
    return `${f.codigo} — ${f.nome}`;
}

export function exercicioPadraoParticipacao(): number {
    return new Date().getFullYear() + 1;
}
