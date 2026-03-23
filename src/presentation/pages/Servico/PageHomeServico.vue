<script lang="ts" setup>
import { onMounted } from 'vue';
import { useFindAllServico } from '@/presentation/composables/Servico/useFindAllServico';
import BaseLoading from '@/presentation/components/Shared/BaseLoading.vue';

const { findAll, servicos, loading, error } = useFindAllServico();

onMounted(async () => {
    await findAll(1, 20);
});
</script>

<template>
    <article class="page-servicos d-flex align-items-start min-vh-100 py-4">
        <div class="container">

            <BaseLoading v-if="loading" text="Carregando serviços ..."/>

            <div v-else-if="servicos && servicos.length > 0">
                <div class="row g-3 mt-2">
                    <div class="col-12 col-sm-6 col-md-4" v-for="servico in servicos" :key="servico.id">
                        <div class="card shadow-sm h-100">
                            <div class="card-body d-flex flex-column">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title mb-1">{{ servico.nome }}</h5>
                                    <span :class="['status-badge', servico.status === 'ativo' ? 'active' : 'inactive']">
                                        {{ (servico.status ?? '').toString().toUpperCase() || 'N/A' }}
                                    </span>
                                </div>

                                <p class="card-text text-muted mb-3">
                                    {{ servico.descricao ?? '—' }}
                                </p>

                                <div class="mt-auto d-flex justify-content-between align-items-center">
                                    <div>
                                        <RouterLink class="btn btn-sm btn-primary" to="/login">Agendar</RouterLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="col-12 col-sm-6 col-md-4">

                <div class="col-12 col-lg-8">
                    <p class="text-muted">
                        Nenhum serviço encontrado
                    </p>
                </div>

            </div>
        </div>
    </article>
</template>

<style scoped>
.card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border: 1px solid rgba(20, 30, 40, 0.04);
    border-radius: 12px;
    overflow: hidden;
}

.card-body {
    padding: 1rem 1.25rem;
}

.page-servicos {
    background: linear-gradient(180deg, rgba(250, 250, 250, 1) 0%, rgba(245, 247, 250, 1) 100%);
    padding-top: 6rem;
    padding-bottom: 4rem;
}

.section-title {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1e293b;
    position: relative;
    display: inline-block;
    padding-bottom: .5rem;
    margin-bottom: 2rem;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
    border-radius: 3px;
}

.status-badge {
    font-size: 0.675rem;
    padding: .25rem .5rem;
    border-radius: 999px;
    color: #fff;
    font-weight: 700;
    letter-spacing: .02em;
}

.status-badge.active {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%);
}

.status-badge.inactive {
    background: #9aaec0;
}

.btn-primary {
    background: linear-gradient(90deg, #5c6bc0 0%, #2da0a8 100%) !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 6px 10px !important;
    box-shadow: 0 8px 18px rgba(45, 160, 168, 0.08);
    font-weight: 600;
    font-size: .85rem;
}

.btn-outline-primary {
    border-radius: 8px;
    padding: 6px 10px;
    font-size: .85rem;
    color: #5c6bc0;
    border: 1px solid rgba(92, 107, 192, 0.18);
    background: transparent;
}

@media (min-width: 992px) {
    .card-body {
        padding: 1.25rem 1.5rem;
    }
}
</style>