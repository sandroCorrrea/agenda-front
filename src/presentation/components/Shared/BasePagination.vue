<script setup lang="ts">
import { computed, watch } from 'vue'
import {
    RiArrowRightSFill,
    RiArrowLeftSFill
} from "@remixicon/vue";

const props = defineProps<{
    currentPage: number
    lastPage: number
}>()

const emit = defineEmits<{
    (e: 'change', page: number): void
}>()

const visiblePages = computed(() => {
    const total = props.lastPage
    const current = props.currentPage
    const delta = 2

    let start = Math.max(1, current - delta)
    let end = Math.min(total, current + delta)

    if (current <= 3) {
        end = Math.min(5, total)
    }

    if (current >= total - 2) {
        start = Math.max(1, total - 4)
    }

    const pages = []
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return pages
})
</script>

<template>
    <nav v-if="lastPage > 1">
        <ul class="pagination justify-content-center">

            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" @click.prevent="$emit('change', currentPage - 1)">
                    <RiArrowLeftSFill />
                </a>
            </li>

            <li v-for="p in visiblePages" :key="p" class="page-item" :class="{ active: p === currentPage }">
                <a class="page-link" @click.prevent="$emit('change', p)">
                    {{ p }}
                </a>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                <a class="page-link" @click.prevent="$emit('change', currentPage + 1)">
                    <RiArrowRightSFill />
                </a>
            </li>

        </ul>
    </nav>
</template>

<style scoped>
.pagination {
    display: flex;
    gap: 6px;
    padding: 0;
    margin: 30px 0;
    list-style: none;
}
.page-item {
    display: flex;
}

.page-link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    height: 38px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    color: #374151;
    font-weight: 500;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.page-link:hover {
    background-color: #f3f4f6;
    border-color: #d1d5db;
}

.page-item.active .page-link {
    background-color: #2563eb;
    border-color: #2563eb;
    color: #ffffff;
    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
}

.page-item.disabled .page-link {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.page-link svg {
    width: 20px;
    height: 20px;
}
</style>