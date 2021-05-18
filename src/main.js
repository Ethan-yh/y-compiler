import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vue2OrgTree from 'vue2-org-tree'
import 'vue2-org-tree/dist/style.css'
import App from './App.vue'

Vue.use(ElementUI);
Vue.use(Vue2OrgTree)

Vue.config.productionTip = false

Vue.prototype.$Bus = new Vue()

new Vue({
  render: h => h(App),
}).$mount('#app')
