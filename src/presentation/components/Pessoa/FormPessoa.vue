<script setup lang="ts">
import { reactive, toRefs } from 'vue';

const props = defineProps({
    initial: {
        type: Object as () => Partial<{
            nome: string;
            cpf: string;
            dataNascimento: string;
            email: string;
            celular: string;
        }>,
        default: () => ({})
    },
});

const emit = defineEmits<{
    (e: 'submit', payload: { nome: string; cpf: string; dataNascimento: string; email: string; celular: string }): void;
    (e: 'cancel'): void;
}>();

const form = reactive({
    nome: props.initial.nome ?? '',
    cpf: props.initial.cpf ?? '',
    dataNascimento: props.initial.dataNascimento ?? '',
    email: props.initial.email ?? '',
    celular: props.initial.celular ?? '',
});

function onSubmit(event: Event) {
    event.preventDefault();
    emit('submit', { ...form });
}

function onCancel() {
    emit('cancel');
}
</script>

<template>
    <form @submit="onSubmit" class="pessoa-form">

        <div class="mb-4 d-flex align-items-center gap-3">
            <label class="me-2">Nome</label>
            <input v-model="form.nome" required />
        </div>

        <div>
            <label>Nome</label>
            <input v-model="form.nome" required />
        </div>

        <div>
            <label>CPF</label>
            <input v-model="form.cpf" required />
        </div>

        <div>
            <label>Data de nascimento</label>
            <input v-model="form.dataNascimento" type="date" required />
        </div>

        <div>
            <label>Email</label>
            <input v-model="form.email" type="email" />
        </div>

        <div>
            <label>Celular</label>
            <input v-model="form.celular" />
        </div>

        <div>
            <button type="submit">Salvar</button>
            <button type="button" @click="onCancel">Cancelar</button>
        </div>
    </form>
</template>