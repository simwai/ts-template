import { Browser, BrowserContext, LaunchOptions, Page, chromium } from 'playwright'
import { err, ok, Result } from 'neverthrow'
import { getRandom } from 'random-useragent'
import { log, warn, trace } from './logger.js'
import { Config } from './types.js'
import { handleBrowserNotInitializedError, handlePageSpawnError } from './error-handlers/browser-manager-error-handler.js'

export class BrowserManager {
  browser?: Browser = undefined

  constructor(private readonly _config: Config) {}

  async init(): Promise<Result<undefined, unknown>> {
    if (this.browser) ok(undefined)

    const browser = await this.launchChromium(getRandom())
    if (browser.isErr()) return err(browser.error)
    this.browser = browser.value

    return ok(undefined)
  }

  async launchChromium(userAgent: string): Promise<Result<Browser, unknown>> {
    const launchOptions: LaunchOptions = {
      headless: this._config.HEADLESS,
      args: [`--user-agent=${userAgent}`],
      logger: {
        isEnabled: (name, _severity) => name === 'browser',
        log(name, _severity, message, _arguments) {
          const logMessage = typeof message === 'string' ? message : JSON.stringify(message)
          switch (_severity) {
            case 'verbose': {
              log(`${name} ${logMessage}`)
              break
            }

            case 'warning': {
              warn(`${name} ${logMessage}`)
              break
            }

            case 'info': {
              log(`${name} ${logMessage}`)
              break
            }

            case 'error': {
              trace(`${name} ${logMessage}`)
              break
            }
          }
        },
      },
    }

    try {
      const browser = await chromium.launch(launchOptions)
      return ok(browser)
    } catch (error) {
      return err(error)
    }
  }

  async spawnPages(): Promise<Result<[Page, Page], Error>> {
    if (!this.browser) return handleBrowserNotInitializedError

    let page: Page
    let detailPage: Page
    let pageContext: BrowserContext
    let detailPageContext: BrowserContext

    try {
      pageContext = await this.browser.newContext()
      if (!pageContext) return handlePageSpawnError
      page = await pageContext.newPage()

      detailPageContext = await this.browser.newContext()
      detailPage = await detailPageContext.newPage()
    } catch (error) {
      console.error(error)
      return handlePageSpawnError
    }

    return ok([page, detailPage])
  }
}
