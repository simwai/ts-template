import { Page } from 'playwright'

export type Config = {
  HEADLESS: boolean
  PARALLEL_MODE: boolean
  TRACING: boolean
  EXIT_ON_SCRAPING_ERROR: boolean
}

export type ScrapingTask = {
  url: string
  handler: (page: Page, detailPage: Page) => Promise<void>
}
