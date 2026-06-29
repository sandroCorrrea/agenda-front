<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { RiCloseLine } from '@remixicon/vue';
import { useMatrizStore } from '@/presentation/store/useMatrizStore';
import {
    montarTermoTransparenciaDadosCadastro,
    type TermoLgpdSecao
} from '@/shared/content/termoTransparenciaDadosCadastro';

const props = defineProps<{
    aberto: boolean;
}>();

const emit = defineEmits<{
    (e: 'fechar'): void;
}>();

const matrizStore = useMatrizStore();

const nomeEmpresa = computed(
    () => matrizStore.matriz?.nome?.trim() || 'Agenda Assessoria Contábil'
);
const emailContato = computed(
    () => matrizStore.matriz?.email?.trim() || 'contato@agenda.com.br'
);
const enderecoEmpresa = computed(() => {
    const matriz = matrizStore.matriz;
    if (!matriz) return 'consulte nossos canais de atendimento';
    return `${matriz.rua}, ${matriz.numero} — ${matriz.bairro}, ${matriz.cidade}/${matriz.uf} — CEP ${matriz.cep}`;
});
const siteEmpresa = computed(() => 'agenda-contabilidade.com');

const secoes = computed<TermoLgpdSecao[]>(() =>
    montarTermoTransparenciaDadosCadastro({
        nomeEmpresa: nomeEmpresa.value,
        emailContato: emailContato.value,
        endereco: enderecoEmpresa.value,
        site: siteEmpresa.value
    })
);

function fechar() {
    emit('fechar');
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && props.aberto) {
        fechar();
    }
}

watch(
    () => props.aberto,
    (aberto) => {
        if (typeof document === 'undefined') return;
        document.body.style.overflow = aberto ? 'hidden' : '';
    },
    { immediate: true }
);

onUnmounted(() => {
    if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
    }
});
</script>

<template>
    <Teleport to="body">
        <div
            v-if="aberto"
            class="termo-lgpd-modal__portal"
            role="presentation"
            @keydown="onKeydown"
        >
            <div
                class="termo-lgpd-modal__backdrop"
                aria-hidden="true"
                @click="fechar"
            />
            <div
                class="termo-lgpd-modal__wrap"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="termo-lgpd-modal-titulo"
                @click.self="fechar"
            >
                <div class="termo-lgpd-modal__panel" @click.stop>
                    <button
                        type="button"
                        class="termo-lgpd-modal__fechar"
                        aria-label="Fechar"
                        @click="fechar"
                    >
                        <RiCloseLine />
                    </button>

                    <header class="termo-lgpd-modal__cabecalho">
                        <h2 id="termo-lgpd-modal-titulo" class="termo-lgpd-modal__titulo">
                            Termo de Transparência nos Dados
                        </h2>
                        <p class="termo-lgpd-modal__subtitulo">
                            Informações sobre o tratamento de dados pessoais conforme a LGPD (Lei nº 13.709/2018).
                        </p>
                    </header>

                    <div class="termo-lgpd-modal__corpo">
                        <section
                            v-for="secao in secoes"
                            :key="secao.titulo"
                            class="termo-lgpd-modal__secao"
                        >
                            <h3>{{ secao.titulo }}</h3>
                            <p v-for="(paragrafo, index) in secao.paragrafos" :key="index">
                                {{ paragrafo }}
                            </p>
                            <ul v-if="secao.itens?.length">
                                <li v-for="item in secao.itens" :key="item">{{ item }}</li>
                            </ul>
                        </section>
                    </div>

                    <footer class="termo-lgpd-modal__rodape">
                        <button
                            type="button"
                            class="btn btn-primary btn-sm termo-lgpd-modal__btn"
                            @click="fechar"
                        >
                            Entendi
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.termo-lgpd-modal__portal {
    position: fixed;
    inset: 0;
    z-index: 4000;
}

.termo-lgpd-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(22, 37, 78, 0.45);
    backdrop-filter: blur(4px);
}

.termo-lgpd-modal__wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.termo-lgpd-modal__panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 640px;
    max-height: min(88vh, 760px);
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.08);
    border-radius: 18px;
    box-shadow:
        0 12px 40px rgba(20, 30, 40, 0.12),
        0 4px 12px rgba(20, 30, 40, 0.06);
    overflow: hidden;
}

.termo-lgpd-modal__fechar {
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: rgba(92, 107, 192, 0.08);
    color: #4a5b78;
    cursor: pointer;
}

.termo-lgpd-modal__fechar:hover {
    background: rgba(92, 107, 192, 0.15);
    color: #16254e;
}

.termo-lgpd-modal__fechar svg {
    width: 1.25rem;
    height: 1.25rem;
}

.termo-lgpd-modal__cabecalho {
    flex-shrink: 0;
    padding: 1.5rem 3rem 1rem 1.5rem;
    border-bottom: 1px solid rgba(20, 30, 40, 0.06);
}

.termo-lgpd-modal__titulo {
    margin: 0 0 0.45rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: #16254e;
    line-height: 1.3;
}

.termo-lgpd-modal__subtitulo {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #5a6b82;
}

.termo-lgpd-modal__corpo {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 1.5rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(92, 107, 192, 0.35) transparent;
}

.termo-lgpd-modal__corpo::-webkit-scrollbar {
    width: 6px;
}

.termo-lgpd-modal__corpo::-webkit-scrollbar-thumb {
    background: rgba(92, 107, 192, 0.35);
    border-radius: 999px;
}

.termo-lgpd-modal__secao + .termo-lgpd-modal__secao {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(20, 30, 40, 0.05);
}

.termo-lgpd-modal__secao h3 {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    font-weight: 700;
    color: #2f4578;
}

.termo-lgpd-modal__secao p {
    margin: 0 0 0.55rem;
    font-size: 0.875rem;
    line-height: 1.55;
    color: #4a5b78;
}

.termo-lgpd-modal__secao ul {
    margin: 0;
    padding-left: 1.15rem;
}

.termo-lgpd-modal__secao li {
    font-size: 0.875rem;
    line-height: 1.5;
    color: #4a5b78;
    margin-bottom: 0.35rem;
}

.termo-lgpd-modal__rodape {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    padding: 0.85rem 1.5rem 1.25rem;
    border-top: 1px solid rgba(20, 30, 40, 0.06);
    background: rgba(246, 251, 252, 0.65);
}

.termo-lgpd-modal__btn {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 10px 18px !important;
    font-weight: 700;
}

@media (max-width: 575.98px) {
    .termo-lgpd-modal__wrap {
        padding: 0.75rem;
    }

    .termo-lgpd-modal__panel {
        max-height: 92vh;
        border-radius: 16px;
    }

    .termo-lgpd-modal__cabecalho {
        padding: 1.25rem 2.75rem 0.85rem 1.15rem;
    }

    .termo-lgpd-modal__corpo {
        padding: 0.85rem 1.15rem;
    }
}
</style>
