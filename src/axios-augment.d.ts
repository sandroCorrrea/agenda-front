import "axios";

declare module "axios" {
    interface AxiosRequestConfig {
        /** Não envia cabeçalho Authorization (rotas públicas). */
        skipAuth?: boolean;
    }

    interface InternalAxiosRequestConfig {
        skipAuth?: boolean;
    }
}
