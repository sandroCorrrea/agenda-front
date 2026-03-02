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