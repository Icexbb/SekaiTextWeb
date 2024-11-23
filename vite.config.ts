import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {NaiveUiResolver} from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({imports: ['vue', {'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar']}]}),
        Components({resolvers: [NaiveUiResolver()]})
    ],
    base: "/SekaiTextWeb/",
    build: {
        outDir: "docs",
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].split('@')[0]
                    }
                }
            }
        }
    }
})
