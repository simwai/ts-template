import { setTimeout } from 'node:timers/promises'
import { Result, ok, err } from 'neverthrow'

type Invocation = () => any | Promise<any>
type RetryOptions = {
  timeout?: number
  retries?: number
  isExponential?: boolean
}

export async function retry(
  invocation: Invocation,
  { timeout = 125, retries = 4, isExponential = true }: RetryOptions = {}
): Promise<Result<any, Error>> {
  let lastError: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const result = invocation() // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      if (result instanceof Promise) {
        return ok(await result)
      }

      return ok(result)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      await setTimeout(timeout)
      if (isExponential) timeout *= 2
    }
  }

  if (lastError !== null) {
    return err(lastError)
  }

  throw new Error('Unexpected error occurred')
}
