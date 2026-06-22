import { MailTrackerApiClient } from '../shared/MailTrackerApiClient'
import type { CurrentGmailTabStatus, ExtensionRuntimeMessage } from '../shared/ExtensionRuntimeMessage'
import { ExtensionPreferenceRepository } from './ExtensionPreferenceRepository'
import { GmailTabValidator } from './GmailTabValidator'

export class BackgroundMessageController {
  constructor(
    private readonly gmailTabValidator: GmailTabValidator,
    private readonly extensionPreferenceRepository: ExtensionPreferenceRepository,
  ) {}

  handleMessage(message: ExtensionRuntimeMessage): Promise<unknown> {
    if (message.messageType === 'getCurrentGmailTabStatus') {
      return this.getCurrentGmailTabStatus()
    }

    if (message.messageType === 'savePreferredDisplayMode') {
      return this.extensionPreferenceRepository.savePreferredDisplayMode(message.preferredDisplayMode)
    }

    if (message.messageType === 'saveSidebarEnabled') {
      return this.extensionPreferenceRepository.saveSidebarEnabled(message.sidebarEnabled)
    }

    if (message.messageType === 'toggleSidebarForCurrentTab') {
      return this.toggleSidebarForCurrentTab()
    }

    if (message.messageType === 'createTrackingToken') {
      return this.createTrackingToken(message.request)
    }

    throw new Error('Unsupported MailTracker message')
  }

  private async getCurrentGmailTabStatus(): Promise<CurrentGmailTabStatus> {
    const currentActiveTab = await this.gmailTabValidator.getCurrentActiveTab()
    const isGmailTabOpen = this.gmailTabValidator.isGmailTab(currentActiveTab)
    const isGmailAuthenticated = this.gmailTabValidator.isAuthenticatedGmailTab(currentActiveTab)
    const preferredDisplayMode = await this.extensionPreferenceRepository.getPreferredDisplayMode()
    const sidebarEnabled = await this.extensionPreferenceRepository.getSidebarEnabled()
    const backendBaseUrl = await this.extensionPreferenceRepository.getBackendBaseUrl()

    return {
      isGmailTabOpen,
      isGmailAuthenticated,
      preferredDisplayMode,
      sidebarEnabled,
      backendBaseUrl,
      statusMessage: this.buildStatusMessage(isGmailTabOpen, isGmailAuthenticated),
    }
  }

  private async toggleSidebarForCurrentTab(): Promise<{ sidebarToggled: boolean }> {
    const currentActiveTab = await this.gmailTabValidator.getCurrentActiveTab()

    if (!this.gmailTabValidator.isGmailTab(currentActiveTab) || currentActiveTab?.id === undefined) {
      throw new Error('Open Gmail before launching the MailTracker sidebar.')
    }

    await chrome.scripting.executeScript({
      target: { tabId: currentActiveTab.id },
      files: ['contentScript.js'],
    })

    return { sidebarToggled: true }
  }

  private async createTrackingToken(request: {
    recipientEmailAddress: string
    emailSubject: string
  }) {
    const backendBaseUrl = await this.extensionPreferenceRepository.getBackendBaseUrl()
    return new MailTrackerApiClient(backendBaseUrl).createTrackingToken(request)
  }

  private buildStatusMessage(isGmailTabOpen: boolean, isGmailAuthenticated: boolean): string {
    if (!isGmailTabOpen) {
      return 'Open Gmail to use MailTracker.'
    }

    if (!isGmailAuthenticated) {
      return 'Sign in to Gmail before sending tracked email.'
    }

    return 'MailTracker is ready for this Gmail tab.'
  }
}
