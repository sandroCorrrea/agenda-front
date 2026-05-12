<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
    RiArrowDownSLine,
    RiCloseLine,
    RiDashboardLine,
    RiLockLine,
    RiLogoutBoxRLine,
    RiMenuLine,
    RiUserLine
} from "@remixicon/vue";
import logo from "@/presentation/assets/img/logo.svg";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import { useAuthStore } from "@/presentation/store/useAuthStore";
import { TipoUsuario } from "@/domain/types/TipoUsuario";
import { useLogoutUsuario } from "@/presentation/composables/Pessoa/useLogoutUsuario";

const matriz = useMatrizStore();
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { sair: chamarLogoutApi } = useLogoutUsuario();

const menuAberto = ref(false);
const saindo = ref(false);
const adminSubmenuAberto = ref<"" | "gestao" | "blog" | "clientes" | "conta">(
    ""
);
/** Submenu do portal do cliente (Perfil / Chaves), mesmo padrao do admin Conta. */
const clienteSubmenuAberto = ref<"" | "conta">("");
const apisMenuAberto = ref(false);
/** Submenu visitante: Login e Cadastro em um único item. */
const acessoVisitanteAberto = ref(false);
/** Submenu público: Aviso e Blog sob “Conteúdo”. */
const conteudoMenuAberto = ref(false);
const modalConfirmarSaidaAberto = ref(false);

const isCliente = computed(
    () => auth.estaAutenticado && auth.usuario?.tipo_usuario === TipoUsuario.CLIENTE
);
const isAdmin = computed(
    () =>
        auth.estaAutenticado &&
        auth.usuario?.tipo_usuario === TipoUsuario.ADMINISTRADOR
);

/** Logo + nome da empresa: admin ao painel; cliente à área de protocolos; demais, home pública. */
const marcaDestino = computed(() => {
    if (isAdmin.value) return { name: "AdministradorPainel" as const };
    if (isCliente.value) return "/cliente/protocolos";
    return "/";
});

/** Rotas filhas por grupo — os toggles são <button>, então não recebem router-link-active. */
const ROTAS_ADMIN_GESTAO = new Set<string>([
    "AdministradorServicos",
    "AdministradorServicoCadastro",
    "AdministradorServicoEditar",
    "AdministradorProtocolos",
    "AdministradorProtocoloCadastro",
    "AdministradorProtocoloEditar",
    "AdministradorAvisos",
    "AdministradorAvisoCadastro",
    "AdministradorAvisoEditar"
]);
const ROTAS_ADMIN_BLOG = new Set<string>([
    "BlogCategorias",
    "BlogCategoriaCadastro",
    "BlogCategoriaEditar",
    "BlogPostagem",
    "BlogPostagemCadastro",
    "BlogPostagemEditar"
]);
const ROTAS_ADMIN_CLIENTES = new Set<string>([
    "AdministradorClientesPessoaFisica",
    "AdministradorClienteFisicaEditar",
    "AdministradorEmpresas",
    "AdministradorEmpresaEditar",
    "AdministradorUsuarios"
]);
const ROTAS_ADMIN_CONTA = new Set<string>(["AdministradorPerfil", "AdministradorChaves"]);
const ROTAS_CLIENTE_CONTA = new Set<string>(["ClientePerfil", "ClienteChaves"]);

function nomeRotaAtual(): string | null {
    const n = route.name;
    return typeof n === "string" ? n : null;
}

const adminGestaoAtivo = computed(() => {
    const n = nomeRotaAtual();
    return n != null && ROTAS_ADMIN_GESTAO.has(n);
});
const adminBlogAtivo = computed(() => {
    const n = nomeRotaAtual();
    return n != null && ROTAS_ADMIN_BLOG.has(n);
});
const adminClientesAtivo = computed(() => {
    const n = nomeRotaAtual();
    return n != null && ROTAS_ADMIN_CLIENTES.has(n);
});
const adminContaAtivo = computed(() => {
    const n = nomeRotaAtual();
    return n != null && ROTAS_ADMIN_CONTA.has(n);
});
const clienteContaAtivo = computed(() => {
    const n = nomeRotaAtual();
    return n != null && ROTAS_CLIENTE_CONTA.has(n);
});
const apisDocumentacaoAtiva = computed(
    () => route.name === "BpeDocumentacao" || route.name === "ProtocoloDocumentacao"
);
const acessoVisitanteAtivo = computed(
    () => route.name === "Login" || route.name === "Cadastro"
);
const conteudoPublicoAtivo = computed(() => {
    const n = route.name;
    return n === "Aviso" || n === "Blog" || n === "BlogDetalhe";
});

function toggleMenu() {
    menuAberto.value = !menuAberto.value;
}

function closeMenu() {
    menuAberto.value = false;
    adminSubmenuAberto.value = "";
    clienteSubmenuAberto.value = "";
    apisMenuAberto.value = false;
    acessoVisitanteAberto.value = false;
    conteudoMenuAberto.value = false;
}

function toggleApisMenu() {
    apisMenuAberto.value = !apisMenuAberto.value;
}

function toggleAcessoVisitante() {
    acessoVisitanteAberto.value = !acessoVisitanteAberto.value;
}

function toggleConteudoMenu() {
    conteudoMenuAberto.value = !conteudoMenuAberto.value;
}

function toggleAdminSubmenu(chave: "gestao" | "blog" | "clientes" | "conta") {
    adminSubmenuAberto.value =
        adminSubmenuAberto.value === chave ? "" : chave;
}

function toggleClienteSubmenu(chave: "conta") {
    clienteSubmenuAberto.value =
        clienteSubmenuAberto.value === chave ? "" : chave;
}

function abrirModalSaida() {
    modalConfirmarSaidaAberto.value = true;
}

function fecharModalSaida() {
    if (saindo.value) return;
    modalConfirmarSaidaAberto.value = false;
}

watch(
    () => route.fullPath,
    () => {
        closeMenu();
    }
);

async function sair() {
    if (saindo.value) return;
    saindo.value = true;
    try {
        await chamarLogoutApi();
        auth.encerrarSessao();
        modalConfirmarSaidaAberto.value = false;
        closeMenu();
        await router.push({ name: "Home" });
    } finally {
        saindo.value = false;
    }
}
</script>

<template>
    <header class="navsafe">
        <nav class="navsafe__inner container-fluid px-3 px-xl-4">
            <RouterLink class="navsafe__brand" :to="marcaDestino" @click="closeMenu">
                <img :src="logo" alt="Logo" class="navsafe__logo" />
                <span class="navsafe__title">{{ matriz.matriz?.apelido }}</span>
            </RouterLink>

            <button
                type="button"
                class="navsafe__toggle"
                :aria-expanded="menuAberto"
                aria-label="Abrir menu"
                @click="toggleMenu"
            >
                <RiMenuLine v-if="!menuAberto" />
                <RiCloseLine v-else />
            </button>

            <div
                class="navsafe__overlay"
                :class="{ 'navsafe__overlay--open': menuAberto }"
                @click="closeMenu"
            />

            <div class="navsafe__menu" :class="{ 'navsafe__menu--open': menuAberto }">
                <ul class="navsafe__list">
                    <template v-if="!auth.estaAutenticado">
                        <li><RouterLink to="/" class="navsafe__link" @click="closeMenu">Home</RouterLink></li>
                        <li><RouterLink to="/servico" class="navsafe__link" @click="closeMenu">Serviços</RouterLink></li>
                        <li><RouterLink to="/contato" class="navsafe__link" @click="closeMenu">Contato</RouterLink></li>
                        <li
                            class="navsafe__item-submenu"
                            :class="{ 'navsafe__item-submenu--open': conteudoMenuAberto }"
                        >
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': conteudoPublicoAtivo }"
                                @click="toggleConteudoMenu"
                            >
                                Conteúdo
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink to="/aviso" class="navsafe__submenu-link" @click="closeMenu">
                                    Aviso
                                </RouterLink>
                                <RouterLink to="/blog" class="navsafe__submenu-link" @click="closeMenu">
                                    Blog
                                </RouterLink>
                            </div>
                        </li>
                        <li class="navsafe__item-submenu" :class="{ 'navsafe__item-submenu--open': apisMenuAberto }">
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': apisDocumentacaoAtiva }"
                                @click="toggleApisMenu"
                            >
                                APIs
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink :to="{ name: 'BpeDocumentacao' }" class="navsafe__submenu-link" @click="closeMenu">BPe</RouterLink>
                                <RouterLink :to="{ name: 'ProtocoloDocumentacao' }" class="navsafe__submenu-link" @click="closeMenu">Protocolo</RouterLink>
                            </div>
                        </li>
                        <li
                            class="navsafe__item-submenu"
                            :class="{ 'navsafe__item-submenu--open': acessoVisitanteAberto }"
                        >
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': acessoVisitanteAtivo }"
                                @click="toggleAcessoVisitante"
                            >
                                Acesso
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink
                                    to="/login"
                                    class="navsafe__submenu-link navsafe__submenu-link--with-icon"
                                    @click="closeMenu"
                                >
                                    <RiLockLine /> Login
                                </RouterLink>
                                <RouterLink
                                    to="/cadastro"
                                    class="navsafe__submenu-link navsafe__submenu-link--with-icon"
                                    @click="closeMenu"
                                >
                                    <RiUserLine /> Cadastro
                                </RouterLink>
                            </div>
                        </li>
                    </template>

                    <template v-else-if="isCliente">
                        <li><RouterLink to="/cliente/protocolos" class="navsafe__link" @click="closeMenu">Protocolos</RouterLink></li>
                        <li
                            class="navsafe__item-submenu"
                            :class="{ 'navsafe__item-submenu--open': clienteSubmenuAberto === 'conta' }"
                        >
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': clienteContaAtivo }"
                                @click="toggleClienteSubmenu('conta')"
                            >
                                Conta
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink
                                    :to="{ name: 'ClientePerfil' }"
                                    class="navsafe__submenu-link"
                                    @click="closeMenu"
                                >
                                    Perfil
                                </RouterLink>
                                <RouterLink
                                    :to="{ name: 'ClienteChaves' }"
                                    class="navsafe__submenu-link"
                                    @click="closeMenu"
                                >
                                    Chaves
                                </RouterLink>
                            </div>
                        </li>
                        <li><button type="button" class="navsafe__link navsafe__btn-danger" :disabled="saindo" @click="abrirModalSaida"><RiLogoutBoxRLine /> {{ saindo ? "Saindo..." : "Sair" }}</button></li>
                    </template>

                    <template v-else-if="isAdmin">
                        <li>
                            <RouterLink
                                :to="{ name: 'AdministradorPainel' }"
                                class="navsafe__link"
                                @click="closeMenu"
                            >
                                <RiDashboardLine /> Painel
                            </RouterLink>
                        </li>

                        <li class="navsafe__item-submenu" :class="{ 'navsafe__item-submenu--open': adminSubmenuAberto === 'gestao' }">
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': adminGestaoAtivo }"
                                @click="toggleAdminSubmenu('gestao')"
                            >
                                Gestão
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink :to="{ name: 'AdministradorServicos' }" class="navsafe__submenu-link" @click="closeMenu">Serviços</RouterLink>
                                <RouterLink :to="{ name: 'AdministradorProtocolos' }" class="navsafe__submenu-link" @click="closeMenu">Protocolos</RouterLink>
                                <RouterLink :to="{ name: 'AdministradorAvisos' }" class="navsafe__submenu-link" @click="closeMenu">Avisos</RouterLink>
                            </div>
                        </li>

                        <li class="navsafe__item-submenu" :class="{ 'navsafe__item-submenu--open': adminSubmenuAberto === 'blog' }">
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': adminBlogAtivo }"
                                @click="toggleAdminSubmenu('blog')"
                            >
                                Blog
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink :to="{ name: 'BlogCategorias' }" class="navsafe__submenu-link" @click="closeMenu">Categorias</RouterLink>
                                <RouterLink :to="{ name: 'BlogPostagem' }" class="navsafe__submenu-link" @click="closeMenu">Postagens</RouterLink>
                            </div>
                        </li>

                        <li class="navsafe__item-submenu" :class="{ 'navsafe__item-submenu--open': adminSubmenuAberto === 'clientes' }">
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': adminClientesAtivo }"
                                @click="toggleAdminSubmenu('clientes')"
                            >
                                Clientes
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink to="/admin/clientes/pessoa-fisica" class="navsafe__submenu-link" @click="closeMenu">Pessoa física</RouterLink>
                                <RouterLink to="/admin/empresas" class="navsafe__submenu-link" @click="closeMenu">Pessoa jurídica</RouterLink>
                                <RouterLink :to="{ name: 'AdministradorUsuarios' }" class="navsafe__submenu-link" @click="closeMenu">Administradores</RouterLink>
                            </div>
                        </li>

                        <li class="navsafe__item-submenu" :class="{ 'navsafe__item-submenu--open': adminSubmenuAberto === 'conta' }">
                            <button
                                type="button"
                                class="navsafe__link navsafe__submenu-toggle"
                                :class="{ 'navsafe__submenu-toggle--active': adminContaAtivo }"
                                @click="toggleAdminSubmenu('conta')"
                            >
                                Conta
                                <RiArrowDownSLine class="navsafe__submenu-icon" />
                            </button>
                            <div class="navsafe__submenu">
                                <RouterLink to="/admin/perfil" class="navsafe__submenu-link" @click="closeMenu">Perfil</RouterLink>
                                <RouterLink to="/admin/chaves" class="navsafe__submenu-link" @click="closeMenu">Chaves</RouterLink>
                            </div>
                        </li>

                        <li><button type="button" class="navsafe__link navsafe__btn-danger" :disabled="saindo" @click="abrirModalSaida"><RiLogoutBoxRLine /> {{ saindo ? "Saindo..." : "Sair" }}</button></li>
                    </template>
                </ul>
            </div>
        </nav>

        <Teleport to="body">
            <div v-if="modalConfirmarSaidaAberto" class="navsafe-modal" @click.self="fecharModalSaida">
                <div class="navsafe-modal__card">
                    <h3>Confirmar saída</h3>
                    <p>Tem certeza que você realmente deseja sair da sua conta?</p>
                    <div class="navsafe-modal__acoes">
                        <button type="button" class="navsafe-modal__btn navsafe-modal__btn--ghost" :disabled="saindo" @click="fecharModalSaida">
                            Cancelar
                        </button>
                        <button type="button" class="navsafe-modal__btn navsafe-modal__btn--danger" :disabled="saindo" @click="sair">
                            {{ saindo ? "Saindo..." : "Sair" }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </header>
</template>

<style scoped>
.navsafe {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2300;
    background: linear-gradient(120deg, #11182b 0%, #182641 100%);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
}

.navsafe__inner {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
}

.navsafe__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    text-decoration: none;
    color: #fff;
    min-width: 0;
}

.navsafe__logo {
    height: 36px;
    width: auto;
    flex-shrink: 0;
}

.navsafe__title {
    font-weight: 800;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.navsafe__desktop-highlight {
    display: none;
}

.navsafe__highlight-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    text-decoration: none;
    color: #d7e5ff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    font-size: 0.82rem;
    font-weight: 700;
}

.navsafe__toggle {
    border: none;
    background: transparent;
    color: #e6efff;
    font-size: 1.55rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 10px;
    transition: background 0.2s ease;
}

.navsafe__toggle:hover {
    background: rgba(255, 255, 255, 0.1);
}

.navsafe__overlay {
    position: fixed;
    inset: 72px 0 0 0;
    background: rgba(8, 12, 22, 0.52);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 5;
}

.navsafe__overlay--open {
    opacity: 1;
    pointer-events: auto;
}

.navsafe__menu {
    position: fixed;
    top: 72px;
    right: 0;
    width: min(350px, 100vw);
    height: calc(100vh - 72px);
    overflow: auto;
    background: #121a2d;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    opacity: 0;
    pointer-events: none;
    transform: translateX(100%);
    transition: all 0.18s ease;
    z-index: 10;
}

.navsafe__menu--open {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
}

.navsafe__list {
    list-style: none;
    margin: 0;
    padding: 0.75rem 0.7rem 1rem;
}

.navsafe__link {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.85rem 0.85rem;
    color: #f0f4ff;
    text-decoration: none;
    font-weight: 650;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 12px;
    margin-bottom: 0.2rem;
    transition: background 0.2s ease, color 0.2s ease;
}

.navsafe__link:hover {
    background: rgba(255, 255, 255, 0.1);
}

.navsafe__link--cta,
.navsafe__link--role {
    background: rgba(77, 141, 255, 0.16);
    border: 1px solid rgba(150, 186, 255, 0.25);
}

.navsafe__link.router-link-active {
    background: rgba(91, 153, 255, 0.18);
    color: #ffffff;
}

.navsafe__link.navsafe__submenu-toggle--active {
    background: rgba(91, 153, 255, 0.18);
    color: #ffffff;
}

.navsafe__submenu-link--with-icon {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.navsafe__btn-danger {
    color: #ffcece;
}

.navsafe__item-submenu {
    position: relative;
}

.navsafe__submenu-toggle {
    justify-content: space-between;
}

.navsafe__submenu-icon {
    transition: transform 0.2s ease;
}

.navsafe__submenu {
    display: none;
    padding: 0 0.35rem 0.35rem 1rem;
}

.navsafe__submenu-link {
    display: block;
    color: #d9e6ff;
    text-decoration: none;
    border-radius: 10px;
    padding: 0.55rem 0.7rem;
    font-size: 0.9rem;
}

.navsafe__submenu-link:hover,
.navsafe__submenu-link.router-link-active {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
}

.navsafe__item-submenu--open .navsafe__submenu {
    display: block;
}

.navsafe__item-submenu--open .navsafe__submenu-icon {
    transform: rotate(180deg);
}

.navsafe-modal {
    position: fixed;
    inset: 0;
    background: rgba(6, 10, 18, 0.58);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 3000;
}

.navsafe-modal__card {
    width: min(440px, 100%);
    background: #ffffff;
    border-radius: 16px;
    padding: 1.2rem 1.1rem;
    box-shadow: 0 24px 44px rgba(7, 14, 30, 0.3);
}

.navsafe-modal__card h3 {
    margin: 0;
    color: #16254e;
    font-size: 1.2rem;
    font-weight: 800;
}

.navsafe-modal__card p {
    margin: 0.7rem 0 0;
    color: #4f5f7c;
}

.navsafe-modal__acoes {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.55rem;
}

.navsafe-modal__btn {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 0.92rem;
    font-weight: 700;
    font-size: 0.9rem;
}

.navsafe-modal__btn--ghost {
    background: #edf2fb;
    color: #233b6a;
}

.navsafe-modal__btn--danger {
    background: linear-gradient(90deg, #f26b6b 0%, #d33f49 100%);
    color: #fff;
}

@media (min-width: 1200px) {
    .navsafe__inner {
        gap: 1.1rem;
    }

    .navsafe__desktop-highlight {
        display: block;
    }

    .navsafe__toggle {
        display: none;
    }

    .navsafe__overlay {
        display: none;
    }

    .navsafe__menu {
        position: relative;
        top: auto;
        right: auto;
        height: auto;
        width: auto;
        max-width: 100%;
        overflow: visible;
        opacity: 1;
        pointer-events: auto;
        transform: none;
        background: transparent;
        border-left: 0;
        z-index: 1;
    }

    .navsafe__list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 0.35rem;
        padding: 0;
    }

    .navsafe__link {
        width: auto;
        border-radius: 999px;
        padding: 0.42rem 0.74rem;
        margin-bottom: 0;
        font-size: 0.84rem;
        white-space: nowrap;
    }

    .navsafe__submenu-toggle {
        min-width: 100px;
        justify-content: center;
    }

    .navsafe__submenu {
        position: absolute;
        top: calc(100% + 0.25rem);
        right: 0;
        min-width: 185px;
        background: #121a2d;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 0.35rem;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        z-index: 20;
    }
}

@media (max-width: 768px) {
    .navsafe__logo {
        height: 32px;
    }

    .navsafe__title {
        max-width: 165px;
        font-size: 0.9rem;
    }

    .navsafe__highlight-link {
        font-size: 0.78rem;
        padding: 0.28rem 0.62rem;
    }
}
</style>
