import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dotsData: null
  },
  mutations: {
    setDotsData(state, data) {
      state.dotsData = data;
    }
  },
  actions: {
  },
  modules: {
  }
})
