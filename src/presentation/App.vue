<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
// @ts-ignore: missing type declarations for .vue imports
import Navbar from './components/Layout/Navbar.vue';
</script>

<template>
  <Navbar />
  <RouterView />
</template>

<style scoped>
</style>
