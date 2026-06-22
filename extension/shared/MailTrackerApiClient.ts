import type { TrackingTokenCreationRequest } from './TrackingTokenCreationRequest'
import type { TrackingTokenCreationResponse } from './TrackingTokenCreationResponse'
import type { TrackingEventSummaryResponse } from './TrackingEventSummaryResponse'

export class MailTrackerApiClient {
  constructor(private readonly backendBaseUrl: string) {}

  async createTrackingToken(
    request: TrackingTokenCreationRequest,
  ): Promise<TrackingTokenCreationResponse> {
    const response = await fetch(`${this.backendBaseUrl}/api/trackingTokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error('Tracking token could not be created')
    }

    return (await response.json()) as TrackingTokenCreationResponse
  }

  async getTrackingEventSummary(trackingToken: string): Promise<TrackingEventSummaryResponse> {
    const response = await fetch(`${this.backendBaseUrl}/api/trackingEvents/${trackingToken}`)

    if (!response.ok) {
      throw new Error('Tracking history could not be refreshed')
    }

    return (await response.json()) as TrackingEventSummaryResponse
  }
}
