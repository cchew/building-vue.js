<template>
  <VApp>
    <VMain>
       <WeatherDisplay/>
    </VMain>
  </VApp>
</template>

<script>
import { VApp, VMain } from 'vuetify/components';
import WeatherDisplay from './components/WeatherDisplay.vue';

export default {
  name: 'App',
  components: {
    VApp,
    VMain,
    WeatherDisplay
  },
}
</script>

<style scoped></style>