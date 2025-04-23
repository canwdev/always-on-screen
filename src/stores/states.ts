import { useStorage } from '@vueuse/core'

export const isDarkMode = useStorage('isDarkMode', false)
