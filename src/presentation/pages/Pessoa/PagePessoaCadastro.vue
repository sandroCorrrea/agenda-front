<script setup lang="ts">
import FormCadastro from '@/presentation/components/Pessoa/FormCadastro.vue';
import { usePersistPessoa } from '@/presentation/composables/Pessoa/usePersistPessoa';

const {persit, loading, error, pessoaEntity} = usePersistPessoa();
</script>

<template>
    <section>
        <FormCadastro
            :persist = "persit"
            :loading = "loading"
            :error = "error"
            :pessoaEntity = "pessoaEntity"
        />
    </section>
</template>