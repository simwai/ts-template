import { Browser, Page } from 'playwright'
import { Result } from 'neverthrow'
import { BrowserManager } from './browser-manager.js'
import { error, log } from './logger.js'
import { Config, ScrapingTask } from './types.js'
import { HEADLESS, TRACING, PARALLEL_MODE, EXIT_ON_SCRAPING_ERROR } from './config.json'

class ScrapingBot {
  private readonly _browser?: Browser = undefined

  constructor(
    private readonly _browserManager: BrowserManager,
    private readonly _config: Config
  ) {
    this._browserManager = new BrowserManager(this._config)
  }

  async start(tasks: ScrapingTask[]) {
    log('Bot started')

    await this._browserManager.init()

    let page: Page | undefined
    let detailPage: Page | undefined
    const result: Result<[Page, Page], Error> = await this._browserManager.spawnPages()
    if (result.isErr()) {
      error(result.error)
    } else {
      ;[page, detailPage] = result.value
    }

    let page2: Page | undefined
    let detailPage2: Page | undefined
    if (PARALLEL_MODE) {
      const result = await this._browserManager.spawnPages()
      if (result.isErr()) {
        error(result.error)
      } else {
        ;[page2, detailPage2] = result.value
      }
    }

    if (TRACING) {
      const pagesToPass = []
      pagesToPass.push(page!, detailPage!)
      if (page2 && detailPage2) pagesToPass.push(page2, detailPage2)

      await this.startTracing(pagesToPass)
    }

    const results = await (PARALLEL_MODE
      ? Promise.allSettled(tasks.map(async (task) => this.executeTask(task, [page!, detailPage!, page2, detailPage2])))
      : Promise.allSettled(tasks.map(async (task) => this.executeTask(task, [page!, detailPage!]))))

    // Work with the task results

    if (TRACING) {
      await this.stopTracing([page, detailPage, page2, detailPage2].filter(Boolean) as Page[])
    }

    console.log('Close browser')
    await this._browser!.close()

    console.log('Bot succeeded')
  }

  async startTracing(pages: Page[]): Promise<void> {
    const tracingOptions = { screenshots: true, snapshots: true }
    const contexts = await Promise.all(pages.map((page) => page.context()))

    await Promise.allSettled(contexts.map(async (context) => context.tracing.start(tracingOptions)))
  }

  async stopTracing(pages: Page[]): Promise<void> {
    const contexts = await Promise.all(pages.map((page) => page.context()))

    await Promise.allSettled(contexts.map(async (context, i) => context.tracing.stop({ path: `trace-${i + 1}.zip` })))
  }

  async executeTask(task: ScrapingTask, pageArguments: [Page, Page, Page?, Page?]) {
    const [page, detailPage, page2, detailPage2] = pageArguments

    return PARALLEL_MODE && page2 && detailPage2
      ? Promise.allSettled([task.handler(page, detailPage), task.handler(page2, detailPage2)])
      : task.handler(page, detailPage)
  }
}

// Example usage
const myConfig: Config = {
  HEADLESS,
  TRACING,
  PARALLEL_MODE,
  EXIT_ON_SCRAPING_ERROR,
}

const browserManager = new BrowserManager(myConfig)
const bot = new ScrapingBot(browserManager, myConfig)
const tasks: ScrapingTask[] = [
  {
    url: 'https://example.com/page1',
    async handler(page, detailPage) {
      // Implement the scraping logic for page1
    },
  },
  {
    url: 'https://example.com/page2',
    async handler(page, detailPage) {
      // Implement the scraping logic for page2
    },
  },
]
await bot.start(tasks)
