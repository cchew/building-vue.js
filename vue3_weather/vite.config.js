import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExternalsPlugin } from 'vite-plugin-externals'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // We don't want to double load Vue so set it to use the external package
    // already provided by Drupal.
    // https://github.com/crcong/vite-plugin-externals
    viteExternalsPlugin({
      vue: 'Vue'
    }, { disableInServe: true }),
  ],

  // Set up the path to the dist folder from within Drupal.
  // https://github.com/vitejs/vite/pull/7644 may make this easier in Vite 3.
  // Comment this during `deno run dev`
  base: '/modules/custom_vue/vue3_weather/dist/',

  build: {
    rollupOptions: {
      // Remove the [hash] since Drupal will take care of that.
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `chunks/[name].[hash].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  },
})
