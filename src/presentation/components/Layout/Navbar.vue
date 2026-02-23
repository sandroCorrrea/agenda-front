<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import {
    RiMenuLine,
    RiCloseLine,
    RiArrowDownSLine,
    RiArrowDownLine,
    RiArrowUpDownLine,
    RiLockLine,
    RiUserLine,
    RiUser2Line,
    RiClipboardLine,
    RiBuildingLine
} from "@remixicon/vue";
import logo from '@/presentation/assets/img/logo.svg';

const navToggle = ref<HTMLElement | null>(null);
const navMenu = ref<HTMLElement | null>(null);
const isOpen = ref(false);

function toggleHandler() {
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <header class="header">
        <nav class="nav container">
            <div class="nav__data">
                <RouterLink class="nav__logo" to="/">
                    <img :src="logo" alt="Logo" class="nav__logo-img"> Agenda Contabilidade
                </RouterLink>

                <div
                  class="nav__toggle"
                  id="nav-toggle"
                  role="button"
                  tabindex="0"
                  aria-controls="nav-menu"
                  :aria-expanded="isOpen"
                  :class="{ 'show-icon': isOpen }"
                  @click="toggleHandler"
                  @keydown.enter.prevent="toggleHandler"
                  @keydown.space.prevent="toggleHandler"
                >
                    <RiMenuLine class="nav__burger" />
                    <RiCloseLine class="nav__close" />
                </div>
            </div>

            <div class="nav__menu" id="nav-menu" ref="navMenu" :class="{ 'show-menu': isOpen }">
                <ul class="nav__list">
                    <li><a href="#" class="nav__link">Home</a></li>

                    <li><a href="/servico" class="nav__link">Serviços</a></li>

                    <li class="dropdown__item">
                        <div class="nav__link">
                            APIs
                            <RiArrowDownSLine class="dropdown__arrow" />
                        </div>

                        <ul class="dropdown__menu">
                            <li>
                                <a href="#" class="dropdown__link">
                                    <RiUser2Line /> eSocial
                                </a>
                            </li>

                            <li>
                                <a href="#" class="dropdown__link">
                                    <RiClipboardLine /> Protocolo
                                </a>
                            </li>

                            <li class="dropdown__subitem">
                                <div class="dropdown__link">
                                    <RiBuildingLine /> CASP
                                    <RiArrowDownLine class="dropdown__add" />
                                </div>

                                <ul class="dropdown__submenu">
                                    <li>
                                        <a href="#" class="dropdown__sublink">
                                            <RiArrowUpDownLine /> Documents
                                        </a>
                                    </li>

                                    <li>
                                        <a href="#" class="dropdown__sublink">
                                            <RiArrowUpDownLine /> Payments
                                        </a>
                                    </li>

                                    <li>
                                        <a href="#" class="dropdown__sublink">
                                            <RiArrowUpDownLine /> Refunds
                                        </a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </li>

                    <li><a href="/contato" class="nav__link">Contato</a></li>

                    <li class="dropdown__item">
                        <div class="nav__link">
                            Entrar
                            <RiArrowDownSLine class="dropdown__arrow" />
                        </div>

                        <ul class="dropdown__menu">
                            <li>
                                <a href="/cadastro" class="dropdown__link">
                                    <RiUserLine /> Cadastro
                                </a>
                            </li>

                            <li>
                                <a href="/login" class="dropdown__link">
                                    <RiLockLine /> Login
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<style scoped>
* {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

ul {
    list-style: none;
    /*-webkit-tap-highlight-color: transparent;*/
}

a {
    text-decoration: none;
}

.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--black-color);
    box-shadow: 0 2px 16px hsla(220, 32%, 8%, .3);
    z-index: var(--z-fixed);
}

/* Garantir que a navbar e os menus dropdown fiquem acima de outros componentes (cards/formulários) */
.header {
    /* Mantém demais estilos existentes e garante sobreposição quando a variável for baixa */
    z-index: 2000; /* sobrescreve var(--z-fixed) se necessário */
}

.nav__menu,
.dropdown__menu,
.dropdown__submenu {
    z-index: 2100; /* dropdowns devem ficar acima do header para aparecer sobre cards */
}

.nav {
    height: var(--header-height);
}

.nav__logo,
.nav__burger,
.nav__close {
    color: var(--white-color);
}

.nav__data {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav__logo {
    display: inline-flex;
    align-items: center;
    column-gap: .25rem;
    font-weight: var(--font-semi-bold);
    /*-webkit-tap-highlight-color: transparent;*/
}

.nav__logo i {
    font-weight: initial;
    font-size: 1.25rem;
}

.nav__toggle {
    position: relative;
    width: 32px;
    height: 32px;
}

.nav__burger,
.nav__close {
    position: absolute;
    width: max-content;
    height: max-content;
    inset: 0;
    margin: auto;
    font-size: 1.25rem;
    cursor: pointer;
    transition: opacity .1s, transform .4s;
}

.nav__close {
    opacity: 0;
}

@media screen and (max-width: 1118px) {
    .nav__menu {
        position: absolute;
        left: 0;
        top: 2.5rem;
        width: 100%;
        height: calc(100vh - 3.5rem);
        overflow: auto;
        pointer-events: none;
        opacity: 0;
        transition: top .4s, opacity .3s;
    }

    .nav__menu::-webkit-scrollbar {
        width: 0;
    }

    .nav__list {
        background-color: var(--black-color);
        padding-top: 1rem;
    }
}

.nav__link {
    color: var(--white-color);
    background-color: var(--black-color);
    font-weight: var(--font-semi-bold);
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color .3s;
}

.nav__link:hover {
    background-color: var(--black-color-light);
}

.show-menu {
    opacity: 1;
    top: 3.5rem;
    pointer-events: initial;
}

.show-icon .nav__burger {
    opacity: 0;
    transform: rotate(90deg);
}

.show-icon .nav__close {
    opacity: 1;
    transform: rotate(90deg);
}

.dropdown__item {
    cursor: pointer;
}

.dropdown__arrow {
    font-size: 1.25rem;
    font-weight: initial;
    transition: transform .4s;
}

.dropdown__link,
.dropdown__sublink {
    padding: 1.25rem 1.25rem 1.25rem 2.5rem;
    color: var(--white-color);
    background-color: var(--black-color-light);
    display: flex;
    align-items: center;
    column-gap: .5rem;
    font-weight: var(--font-semi-bold);
    transition: background-color .3s;
}

.dropdown__link i,
.dropdown__sublink i {
    font-size: 1.25rem;
    font-weight: initial;
}

.dropdown__link:hover,
.dropdown__sublink:hover {
    background-color: var(--black-color);
}

.dropdown__menu,
.dropdown__submenu {
    max-height: 0;
    overflow: hidden;
    transition: max-height .4s ease-out;
}

.dropdown__item:hover .dropdown__menu,
.dropdown__subitem:hover>.dropdown__submenu {
    max-height: 1000px;
    transition: max-height .4s ease-in;
}

.dropdown__item:hover .dropdown__arrow {
    transform: rotate(180deg);
}

.dropdown__add {
    margin-left: auto;
}

.dropdown__sublink {
    background-color: var(--black-color-lighten);
}

@media screen and (max-width: 340px) {
    .container {
        margin-inline: 1rem;
    }

    .nav__link {
        padding-inline: 1rem;
    }
}

@media screen and (min-width: 1118px) {
    .container {
        margin-inline: auto;
    }

    .nav {
        height: calc(var(--header-height) + 2rem);
        display: flex;
        justify-content: space-between;
    }

    .nav__toggle {
        display: none;
    }

    .nav__list {
        height: 100%;
        display: flex;
        column-gap: 3rem;
    }

    .nav__link {
        height: 100%;
        padding: 0;
        justify-content: initial;
        column-gap: .25rem;
    }

    .nav__link:hover {
        background-color: transparent;
    }

    .dropdown__item,
    .dropdown__subitem {
        position: relative;
    }

    .dropdown__menu,
    .dropdown__submenu {
        max-height: initial;
        overflow: initial;
        position: absolute;
        left: 0;
        top: 6rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity .3s, top .3s;
    }

    .dropdown__link,
    .dropdown__sublink {
        padding-inline: 1rem 3.5rem;
    }

    .dropdown__subitem .dropdown__link {
        padding-inline: 1rem;
    }

    .dropdown__submenu {
        position: absolute;
        left: 100%;
        top: .5rem;
    }

    .dropdown__item:hover .dropdown__menu {
        opacity: 1;
        top: 5.5rem;
        pointer-events: initial;
        transition: top .3s;
    }

    .dropdown__subitem:hover>.dropdown__submenu {
        opacity: 1;
        top: 0;
        pointer-events: initial;
        transition: top .3s;
    }
}

.nav__logo-img {
    height: 32px;
    width: auto;
}

@media screen and (max-width: 768px) {
    .nav__logo-img {
        height: 26px;
    }
}

@media screen and (min-width: 1118px) {
    .nav__logo-img {
        height: 36px;
    }
}

</style>