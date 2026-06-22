import { BackgroundMessageController } from './BackgroundMessageController'
import { ExtensionPreferenceRepository } from './ExtensionPreferenceRepository'
import { GmailTabValidator } from './GmailTabValidator'
import type { ExtensionRuntimeMessage } from '../shared/ExtensionRuntimeMessage'

const backgroundMessageController = new BackgroundMessageController(
  new GmailTabValidator(),
  new ExtensionPreferenceRepository(),
)

chrome.runtime.onMessage.addListener((message: ExtensionRuntimeMessage, _sender, sendResponse) => {
  void backgroundMessageController
    .handleMessage(message)
    .then(sendResponse)
    .catch((error: unknown) => {
      sendResponse({
        errorMessage: error instanceof Error ? error.message : 'MailTracker action failed',
      })
    })

  return true
})
