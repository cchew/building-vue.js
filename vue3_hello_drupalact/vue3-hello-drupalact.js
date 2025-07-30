Vue.createApp({
  data: () => ({
    message: 'Hello DrupalACT from Vue 3!'
  }),
  template: `<div class="test">{{message}}</div>`
}).mount('.vue3-hello-drupalact');