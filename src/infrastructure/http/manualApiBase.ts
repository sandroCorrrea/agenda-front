const PRODUCAO = "https://manual-service.onrender.com";

export function exigirProducao(normalizada: string, modo: string): string {
    if (normalizada !== PRODUCAO) {
        throw new Error(`VITE_MANUAL_API_URL inválida para o modo ${modo}.`);
    }
    return PRODUCAO;
}

export function resolverBaseManual(valor: string | undefined, modo = import.meta.env.MODE): string {
    const bruto = (valor ?? "").trim();
    if (!bruto) {
        throw new Error(`Defina VITE_MANUAL_API_URL. Modo do Vite: ${modo}.`);
    }

    let url: URL;
    try {
        url = new URL(bruto);
    } catch {
        throw new Error(`VITE_MANUAL_API_URL inválida para o modo ${modo}.`);
    }

    if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password || url.search || url.hash) {
        throw new Error(`VITE_MANUAL_API_URL inválida para o modo ${modo}.`);
    }
    if (url.pathname !== "/" && url.pathname !== "") {
        throw new Error(`VITE_MANUAL_API_URL inválida para o modo ${modo}.`);
    }

    const normalizada = `${url.protocol}//${url.host}`;
    if (import.meta.env.PROD) {
        return exigirProducao(normalizada, modo);
    }
    if (import.meta.env.DEV && modo === "development") {
        if (normalizada === "http://127.0.0.1:8765" || normalizada === "http://localhost:8765") {
            return normalizada;
        }
    }
    throw new Error(`VITE_MANUAL_API_URL inválida para o modo ${modo}.`);
}
