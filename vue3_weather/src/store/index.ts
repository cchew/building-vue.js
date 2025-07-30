import { createStore } from 'vuex'
import weatherModule from './weather'
import geocodingModule from './geocoding'

export const USER_AGENT = 'weather-app/1.0'

export default createStore({
  modules: {
    weather: weatherModule,
    geocoding: geocodingModule
  }
})