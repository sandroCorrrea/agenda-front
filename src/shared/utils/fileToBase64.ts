/**
 * Converte um `File` em data URL Base64 (`data:<mime>;base64,...`).
 *
 * Usado quando precisamos enviar a imagem por JSON (`imagem_base64`) em vez
 * de multipart, evitando os limites `upload_max_filesize` / `post_max_size`
 * do PHP no backend.
 */
export function fileToBase64DataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Não foi possível ler o arquivo como Base64."));
            }
        };
        reader.onerror = () =>
            reject(reader.error ?? new Error("Erro ao ler o arquivo."));
        reader.onabort = () =>
            reject(new Error("Leitura do arquivo cancelada."));
        reader.readAsDataURL(file);
    });
}
