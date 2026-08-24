import { useColorMode } from '@vueuse/core'

const { store, system, state } = useColorMode({ attribute: 'theme' })

export const themeMode = store
export const themeSystem = system
export const themeState = state
