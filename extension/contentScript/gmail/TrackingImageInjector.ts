import type { GmailComposeWindow } from './GmailComposeWindow'

export class TrackingImageInjector {
  injectTrackingImageIntoComposeWindow(
    gmailComposeWindow: GmailComposeWindow,
    trackingImageUrl: string,
  ): void {
    const existingTrackingImageElement = gmailComposeWindow.editableMessageBodyElement
      .querySelector<HTMLImageElement>('img[data-mailtracker-tracking-image="true"]')

    if (existingTrackingImageElement) {
      existingTrackingImageElement.src = trackingImageUrl
      return
    }

    const trackingImageElement = document.createElement('img')
    trackingImageElement.src = trackingImageUrl
    trackingImageElement.width = 1
    trackingImageElement.height = 1
    trackingImageElement.alt = ''
    trackingImageElement.dataset.mailtrackerTrackingImage = 'true'
    trackingImageElement.style.width = '1px'
    trackingImageElement.style.height = '1px'
    trackingImageElement.style.opacity = '0'
    trackingImageElement.style.pointerEvents = 'none'

    gmailComposeWindow.editableMessageBodyElement.append(document.createElement('br'), trackingImageElement)
  }
}
