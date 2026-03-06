<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useFindAllAviso } from '@/presentation/composables/Aviso/useFindAllAviso';
import { useDownloadAviso } from '@/presentation/composables/Aviso/useDownloadAviso';
import { RiInfoCardLine } from '@remixicon/vue';
import BaseLoading from '@/presentation/components/Shared/BaseLoading.vue';

const { findAll, avisos, loading, error } = useFindAllAviso();
const { download, loading: downloadLoading, error: downloadError } = useDownloadAviso();

const downloading = ref<Record<number, boolean>>({});

const query = ref('');
let debounceTimer: any = null;

onMounted(() => {
    findAll(1, 100);
});

watch(query, (newVal) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const nome = (newVal ?? '').trim();
        if (nome.length === 0) {
            findAll(1, 100);
        } else {
            findAll(1, 100, nome);
        }
    }, 250);
});

function formatDate(dateStr: string | undefined) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return dateStr;
    }
}

const filteredAvisos = computed(() => {
    return avisos.value;
});

async function handleDownload(avisoId: number) {
    downloading.value[avisoId] = true;
    try {
        const blob = await download(avisoId);
        if (blob) {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `aviso-${avisoId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } else {
            console.error('Falha no download:', downloadError.value);
        }
    } finally {
        downloading.value[avisoId] = false;
    }
}
</script>

<template>
    <article class="page-servicos d-flex align-items-start min-vh-100 py-4">
        <div class="container">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                <div class="mb-2 mb-md-0">
                    <h1 class="section-title">Avisos</h1>
                    <p class="text-muted">
                        <RiInfoCardLine /> Os avisos ficam disponíveis apenas por 24 horas; após esse período eles
                        expiram automaticamente.
                    </p>
                </div>

                <div class="ms-0 ms-md-3 search-box" v-if="filteredAvisos && filteredAvisos.length > 0">
                    <div class="input-group">
                        <input v-model="query" type="search" class="form-control" placeholder="Buscar por nome do aviso"
                            aria-label="Buscar avisos" />
                    </div>
                </div>
            </div>

            <BaseLoading v-if="loading" text="Carregando avisos ..."/>

            <div v-else-if="filteredAvisos && filteredAvisos.length > 0">
                <div class="row g-3 mt-2 justify-content-center">
                    <div class="col-12 col-md-8" v-for="aviso in filteredAvisos" :key="aviso.id">
                        <div class="card shadow-sm mb-3">
                            <div class="card-body d-flex flex-column">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title mb-1">{{ aviso.nome }}</h5>
                                    <span class="text-muted small">Expira: {{ formatDate(aviso.expiracao) }}</span>
                                </div>

                                <p class="card-text text-muted mb-3">
                                    {{ aviso.descricao ?? '—' }}
                                </p>

                                <div class="mt-auto d-flex justify-content-between align-items-center">
                                    <small class="text-muted">Disponível por 24 horas</small>
                                    <button class="btn btn-primary btn-sm" @click="handleDownload(aviso.id)"
                                        :disabled="downloading[aviso.id]">
                                        {{ downloading[aviso.id] ? 'Baixando...' : 'Baixar' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="col-12 col-sm-6 col-md-4">

                <div class="col-12 col-lg-8">
                    <p class="text-muted">
                        Nenhum aviso encontrado
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
    padding: 1.25rem 1.5rem;
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

.aviso-info {
    font-size: 0.9rem;
    color: #6c757d;
}

.search-box {
    width: 100%;
}

@media (min-width: 768px) {
    .search-box {
        min-width: 260px;
        width: auto;
    }

    .card-body {
        padding: 1.5rem 1.75rem;
    }
}
</style>