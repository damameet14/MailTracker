import type { TrackedEmailStatus } from './TrackedEmailStatus'

export interface TrackedEmailHistoryRecord {
  trackingToken: string
  recipientEmailAddress: string
  ccEmailAddresses: string
  bccEmailAddresses: string
  emailSubject: string
  sentAtIsoString: string
  trackingImageUrl: string
  status: TrackedEmailStatus
  trackingImageLoadedCount: number
}
