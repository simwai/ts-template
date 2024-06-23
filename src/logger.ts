/**
 * Beautiful console logger with color and timestamps.
 * @module Logger
 */

import chalk from 'chalk'
import { DateTime } from 'luxon'

const isTimeEnabled = false

export type LogType = 'log' | 'warn' | 'error' | 'trace'

// Dracula-inspired color shades
const colors = {
  log: chalk.hex('#f8f8f2'), // Light foreground
  warn: chalk.hex('#f1fa8c'), // Yellow
  error: chalk.hex('#ff5555'), // Red
  trace: chalk.hex('#bd93f9'), // Purple
}

const logMessage = (type: LogType, ...content: Array<string | Error>): void => {
  const formattedContent: string = content.join(' ')
  const now: DateTime = DateTime.now()
  const timestamp = `[${now.toFormat('dd-MM-yyyy HH:mm:ss')}]`
  const parseContent: string = content.some((item): item is Error => item instanceof Error)
    ? JSON.stringify(
        content.map((item): { message?: string; stack?: string } | string =>
          item instanceof Error ? { message: item.message, stack: item.stack } : item
        )
      )
    : formattedContent
  const format: string = (isTimeEnabled ? `${timestamp}` : '') + `[${type.toUpperCase()}]: ${parseContent}`

  switch (type) {
    case 'log': {
      console.log(colors.log(format))
      break
    }

    case 'warn': {
      console.log(colors.warn(format))
      break
    }

    case 'error': {
      console.log(colors.error(format))
      break
    }

    case 'trace': {
      console.trace(colors.trace(format))
      break
    }
  }
}

/**
 * Log a message to the console
 * @param {...any[]} content - The message to log
 */
export const log = (...content: Array<string | Error>): void => {
  logMessage('log', ...content)
}

/**
 * Log an error to the console
 * @param {...(string | Error)[]} arguments_ - The message of the error
 */
export const error = (...arguments_: Array<string | Error>): void => {
  logMessage('error', ...arguments_)
}

/**
 * Log a warning to the console
 * @param {...string[]} arguments_ - The message of the warning
 */
export const warn = (...arguments_: string[]): void => {
  logMessage('warn', ...arguments_)
}

/**
 * Log a trace to the console
 * @param {...string[]} arguments_ - The message of the trace
 */
export const trace = (...arguments_: string[]): void => {
  logMessage('trace', ...arguments_)
}
