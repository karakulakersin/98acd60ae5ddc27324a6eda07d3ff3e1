import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import Aquarium from '../Aquarium.vue'
import { useFishStore } from '../../stores/fishStore'
import FishModal from '../FishModal.vue'

describe('Aquarium.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    // Create a fresh wrapper and store before each test
    wrapper = mount(Aquarium, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              fishStore: {
                fishList: [
                  {
                    id: 1,
                    name: 'Nemo',
                    type: 'Goldfish',
                    weight: 100,
                    healthStatus: 2,
                    imageUrl: '/src/assets/images/fishs/goldfish.webp',
                    feedingSchedule: {
                      intervalInHours: 4,
                      lastFeed: '12:00',
                    },
                  },
                ],
                selectedFishId: null,
              },
            },
          }),
        ],
        components: {
          FishModal,
        },
      },
    })
    store = useFishStore()
  })

  it('renders aquarium with fish', () => {
    // Check if aquarium container exists
    expect(wrapper.find('.aquarium').exists()).toBe(true)
    // Check if fish is rendered
    expect(wrapper.find('.fish').exists()).toBe(true)
  })

  it('handles fish click correctly', async () => {
    const fish = wrapper.find('.fish')
    await fish.trigger('click')

    // Check if fish is selected in store
    expect(store.selectedFishId).toBe(1)
    // Check if modal is shown
    expect(wrapper.findComponent(FishModal).exists()).toBe(true)
  })

  it('closes modal when clicking outside', async () => {
    // First select a fish
    const fish = wrapper.find('.fish')
    await fish.trigger('click')
    expect(store.selectedFishId).toBe(1)

    // Click on wrapper (outside fish and modal)
    await wrapper.find('.aquarium-wrapper').trigger('click')

    // Check if modal is closed and selection is cleared
    expect(store.selectedFishId).toBe(null)
    expect(wrapper.findComponent(FishModal).exists()).toBe(false)
  })

  it('shows correct fish status classes', () => {
    const fish = wrapper.find('.fish')

    // Check if fish has correct classes based on health status
    expect(fish.classes()).toContain('fish-goldfish')
    expect(fish.classes()).not.toContain('dead')
    expect(fish.classes()).not.toContain('paused')
  })
})
