<script setup lang="ts">
import { RiFileList3Line } from "@remixicon/vue";
import AdminPageHero from "@/presentation/components/Admin/AdminPageHero.vue";
import "@/presentation/assets/styles/politica-admin.css";
</script>

<template>
    <article class="admin-list-page pol-page min-vh-100 py-4">
        <div class="container">
            <AdminPageHero title="CASP" subtitle="Relatórios da remessa.">
                <template #icon><RiFileList3Line /></template>
            </AdminPageHero>

            <section class="card border-0 shadow-sm pol-panel">
                <div class="card-body text-center py-5 px-3">
                    <p class="text-muted mb-0">Nenhum relatório disponível até o momento.</p>
                </div>
            </section>
        </div>
    </article>
</template>
