<script setup lang="ts">
import { computed, onMounted } from "vue";
import {
    RiCheckboxCircleLine,
    RiExternalLinkLine,
    RiFileCopyLine,
    RiLinkM,
    RiMapPin2Line,
    RiQrCodeLine,
    RiShareForwardLine
} from "@remixicon/vue";
import { useParticipacaoFormularioLink } from "@/presentation/composables/Participacao/useParticipacaoFormularioLink";

const props = withDefaults(
    defineProps<{
        compacto?: boolean;
        autoCarregar?: boolean;
    }>(),
    {
        compacto: false,
        autoCarregar: true
    }
);

const { dados, carregando, erro, copiado, carregar, copiarLink } =
    useParticipacaoFormularioLink();

const tituloMunicipio = computed(() => {
    if (!dados.value) return "";
    return `${dados.value.localidade}/${dados.value.uf}`;
});

onMounted(async () => {
    if (!props.autoCarregar) return;
    try {
        await carregar();
    } catch {
        return;
    }
});

defineExpose({ carregar, dados, erro, carregando });
</script>

<template>
    <section
        class="part-link"
        :class="{ 'part-link--compacto': compacto, 'part-link--loading': carregando }"
    >
        <div class="part-link__glow" aria-hidden="true" />

        <header class="part-link__head">
            <span class="part-link__badge">
                <RiMapPin2Line />
                Formulário público
            </span>
            <h2 v-if="!compacto" class="part-link__title">
                Link exclusivo do seu município
            </h2>
            <h3 v-else class="part-link__title part-link__title--sm">
                Compartilhe o formulário
            </h3>
            <p class="part-link__lead">
                Cada proposta enviada por este link será vinculada automaticamente ao
                código IBGE do município cadastrado no seu perfil.
            </p>
        </header>

        <div v-if="carregando" class="part-link__state">
            <div class="part-link__spinner" />
            <p>Gerando link do formulário...</p>
        </div>

        <div v-else-if="erro" class="part-link__alert part-link__alert--warn">
            <RiQrCodeLine class="part-link__alert-icon" />
            <div>
                <strong>Não foi possível gerar o link</strong>
                <p>{{ erro }}</p>
                <p v-if="erro.includes('IBGE')" class="part-link__hint">
                    Acesse <strong>Perfil</strong> e cadastre o endereço com o código IBGE
                    de 7 dígitos do município.
                </p>
            </div>
        </div>

        <div v-else-if="dados" class="part-link__body">
            <div class="part-link__municipio">
                <div class="part-link__municipio-icon" aria-hidden="true">
                    <RiMapPin2Line />
                </div>
                <div>
                    <p class="part-link__municipio-label">Município vinculado</p>
                    <p class="part-link__municipio-nome">{{ tituloMunicipio }}</p>
                    <span class="part-link__ibge">IBGE {{ dados.ibge }}</span>
                </div>
            </div>

            <label class="part-link__field-label" for="part-link-url">
                <RiLinkM /> Endereço para compartilhar
            </label>
            <div class="part-link__field">
                <input
                    id="part-link-url"
                    class="part-link__input"
                    :value="dados.linkFormulario"
                    readonly
                    @focus="($event.target as HTMLInputElement).select()"
                />
                <button
                    type="button"
                    class="part-link__btn part-link__btn--copy"
                    :class="{ 'part-link__btn--ok': copiado }"
                    @click="copiarLink"
                >
                    <RiCheckboxCircleLine v-if="copiado" />
                    <RiFileCopyLine v-else />
                    {{ copiado ? "Copiado!" : "Copiar" }}
                </button>
            </div>

            <div class="part-link__acoes">
                <a
                    :href="dados.linkFormulario"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="part-link__btn part-link__btn--primary"
                >
                    <RiExternalLinkLine />
                    Abrir formulário
                </a>
                <button
                    type="button"
                    class="part-link__btn part-link__btn--ghost"
                    @click="copiarLink"
                >
                    <RiShareForwardLine />
                    Copiar para compartilhar
                </button>
            </div>

            <p class="part-link__footnote">
                Envie este link para cidadãos, conselhos e audiências públicas.
                Não altere o endereço — o trecho final identifica o município de forma segura.
            </p>
        </div>
    </section>
</template>

<style scoped>
.part-link {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    border: 1px solid rgba(45, 160, 168, 0.28);
    background:
        radial-gradient(circle at 0% 0%, rgba(92, 107, 192, 0.18), transparent 55%),
        radial-gradient(circle at 100% 100%, rgba(45, 160, 168, 0.16), transparent 50%),
        linear-gradient(145deg, #0f1a32 0%, #152845 48%, #12343a 100%);
    color: #e8f2ff;
    padding: 1.35rem 1.25rem 1.5rem;
    box-shadow: 0 18px 40px rgba(10, 18, 36, 0.22);
}

.part-link--compacto {
    padding: 1.1rem 1rem 1.25rem;
}

.part-link__glow {
    position: absolute;
    inset: -40% auto auto -20%;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(126, 232, 224, 0.14), transparent 70%);
    pointer-events: none;
}

.part-link__head {
    position: relative;
    margin-bottom: 1.1rem;
}

.part-link__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.28rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #7ee8e0;
    background: rgba(126, 232, 224, 0.1);
    border: 1px solid rgba(126, 232, 224, 0.25);
}

.part-link__title {
    margin: 0.65rem 0 0.35rem;
    font-size: 1.45rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
}

.part-link__title--sm {
    font-size: 1.15rem;
}

.part-link__lead {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.55;
    color: rgba(232, 242, 255, 0.82);
    max-width: 52ch;
}

.part-link__state {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgba(232, 242, 255, 0.85);
    font-size: 0.92rem;
}

.part-link__spinner {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top-color: #7ee8e0;
    animation: part-link-spin 0.8s linear infinite;
}

@keyframes part-link-spin {
    to {
        transform: rotate(360deg);
    }
}

.part-link__alert {
    display: flex;
    gap: 0.85rem;
    padding: 0.95rem 1rem;
    border-radius: 14px;
    background: rgba(255, 193, 7, 0.08);
    border: 1px solid rgba(255, 193, 7, 0.28);
}

.part-link__alert strong {
    display: block;
    color: #ffe08a;
    margin-bottom: 0.25rem;
}

.part-link__alert p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: rgba(255, 240, 200, 0.92);
}

.part-link__alert-icon {
    font-size: 1.5rem;
    color: #ffc857;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.part-link__hint {
    margin-top: 0.5rem !important;
    font-size: 0.84rem !important;
    opacity: 0.9;
}

.part-link__body {
    position: relative;
    display: grid;
    gap: 0.9rem;
}

.part-link__municipio {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.85rem 1rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.part-link__municipio-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 1.35rem;
    color: #7ee8e0;
    background: linear-gradient(145deg, rgba(92, 107, 192, 0.35), rgba(45, 160, 168, 0.28));
}

.part-link__municipio-label {
    margin: 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(232, 242, 255, 0.65);
    font-weight: 700;
}

.part-link__municipio-nome {
    margin: 0.1rem 0 0.35rem;
    font-size: 1.2rem;
    font-weight: 800;
    color: #fff;
}

.part-link__ibge {
    display: inline-flex;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #b8f0eb;
    background: rgba(45, 160, 168, 0.2);
    border: 1px solid rgba(126, 232, 224, 0.25);
}

.part-link__field-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    font-size: 0.82rem;
    font-weight: 700;
    color: rgba(232, 242, 255, 0.78);
}

.part-link__field {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.5rem;
}

@media (max-width: 575px) {
    .part-link__field {
        grid-template-columns: 1fr;
    }
}

.part-link__input {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    padding: 0.72rem 0.85rem;
    font-size: 0.84rem;
    color: #f4f8ff;
    background: rgba(8, 14, 28, 0.55);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.part-link__input:focus {
    outline: 2px solid rgba(126, 232, 224, 0.45);
    outline-offset: 1px;
}

.part-link__acoes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
}

.part-link__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: none;
    border-radius: 999px;
    padding: 0.55rem 1rem;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.part-link__btn--primary {
    color: #0f1a2e;
    background: linear-gradient(90deg, #e8f4ff 0%, #b8f5ef 100%);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.part-link__btn--primary:hover {
    transform: translateY(-1px);
    color: #0a1220;
}

.part-link__btn--ghost {
    color: #e8f2ff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
}

.part-link__btn--copy {
    color: #0f1a2e;
    background: #e8f4ff;
    white-space: nowrap;
}

.part-link__btn--ok {
    background: #c8f5e4;
    color: #145a3a;
}

.part-link__footnote {
    margin: 0.15rem 0 0;
    font-size: 0.78rem;
    line-height: 1.45;
    color: rgba(232, 242, 255, 0.58);
}
</style>
