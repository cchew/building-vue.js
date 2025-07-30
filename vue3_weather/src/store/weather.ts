import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'
import axios, { AxiosResponse } from 'axios'
import { USER_AGENT } from './index'

interface WeatherPeriod {
  name: string
  temperature: number
  temperatureUnit: string
  windSpeed: string
  windDirection: string
  detailedForecast: string
}

interface WeatherState {
  alerts: string[]
  forecasts: WeatherPeriod[]
  loading: boolean
  error: string | null
}

interface AlertFeature {
  properties: {
    event?: string
    areaDesc?: string
    severity?: string
    description?: string
    instruction?: string
  }
}

const NWS_API_BASE = "https://api.weather.gov"

// State
const state: WeatherState = {
  alerts: [],
  forecasts: [],
  loading: false,
  error: null
}

// Getters
const getters: GetterTree<WeatherState, any> = {
  hasAlerts: (state) => state.alerts.length > 0,
  hasForecast: (state) => state.forecasts.length > 0,
  isLoading: (state) => state.loading,
  getError: (state) => state.error
}

// Mutations
const mutations: MutationTree<WeatherState> = {
  setAlerts(state, alerts: string[]) {
    state.alerts = alerts
  },
  setForecasts(state, forecasts) {
    state.forecasts = forecasts
  },
  setLoading(state, loading: boolean) {
    state.loading = loading
  },
  setError(state, error: string | null) {
    state.error = error
  }
}

// Actions
const actions: ActionTree<WeatherState, any> = {
  /**
   * Makes a request to the National Weather Service API
   * @param {object} context - Vuex action context
   * @param {string} url - The full URL to request
   * @returns {Promise<any>} The response data or null if request fails
   */
  async makeNWSRequest({ commit }, url: string): Promise<any> {
    const headers = {
      'User-Agent': USER_AGENT,
      'Accept': 'application/geo+json',
    }

    try {
      const response: AxiosResponse = await axios.get(url, { headers, timeout: 30000 })
      return response.data
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      return null
    }
  },

  /**
   * Formats an alert feature into a readable string
   * @param {object} context - Vuex action context
   * @param {AlertFeature} feature - The alert feature to format
   * @returns {string} Formatted alert text
   */
  formatAlert(_, feature: AlertFeature): string {
    const props = feature.properties
    return `
Event: ${props.event || 'Unknown'}
Area: ${props.areaDesc || 'Unknown'}
Severity: ${props.severity || 'Unknown'}
Description: ${props.description || 'No description available'}
Instructions: ${props.instruction || 'No specific instructions provided'}
`
  },

  /**
   * Fetches active weather alerts for a given US state
   * @param {object} context - Vuex action context
   * @param {string} state - Two-letter US state code
   */
  async getAlerts({ commit, dispatch }, state: string): Promise<void> {
    commit("setLoading", true)
    commit("setError", null)

    try {
      const url = `${NWS_API_BASE}/alerts/active/area/${state}`
      const data = await dispatch('makeNWSRequest', url)

      if (!data || !data.features) {
        throw new Error('Unable to fetch alerts or no alerts found.')
      }

      if (data.features.length === 0) {
        commit("setAlerts", ['No active alerts for this state.'])
      } else {
        const alerts = await Promise.all(
          data.features.map((feature: AlertFeature) => dispatch('formatAlert', feature))
        )
        commit("setAlerts", alerts)
      }
    } catch (error) {
      commit("setError", error instanceof Error ? error.message : 'An error occurred')
      commit("setAlerts", [])
    } finally {
      commit("setLoading", false)
    }
  },

  /**
   * Fetches weather forecast for given coordinates
   * @param {object} context - Vuex action context
   * @param {object} params - Coordinate parameters
   * @param {number} params.latitude - Latitude coordinate
   * @param {number} params.longitude - Longitude coordinate
   */
  async getForecast({ commit, dispatch }, {
    latitude,
    longitude
  }: {
    latitude: number
    longitude: number
  }): Promise<void> {
    commit("setLoading", true)
    commit("setError", null)

    try {
      // Get the forecast grid endpoint
      const pointsUrl = `${NWS_API_BASE}/points/${latitude},${longitude}`
      const pointsData = await dispatch('makeNWSRequest', pointsUrl)

      if (!pointsData) {
        throw new Error('Unable to fetch forecast data for this location.')
      }

      // Get the forecast URL from the points response
      const forecastUrl = pointsData.properties.forecast
      const forecastData = await dispatch('makeNWSRequest', forecastUrl)

      if (!forecastData) {
        throw new Error('Unable to fetch detailed forecast.')
      }

      // Store only the next 5 periods
      const forecasts = forecastData.properties.periods
        .slice(0, 5)
        .map((period: any) => ({
          name: period.name,
          temperature: period.temperature,
          temperatureUnit: period.temperatureUnit,
          windSpeed: period.windSpeed,
          windDirection: period.windDirection,
          detailedForecast: period.detailedForecast
        }))

      commit("setForecasts", forecasts)
    } catch (error) {
      commit("setError", error instanceof Error ? error.message : 'An error occurred')
      commit("setForecasts", [])
    } finally {
      commit("setLoading", false)
    }
  }
}

// Create the module
const weatherModule: Module<WeatherState, any> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

export default weatherModule