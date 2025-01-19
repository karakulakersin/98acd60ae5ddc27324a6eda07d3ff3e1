import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import FishTable from '../FishTable.vue'
import { useFishStore } from '../../stores/fishStore'

describe('FishTable.vue', () => {
  let wrapper
  let store

  const mockFishList = [
    {
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
    },
    {
      id: 2,
      name: 'Dory',
      type: 'Betta',
      weight: 80,
      healthStatus: 3,
      imageUrl: '/src/assets/images/fishs/betta.png',
      feedingSchedule: {
        intervalInHours: 6,
        lastFeed: '10:00',
      },
    },
  ]

  beforeEach(() => {
    wrapper = mount(FishTable, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              fishStore: {
                fishList: mockFishList,
                digitalClock: new Date('2024-01-01T13:00:00'),
              },
            },
          }),
        ],
      },
    })
    store = useFishStore()
  })

  it('renders table with correct number of rows', () => {
    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(mockFishList.length)
  })

  it('displays correct fish information in table cells', () => {
    const firstRow = wrapper.find('tbody tr')
    expect(firstRow.find('td:nth-child(2)').text()).toBe('Nemo')
    expect(firstRow.find('td:nth-child(3)').text()).toBe('Goldfish')
    expect(firstRow.find('td:nth-child(4)').text()).toBe('100.00 g')
  })

  it('sorts table by name when name header is clicked', async () => {
    const nameHeader = wrapper.findAll('th').find((header) => header.text().includes('Adı'))
    await nameHeader.trigger('click')

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0].find('td:nth-child(2)').text()).toBe('Dory') // Alphabetically first
    expect(rows[1].find('td:nth-child(2)').text()).toBe('Nemo')

    // Click again for reverse sort
    await nameHeader.trigger('click')
    const rowsAfterSecondClick = wrapper.findAll('tbody tr')
    expect(rowsAfterSecondClick[0].find('td:nth-child(2)').text()).toBe('Nemo')
  })

  it('sorts table by weight correctly', async () => {
    const weightHeader = wrapper.findAll('th').find((header) => header.text().includes('Ağırlık'))
    await weightHeader.trigger('click')

    const rows = wrapper.findAll('tbody tr')
    expect(parseFloat(rows[0].find('td:nth-child(4)').text())).toBeLessThan(
      parseFloat(rows[1].find('td:nth-child(4)').text())
    )
  })

  it('shows feed button for alive fish', () => {
    const firstRow = wrapper.find('tbody tr')
    expect(firstRow.find('button').exists()).toBe(true)
    expect(firstRow.find('button').text()).toBe('Besle')
  })

  it('hides feed button for dead fish', async () => {
    // Update store's fishList with a dead fish
    store.fishList = [
      {
        ...mockFishList[0],
        healthStatus: 0,
      },
    ]

    // Wait for the component to update
    await wrapper.vm.$nextTick()

    const row = wrapper.find('tbody tr')
    const feedButton = row.find('button.feed-button') // Add a specific class for feed button
    expect(feedButton.exists()).toBe(false)
  })

  it('calls feed method when feed button is clicked', async () => {
    const feedButton = wrapper.find('tbody tr button')
    await feedButton.trigger('click')
    expect(store.feed).toHaveBeenCalledWith(mockFishList[0])
  })

  it('applies correct health status styling', async () => {
    // Create wrapper with mocked store methods
    wrapper = mount(FishTable, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              fishStore: {
                fishList: mockFishList,
              },
            },
            stubActions: false,
          }),
        ],
      },
    })
    store = useFishStore()

    // Mock store methods explicitly
    store.getHealthClass = vi.fn().mockReturnValue('health-normal')
    store.getHealth = vi.fn().mockReturnValue('Standart')

    // Update store's fish list to trigger reactivity
    store.fishList = [...mockFishList]

    // Wait for the next tick to ensure component updates
    await wrapper.vm.$nextTick()

    const healthCell = wrapper.find('tbody tr td:nth-child(6)')
    const healthStatus = healthCell.find('div')

    // Log classes for debugging
    console.log('Health status classes:', healthStatus.classes())

    // Check for correct styling
    expect(healthStatus.classes()).toContain('px-3')
    expect(healthStatus.classes()).toContain('py-1.5')
    expect(healthStatus.classes()).toContain('rounded-full')
    expect(healthStatus.classes()).toContain('text-sm')
    expect(healthStatus.classes()).toContain('font-medium')
    expect(healthStatus.classes()).toContain('inline-block')
    expect(healthStatus.classes()).toContain('text-center')
    expect(healthStatus.classes()).toContain('bg-blue-100')
    expect(healthStatus.classes()).toContain('text-blue-800')
  })

  it('shows correct feeding time information', async () => {
    // Mock the timeSinceLastFeed method
    store.timeSinceLastFeed = vi.fn().mockReturnValue('1 saat önce beslendi')

    // Force a re-render
    await wrapper.vm.$nextTick()

    const feedingCell = wrapper.find('tbody tr td:nth-child(5)')
    expect(feedingCell.text()).toContain('saat önce beslendi')
    expect(store.timeSinceLastFeed).toHaveBeenCalledWith(mockFishList[0])
  })

  it('applies grayscale to dead fish images', async () => {
    store.fishList = [
      {
        ...mockFishList[0],
        healthStatus: 0,
      },
    ]

    await wrapper.vm.$nextTick()

    const fishImage = wrapper.find('img')
    expect(fishImage.classes()).toContain('grayscale')
    expect(fishImage.classes()).toContain('brightness-75')
  })

  it('sorts by last feeding time correctly', async () => {
    const feedingHeader = wrapper.findAll('th').find((header) => header.text().includes('Beslenme'))
    await feedingHeader.trigger('click')

    const rows = wrapper.findAll('tbody tr')

    // Get fish data from rows
    const firstFishName = rows[0].find('td:nth-child(2)').text()
    const secondFishName = rows[1].find('td:nth-child(2)').text()

    // Find corresponding fish objects
    const firstFish = mockFishList.find((fish) => fish.name === firstFishName)
    const secondFish = mockFishList.find((fish) => fish.name === secondFishName)

    // Verify sorting order based on lastFeed times
    const firstTime = firstFish.feedingSchedule.lastFeed.split(':').map(Number)
    const secondTime = secondFish.feedingSchedule.lastFeed.split(':').map(Number)

    // Convert times to minutes for comparison
    const firstTimeInMinutes = firstTime[0] * 60 + firstTime[1]
    const secondTimeInMinutes = secondTime[0] * 60 + secondTime[1]

    // Check if sorting is correct (ascending order)
    expect(firstTimeInMinutes).toBeLessThanOrEqual(secondTimeInMinutes)
  })
})
