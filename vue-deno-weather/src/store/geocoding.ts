import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import axios, { AxiosResponse } from 'axios'
import { USER_AGENT } from './index'

interface Coordinates {
  latitude: number | null
  longitude: number | null
}

interface GeocodingState {
  loading: boolean
  error: string | null
  coordinates: Coordinates
}

interface NominatimResponse {
  lat: string
  lon: string
}

// State
const state: GeocodingState = {
  loading: false,
  error: null,
  coordinates: {
    latitude: null,
    longitude: null
  }
}

// Getters
const getters: GetterTree<GeocodingState, any> = {
  isLoading: (state) => state.loading,
  getError: (state) => state.error,
  hasCoordinates: (state) => state.coordinates.latitude !== null && state.coordinates.longitude !== null
}

// Mutations
const mutations: MutationTree<GeocodingState> = {
  setCoordinates(state, { latitude, longitude }) {
    state.coordinates = { latitude, longitude }
  },
  setLoading(state, loading: boolean) {
    state.loading = loading
  },
  setError(state, error: string | null) {
    state.error = error
  }
}

// Actions
const actions: ActionTree<GeocodingState, any> = {
  /**
   * Converts a US state code to geographic coordinates using Nominatim
   * @param {object} context - Vuex action context
   * @param {string} stateCode - Two-letter US state code
   * @returns {Promise<Coordinates>} The state's coordinates
   * @throws {Error} If coordinates cannot be found
   */
  async getStateCoordinates({ commit }, stateCode: string): Promise<Coordinates> {
    commit("setLoading", true)
    commit("setError", null)
    
    try {
      const response: AxiosResponse<NominatimResponse[]> = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            state: stateCode,
            country: 'USA',
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': USER_AGENT
          }
        }
      )

      if (!response.data || response.data.length === 0) {
        throw new Error(`No coordinates found for state: ${stateCode}`)
      }

      const result = response.data[0]
      const coordinates: Coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      }

      commit("setCoordinates", coordinates)
      return coordinates
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get coordinates'
      commit("setError", errorMessage)
      commit("setCoordinates", { latitude: null, longitude: null })
      throw error
    } finally {
      commit("setLoading", false)
    }
  }
}

// Create the module
const geocodingModule: Module<GeocodingState, any> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

export default geocodingModule 