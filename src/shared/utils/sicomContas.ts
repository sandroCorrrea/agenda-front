import type { SicomContaDicionario, SicomContaSemVinculo } from "@/domain/sicom/contas";

export const TAMANHO_PAGINA_CONTAS = 20;

export function textoPreenchido(valor: string | null | undefined): boolean {
    return valor != null && valor.trim() !== "";
}

export function campoRegistro(valor: string): string {
    return valor.trim() === "" ? "—" : valor;
}

export function camposVisiveis(registro: string[]): string[] {
    return registro.map((campo) => campo.trim()).filter((campo) => campo !== "");
}

export function seloDesdobramento(conta: Pick<SicomContaDicionario, "desdobramento" | "rotuloDesdobramento">): string | null {
    const digito = textoPreenchido(conta.desdobramento) ? conta.desdobramento : null;
    const rotulo = textoPreenchido(conta.rotuloDesdobramento) ? conta.rotuloDesdobramento : null;
    if (rotulo && digito) return `${digito} · ${rotulo}`;
    if (rotulo) return rotulo;
    if (digito) return `desdobramento ${digito}`;
    return null;
}

export function partesCaminho(conta: Pick<SicomContaDicionario, "caminho" | "classificacao">): string[] {
    if (textoPreenchido(conta.caminho)) {
        return conta.caminho!
            .split("›")
            .map((parte) => parte.trim())
            .filter((parte) => parte !== "");
    }
    return conta.classificacao
        .map((item) => item.nome)
        .filter((nome): nome is string => textoPreenchido(nome));
}

export function paresEmentario(conta: Record<string, string | null>): Array<[string, string]> {
    return Object.entries(conta).filter((entrada): entrada is [string, string] => textoPreenchido(entrada[1]));
}

export function filtrarDicionario(
    contas: SicomContaDicionario[],
    busca: string,
    arquivo: string | null
): SicomContaDicionario[] {
    const termo = busca.trim().toLowerCase();
    const saida: SicomContaDicionario[] = [];
    for (const conta of contas) {
        const ocorrencias = arquivo == null ? conta.ocorrencias : conta.ocorrencias.filter((item) => item.arquivo === arquivo);
        if (arquivo != null && ocorrencias.length === 0) continue;
        if (termo) {
            const alvo = [
                conta.codigoInformado,
                conta.codigoConta,
                conta.especificacao,
                conta.rotuloDesdobramento,
                conta.caminho,
                ...ocorrencias.flatMap((item) => [item.nomeNaRemessa, item.arquivo])
            ]
                .filter((item): item is string => item != null)
                .join("\n")
                .toLowerCase();
            if (!alvo.includes(termo)) continue;
        }
        saida.push(arquivo == null ? conta : { ...conta, ocorrencias });
    }
    return saida;
}

export function textoSemVinculo(item: SicomContaSemVinculo): string {
    const linha = item.linha == null ? "—" : String(item.linha);
    const codigo = textoPreenchido(item.codigoInformado) ? item.codigoInformado : "—";
    const base = `Linha ${linha} · código ${codigo} · sem conta neste ementário.`;
    const contexto = item.registro
        .map((campo) => campo.trim())
        .filter((campo) => campo !== "" && !/^[\d.,]+$/.test(campo))
        .sort((a, b) => b.length - a.length)[0];
    return contexto ? `${base} ${contexto}` : base;
}

export function semVinculoVisiveis(arquivos: { arquivo: string | null; semVinculo: SicomContaSemVinculo[] }[], arquivo: string | null) {
    return arquivos
        .filter((item) => arquivo == null || item.arquivo === arquivo)
        .flatMap((item) => item.semVinculo);
}
