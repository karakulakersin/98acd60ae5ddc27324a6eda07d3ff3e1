import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SimulationTimeControl from '../SimulationTimeControl.vue'
import { useFishStore } from '../../stores/fishStore'

describe('SimulationTimeControl.vue', () => {
  let wrapper
  let store

  beforeEach(() => {
    // Create a fresh wrapper and store before each test
    wrapper = mount(SimulationTimeControl, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              fishStore: {
                digitalClock: new Date('2024-01-01T12:00:00'),
                speedMultiplier: 1,
              },
            },
          }),
        ],
      },
    })
    store = useFishStore()
  })

  it('renders the digital clock correctly', () => {
    const timeDisplay = wrapper.find('h2')
    expect(timeDisplay.text()).toBe('12:00:00')
  })

  it('displays correct initial speed', () => {
    const select = wrapper.find('select')
    expect(select.element.value).toBe('1')
  })

  it('updates speed when selection changes', async () => {
    const select = wrapper.find('select')
    await select.setValue('60')

    expect(store.setSpeed).toHaveBeenCalledWith(60)
  })

  it('starts clock on mount', () => {
    expect(store.startClock).toHaveBeenCalled()
  })

  it('stops clock on unmount', () => {
    wrapper.unmount()
    expect(store.stopClock).toHaveBeenCalled()
  })

  it('renders all speed options', () => {
    const options = wrapper.findAll('option')
    const expectedSpeeds = ['1', '60', '120', '3600']

    expect(options).toHaveLength(4)
    options.forEach((option, index) => {
      expect(option.element.value).toBe(expectedSpeeds[index])
    })
  })

  it('updates formatted time when digital clock changes', async () => {
    // Update store's digital clock
    store.digitalClock = new Date('2024-01-01T15:30:00')
    await wrapper.vm.$nextTick()

    const timeDisplay = wrapper.find('h2')
    expect(timeDisplay.text()).toBe('15:30:00')
  })

  it('has correct styling for time display', () => {
    const timeDisplay = wrapper.find('h2')
    expect(timeDisplay.classes()).toContain('text-2xl')
    expect(timeDisplay.classes()).toContain('text-gray-800')
    expect(timeDisplay.classes()).toContain('font-semibold')
    expect(timeDisplay.classes()).toContain('font-mono')
  })

  it('has correct styling for speed control', () => {
    const select = wrapper.find('select')
    expect(select.classes()).toContain('p-2.5')
    expect(select.classes()).toContain('border-2')
    expect(select.classes()).toContain('rounded-lg')
  })

  it('displays correct labels', () => {
    const labels = wrapper.findAll('.text-sm.text-gray-600.font-medium')
    expect(labels[0].text()).toBe('Simülasyon Zamanı')
    expect(labels[1].text()).toBe('Hız Kontrolü')
  })
})
