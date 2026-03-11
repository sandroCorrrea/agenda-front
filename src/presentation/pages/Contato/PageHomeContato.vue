<script type="ts" setup>
import FormContato from '@/presentation/components/Contato/FormContato.vue';
import { usePersistContato } from '@/presentation/composables/Contato/usePersistContato';

const {
  loading: loadingContato,
  error: errorContato,
  persistContato,
  resultContato
} = usePersistContato();
</script>
<template>
    <FormContato 
        :loadingContato = "loadingContato"
        :errorContato = "errorContato"
        :persistContato = "persistContato"
        :resultContato = "resultContato"    
    />
</template>