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

/** Fallback local (caso /opcoes ainda não tenha carregado). */
export const PUBLICO_BENEFICIADO_LABELS: Record<string, string> = {
    criancas: "Crianças",
    adolescentes: "Adolescentes",
    jovens: "Jovens",
    mulheres: "Mulheres",
    idosos: "Idosos",
    agricultores: "Agricultores",
    pessoas_com_deficiencia: "Pessoas com deficiência",
    populacao_geral: "População em geral",
    outro: "Outro"
};

/** Normaliza string | array | CSV legado em lista de values. */
export function normalizarPublicoBeneficiado(
    values: string | string[] | null | undefined
): string[] {
    if (values == null) return [];
    const bruto = Array.isArray(values) ? values : [values];
    const out: string[] = [];
    for (const item of bruto) {
        const texto = String(item ?? "").trim();
        if (!texto) continue;
        if (texto.includes(",")) {
            for (const parte of texto.split(",")) {
                const v = parte.trim();
                if (v && !out.includes(v)) out.push(v);
            }
        } else if (!out.includes(texto)) {
            out.push(texto);
        }
    }
    return out;
}

export function labelDeOpcao(
    opcoes: ParticipacaoValueLabelDTO[] | undefined,
    value: string | null | undefined
): string {
    if (!value) return "—";
    return (
        opcoes?.find((o) => o.value === value)?.label ??
        PUBLICO_BENEFICIADO_LABELS[value] ??
        value
    );
}

export function labelPublicoBeneficiado(
    value: string,
    opcoes?: ParticipacaoValueLabelDTO[]
): string {
    return (
        opcoes?.find((o) => o.value === value)?.label ??
        PUBLICO_BENEFICIADO_LABELS[value] ??
        value.replace(/_/g, " ")
    );
}

/** Labels em texto (ex.: relatórios). Preferir chips na UI. */
export function labelsDeOpcoes(
    opcoes: ParticipacaoValueLabelDTO[] | undefined,
    values: string | string[] | null | undefined
): string {
    const lista = normalizarPublicoBeneficiado(values);
    if (lista.length === 0) return "—";
    return lista.map((v) => labelPublicoBeneficiado(v, opcoes)).join(" · ");
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
