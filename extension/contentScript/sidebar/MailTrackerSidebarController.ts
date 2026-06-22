import type { TrackingTokenCreationResponse } from '../../shared/TrackingTokenCreationResponse'
import { GmailComposeWindowFinder } from '../gmail/GmailComposeWindowFinder'
import { TrackingImageInjector } from '../gmail/TrackingImageInjector'
import { MailTrackerSidebarElementFactory } from './MailTrackerSidebarElementFactory'

export class MailTrackerSidebarController {
  private readonly hostElementId = 'mailtracker-sidebar-host'
  private statusElement: HTMLElement | null = null

  constructor(
    private readonly sidebarElementFactory: MailTrackerSidebarElementFactory,
    private readonly gmailComposeWindowFinder: GmailComposeWindowFinder,
    private readonly trackingImageInjector: TrackingImageInjector,
  ) {}

  toggleSidebar(): void {
    const existingHostElement = document.getElementById(this.hostElementId)

    if (existingHostElement) {
      existingHostElement.shadowRoot?.querySelector('.mailtracker-shell')?.classList.toggle('mailtracker-collapsed')
      return
    }

    const hostElement = this.sidebarElementFactory.createHostElement()
    const shadowRoot = hostElement.attachShadow({ mode: 'open' })
    shadowRoot.append(this.createSidebarStyles())
    shadowRoot.append(this.sidebarElementFactory.createSidebarShell(
      () => shadowRoot.querySelector('.mailtracker-shell')?.classList.add('mailtracker-collapsed'),
      () => void this.prepareCurrentComposeWindow(),
    ))
    this.statusElement = shadowRoot.querySelector('.mailtracker-status')
    document.body.append(hostElement)
  }

  private async prepareCurrentComposeWindow(): Promise<void> {
    this.updateStatusMessage('Looking for the current Gmail compose window...')
    const gmailComposeWindow = this.gmailComposeWindowFinder.findOpenComposeWindow()

    if (!gmailComposeWindow) {
      this.updateStatusMessage('Open a Gmail compose window before preparing tracking.')
      return
    }

    if (!gmailComposeWindow.recipientEmailAddress || !gmailComposeWindow.emailSubject) {
      this.updateStatusMessage('Add a recipient and subject before preparing tracking.')
      return
    }

    this.updateStatusMessage('Creating tracking image...')
    const trackingTokenResponse = await this.createTrackingToken(
      gmailComposeWindow.recipientEmailAddress,
      gmailComposeWindow.emailSubject,
    )
    this.trackingImageInjector.injectTrackingImageIntoComposeWindow(
      gmailComposeWindow,
      trackingTokenResponse.trackingImageUrl,
    )
    this.updateStatusMessage('Tracking image inserted. You can send from Gmail.')
  }

  private async createTrackingToken(
    recipientEmailAddress: string,
    emailSubject: string,
  ): Promise<TrackingTokenCreationResponse> {
    const response = await chrome.runtime.sendMessage({
      messageType: 'createTrackingToken',
      request: { recipientEmailAddress, emailSubject },
    })

    if (response?.errorMessage) {
      throw new Error(response.errorMessage)
    }

    return response as TrackingTokenCreationResponse
  }

  private updateStatusMessage(message: string): void {
    if (this.statusElement) {
      this.statusElement.textContent = message
    }
  }

  private createSidebarStyles(): HTMLStyleElement {
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      :host{all:initial}
      *{box-sizing:border-box}
      .mailtracker-shell{display:flex;align-items:flex-start;gap:0;transform:translateX(0);transition:transform 160ms ease;font:14px Inter,Arial,sans-serif;color:#232b2f}
      .mailtracker-shell.mailtracker-collapsed{transform:translateX(348px)}
      .mailtracker-puller{width:36px;height:108px;margin-top:88px;border:0;border-radius:6px 0 0 6px;background:#d6684c;color:#fff;box-shadow:0 10px 26px rgba(35,43,47,.18);font:800 12px Inter,Arial,sans-serif;letter-spacing:0;writing-mode:vertical-rl;transform:rotate(180deg);cursor:pointer}
      .mailtracker-panel{width:348px;min-height:520px;max-height:calc(100vh - 110px);overflow:auto;padding:0 0 14px;background:#fff;border:1px solid #ddd6cd;border-right:0;border-radius:8px 0 0 8px;box-shadow:0 18px 60px rgba(35,43,47,.18)}
      .mailtracker-header{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:13px 16px;border-bottom:1px solid #ddd6cd}
      .mailtracker-brand-wrap{display:flex;align-items:center;gap:8px}
      .mailtracker-logo{width:28px;height:28px;object-fit:contain}
      .mailtracker-brand{font-size:18px;font-weight:800;letter-spacing:0;color:#1e272b}
      .mailtracker-close-button{width:30px;height:30px;padding:0;border:1px solid #ddd6cd;border-radius:8px;background:#fff;color:#354045;cursor:pointer;font:800 18px Inter,Arial,sans-serif}
      .mailtracker-summary{display:grid;gap:4px;padding:16px}
      .mailtracker-summary-title{color:#1f282c;font-size:16px}
      .mailtracker-summary-copy{color:#746960;font-size:12px;line-height:1.45}
      .mailtracker-action,.mailtracker-primary-action{display:flex;align-items:center;gap:10px;width:calc(100% - 32px);min-height:36px;margin:0 16px 10px;border:1px solid #ddd6cd;border-radius:8px;background:#fff;color:#232b2f;cursor:pointer;font:800 13px Inter,Arial,sans-serif;text-align:left}
      .mailtracker-primary-action{border-color:#d6684c;background:#fff7f3;color:#d6684c}
      .mailtracker-action-icon{display:grid;place-items:center;width:22px;color:#d6684c;font-size:16px}
      .mailtracker-action-label{flex:1}
      .mailtracker-notice{margin:14px 16px 8px;padding:10px;border:1px solid #eadfce;border-radius:8px;background:#fff7eb;color:#8a5b22;font-size:12px;line-height:1.45}
      .mailtracker-status{min-height:42px;margin:0 16px;color:#4b3d31;font-size:12px;line-height:1.45}
    `
    return styleElement
  }
}
