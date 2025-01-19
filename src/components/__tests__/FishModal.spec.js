import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import FishModal from '../FishModal.vue'
import { useFishStore } from '../../stores/fishStore'

describe('FishModal.vue', () => {
  let wrapper
  let store

  const mockFish = {
    id: 1,
    name: 'Nemo',
    type: 'Goldfish',
    weight: 100,
    healthStatus: 2,
    imageUrl: '/src/assets/images/fishs/goldfish.png',
    feedingSchedule: {
      intervalInHours: 4,
      lastFeed: '12:00',
    },
  }

  const mockPosition = {
    x: 100,
    y: 200,
    aquariumWidth: 1000,
  }

  beforeEach(() => {
    wrapper = mount(FishModal, {
      props: {
        fish: mockFish,
        isOpen: true,
        position: mockPosition,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              fishStore: {
                digitalClock: new Date(),
                speedMultiplier: 1,
              },
            },
          }),
        ],
      },
    })
    store = useFishStore()
  })

  it('renders modal when isOpen is true', () => {
    expect(wrapper.find('.modal-container').exists()).toBe(true)
  })

  it('does not render modal when isOpen is false', async () => {
    await wrapper.setProps({ isOpen: false })
    expect(wrapper.find('.modal-container').exists()).toBe(false)
  })

  it('displays correct fish information', () => {
    const title = wrapper.find('h2')
    expect(title.text()).toBe('Nemo (Goldfish)')

    const weight = wrapper.find('p:nth-child(1)')
    expect(weight.text()).toContain('100.00g')
  })

  it('emits close event when close button is clicked', async () => {
    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('enables feed button when fish is alive', () => {
    const feedButton = wrapper.find('button:nth-child(2)')
    expect(feedButton.attributes('disabled')).toBeUndefined()
  })

  it('positions modal correctly on the left side', async () => {
    await wrapper.setProps({
      position: {
        ...mockPosition,
        x: 400, // Less than half of aquariumWidth
      },
    })
    const modalContainer = wrapper.find('.modal-container')
    const style = modalContainer.attributes('style')
    expect(style).toContain('left:')
    expect(style).toContain('top:')
  })

  it('closes modal when fish dies', async () => {
    await wrapper.setProps({
      fish: {
        ...mockFish,
        healthStatus: 0,
      },
    })
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
