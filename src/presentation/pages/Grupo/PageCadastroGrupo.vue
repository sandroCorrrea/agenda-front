<script setup lang="ts">
import { reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
    RiArrowLeftLine,
    RiArrowRightLine,
    RiCheckLine,
    RiKey2Line,
    RiTeamLine,
    RiUserLine
} from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import { useGruposAdmin } from "@/presentation/composables/Grupo/useGruposAdmin";

const router = useRouter();
const { criar, salvando, erro } = useGruposAdmin();
const erroLocal = ref<string | null>(null);

const form = reactive({
    nome: "",
    descricao: "",
    ativo: true
});

async function aoSalvar(e: Event) {
    e.preventDefault();
    erroLocal.value = null;
    if (!form.nome.trim()) {
        erroLocal.value = "Informe um nome para o grupo.";
        return;
    }
    try {
        const criado = await criar({
            nome: form.nome.trim(),
            descricao: form.descricao.trim() || null,
            ativo: form.ativo
        });
        await router.push({
            name: "AdministradorGrupoEditar",
            params: { id: criado.id },
            query: { aba: "permissoes", novo: "1" }
        });
    } catch {
        return;
    }
}
</script>

<template>
    <article class="admin-list-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero
                title="Novo grupo"
                subtitle="Passo 1 de 3 — defina o nome e a descrição. Em seguida você libera permissões e convida membros."
            >
                <template #icon><RiTeamLine /></template>
                <template #actions>
                    <RouterLink :to="{ name: 'AdministradorGrupos' }" class="btn">
                        <RiArrowLeftLine class="me-1" />
                        Voltar à lista
                    </RouterLink>
                </template>
            </AdminPageHero>

            <nav class="grp-steps mb-4" aria-label="Etapas de criação">
                <div class="grp-step grp-step--active">
                    <span class="grp-step__num">1</span>
                    <div>
                        <strong>Dados</strong>
                        <small>Nome e status</small>
                    </div>
                </div>
                <div class="grp-step__line" aria-hidden="true" />
                <div class="grp-step">
                    <span class="grp-step__num"><RiKey2Line /></span>
                    <div>
                        <strong>Permissões</strong>
                        <small>Menus e ações</small>
                    </div>
                </div>
                <div class="grp-step__line" aria-hidden="true" />
                <div class="grp-step">
                    <span class="grp-step__num"><RiUserLine /></span>
                    <div>
                        <strong>Membros</strong>
                        <small>Quem pertence</small>
                    </div>
                </div>
            </nav>

            <div v-if="erro || erroLocal" class="admin-alert admin-alert--erro mb-3">
                {{ erro || erroLocal }}
            </div>

            <section class="card admin-card border-0 shadow-sm">
                <div class="card-body p-4 p-md-5">
                    <form class="grp-form" @submit="aoSalvar">
                        <div class="grp-form__bloco">
                            <label class="form-label" for="grp-nome">Nome do grupo</label>
                            <input
                                id="grp-nome"
                                v-model="form.nome"
                                type="text"
                                class="form-control form-control-lg"
                                required
                                maxlength="120"
                                placeholder="Ex.: Prefeitura — Participação popular"
                                autocomplete="off"
                            />
                            <small class="text-muted">Use um nome claro para a equipe identificar o propósito.</small>
                        </div>

                        <div class="grp-form__bloco">
                            <label class="form-label" for="grp-desc">Descrição (opcional)</label>
                            <textarea
                                id="grp-desc"
                                v-model="form.descricao"
                                class="form-control"
                                rows="3"
                                placeholder="O que este grupo pode fazer no sistema?"
                            />
                        </div>

                        <div class="grp-switch">
                            <div>
                                <strong>Grupo ativo</strong>
                                <p>Grupos inativos não liberam menus para os membros.</p>
                            </div>
                            <label class="grp-switch__control">
                                <input id="grupo-ativo" v-model="form.ativo" type="checkbox" />
                                <span>{{ form.ativo ? "Ativo" : "Inativo" }}</span>
                            </label>
                        </div>

                        <div class="grp-form__acoes">
                            <RouterLink
                                :to="{ name: 'AdministradorGrupos' }"
                                class="btn grp-btn-ghost"
                            >
                                Cancelar
                            </RouterLink>
                            <button type="submit" class="btn grp-btn-primary" :disabled="salvando">
                                <template v-if="salvando">Criando...</template>
                                <template v-else>
                                    Continuar para permissões
                                    <RiArrowRightLine />
                                </template>
                            </button>
                        </div>
                    </form>

                    <aside class="grp-callout mt-4">
                        <RiCheckLine />
                        <p>
                            Após criar, escolha se o grupo é para <strong>portal do cliente</strong>
                            ou <strong>área administrativa (prefeitura)</strong> ao marcar as
                            permissões. Não misture os dois escopos no mesmo grupo.
                        </p>
                    </aside>
                </div>
            </section>
        </div>
    </article>
</template>

<style scoped>
.admin-alert {
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.92rem;
}

.admin-alert--erro {
    background: #fff3f3;
    border: 1px solid #f1b4b4;
    color: #9e2b2b;
}

.grp-steps {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    gap: 0.55rem;
    align-items: center;
    padding: 0.85rem 1rem;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(31, 46, 84, 0.08);
    box-shadow: 0 8px 20px rgba(28, 51, 89, 0.05);
}

.grp-step {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-width: 0;
    opacity: 0.55;
}

.grp-step--active {
    opacity: 1;
}

.grp-step__num {
    width: 36px;
    height: 36px;
    border-radius: 11px;
    display: grid;
    place-items: center;
    background: rgba(45, 74, 132, 0.1);
    color: #2d4a84;
    font-weight: 800;
    flex-shrink: 0;
}

.grp-step--active .grp-step__num {
    background: linear-gradient(135deg, #2d4a84, #2da0a8);
    color: #fff;
}

.grp-step strong {
    display: block;
    font-size: 0.88rem;
    color: #1c3359;
}

.grp-step small {
    display: block;
    color: #6b7c99;
    font-size: 0.75rem;
}

.grp-step__line {
    height: 2px;
    background: linear-gradient(90deg, rgba(45, 74, 132, 0.2), rgba(45, 160, 168, 0.35));
    border-radius: 99px;
}

.grp-form__bloco {
    margin-bottom: 1.15rem;
}

.grp-form__bloco .form-label {
    font-weight: 700;
    color: #1c3359;
}

.grp-switch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.1rem;
    border-radius: 14px;
    background: #f4f7fc;
    border: 1px solid rgba(31, 46, 84, 0.08);
    margin-bottom: 1.4rem;
}

.grp-switch strong {
    display: block;
    color: #1c3359;
}

.grp-switch p {
    margin: 0.2rem 0 0;
    color: #6b7c99;
    font-size: 0.86rem;
}

.grp-switch__control {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-weight: 700;
    color: #2d4a84;
    margin: 0;
}

.grp-form__acoes {
    display: flex;
    justify-content: flex-end;
    gap: 0.65rem;
    flex-wrap: wrap;
}

.grp-btn-primary {
    display: inline-flex !important;
    align-items: center;
    gap: 0.35rem;
    background: linear-gradient(120deg, #2d4a84, #2da0a8) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    padding: 0.65rem 1.15rem !important;
}

.grp-btn-ghost {
    border-radius: 12px !important;
    font-weight: 700 !important;
    background: #edf2fb !important;
    color: #233b6a !important;
    border: none !important;
}

.grp-callout {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.95rem 1rem;
    border-radius: 14px;
    background: rgba(45, 160, 168, 0.1);
    color: #1a5f64;
}

.grp-callout p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.45;
}

@media (max-width: 767.98px) {
    .grp-steps {
        grid-template-columns: 1fr;
    }

    .grp-step__line {
        display: none;
    }

    .grp-switch {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
