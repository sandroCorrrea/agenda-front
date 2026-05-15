/**
 * Traduz mensagens conhecidas do Laravel relacionadas ao campo `imagem` /
 * `imagem_base64` do carrossel para um texto mais útil em PT-BR.
 *
 * Quando o multipart cai por limite do PHP (`uploaded` / `failed to upload`),
 * o repositório do front re-tenta automaticamente em Base64. Se ainda assim
 * vier um erro do servidor, mostramos uma mensagem mais clara.
 */
export function traduzirErroImagemCarrossel(
    mensagem: string | null | undefined
): string {
    const raw = (mensagem ?? "").trim();
    if (!raw) return "";

    const lower = raw.toLowerCase();

    if (lower.includes("failed to upload") || lower.includes("uploaded")) {
        return (
            "Falha no upload da imagem mesmo após tentativa em Base64. " +
            "Verifique o tamanho do arquivo e os limites do servidor."
        );
    }
    if (
        lower.includes("base64") &&
        (lower.includes("inválid") || lower.includes("invalid") || lower.includes("decod"))
    ) {
        return "O arquivo enviado não pôde ser lido como imagem Base64 válida.";
    }
    if (lower.includes("must be an image")) {
        return "O arquivo enviado precisa ser uma imagem válida (JPG, PNG ou WEBP).";
    }
    if (lower.includes("must be a file of type")) {
        return "Formato não suportado. Envie JPG, PNG ou WEBP.";
    }
    if (lower.includes("may not be greater than") && lower.includes("kilobytes")) {
        return "Imagem acima do tamanho permitido (máximo 15 MB).";
    }
    if (lower.includes("required")) {
        return "Selecione uma imagem para enviar.";
    }

    return raw;
}
