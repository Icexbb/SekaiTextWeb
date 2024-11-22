import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui'
import router from './router'
import {createPinia} from 'pinia'

createApp(App).use(router).use(naive).use(createPinia()).mount('#app').$nextTick(() => {
    postMessage({payload: 'removeLoading'}, '*')
}).then(() => null);