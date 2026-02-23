<script setup lang="ts">
import { useRouter } from 'vue-router';
import FormRecuperarSenha from '@/presentation/components/Pessoa/FormRecuperarSenha.vue';

const router = useRouter();
</script>

<template>
    <section>
        <FormRecuperarSenha />
    </section>
</template>