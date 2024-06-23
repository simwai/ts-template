import { err } from 'neverthrow'

export const handleUnexpectedError = err(new Error('Unexpected error'))
