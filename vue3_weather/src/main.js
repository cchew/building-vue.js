import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'
import router from './router'

const app = createApp(App)

app.use(vuetify)
app.use(store)
// Removed for Drupal integration
// app.use(router)

app.mount('.vue3-weather')