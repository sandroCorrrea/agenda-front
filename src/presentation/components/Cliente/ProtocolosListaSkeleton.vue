<template>
  <div class="skel" aria-hidden="true">
    <div class="skel__desktop">
      <div v-for="n in linhas" :key="n" class="skel__row">
        <div class="skel__cell skel__cell--lg" />
        <div class="skel__cell skel__cell--md" />
        <div class="skel__cell skel__cell--md" />
        <div class="skel__cell skel__cell--md" />
        <div class="skel__cell skel__cell--xs" />
      </div>
    </div>
    <div class="skel__mobile">
      <div v-for="n in 4" :key="n" class="skel__card">
        <div class="skel__line skel__line--short" />
        <div class="skel__line" />
        <div class="skel__line skel__line--mid" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ linhas?: number }>(), { linhas: 6 });
</script>

<style scoped>
.skel__mobile {
  display: none;
  flex-direction: column;
  gap: 0.85rem;
}

.skel__desktop {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

@media (max-width: 991.98px) {
  .skel__desktop {
    display: none;
  }

  .skel__mobile {
    display: flex;
  }
}

.skel__row {
  display: grid;
  grid-template-columns: 1.5fr 0.75fr 0.9fr 1fr 0.45fr;
  gap: 0.5rem;
  align-items: center;
}

.skel__cell {
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e8ecf5 0%, #f4f6fb 50%, #e8ecf5 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s ease-in-out infinite;
}

.skel__cell--xs {
  max-width: 48px;
}
.skel__cell--sm {
  max-width: 64px;
}
.skel__cell--md {
  max-width: 100px;
}
.skel__cell--lg {
  max-width: 140px;
}
.skel__cell--xl {
  max-width: 220px;
}

.skel__card {
  border-radius: 16px;
  padding: 1rem 1.1rem;
  background: #fff;
  border: 1px solid rgba(20, 30, 40, 0.06);
  box-shadow: 0 8px 22px rgba(20, 30, 40, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.skel__line {
  height: 12px;
  border-radius: 8px;
  background: linear-gradient(90deg, #e8ecf5 0%, #f4f6fb 50%, #e8ecf5 100%);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s ease-in-out infinite;
}

.skel__line--short {
  width: 35%;
  height: 10px;
}

.skel__line--mid {
  width: 72%;
}

@keyframes skel-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
