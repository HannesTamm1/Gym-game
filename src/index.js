import './style.scss';
import {
  createApp
} from 'vue';
import {
  createWebHashHistory,
  createWebHistory,
  createMemoryHistory,
  createRouter
} from 'vue-router';


import App from './App.vue';

import GymClicker from './pages/GymClicker.vue';

const routes = [{
  path: '/cookieclicker',
  component: GymClicker,
  name: 'NO PAIN! NO GAIN!',
  meta: {
    container: false
  }
}, ]

const router = createRouter({
  history: createWebHistory(),
  routes,
});


const app = createApp(App);
app.use(router);
app.mount('#app');