<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
    RiArrowLeftSLine,
    RiArrowRightSLine,
    RiCheckboxCircleFill,
    RiFileSearchLine,
    RiGovernmentLine,
    RiInformationLine,
    RiLoader4Line,
    RiShieldCheckLine,
    RiSpeakLine
} from "@remixicon/vue";
import { useParticipacaoForm } from "@/presentation/composables/Participacao/useParticipacaoForm";
import { useMatrizStore } from "@/presentation/store/useMatrizStore";
import { phoneMask } from "@/shared/utils/masks";
import { exercicioPadraoParticipacao } from "@/shared/utils/participacaoLabels";
import logo from "@/presentation/assets/img/logo.jpeg";

const matriz = useMatrizStore();
const {
    form,
    opcoes,
    carregandoOpcoes,
    enviando,
    erroGeral,
    errosCampo,
    resultado,
    carregarOpcoes,
    enviar,
    resetarFormulario
} = useParticipacaoForm();

const passo = ref(0);
const introAberta = ref(true);
const stepsRef = ref<HTMLElement | null>(null);

const passos = [
    { id: "identificacao", titulo: "Quem você é", breve: "Identificação" },
    { id: "proposta", titulo: "Sua proposta", breve: "Proposta" },
    { id: "impacto", titulo: "Impacto", breve: "Impacto" },
    { id: "confirma", titulo: "Confirmação", breve: "Envio" }
];

const totalPassos = passos.length;
const exercicio = computed(() => form.exercicio || exercicioPadraoParticipacao());

const nomeMarca = computed(
    () => matriz.matriz?.apelido?.trim() || "Agenda Contabilidade"
);

const progressoPct = computed(() => ((passo.value + 1) / totalPassos) * 100);

const camposPorPasso: string[][] = [
    [
        "bairro_comunidade",
        "faixa_etaria",
        "sexo",
        "nome",
        "email",
        "telefone",
        "localidade_atendida",
        "localidade_descricao"
    ],
    [
        "participacao_funcao_id",
        "tipo_demanda",
        "problema",
        "solucao",
        "beneficios"
    ],
    ["publico_beneficiado", "prioridade", "abrangencia"],
    ["deseja_info_audiencia", "autoriza_lgpd", "aceite_viabilidade", "email"]
];

function temErroNoPasso(indice: number): boolean {
    const campos = camposPorPasso[indice] ?? [];
    return campos.some((c) => Boolean(errosCampo[c]));
}

function validarPassoAtual(): boolean {
    const campos = camposPorPasso[passo.value];
    let ok = true;

    const setErr = (campo: string, condicao: boolean, msg: string) => {
        if (!condicao) {
            errosCampo[campo] = msg;
            ok = false;
        } else if (errosCampo[campo]) {
            delete errosCampo[campo];
        }
    };

    if (passo.value === 0) {
        setErr(
            "bairro_comunidade",
            form.bairro_comunidade.trim().length > 0,
            "Informe o bairro ou comunidade rural."
        );
        setErr("faixa_etaria", Boolean(form.faixa_etaria), "Selecione a faixa etária.");
        setErr(
            "localidade_atendida",
            Boolean(form.localidade_atendida),
            "Selecione a localidade atendida."
        );
        if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
            errosCampo.email = "Informe um e-mail válido.";
            ok = false;
        } else if (errosCampo.email && !form.deseja_info_audiencia) {
            delete errosCampo.email;
        }
    }

    if (passo.value === 1) {
        setErr(
            "participacao_funcao_id",
            form.participacao_funcao_id != null && form.participacao_funcao_id > 0,
            "Selecione a área temática."
        );
        setErr("tipo_demanda", Boolean(form.tipo_demanda), "Selecione o tipo da demanda.");
        setErr(
            "problema",
            form.problema.trim().length >= 10,
            "Descreva o problema (mín. 10 caracteres)."
        );
        setErr(
            "solucao",
            form.solucao.trim().length >= 10,
            "Descreva a solução (mín. 10 caracteres)."
        );
        setErr(
            "beneficios",
            form.beneficios.trim().length >= 10,
            "Descreva os benefícios (mín. 10 caracteres)."
        );
    }

    if (passo.value === 2) {
        setErr(
            "publico_beneficiado",
            form.publico_beneficiado.length > 0,
            "Selecione ao menos um público beneficiado."
        );
        setErr("prioridade", Boolean(form.prioridade), "Selecione o grau de prioridade.");
        setErr("abrangencia", Boolean(form.abrangencia), "Selecione a abrangência.");
    }

    if (passo.value === 3) {
        setErr(
            "autoriza_lgpd",
            form.autoriza_lgpd === true,
            "É necessário autorizar o tratamento dos dados (LGPD)."
        );
        setErr(
            "aceite_viabilidade",
            form.aceite_viabilidade === true,
            "É necessário declarar ciência sobre a viabilidade."
        );
        if (form.deseja_info_audiencia) {
            setErr(
                "email",
                /\S+@\S+\.\S+/.test(form.email.trim()),
                "Informe o e-mail para receber informações sobre a audiência pública."
            );
        }
    }

    void campos;
    return ok;
}

function irProximo() {
    if (!validarPassoAtual()) return;
    if (passo.value < totalPassos - 1) {
        passo.value += 1;
        scrollTopoForm();
    }
}

function irAnterior() {
    if (passo.value > 0) {
        passo.value -= 1;
        scrollTopoForm();
    }
}

function scrollTopoForm() {
    requestAnimationFrame(() => {
        stepsRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

function aoDigitarTelefone(ev: Event) {
    const el = ev.target as HTMLInputElement;
    form.telefone = phoneMask(el.value);
}

async function onSubmit() {
    if (!validarPassoAtual()) return;
    const criado = await enviar();
    if (criado) {
        scrollTopoForm();
    } else {
        for (let i = 0; i < camposPorPasso.length; i++) {
            if (temErroNoPasso(i)) {
                passo.value = i;
                break;
            }
        }
    }
}

function novaProposta() {
    resetarFormulario();
    passo.value = 0;
    introAberta.value = false;
}

onMounted(async () => {
    try {
        await carregarOpcoes();
    } catch {
        /* erro já em erroGeral */
    }
});

watch(
    () => form.deseja_info_audiencia,
    (v) => {
        if (!v && errosCampo.email?.includes("audiência")) {
            delete errosCampo.email;
        }
    }
);
</script>

<template>
    <article class="part-pub">
        <div class="part-pub__bg" aria-hidden="true">
            <span class="part-pub__orb part-pub__orb--1" />
            <span class="part-pub__orb part-pub__orb--2" />
            <span class="part-pub__grid" />
        </div>

        <header class="part-pub__header">
            <div class="part-pub__brand">
                <img :src="logo" alt="" class="part-pub__logo" width="48" height="48" />
                <div>
                    <p class="part-pub__brand-name">{{ nomeMarca }}</p>
                    <p class="part-pub__brand-tag">
                        <RiShieldCheckLine /> Participação popular · LOA {{ exercicio }}
                    </p>
                </div>
            </div>
        </header>

        <div ref="stepsRef" class="part-pub__shell">
            <!-- Sucesso -->
            <section v-if="resultado" class="part-pub__success" aria-live="polite">
                <RiCheckboxCircleFill class="part-pub__success-icon" />
                <h1 class="part-pub__success-title">Proposta registrada</h1>
                <p class="part-pub__success-protocolo">
                    Protocolo nº <strong>{{ resultado.id }}</strong>
                </p>
                <p class="part-pub__success-text">
                    Sua contribuição foi recebida e seguirá para análise técnica da
                    administração municipal. Guarde o número do protocolo para
                    acompanhamento.
                </p>

                <div class="part-pub__success-actions">
                    <RouterLink
                        :to="{
                            name: 'ParticipacaoPopularConsulta',
                            query: { protocolo: String(resultado.id) }
                        }"
                        class="part-pub__btn part-pub__btn--primary"
                    >
                        <RiFileSearchLine />
                        Acompanhar meu protocolo
                    </RouterLink>
                    <button
                        type="button"
                        class="part-pub__btn part-pub__btn--ghost"
                        @click="novaProposta"
                    >
                        Enviar outra proposta
                    </button>
                </div>

                <p class="part-pub__success-link-hint">
                    Você também pode consultar depois em
                    <RouterLink :to="{ name: 'ParticipacaoPopularConsulta' }">
                        /participacao-popular/acompanhar
                    </RouterLink>
                    com o protocolo{{ resultado.email ? " ou o e-mail informado" : "" }}.
                </p>
            </section>

            <template v-else>
                <!-- Intro -->
                <section class="part-pub__hero">
                    <div class="part-pub__eyebrow">
                        <RiGovernmentLine />
                        Art. 48 da LRF · Transparência fiscal
                    </div>
                    <h1 class="part-pub__title">
                        Formule sua proposta para a
                        <span>LOA {{ exercicio }}</span>
                    </h1>
                    <p class="part-pub__lead">
                        Este formulário complementa as audiências públicas e permite que
                        você indique prioridades, sugira melhorias e proponha ações para o
                        orçamento municipal.
                    </p>

                    <div class="part-pub__intro-actions">
                        <button
                            type="button"
                            class="part-pub__info-toggle"
                            :aria-expanded="introAberta"
                            @click="introAberta = !introAberta"
                        >
                            <RiInformationLine />
                            {{ introAberta ? "Ocultar contexto" : "Por que este formulário?" }}
                        </button>
                        <RouterLink
                            :to="{ name: 'ParticipacaoPopularConsulta' }"
                            class="part-pub__info-toggle part-pub__info-toggle--link"
                        >
                            <RiFileSearchLine />
                            Já enviei — acompanhar protocolo
                        </RouterLink>
                    </div>

                    <div v-show="introAberta" class="part-pub__info-panel">
                        <p>
                            A participação popular no processo orçamentário tem fundamento
                            no art. 48 da Lei Complementar nº 101/2000, no Estatuto da
                            Cidade e nos princípios de transparência e publicidade da
                            Constituição Federal.
                        </p>
                        <ul>
                            <li>Apresente demandas prioritárias</li>
                            <li>Indique áreas de investimento</li>
                            <li>Proponha projetos e melhorias</li>
                            <li>Ajude a definir prioridades da LOA</li>
                        </ul>
                        <p class="part-pub__info-note">
                            A apresentação da proposta não gera obrigação de inclusão
                            automática no orçamento.
                        </p>
                    </div>
                </section>

                <!-- Loading opções -->
                <section v-if="carregandoOpcoes" class="part-pub__loading" role="status">
                    <RiLoader4Line class="part-pub__spin" />
                    <p>Preparando o formulário...</p>
                </section>

                <template v-else-if="opcoes">
                    <!-- Progresso -->
                    <nav class="part-pub__progress" aria-label="Etapas do formulário">
                        <div class="part-pub__progress-bar" aria-hidden="true">
                            <span :style="{ width: progressoPct + '%' }" />
                        </div>
                        <ol class="part-pub__steps">
                            <li
                                v-for="(p, i) in passos"
                                :key="p.id"
                                class="part-pub__step"
                                :class="{
                                    'part-pub__step--ativo': i === passo,
                                    'part-pub__step--feito': i < passo
                                }"
                            >
                                <span class="part-pub__step-num">{{ i + 1 }}</span>
                                <span class="part-pub__step-label">{{ p.breve }}</span>
                            </li>
                        </ol>
                    </nav>

                    <div v-if="erroGeral" class="part-pub__alert part-pub__alert--erro" role="alert">
                        {{ erroGeral }}
                    </div>

                    <form class="part-pub__form" novalidate @submit.prevent="onSubmit">
                        <!-- Passo 1 -->
                        <fieldset v-show="passo === 0" class="part-pub__fieldset">
                            <legend class="part-pub__legend">
                                <RiSpeakLine /> Identificação do participante
                            </legend>
                            <p class="part-pub__hint">
                                Campos com * são obrigatórios. Os demais são opcionais e
                                reforçam a legitimidade estatística do processo.
                            </p>

                            <div class="part-pub__grid-fields">
                                <div class="part-pub__field part-pub__field--full">
                                    <label for="part-nome">Nome completo</label>
                                    <input
                                        id="part-nome"
                                        v-model="form.nome"
                                        type="text"
                                        maxlength="120"
                                        autocomplete="name"
                                        placeholder="Opcional"
                                    />
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-bairro">
                                        Bairro ou comunidade rural <span aria-hidden="true">*</span>
                                    </label>
                                    <input
                                        id="part-bairro"
                                        v-model="form.bairro_comunidade"
                                        type="text"
                                        maxlength="120"
                                        required
                                        :aria-invalid="Boolean(errosCampo.bairro_comunidade)"
                                        placeholder="Ex.: Pinheiros"
                                    />
                                    <p v-if="errosCampo.bairro_comunidade" class="part-pub__err">
                                        {{ errosCampo.bairro_comunidade }}
                                    </p>
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-faixa">
                                        Faixa etária <span aria-hidden="true">*</span>
                                    </label>
                                    <select
                                        id="part-faixa"
                                        v-model="form.faixa_etaria"
                                        required
                                        :aria-invalid="Boolean(errosCampo.faixa_etaria)"
                                    >
                                        <option disabled value="">Selecione</option>
                                        <option
                                            v-for="o in opcoes.faixaEtaria"
                                            :key="o.value"
                                            :value="o.value"
                                        >
                                            {{ o.label }}
                                        </option>
                                    </select>
                                    <p v-if="errosCampo.faixa_etaria" class="part-pub__err">
                                        {{ errosCampo.faixa_etaria }}
                                    </p>
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-sexo">Sexo</label>
                                    <select id="part-sexo" v-model="form.sexo">
                                        <option value="">Prefiro não informar agora</option>
                                        <option
                                            v-for="o in opcoes.sexo"
                                            :key="o.value"
                                            :value="o.value"
                                        >
                                            {{ o.label }}
                                        </option>
                                    </select>
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-email">E-mail</label>
                                    <input
                                        id="part-email"
                                        v-model="form.email"
                                        type="email"
                                        maxlength="100"
                                        autocomplete="email"
                                        placeholder="opcional@email.com"
                                        :aria-invalid="Boolean(errosCampo.email)"
                                    />
                                    <p v-if="errosCampo.email" class="part-pub__err">
                                        {{ errosCampo.email }}
                                    </p>
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-tel">Telefone</label>
                                    <input
                                        id="part-tel"
                                        :value="form.telefone"
                                        type="tel"
                                        maxlength="20"
                                        autocomplete="tel"
                                        placeholder="(00) 00000-0000"
                                        @input="aoDigitarTelefone"
                                    />
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-localidade">
                                        Localidade atendida <span aria-hidden="true">*</span>
                                    </label>
                                    <select
                                        id="part-localidade"
                                        v-model="form.localidade_atendida"
                                        required
                                        :aria-invalid="Boolean(errosCampo.localidade_atendida)"
                                    >
                                        <option disabled value="">Selecione</option>
                                        <option
                                            v-for="o in opcoes.localidadeAtendida"
                                            :key="o.value"
                                            :value="o.value"
                                        >
                                            {{ o.label }}
                                        </option>
                                    </select>
                                    <p v-if="errosCampo.localidade_atendida" class="part-pub__err">
                                        {{ errosCampo.localidade_atendida }}
                                    </p>
                                </div>

                                <div class="part-pub__field">
                                    <label for="part-local-desc">Nome da localidade (se aplicável)</label>
                                    <input
                                        id="part-local-desc"
                                        v-model="form.localidade_descricao"
                                        type="text"
                                        maxlength="120"
                                        placeholder="Ex.: Distrito Centro / Bairro Alto"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <!-- Passo 2 -->
                        <fieldset v-show="passo === 1" class="part-pub__fieldset">
                            <legend class="part-pub__legend">Sua proposta</legend>
                            <p class="part-pub__hint">
                                Descreva o problema, a solução e os benefícios esperados —
                                quanto mais claro, melhor para a análise técnica.
                            </p>

                            <div class="part-pub__grid-fields">
                                <div class="part-pub__field part-pub__field--full">
                                    <label for="part-funcao">
                                        Área temática <span aria-hidden="true">*</span>
                                    </label>
                                    <select
                                        id="part-funcao"
                                        v-model.number="form.participacao_funcao_id"
                                        required
                                        :aria-invalid="Boolean(errosCampo.participacao_funcao_id)"
                                    >
                                        <option :value="null" disabled>Selecione a função pública</option>
                                        <option
                                            v-for="f in opcoes.funcao"
                                            :key="f.id"
                                            :value="f.id"
                                        >
                                            {{ f.codigo }} — {{ f.nome }}
                                        </option>
                                    </select>
                                    <p v-if="errosCampo.participacao_funcao_id" class="part-pub__err">
                                        {{ errosCampo.participacao_funcao_id }}
                                    </p>
                                </div>

                                <div class="part-pub__field part-pub__field--full">
                                    <label for="part-tipo">
                                        Tipo da demanda <span aria-hidden="true">*</span>
                                    </label>
                                    <select
                                        id="part-tipo"
                                        v-model="form.tipo_demanda"
                                        required
                                        :aria-invalid="Boolean(errosCampo.tipo_demanda)"
                                    >
                                        <option disabled value="">Selecione</option>
                                        <option
                                            v-for="o in opcoes.tipoDemanda"
                                            :key="o.value"
                                            :value="o.value"
                                        >
                                            {{ o.label }}
                                        </option>
                                    </select>
                                    <p v-if="errosCampo.tipo_demanda" class="part-pub__err">
                                        {{ errosCampo.tipo_demanda }}
                                    </p>
                                </div>

                                <div class="part-pub__field part-pub__field--full">
                                    <label for="part-problema">
                                        Problema existente <span aria-hidden="true">*</span>
                                    </label>
                                    <textarea
                                        id="part-problema"
                                        v-model="form.problema"
                                        rows="4"
                                        required
                                        placeholder="Ex.: A quadra não possui cobertura e fica inutilizável em dias de chuva."
                                        :aria-invalid="Boolean(errosCampo.problema)"
                                    />
                                    <p v-if="errosCampo.problema" class="part-pub__err">
                                        {{ errosCampo.problema }}
                                    </p>
                                </div>

                                <div class="part-pub__field part-pub__field--full">
                                    <label for="part-solucao">
                                        Solução proposta <span aria-hidden="true">*</span>
                                    </label>
                                    <textarea
                                        id="part-solucao"
                                        v-model="form.solucao"
                                        rows="4"
                                        required
                                        placeholder="Ex.: Construção de cobertura na quadra esportiva da comunidade Pinheiros."
                                        :aria-invalid="Boolean(errosCampo.solucao)"
                                    />
                                    <p v-if="errosCampo.solucao" class="part-pub__err">
                                        {{ errosCampo.solucao }}
                                    </p>
                                </div>

                                <div class="part-pub__field part-pub__field--full">
                                    <label for="part-beneficios">
                                        Benefícios esperados <span aria-hidden="true">*</span>
                                    </label>
                                    <textarea
                                        id="part-beneficios"
                                        v-model="form.beneficios"
                                        rows="4"
                                        required
                                        placeholder="Ex.: Permitir atividades esportivas e culturais durante todo o ano."
                                        :aria-invalid="Boolean(errosCampo.beneficios)"
                                    />
                                    <p v-if="errosCampo.beneficios" class="part-pub__err">
                                        {{ errosCampo.beneficios }}
                                    </p>
                                </div>
                            </div>
                        </fieldset>

                        <!-- Passo 3 -->
                        <fieldset v-show="passo === 2" class="part-pub__fieldset">
                            <legend class="part-pub__legend">Impacto e prioridade</legend>
                            <p class="part-pub__hint">
                                Essas informações ajudam a alinhar a demanda às políticas
                                públicas e ao planejamento territorial.
                            </p>

                            <div class="part-pub__grid-fields">
                                <div class="part-pub__field part-pub__field--full">
                                    <span class="part-pub__label-like">
                                        Público beneficiado <span aria-hidden="true">*</span>
                                    </span>
                                    <p class="part-pub__hint part-pub__hint--inline">
                                        Você pode marcar mais de uma opção.
                                    </p>
                                    <div
                                        class="part-pub__chips"
                                        role="group"
                                        aria-label="Público beneficiado"
                                    >
                                        <label
                                            v-for="o in opcoes.publicoBeneficiado"
                                            :key="o.value"
                                            class="part-pub__chip"
                                            :class="{
                                                'part-pub__chip--on':
                                                    form.publico_beneficiado.includes(o.value)
                                            }"
                                        >
                                            <input
                                                v-model="form.publico_beneficiado"
                                                type="checkbox"
                                                :value="o.value"
                                                name="publico"
                                            />
                                            {{ o.label }}
                                        </label>
                                    </div>
                                    <p v-if="errosCampo.publico_beneficiado" class="part-pub__err">
                                        {{ errosCampo.publico_beneficiado }}
                                    </p>
                                </div>

                                <div class="part-pub__field part-pub__field--full">
                                    <span class="part-pub__label-like">
                                        Grau de prioridade <span aria-hidden="true">*</span>
                                    </span>
                                    <div
                                        class="part-pub__prio"
                                        role="radiogroup"
                                        aria-label="Prioridade"
                                    >
                                        <label
                                            v-for="o in opcoes.prioridade"
                                            :key="o.value"
                                            class="part-pub__prio-item"
                                            :class="[
                                                `part-pub__prio-item--${o.value}`,
                                                {
                                                    'part-pub__prio-item--on':
                                                        form.prioridade === o.value
                                                }
                                            ]"
                                        >
                                            <input
                                                v-model="form.prioridade"
                                                type="radio"
                                                :value="o.value"
                                                name="prioridade"
                                            />
                                            {{ o.label }}
                                        </label>
                                    </div>
                                    <p v-if="errosCampo.prioridade" class="part-pub__err">
                                        {{ errosCampo.prioridade }}
                                    </p>
                                </div>

                                <div class="part-pub__field part-pub__field--full">
                                    <span class="part-pub__label-like">
                                        Abrangência da proposta <span aria-hidden="true">*</span>
                                    </span>
                                    <div
                                        class="part-pub__chips"
                                        role="radiogroup"
                                        aria-label="Abrangência"
                                    >
                                        <label
                                            v-for="o in opcoes.abrangencia"
                                            :key="o.value"
                                            class="part-pub__chip"
                                            :class="{
                                                'part-pub__chip--on': form.abrangencia === o.value
                                            }"
                                        >
                                            <input
                                                v-model="form.abrangencia"
                                                type="radio"
                                                :value="o.value"
                                                name="abrangencia"
                                            />
                                            {{ o.label }}
                                        </label>
                                    </div>
                                    <p v-if="errosCampo.abrangencia" class="part-pub__err">
                                        {{ errosCampo.abrangencia }}
                                    </p>
                                </div>
                            </div>
                        </fieldset>

                        <!-- Passo 4 -->
                        <fieldset v-show="passo === 3" class="part-pub__fieldset">
                            <legend class="part-pub__legend">Confirmação e envio</legend>
                            <p class="part-pub__hint">
                                Revise e confirme os aceites legais para registrar sua
                                proposta.
                            </p>

                            <label class="part-pub__check">
                                <input v-model="form.deseja_info_audiencia" type="checkbox" />
                                <span>
                                    Deseja receber informações sobre a audiência pública?
                                    <small v-if="form.deseja_info_audiencia">
                                        Nesse caso, o e-mail torna-se obrigatório.
                                    </small>
                                </span>
                            </label>

                            <div
                                v-if="form.deseja_info_audiencia"
                                class="part-pub__field part-pub__field--full mt-2"
                            >
                                <label for="part-email-audiencia">
                                    E-mail para convocação <span aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="part-email-audiencia"
                                    v-model="form.email"
                                    type="email"
                                    maxlength="100"
                                    required
                                    :aria-invalid="Boolean(errosCampo.email)"
                                    placeholder="seu@email.com"
                                />
                                <p v-if="errosCampo.email" class="part-pub__err">
                                    {{ errosCampo.email }}
                                </p>
                            </div>

                            <label
                                class="part-pub__check part-pub__check--legal"
                                :class="{ 'part-pub__check--erro': errosCampo.autoriza_lgpd }"
                            >
                                <input v-model="form.autoriza_lgpd" type="checkbox" required />
                                <span>
                                    Autorizo o tratamento dos dados pessoais para fins
                                    estatísticos e para subsidiar a elaboração do instrumento
                                    de planejamento orçamentário, nos termos da Lei Geral
                                    de Proteção de Dados — Lei Federal nº 13.709/2018.
                                    <em aria-hidden="true">*</em>
                                </span>
                            </label>
                            <p v-if="errosCampo.autoriza_lgpd" class="part-pub__err">
                                {{ errosCampo.autoriza_lgpd }}
                            </p>

                            <label
                                class="part-pub__check part-pub__check--legal"
                                :class="{
                                    'part-pub__check--erro': errosCampo.aceite_viabilidade
                                }"
                            >
                                <input
                                    v-model="form.aceite_viabilidade"
                                    type="checkbox"
                                    required
                                />
                                <span>
                                    Declaro estar ciente de que a apresentação da proposta
                                    não gera obrigação de inclusão automática no instrumento
                                    de planejamento (LOA/LDO/PPA), estando sua implementação
                                    condicionada à viabilidade técnica, jurídica,
                                    orçamentária e financeira do Município.
                                    <em aria-hidden="true">*</em>
                                </span>
                            </label>
                            <p v-if="errosCampo.aceite_viabilidade" class="part-pub__err">
                                {{ errosCampo.aceite_viabilidade }}
                            </p>
                        </fieldset>

                        <div class="part-pub__nav">
                            <button
                                v-if="passo > 0"
                                type="button"
                                class="part-pub__btn part-pub__btn--ghost"
                                @click="irAnterior"
                            >
                                <RiArrowLeftSLine /> Voltar
                            </button>
                            <span v-else class="part-pub__nav-spacer" />

                            <button
                                v-if="passo < totalPassos - 1"
                                type="button"
                                class="part-pub__btn part-pub__btn--primary"
                                @click="irProximo"
                            >
                                Continuar <RiArrowRightSLine />
                            </button>
                            <button
                                v-else
                                type="submit"
                                class="part-pub__btn part-pub__btn--primary"
                                :disabled="enviando"
                                :aria-busy="enviando"
                            >
                                <RiLoader4Line v-if="enviando" class="part-pub__spin" />
                                {{ enviando ? "Enviando..." : "Enviar proposta" }}
                            </button>
                        </div>
                    </form>
                </template>

                <section
                    v-else-if="erroGeral"
                    class="part-pub__alert part-pub__alert--erro"
                    role="alert"
                >
                    {{ erroGeral }}
                </section>
            </template>
        </div>

        <footer class="part-pub__footer">
            Formulario eletrônico de participação popular · LOA {{ exercicio }}
        </footer>
    </article>
</template>

<style scoped>
.part-pub {
    --part-ink: #0f2744;
    --part-mute: #5a6b7d;
    --part-accent: #0d6e6e;
    --part-accent-2: #1b4f8a;
    --part-surface: rgba(255, 255, 255, 0.88);
    --part-line: rgba(15, 39, 68, 0.1);
    --part-radius: 1.25rem;
    position: relative;
    isolation: isolate;
    min-height: 100dvh;
    color: var(--part-ink);
    background: #e8f1f5;
    overflow-x: hidden;
}

.part-pub__bg {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background:
        radial-gradient(1200px 600px at 10% -10%, #c9e7ef 0%, transparent 55%),
        radial-gradient(900px 500px at 100% 0%, #d7e4f7 0%, transparent 50%),
        linear-gradient(180deg, #edf5f8 0%, #e4eef3 45%, #dfe9f0 100%);
}

.part-pub__orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.55;
    animation: part-float 14s ease-in-out infinite;
}

.part-pub__orb--1 {
    width: 280px;
    height: 280px;
    background: #7ec8c8;
    top: 12%;
    left: -80px;
}

.part-pub__orb--2 {
    width: 220px;
    height: 220px;
    background: #9bb8e8;
    right: -60px;
    bottom: 18%;
    animation-delay: -4s;
}

.part-pub__grid {
    position: absolute;
    inset: 0;
    background-image:
        linear-gradient(rgba(15, 39, 68, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 39, 68, 0.035) 1px, transparent 1px);
    background-size: 28px 28px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.35), transparent 70%);
}

@keyframes part-float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(18px);
    }
}

.part-pub__header {
    padding: 1rem 1.25rem 0.5rem;
    max-width: 920px;
    margin: 0 auto;
    width: 100%;
}

.part-pub__brand {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.part-pub__logo {
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 8px 20px rgba(15, 39, 68, 0.12);
}

.part-pub__brand-name {
    margin: 0;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.02em;
}

.part-pub__brand-tag {
    margin: 0.15rem 0 0;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    color: var(--part-mute);
}

.part-pub__brand-tag :deep(svg) {
    width: 0.95rem;
    height: 0.95rem;
    color: var(--part-accent);
}

.part-pub__shell {
    width: min(920px, calc(100% - 1.5rem));
    margin: 0 auto 1.5rem;
    background: var(--part-surface);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: var(--part-radius);
    box-shadow:
        0 20px 50px rgba(15, 39, 68, 0.1),
        0 1px 0 rgba(255, 255, 255, 0.8) inset;
    padding: 1.25rem 1.15rem 1.5rem;
}

.part-pub__hero {
    margin-bottom: 1.25rem;
}

.part-pub__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--part-accent);
    background: rgba(13, 110, 110, 0.1);
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    margin-bottom: 0.85rem;
}

.part-pub__eyebrow :deep(svg) {
    width: 1rem;
    height: 1rem;
}

.part-pub__title {
    margin: 0 0 0.65rem;
    font-size: clamp(1.45rem, 4.5vw, 2.1rem);
    line-height: 1.2;
    letter-spacing: -0.03em;
    font-weight: 700;
}

.part-pub__title span {
    color: var(--part-accent-2);
}

.part-pub__lead {
    margin: 0 0 1rem;
    color: var(--part-mute);
    font-size: 0.98rem;
    line-height: 1.55;
}

.part-pub__intro-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    align-items: center;
}

.part-pub__info-toggle {
    border: 0;
    background: transparent;
    color: var(--part-accent-2);
    font-weight: 600;
    font-size: 0.88rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0;
    cursor: pointer;
    text-decoration: none;
}

.part-pub__info-toggle :deep(svg) {
    width: 1.05rem;
    height: 1.05rem;
}

.part-pub__info-toggle--link {
    color: var(--part-accent);
}

.part-pub__success-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    justify-content: center;
    margin-bottom: 1rem;
}

.part-pub__success-actions .part-pub__btn {
    text-decoration: none;
}

.part-pub__success-link-hint {
    margin: 0;
    font-size: 0.82rem;
    color: var(--part-mute);
    line-height: 1.45;
}

.part-pub__success-link-hint a {
    color: var(--part-accent-2);
    font-weight: 700;
    word-break: break-all;
}

.part-pub__info-panel {
    margin-top: 0.85rem;
    padding: 1rem;
    border-radius: 1rem;
    background: linear-gradient(160deg, #f3f8fb, #eef4f8);
    border: 1px solid var(--part-line);
    font-size: 0.9rem;
    color: var(--part-mute);
    line-height: 1.55;
    animation: part-in 0.35s ease;
}

.part-pub__info-panel ul {
    margin: 0.65rem 0;
    padding-left: 1.1rem;
}

.part-pub__info-note {
    margin: 0;
    font-size: 0.82rem;
    opacity: 0.9;
}

@keyframes part-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: none;
    }
}

.part-pub__loading {
    display: grid;
    place-items: center;
    gap: 0.5rem;
    padding: 2.5rem 1rem;
    color: var(--part-mute);
}

.part-pub__spin {
    width: 1.5rem;
    height: 1.5rem;
    animation: part-spin 0.9s linear infinite;
}

@keyframes part-spin {
    to {
        transform: rotate(360deg);
    }
}

.part-pub__progress {
    margin-bottom: 1.25rem;
}

.part-pub__progress-bar {
    height: 6px;
    border-radius: 999px;
    background: rgba(15, 39, 68, 0.08);
    overflow: hidden;
    margin-bottom: 0.85rem;
}

.part-pub__progress-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--part-accent), var(--part-accent-2));
    transition: width 0.35s ease;
}

.part-pub__steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.35rem;
}

.part-pub__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
    opacity: 0.45;
}

.part-pub__step--ativo,
.part-pub__step--feito {
    opacity: 1;
}

.part-pub__step-num {
    width: 1.7rem;
    height: 1.7rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 0.78rem;
    font-weight: 700;
    background: #d9e4ee;
    color: var(--part-ink);
}

.part-pub__step--ativo .part-pub__step-num {
    background: var(--part-accent);
    color: #fff;
    box-shadow: 0 6px 14px rgba(13, 110, 110, 0.35);
}

.part-pub__step--feito .part-pub__step-num {
    background: #1b4f8a;
    color: #fff;
}

.part-pub__step-label {
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--part-mute);
}

.part-pub__fieldset {
    border: 0;
    margin: 0;
    padding: 0;
    animation: part-in 0.3s ease;
}

.part-pub__legend {
    font-size: 1.05rem;
    font-weight: 700;
    margin-bottom: 0.35rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.part-pub__legend :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
    color: var(--part-accent);
}

.part-pub__hint {
    margin: 0 0 1rem;
    color: var(--part-mute);
    font-size: 0.88rem;
    line-height: 1.45;
}

.part-pub__hint--inline {
    margin: 0 0 0.65rem;
    font-size: 0.8rem;
}

.part-pub__grid-fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.9rem;
}

.part-pub__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.part-pub__field label,
.part-pub__label-like {
    font-size: 0.86rem;
    font-weight: 600;
}

.part-pub__field input,
.part-pub__field select,
.part-pub__field textarea {
    width: 100%;
    border: 1px solid var(--part-line);
    border-radius: 0.85rem;
    padding: 0.75rem 0.9rem;
    font: inherit;
    background: #fff;
    color: var(--part-ink);
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}

.part-pub__field textarea {
    resize: vertical;
    min-height: 6.5rem;
}

.part-pub__field input:focus,
.part-pub__field select:focus,
.part-pub__field textarea:focus {
    outline: none;
    border-color: rgba(13, 110, 110, 0.55);
    box-shadow: 0 0 0 4px rgba(13, 110, 110, 0.12);
}

.part-pub__field input[aria-invalid="true"],
.part-pub__field select[aria-invalid="true"],
.part-pub__field textarea[aria-invalid="true"] {
    border-color: #d92d20;
}

.part-pub__err {
    margin: 0;
    color: #b42318;
    font-size: 0.8rem;
}

.part-pub__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.part-pub__chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    border: 1px solid var(--part-line);
    background: #fff;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease;
}

.part-pub__chip input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.part-pub__chip--on {
    background: rgba(13, 110, 110, 0.12);
    border-color: rgba(13, 110, 110, 0.45);
    color: var(--part-accent);
}

.part-pub__prio {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}

.part-pub__prio-item {
    position: relative;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 0.85rem 0.5rem;
    border-radius: 1rem;
    border: 1px solid var(--part-line);
    background: #fff;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
}

.part-pub__prio-item input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.part-pub__prio-item--on {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(15, 39, 68, 0.08);
}

.part-pub__prio-item--muito_alta.part-pub__prio-item--on {
    background: #fde8e8;
    border-color: #f3a1a1;
    color: #b42318;
}

.part-pub__prio-item--alta.part-pub__prio-item--on {
    background: #fff4e5;
    border-color: #f5c27a;
    color: #9a5b00;
}

.part-pub__prio-item--media.part-pub__prio-item--on {
    background: #e8f0fe;
    border-color: #9db7ef;
    color: #1a56c4;
}

.part-pub__prio-item--baixa.part-pub__prio-item--on {
    background: #eef2f6;
    border-color: #c3cdd8;
    color: #445466;
}

.part-pub__check {
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    margin-top: 0.85rem;
    padding: 0.85rem 0.95rem;
    border-radius: 1rem;
    background: #f7fafc;
    border: 1px solid var(--part-line);
    font-size: 0.9rem;
    line-height: 1.45;
    cursor: pointer;
}

.part-pub__check input {
    margin-top: 0.2rem;
    width: 1.1rem;
    height: 1.1rem;
    accent-color: var(--part-accent);
    flex-shrink: 0;
}

.part-pub__check small {
    display: block;
    margin-top: 0.25rem;
    color: var(--part-mute);
    font-size: 0.78rem;
}

.part-pub__check--legal {
    background: #fff;
}

.part-pub__check--erro {
    border-color: #f3a1a1;
    background: #fff6f6;
}

.part-pub__nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.35rem;
    padding-top: 1rem;
    border-top: 1px solid var(--part-line);
}

.part-pub__nav-spacer {
    width: 1px;
}

.part-pub__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    border: 0;
    border-radius: 999px;
    padding: 0.8rem 1.2rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition:
        transform 0.15s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

.part-pub__btn:disabled {
    opacity: 0.7;
    cursor: wait;
}

.part-pub__btn :deep(svg) {
    width: 1.15rem;
    height: 1.15rem;
}

.part-pub__btn--primary {
    background: linear-gradient(135deg, var(--part-accent), #127a7a 40%, var(--part-accent-2));
    color: #fff;
    box-shadow: 0 12px 24px rgba(27, 79, 138, 0.22);
}

.part-pub__btn--primary:hover:not(:disabled) {
    transform: translateY(-1px);
}

.part-pub__btn--ghost {
    background: transparent;
    color: var(--part-mute);
    border: 1px solid var(--part-line);
}

.part-pub__alert {
    padding: 0.85rem 1rem;
    border-radius: 0.9rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.part-pub__alert--erro {
    background: #fde8e8;
    color: #b42318;
    border: 1px solid #f3b4b0;
}

.part-pub__success {
    text-align: center;
    padding: 1.5rem 0.5rem 0.75rem;
    animation: part-in 0.4s ease;
}

.part-pub__success-icon {
    width: 3.2rem;
    height: 3.2rem;
    color: #0f6b3a;
}

.part-pub__success-title {
    margin: 0.75rem 0 0.35rem;
    font-size: 1.6rem;
    letter-spacing: -0.03em;
}

.part-pub__success-protocolo {
    margin: 0 0 0.75rem;
    font-size: 1.05rem;
    color: var(--part-accent-2);
}

.part-pub__success-text {
    margin: 0 auto 1.25rem;
    max-width: 34rem;
    color: var(--part-mute);
    line-height: 1.55;
}

.part-pub__footer {
    text-align: center;
    font-size: 0.75rem;
    color: var(--part-mute);
    padding: 0 1rem 1.5rem;
}

@media (min-width: 640px) {
    .part-pub__shell {
        padding: 1.75rem 1.75rem 1.85rem;
    }

    .part-pub__grid-fields {
        grid-template-columns: 1fr 1fr;
    }

    .part-pub__field--full {
        grid-column: 1 / -1;
    }

    .part-pub__prio {
        grid-template-columns: repeat(4, 1fr);
    }

    .part-pub__step-label {
        font-size: 0.78rem;
    }
}

@media (min-width: 900px) {
    .part-pub__header {
        padding-top: 1.5rem;
    }

    .part-pub__shell {
        padding: 2rem 2.25rem 2rem;
    }
}

@media (max-width: 420px) {
    .part-pub__step-label {
        font-size: 0.62rem;
    }

    .part-pub__nav {
        flex-direction: column-reverse;
        align-items: stretch;
    }

    .part-pub__btn {
        width: 100%;
    }
}
</style>
