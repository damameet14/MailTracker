import type { CurrentGmailTabStatus, ExtensionRuntimeMessage } from '../../../shared/ExtensionRuntimeMessage'
import type { ExtensionDisplayMode } from '../../../shared/ExtensionDisplayMode'
import { MailTrackerApiClient } from '../../../shared/MailTrackerApiClient'
import type { TrackedEmailHistoryRecord } from '../../../shared/TrackedEmailHistoryRecord'
import type { TrackingTokenCreationResponse } from '../../../shared/TrackingTokenCreationResponse'
import { TrackedEmailHistoryRepository } from './TrackedEmailHistoryRepository'
import type { TrackedEmailDraft } from './TrackedEmailDraft'

export class PopupControllerService {
  private readonly trackedEmailHistoryRepository = new TrackedEmailHistoryRepository()

  async getCurrentGmailTabStatus(): Promise<CurrentGmailTabStatus> {
    return this.sendMessage<CurrentGmailTabStatus>({ messageType: 'getCurrentGmailTabStatus' })
  }

  async savePreferredDisplayMode(preferredDisplayMode: ExtensionDisplayMode): Promise<void> {
    await this.sendMessage<void>({ messageType: 'savePreferredDisplayMode', preferredDisplayMode })
  }

  async saveSidebarEnabled(sidebarEnabled: boolean): Promise<void> {
    await this.sendMessage<void>({ messageType: 'saveSidebarEnabled', sidebarEnabled })
  }

  async toggleSidebarForCurrentTab(): Promise<void> {
    await this.sendMessage<void>({ messageType: 'toggleSidebarForCurrentTab' })
  }

  async createTrackingToken(
    recipientEmailAddress: string,
    emailSubject: string,
  ): Promise<TrackingTokenCreationResponse> {
    return this.sendMessage<TrackingTokenCreationResponse>({
      messageType: 'createTrackingToken',
      request: { recipientEmailAddress, emailSubject },
    })
  }

  async getHistoryRecords(): Promise<TrackedEmailHistoryRecord[]> {
    return this.trackedEmailHistoryRepository.getHistoryRecords()
  }

  async saveHistoryRecord(record: TrackedEmailHistoryRecord): Promise<void> {
    await this.trackedEmailHistoryRepository.saveHistoryRecord(record)
  }

  async refreshHistoryRecords(
    backendBaseUrl: string,
    records: TrackedEmailHistoryRecord[],
  ): Promise<TrackedEmailHistoryRecord[]> {
    const mailTrackerApiClient = new MailTrackerApiClient(backendBaseUrl)
    const refreshedRecords = await Promise.all(records.map(async (record) => {
      try {
        const summary = await mailTrackerApiClient.getTrackingEventSummary(record.trackingToken)
        return {
          ...record,
          status: summary.openDetected ? 'openDetected' as const : 'notOpened' as const,
          trackingImageLoadedCount: summary.trackingImageLoadedCount,
        }
      } catch {
        return record
      }
    }))

    await this.trackedEmailHistoryRepository.saveHistoryRecords(refreshedRecords)
    return refreshedRecords
  }

  openGmail(): void {
    chrome.tabs.create({ url: 'https://mail.google.com/mail/' })
  }

  openGmailLogout(): void {
    chrome.tabs.create({ url: 'https://accounts.google.com/Logout' })
  }

  openGmailComposeWindow(draft: TrackedEmailDraft, trackingImageUrl: string): void {
    const plainBody = [
      draft.emailBody,
      '',
      '',
      `MailTracker tracking image: ${trackingImageUrl}`,
      'This URL will be inserted as an invisible image by the Gmail sidebar when compose integration is enabled.',
    ].join('\n')

    const composeUrl = new URL('https://mail.google.com/mail/')
    composeUrl.searchParams.set('view', 'cm')
    composeUrl.searchParams.set('fs', '1')
    composeUrl.searchParams.set('to', draft.recipientEmailAddress)
    if (draft.ccEmailAddresses.trim()) composeUrl.searchParams.set('cc', draft.ccEmailAddresses)
    if (draft.bccEmailAddresses.trim()) composeUrl.searchParams.set('bcc', draft.bccEmailAddresses)
    composeUrl.searchParams.set('su', draft.emailSubject)
    composeUrl.searchParams.set('body', plainBody)
    chrome.tabs.create({ url: composeUrl.toString() })
  }

  private async sendMessage<ResponseBody>(message: ExtensionRuntimeMessage): Promise<ResponseBody> {
    const response = await Promise.race([
      chrome.runtime.sendMessage(message),
      this.createTimeoutPromise(),
    ])

    if (response?.errorMessage) {
      throw new Error(response.errorMessage)
    }

    return response as ResponseBody
  }

  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('MailTracker background service did not respond.')), 3500)
    })
  }
}
