import { computed } from "vue";
import { useRoute } from "vue-router";

/**
 * Telas standalone (ex.: assinatura de protocolo via QR no celular,
 * formulário público de participação popular).
 * Não exibem navbar nem footer do site.
 */
export function useLayoutMinimo() {
    const route = useRoute();

    return computed(
        () =>
            route.meta.layoutMinimo === true ||
            route.name === "ProtocoloAssinar" ||
            route.name === "ParticipacaoFormulario" ||
            route.name === "ParticipacaoConsulta" ||
            route.name === "ParticipacaoPopular" ||
            route.path.startsWith("/protocolo/assinar/") ||
            route.path.startsWith("/participacao-popular") ||
            route.path.startsWith("/participacao/")
    );
}
