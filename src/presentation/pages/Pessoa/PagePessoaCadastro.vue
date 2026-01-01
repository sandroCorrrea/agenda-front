<script setup lang="ts">
import { useRouter } from 'vue-router';
import FormPessoa from '@/presentation/components/Pessoa/FormPessoa.vue';
import { usePersistPessoa } from '@/presentation/composables/Pessoa/usePersistPessoa';

const router = useRouter();
const { create, loading, error } = usePersistPessoa();

async function handleSubmit(payload: { nome: string; cpf: string; dataNascimento: string; email: string; celular: string }) {
    try {
        await create({
            ...payload,
            dataNascimento: new Date(payload.dataNascimento),
            id: 60
        });
        router.push({ name: 'Home' });
    } catch {
    }
}

function handleCancel() {
    router.back();
}
</script>

<template>
    <section>
        <h1>Cadastro de Pessoa</h1>

        <FormPessoa @submit="handleSubmit" @cancel="handleCancel" />

        <div v-if="loading">Salvando...</div>
        <div v-if="error" class="error">{{ error }}</div>
    </section>
</template>