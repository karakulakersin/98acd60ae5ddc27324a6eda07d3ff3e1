import { defineStore } from 'pinia'
import { getFishList } from '@/services/index'

export const useFishStore = defineStore('fishStore', {
  state: () => ({
    fishList: [],
    digitalClock: new Date(),
    speedMultiplier: 1,
    intervalId: null,
  }),

  actions: {
    // Fetches the fish list from API and maps images
    async fetchFishList() {
      try {
        const fishData = await getFishList()

        const fishImageMap = {
          Goldfish: '/src/assets/images/fishs/goldfish.webp',
          Betta: '/src/assets/images/fishs/betta.webp',
          Guppy: '/src/assets/images/fishs/guppy.webp',
          Oscar: '/src/assets/images/fishs/oscar.webp',
          Angelfish: '/src/assets/images/fishs/angelfish.webp',
        }
        this.fishList = fishData.data.map((fish) => ({
          ...fish,
          healthStatus: 2,
          imageUrl: fishImageMap[fish.type] || '/src/assets/images/fishs/defaultFish.webp',
        }))
      } catch (error) {
        console.error('Error fetching fish list:', error)
      }
    },

    // Updates the digital clock based on speed multiplier
    updateTime() {
      this.digitalClock = new Date(this.digitalClock.getTime() + 1000 * this.speedMultiplier)
    },

    // Sets the speed multiplier for the digital clock
    setSpeed(newSpeed) {
      this.speedMultiplier = newSpeed
      this.resetInterval()
    },

    // Resets and restarts the clock interval
    resetInterval() {
      if (this.intervalId) clearInterval(this.intervalId)
      this.intervalId = setInterval(this.updateTime, 1000 / this.speedMultiplier)
    },

    // Starts the digital clock
    startClock() {
      this.resetInterval()
    },

    // Stops the digital clock
    stopClock() {
      if (this.intervalId) clearInterval(this.intervalId)
      this.intervalId = null
    },

    // Feeds the fish and updates its weight and health
    feed(fish) {
      const now = this.digitalClock

      const dailyFeedAmount = fish.weight * 0.01
      const mealsPerDay = 24 / fish.feedingSchedule.intervalInHours
      const feedingWeight = dailyFeedAmount / mealsPerDay

      fish.weight += feedingWeight

      this.updateHealth(fish)

      const hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, '0')
      fish.feedingSchedule.lastFeed = `${hours}:${minutes}`
    },

    // Returns CSS class for fish's health status
    getHealthClass(fish) {
      switch (fish.healthStatus) {
        case 3:
          return 'health-good'
        case 2:
          return 'health-normal'
        case 1:
          return 'health-bad'
        case 0:
          return 'health-dead'
        default:
          return ''
      }
    },

    // Updates fish health status based on feeding schedule
    updateHealth(fish) {
      const diffInMinutes = this.getLastFeedDiffInMinutes(fish)
      const { optimalFeedingMinutes, tolerance } = this.getOptimalFeedingInfo(fish)

      if (fish.healthStatus === 0) return

      const isWithinOptimalRange =
        diffInMinutes >= optimalFeedingMinutes - tolerance &&
        diffInMinutes <= optimalFeedingMinutes + tolerance

      const isOutsideOptimalRange =
        diffInMinutes > optimalFeedingMinutes + tolerance ||
        diffInMinutes < optimalFeedingMinutes - tolerance

      if (isWithinOptimalRange) {
        fish.healthStatus = Math.min(3, fish.healthStatus + 1)
      } else if (isOutsideOptimalRange) {
        fish.healthStatus = Math.max(0, fish.healthStatus - 1)
      }
    },

    // Returns formatted time since last feeding
    timeSinceLastFeed(fish) {
      const diffInMinutes = this.getLastFeedDiffInMinutes(fish)
      if (diffInMinutes < 0) return `Son beslenme zamanı: ${fish.feedingSchedule.lastFeed}`

      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60

      if (hours === 0 && minutes < 10) return 'Şimdi beslendi'
      else if (hours > 0) return `${hours} saat önce beslendi`
      else return `${minutes} dakika önce beslendi`
    },

    // Gets and updates current fish health status
    getHealth(fish) {
      const diffInMinutes = this.getLastFeedDiffInMinutes(fish)
      const { optimalFeedingMinutes, tolerance } = this.getOptimalFeedingInfo(fish)

      const isCriticallyOverdue =
        fish.healthStatus === 1 && diffInMinutes > optimalFeedingMinutes + tolerance

      if (isCriticallyOverdue) {
        fish.healthStatus = 0
      }

      switch (fish.healthStatus) {
        case 3:
          return 'İyi'
        case 2:
          return 'Standart'
        case 1:
          return 'Kötü'
        case 0:
          return 'Öldü'
      }
    },

    // Returns optimal feeding information for fish
    getOptimalFeedingInfo(fish) {
      const optimalFeedingMinutes = fish.feedingSchedule.intervalInHours * 60
      const tolerance = 10
      return { optimalFeedingMinutes, tolerance }
    },

    // Calculates minutes passed since last feeding
    getLastFeedDiffInMinutes(fish) {
      const [lastFeedHours, lastFeedMinutes] = fish.feedingSchedule.lastFeed.split(':').map(Number)

      const lastFeedTime = new Date(this.digitalClock)
      lastFeedTime.setHours(lastFeedHours, lastFeedMinutes, 0, 0)

      if (this.digitalClock.getTime() < lastFeedTime.getTime()) {
        lastFeedTime.setDate(lastFeedTime.getDate() - 1)
      }

      return Math.floor((this.digitalClock - lastFeedTime) / (60 * 1000))
    },
  },
})
