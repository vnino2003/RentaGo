import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import './theme/variables.css'
import './theme/global.css'
import './theme/premium.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)
  .use(IonicVue, { animated: !window.matchMedia('(prefers-reduced-motion: reduce)').matches })
  .use(router)

router.isReady().then(() => {
  app.mount('#app')
})
