<template>
  <VApp>
    <VMain>
      <RouterView />
    </VMain>
  </VApp>
</template>

<script>
import { RouterView } from 'vue-router';
import { VApp, VMain } from 'vuetify/components';

export default {
  name: 'App',
  components: {
    RouterView,
    VApp,
    VMain
  }
}
</script>

<style scoped></style>