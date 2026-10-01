import type { PesquisaStatus, TipoPergunta } from "@/domain/politica/tipos";

export const TIPOS_ELEICAO = [
    { value: "municipal", label: "Municipal" },
    { value: "estadual", label: "Estadual" },
    { value: "federal", label: "Federal" },
    { value: "geral", label: "Geral" }
] as const;

export const STATUS_ELEICAO = [
    { value: "rascunho", label: "Rascunho" },
    { value: "aberta", label: "Aberta" },
    { value: "encerrada", label: "Encerrada" }
] as const;

export const ESFERAS_CARGO = [
    { value: "federal", label: "Federal" },
    { value: "estadual", label: "Estadual" },
    { value: "municipal", label: "Municipal" }
] as const;

export const STATUS_PARTIDO = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" }
] as const;

export const STATUS_CANDIDATO = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" },
    { value: "indeferido", label: "Indeferido" }
] as const;

export const TIPOS_PESQUISA = [
    { value: "interna", label: "Interna" },
    { value: "divulgacao_publica", label: "Divulgação pública" }
] as const;

export const ESTRATEGIAS_DUPLICIDADE = [
    { value: "nenhuma", label: "Nenhuma — um envio novo a cada conclusão" },
    { value: "sessao", label: "Sessão do navegador" },
    { value: "cookie", label: "Cookie (a sessão confiável continua no navegador)" },
    { value: "token", label: "Token de acesso, consumido ao concluir" }
] as const;

export const TIPOS_PERGUNTA: { value: TipoPergunta; label: string; comOpcoes: boolean }[] = [
    { value: "escolha_unica", label: "Escolha única", comOpcoes: true },
    { value: "escolha_multipla", label: "Escolha múltipla", comOpcoes: true },
    { value: "texto", label: "Texto livre", comOpcoes: false },
    { value: "numero", label: "Número", comOpcoes: false },
    { value: "escala", label: "Escala", comOpcoes: false },
    { value: "candidato", label: "Candidato", comOpcoes: true },
    { value: "municipio", label: "Município", comOpcoes: true },
    { value: "faixa_etaria", label: "Faixa etária", comOpcoes: true },
    { value: "genero", label: "Gênero", comOpcoes: true },
    { value: "escolaridade", label: "Escolaridade", comOpcoes: true },
    { value: "renda", label: "Renda", comOpcoes: true },
    { value: "sim_nao", label: "Sim ou não", comOpcoes: true }
];

export function rotuloDe(lista: readonly { value: string; label: string }[], valor: string): string {
    return lista.find((item) => item.value === valor)?.label ?? valor;
}

export function tipoPerguntaPedeOpcoes(tipo: string): boolean {
    return TIPOS_PERGUNTA.find((item) => item.value === tipo)?.comOpcoes ?? false;
}

export function transicoesStatus(status: string): PesquisaStatus[] {
    switch (status) {
        case "rascunho":
            return ["publicada", "arquivada"];
        case "publicada":
            return ["pausada", "encerrada", "arquivada"];
        case "pausada":
            return ["publicada", "encerrada", "arquivada"];
        case "encerrada":
            return ["arquivada"];
        default:
            return [];
    }
}

export function classeStatusPolitica(status: string): string {
    if (["aberta", "ativo", "publicada"].includes(status)) return "pol-badge pol-badge--on";
    if (["encerrada", "indeferido", "arquivada", "inativo"].includes(status)) return "pol-badge pol-badge--off";
    if (["pausada", "rascunho"].includes(status)) return "pol-badge pol-badge--wait";
    return "pol-badge pol-badge--off";
}

export function rotuloStatusPesquisa(status: string): string {
    const mapa: Record<string, string> = {
        rascunho: "Rascunho",
        publicada: "Publicada",
        pausada: "Pausada",
        encerrada: "Encerrada",
        arquivada: "Arquivada"
    };
    return mapa[status] ?? status;
}

export function rotuloAcaoStatus(status: string): string {
    const mapa: Record<string, string> = {
        publicada: "Publicar",
        pausada: "Pausar",
        encerrada: "Encerrar",
        arquivada: "Arquivar"
    };
    return mapa[status] ?? status;
}

export function formatarDataCurta(valor: string | null | undefined): string {
    if (!valor) return "—";
    const data = new Date(valor.includes("T") ? valor : valor.replace(" ", "T"));
    if (Number.isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(data);
}

export function paraCampoDataHora(valor: string | null | undefined): string {
    if (!valor) return "";
    const normalizado = valor.replace(" ", "T");
    return normalizado.slice(0, 16);
}

export function paraCampoData(valor: string | null | undefined): string {
    if (!valor) return "";
    return valor.slice(0, 10);
}

export function paraApiDataHora(valor: string): string | null {
    const limpo = valor.trim();
    if (!limpo) return null;
    return limpo.length === 16 ? `${limpo.replace("T", " ")}:00` : limpo;
}

export function linkPublicoPesquisa(token: string | null, linkApi: string | null): string {
    if (linkApi && linkApi.trim()) return linkApi.trim();
    if (!token) return "";
    if (typeof window === "undefined") return `/politica/${token}`;
    return `${window.location.origin}/politica/${token}`;
}

export function valorOpcao(rotulo: string): string {
    const base = rotulo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 120);
    return base || "opcao";
}
