<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useFindAllAviso } from '@/presentation/composables/Aviso/useFindAllAviso';
import { useDownloadAviso } from '@/presentation/composables/Aviso/useDownloadAviso';
import { RiInfoCardLine } from '@remixicon/vue';

const { findAll, avisos, loading, error } = useFindAllAviso();
const { download, loading: downloadLoading, error: downloadError } = useDownloadAviso();

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
}
</script>

<template>
    <article class="page-servicos d-flex align-items-start min-vh-100 py-4">
        <div class="container">
            <div
                class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
                <div class="mb-2 mb-md-0">
                    <h1 class="mb-1">Avisos</h1>
                    <p class="text-muted mb-0 small">
                        <RiInfoCardLine /> Os avisos ficam disponíveis apenas por 24 horas; após esse período eles
                        expiram automaticamente.
                    </p>
                </div>

                <div class="ms-0 ms-md-3 search-box">
                    <div class="input-group">
                        <input v-model="query" type="search" class="form-control" placeholder="Buscar por nome do aviso"
                            aria-label="Buscar avisos" />
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <div v-if="loading" class="text-muted">Carregando...</div>
                <div v-if="error" class="alert alert-danger">Erro: {{ error }}</div>
            </div>

            <div>
                <div v-if="!filteredAvisos || filteredAvisos.length === 0" class="text-muted">Nenhum aviso encontrado.
                </div>

                <div class="row g-3 mt-2 justify-content-center" v-else>
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
                                    <button class="btn btn-outline-primary btn-sm" @click="handleDownload(aviso.id)"
                                        :disabled="downloadLoading">
                                        {{ downloadLoading ? 'Baixando...' : 'Baixar' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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

.page-servicos h1 {
    font-size: 1.5rem;
    font-weight: 700;
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