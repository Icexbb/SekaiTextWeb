import {createApp} from 'vue'
import './assets/style.css'
// @ts-ignore
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router);
app.mount('#app')
    .$nextTick(() => {
        postMessage({payload: 'removeLoading'}, '*')
    }).then(() => null);