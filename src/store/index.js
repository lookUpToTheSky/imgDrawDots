import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dotsData: null,
    sceneData: null
  },
  mutations: {
    setDotsData(state, data) {
      state.dotsData = data;
    },
    setSceneData(state, data) {
      state.sceneData = data;
    }
  },
  actions: {
  },
  modules: {
  }
})
