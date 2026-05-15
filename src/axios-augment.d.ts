import "axios";

declare module "axios" {
    interface AxiosRequestConfig {
        /** Não envia cabeçalho Authorization (rotas públicas de auth). */
        skipAuth?: boolean;
    }
}
