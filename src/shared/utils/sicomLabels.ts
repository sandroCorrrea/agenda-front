export function formatarBytes(valor: number | null): string {
    if (valor == null) return "—";
    if (valor < 1024) return `${valor.toLocaleString("pt-BR")} B`;
    const unidades = ["KB", "MB", "GB"];
    let tamanho = valor / 1024;
    let indice = 0;
    while (tamanho >= 1024 && indice < unidades.length - 1) {
        tamanho /= 1024;
        indice += 1;
    }
    return `${tamanho.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${unidades[indice]}`;
}
