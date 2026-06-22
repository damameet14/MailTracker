import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import type { ExtensionDisplayMode } from '../../../shared/ExtensionDisplayMode'
import type { CurrentGmailTabStatus } from '../../../shared/ExtensionRuntimeMessage'
import type { TrackedEmailHistoryRecord } from '../../../shared/TrackedEmailHistoryRecord'
import type { HistoryGroupName } from './HistoryGroupName'
import { PopupControllerService } from './PopupControllerService'
import type { PopupTabName } from './PopupTabName'
import { TrackedEmailDraft } from './TrackedEmailDraft'

@Component({
  selector: 'mail-tracker-popup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './PopupComponent.html',
  styleUrl: './PopupComponent.css',
})
export class PopupComponent implements OnInit {
  protected activePopupTabName: PopupTabName = 'sendEmail'
  protected currentGmailTabStatus: CurrentGmailTabStatus | null = null
  protected statusMessage = 'Checking Gmail tab...'
  protected preferredDisplayMode: ExtensionDisplayMode = 'sidebar'
  protected sidebarEnabled = true
  protected historyGroupName: HistoryGroupName = 'dateSent'
  protected trackedEmailDraft = new TrackedEmailDraft()
  protected historyRecords: TrackedEmailHistoryRecord[] = []
  protected attachmentFileNames: string[] = []
  protected isWorking = false

  private readonly popupControllerService = new PopupControllerService()

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    await this.refreshCurrentGmailTabStatus()
    await this.loadHistoryRecords()
  }

  protected setActivePopupTabName(activePopupTabName: PopupTabName): void {
    this.activePopupTabName = activePopupTabName
  }

  protected async choosePreferredDisplayMode(nextPreferredDisplayMode: ExtensionDisplayMode): Promise<void> {
    this.preferredDisplayMode = nextPreferredDisplayMode
    await this.popupControllerService.savePreferredDisplayMode(nextPreferredDisplayMode)
    this.statusMessage = nextPreferredDisplayMode === 'sidebar'
      ? 'Sidebar mode selected.'
      : 'Popup compose mode selected.'
    this.changeDetectorRef.markForCheck()
  }

  protected async toggleSidebarEnabled(): Promise<void> {
    this.sidebarEnabled = !this.sidebarEnabled
    await this.popupControllerService.saveSidebarEnabled(this.sidebarEnabled)
    this.statusMessage = this.sidebarEnabled ? 'Sidebar enabled.' : 'Sidebar disabled.'
    this.changeDetectorRef.markForCheck()
  }

  protected async openSidebar(): Promise<void> {
    await this.runPopupAction('Opening MailTracker sidebar...', async () => {
      await this.popupControllerService.toggleSidebarForCurrentTab()
      this.statusMessage = 'Sidebar toggled on this Gmail tab.'
    })
  }

  protected openGmail(): void {
    this.popupControllerService.openGmail()
  }

  protected openGmailLogout(): void {
    this.popupControllerService.openGmailLogout()
  }

  protected async openPopupComposeInGmail(): Promise<void> {
    await this.runPopupAction('Creating tracking image...', async () => {
      const response = await this.popupControllerService.createTrackingToken(
        this.trackedEmailDraft.recipientEmailAddress,
        this.trackedEmailDraft.emailSubject,
      )

      this.popupControllerService.openGmailComposeWindow(this.trackedEmailDraft, response.trackingImageUrl)
      await this.popupControllerService.saveHistoryRecord({
        trackingToken: response.trackingToken,
        recipientEmailAddress: this.trackedEmailDraft.recipientEmailAddress,
        ccEmailAddresses: this.trackedEmailDraft.ccEmailAddresses,
        bccEmailAddresses: this.trackedEmailDraft.bccEmailAddresses,
        emailSubject: this.trackedEmailDraft.emailSubject,
        sentAtIsoString: new Date().toISOString(),
        trackingImageUrl: response.trackingImageUrl,
        status: 'prepared',
        trackingImageLoadedCount: 0,
      })

      await this.loadHistoryRecords()
      this.statusMessage = 'Gmail compose opened with tracking prepared.'
    })
  }

  protected rememberAttachmentSelection(event: Event): void {
    const inputElement = event.target as HTMLInputElement
    this.attachmentFileNames = Array.from(inputElement.files ?? []).map((file) => file.name)
  }

  protected async refreshHistory(): Promise<void> {
    await this.runPopupAction('Refreshing tracking history...', async () => {
      const records = await this.popupControllerService.getHistoryRecords()
      const backendBaseUrl = this.currentGmailTabStatus?.backendBaseUrl ?? ''
      this.historyRecords = await this.popupControllerService.refreshHistoryRecords(backendBaseUrl, records)
      this.statusMessage = 'History refreshed.'
    })
  }

  protected async refreshCurrentGmailTabStatus(): Promise<void> {
    await this.runPopupAction('Checking Gmail tab...', async () => {
      const nextStatus = await this.popupControllerService.getCurrentGmailTabStatus()
      this.currentGmailTabStatus = nextStatus
      this.preferredDisplayMode = nextStatus.preferredDisplayMode
      this.sidebarEnabled = nextStatus.sidebarEnabled
      this.statusMessage = nextStatus.statusMessage
    })
  }

  protected getGroupedHistoryRecords(): Array<{ groupName: string; records: TrackedEmailHistoryRecord[] }> {
    const groupedRecords = new Map<string, TrackedEmailHistoryRecord[]>()

    for (const record of this.historyRecords) {
      const groupName = this.getHistoryGroupName(record)
      const existingRecords = groupedRecords.get(groupName) ?? []
      groupedRecords.set(groupName, [...existingRecords, record])
    }

    return Array.from(groupedRecords.entries()).map(([groupName, records]) => ({ groupName, records }))
  }

  protected getStatusLabel(record: TrackedEmailHistoryRecord): string {
    if (record.status === 'openDetected') return 'Open detected'
    if (record.status === 'notOpened') return 'No open yet'
    return 'Prepared'
  }

  protected formatHistoryDate(sentAtIsoString: string): string {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(sentAtIsoString))
  }

  private async loadHistoryRecords(): Promise<void> {
    this.historyRecords = await this.popupControllerService.getHistoryRecords()
    this.changeDetectorRef.markForCheck()
  }

  private getHistoryGroupName(record: TrackedEmailHistoryRecord): string {
    if (this.historyGroupName === 'recipient') return record.recipientEmailAddress
    if (this.historyGroupName === 'status') return this.getStatusLabel(record)
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(record.sentAtIsoString))
  }

  private async runPopupAction(actionMessage: string, action: () => Promise<void>): Promise<void> {
    this.isWorking = true
    this.statusMessage = actionMessage
    this.changeDetectorRef.markForCheck()

    try {
      await action()
    } catch (error: unknown) {
      this.statusMessage = error instanceof Error ? error.message : 'MailTracker action failed.'
    } finally {
      this.isWorking = false
      this.changeDetectorRef.markForCheck()
    }
  }
}

