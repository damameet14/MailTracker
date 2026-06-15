export type TrackingClassification =
  | 'unknown'
  | 'likely-human'
  | 'likely-proxy'
  | 'likely-scanner'
  | 'likely-sender'
  | 'duplicate'
  | 'pre-send'

export interface TrackingSignals {
  userAgent: string
  isDuplicate: boolean
  sentAt: Date | null
  receivedAt: Date
  senderNetworkMatch: boolean
}

export function classifyTrackingRequest(signals: TrackingSignals): TrackingClassification {
  if (!signals.sentAt || signals.receivedAt < signals.sentAt) return 'pre-send'
  if (signals.isDuplicate) return 'duplicate'
  if (signals.senderNetworkMatch) return 'likely-sender'
  const ua = signals.userAgent.toLowerCase()
  if (/proofpoint|barracuda|mimecast|scanner|urlscan/.test(ua)) return 'likely-scanner'
  if (/googleimageproxy|apple.*mail|outlook.*proxy/.test(ua)) return 'likely-proxy'
  return 'unknown'
}

export function shouldCountClassification(classification: TrackingClassification): boolean {
  return !['duplicate', 'pre-send', 'likely-sender', 'likely-scanner'].includes(classification)
}
