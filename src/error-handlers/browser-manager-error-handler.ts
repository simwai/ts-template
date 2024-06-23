import { err } from 'neverthrow'

export const handlePageSpawnError = err(new Error('Failed to spawn pages'))
export const handleBrowserNotInitializedError = err(new Error('Browser not initialized'))
