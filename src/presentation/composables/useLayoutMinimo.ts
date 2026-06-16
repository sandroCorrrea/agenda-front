import { computed } from "vue";
import { useRoute } from "vue-router";

/**
 * Telas standalone (ex.: assinatura de protocolo via QR no celular).
 * Não exibem navbar nem footer do site.
 */
export function useLayoutMinimo() {
    const route = useRoute();

    return computed(
        () =>
            route.meta.layoutMinimo === true ||
            route.name === "ProtocoloAssinar" ||
            route.path.startsWith("/protocolo/assinar/")
    );
}
