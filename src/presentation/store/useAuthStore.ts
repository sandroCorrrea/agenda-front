import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { UsuarioAutenticadoDTO } from "@/application/dto/Auth/LoginPostResponseDTO";
import {
    canAccessPainelContabilidade,
    canAccessParticipacaoAdmin,
    isContabilidade,
    isPrefeitura,
    sessaoAdminLegadaSemPerfil
} from "@/shared/utils/adminPermissions";

const chaveToken = "agenda_auth_token";
const chaveUsuario = "agenda_auth_usuario";

export const useAuthStore = defineStore("auth", () => {
    const token = ref<string | null>(null);
    const usuario = ref<UsuarioAutenticadoDTO | null>(null);

    const estaAutenticado = computed(() => Boolean(token.value));
    const ehContabilidade = computed(() => isContabilidade(usuario.value));
    const ehPrefeitura = computed(() => isPrefeitura(usuario.value));
    const podeAcessarPainelContabilidade = computed(() =>
        canAccessPainelContabilidade(usuario.value)
    );
    const podeAcessarParticipacaoAdmin = computed(() =>
        canAccessParticipacaoAdmin(usuario.value)
    );
    const sessaoLegadaSemPerfil = computed(() =>
        sessaoAdminLegadaSemPerfil(usuario.value)
    );

    function recuperarSessao() {
        const t = localStorage.getItem(chaveToken);
        const u = localStorage.getItem(chaveUsuario);
        if (t && u) {
            try {
                token.value = t;
                usuario.value = JSON.parse(u) as UsuarioAutenticadoDTO;
            } catch {
                encerrarSessao();
            }
        }
    }

    function definirSessao(
        novoToken: string,
        novoUsuario: UsuarioAutenticadoDTO
    ) {
        token.value = novoToken;
        usuario.value = novoUsuario;
        localStorage.setItem(chaveToken, novoToken);
        localStorage.setItem(chaveUsuario, JSON.stringify(novoUsuario));
    }

    function encerrarSessao() {
        token.value = null;
        usuario.value = null;
        localStorage.removeItem(chaveToken);
        localStorage.removeItem(chaveUsuario);
    }

    return {
        token,
        usuario,
        estaAutenticado,
        ehContabilidade,
        ehPrefeitura,
        podeAcessarPainelContabilidade,
        podeAcessarParticipacaoAdmin,
        sessaoLegadaSemPerfil,
        recuperarSessao,
        definirSessao,
        encerrarSessao
    };
});
