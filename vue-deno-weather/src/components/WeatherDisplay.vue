<template>
  <VContainer class="weather-display">
    <!-- State Input -->
    <VRow justify="center" class="mb-8">
      <VCol cols="12" sm="8" md="6" lg="4">
        <VCard elevation="0" class="pa-4 rounded-lg">
          <VTextField
            v-model="upperStateCode"
            label="Enter US State Code"
            placeholder="CA"
            maxlength="2"
            variant="outlined"
            density="comfortable"
            bg-color="surface"
            :rules="[v => v.length === 2 || 'State code must be 2 characters']"
            hide-details="auto"
          ></VTextField>
          <VBtn
            block
            color="primary"
            :disabled="!isValidStateCode || isLoading"
            @click="fetchWeatherData"
            class="mt-4"
            size="large"
          >
            Get Weather Data
          </VBtn>
        </VCard>
      </VCol>
    </VRow>

    <!-- Loading State -->
    <VRow v-if="isLoading" justify="center">
      <VCol cols="12" class="text-center">
        <VProgressCircular
          indeterminate
          color="primary"
          size="64"
        ></VProgressCircular>
      </VCol>
    </VRow>

    <!-- Error State -->
    <VRow v-if="error && !isLoading" justify="center">
      <VCol cols="12" sm="8" md="6">
        <VAlert
          type="error"
          variant="tonal"
          closable
        >
          {{ error }}
        </VAlert>
      </VCol>
    </VRow>

    <VRow v-if="!isLoading && hasResults" justify="center">
      <VCol cols="12" sm="10" md="8">
        <!-- Alerts Section -->
        <VExpandTransition>
          <div v-if="hasAlerts">
            <VExpansionPanels class="mb-6" variant="popout">
              <VExpansionPanel>
                <VExpansionPanelTitle class="bg-surface">
                  <template v-slot:default="{ expanded }">
                    <VRow no-gutters>
                      <VCol cols="auto" class="mr-2">
                        <VIcon
                          :color="expanded ? 'warning' : 'medium-emphasis'"
                          :icon="expanded ? 'mdi-alert' : 'mdi-alert-outline'"
                        ></VIcon>
                      </VCol>
                      <VCol>
                        Weather Alerts
                        <VChip
                          v-if="alerts.length > 0 && alerts[0] !== 'No active alerts for this state.'"
                          color="warning"
                          size="small"
                          class="ml-2"
                        >
                          {{ alerts.length }}
                        </VChip>
                      </VCol>
                    </VRow>
                  </template>
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  <VExpansionPanels variant="inset">
                    <VExpansionPanel
                      v-for="(alert, index) in alerts"
                      :key="index"
                      :disabled="alert === 'No active alerts for this state.'"
                    >
                      <VExpansionPanelTitle>
                        <VIcon
                          color="warning"
                          size="small"
                          class="mr-2"
                        >
                          mdi-alert-circle
                        </VIcon>
                        {{ getAlertTitle(alert) }}
                      </VExpansionPanelTitle>
                      <VExpansionPanelText class="bg-surface">
                        <pre>{{ alert }}</pre>
                      </VExpansionPanelText>
                    </VExpansionPanel>
                  </VExpansionPanels>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>
        </VExpandTransition>

        <!-- Forecast Section -->
        <VExpandTransition>
          <div v-if="hasForecast">
            <VExpansionPanels variant="popout">
              <VExpansionPanel>
                <VExpansionPanelTitle class="bg-surface">
                  <template v-slot:default="{ expanded }">
                    <VRow no-gutters>
                      <VCol cols="auto" class="mr-2">
                        <VIcon
                          :color="expanded ? 'primary' : 'medium-emphasis'"
                          :icon="expanded ? 'mdi-weather-partly-cloudy' : 'mdi-weather-partly-cloudy'"
                        ></VIcon>
                      </VCol>
                      <VCol>Weather Forecast</VCol>
                    </VRow>
                  </template>
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  <VExpansionPanels variant="inset">
                    <VExpansionPanel
                      v-for="period in forecasts"
                      :key="period.name"
                    >
                      <VExpansionPanelTitle>
                        <VRow no-gutters align="center">
                          <VCol cols="auto" class="mr-4">
                            {{ period.name }}
                          </VCol>
                          <VCol>
                            <VChip
                              size="small"
                              color="primary"
                              variant="tonal"
                            >
                              {{ period.temperature }}°{{ period.temperatureUnit }}
                            </VChip>
                          </VCol>
                        </VRow>
                      </VExpansionPanelTitle>
                      <VExpansionPanelText class="bg-surface">
                        <VRow dense>
                          <VCol cols="12">
                            <VIcon size="small" class="mr-2">mdi-weather-windy</VIcon>
                            {{ period.windSpeed }} {{ period.windDirection }}
                          </VCol>
                          <VCol cols="12" class="mt-2">
                            {{ period.detailedForecast }}
                          </VCol>
                        </VRow>
                      </VExpansionPanelText>
                    </VExpansionPanel>
                  </VExpansionPanels>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>
        </VExpandTransition>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapState, mapGetters, mapActions } from 'vuex'
import {
  VAlert,
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VChip,
  VCol,
  VContainer,
  VExpandTransition,
  VExpansionPanel,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VExpansionPanels,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VProgressCircular,
  VRow,
  VTextField,
} from 'vuetify/components'

export default defineComponent({
  name: 'WeatherDisplay',

  components: {
    VAlert,
    VBtn,
    VCard,
    VCardText,
    VCardTitle,
    VChip,
    VCol,
    VContainer,
    VExpandTransition,
    VExpansionPanel,
    VExpansionPanelText,
    VExpansionPanelTitle,
    VExpansionPanels,
    VIcon,
    VListItem,
    VListItemSubtitle,
    VProgressCircular,
    VRow,
    VTextField,
  },

  data() {
    return {
      stateCode: '' as string,
    }
  },

  computed: {
    ...mapState('weather', ['alerts', 'forecasts', 'error']),
    ...mapState('geocoding', ['coordinates']),
    ...mapGetters('weather', ['hasAlerts', 'hasForecast', 'isLoading']),
    ...mapGetters('geocoding', ['isLoading as isGeocodingLoading']),
    
    /**
     * Computed property that automatically converts state code to uppercase
     */
    upperStateCode: {
      get(): string {
        return this.stateCode
      },
      set(value: string): void {
        this.stateCode = value.toUpperCase()
      }
    },

    /**
     * Validates if the current state code is a valid 2-letter code
     */
    isValidStateCode(): boolean {
      return this.stateCode.length === 2 && /^[A-Za-z]{2}$/.test(this.stateCode)
    },

    /**
     * Combines loading states from both weather and geocoding modules
     */
    isLoading(): boolean {
      return this.$store.getters['weather/isLoading'] || 
             this.$store.getters['geocoding/isLoading']
    },

    /**
     * Determines if there are valid results to display
     */
    hasResults(): boolean {
      return (this.hasAlerts || this.hasForecast) && !this.error
    }
  },

  methods: {
    ...mapActions('weather', ['getAlerts', 'getForecast']),
    ...mapActions('geocoding', ['getStateCoordinates']),

    /**
     * Fetches weather data for the entered state code
     * First gets coordinates, then fetches alerts and forecast
     */
    async fetchWeatherData(): Promise<void> {
      if (!this.isValidStateCode) return

      const stateCode = this.stateCode.toUpperCase()
      
      try {
        const coordinates = await this.getStateCoordinates(stateCode)
        await this.getAlerts(stateCode)
        await this.getForecast(coordinates)
      } catch (error) {
        console.error('Error fetching weather data:', error)
      }
    },

    /**
     * Extracts the event title from an alert message
     * @param {string} alert - The full alert message
     * @returns {string} The event title or default message
     */
    getAlertTitle(alert: string): string {
      if (alert === 'No active alerts for this state.') {
        return alert
      }
      
      const eventMatch = alert.match(/Event: (.*?)(?:\n|$)/)
      return eventMatch ? eventMatch[1] : 'Weather Alert'
    }
  }
})
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
  line-height: 1.5;
}

.v-expansion-panel-title {
  font-weight: 500;
}

:deep(.v-expansion-panel) {
  background-color: transparent !important;
}

:deep(.v-expansion-panels--inset) .v-expansion-panel {
  box-shadow: none !important;
}
</style>