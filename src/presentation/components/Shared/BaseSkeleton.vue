<template>
    <div class="skeleton-card" v-for="i in 5" :key="i"></div>
</template>

<style scoped>
.skeleton-card {
    height: 250px;
    border-radius: 16px;
    margin-bottom: 20px;
    background: linear-gradient(90deg,
            #f0f0f0 25%,
            #e0e0e0 37%,
            #f0f0f0 63%);
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
    0% {
        background-position: 100% 0
    }

    100% {
        background-position: -100% 0
    }
}
</style>