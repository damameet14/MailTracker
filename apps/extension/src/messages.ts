export type ExtensionRequest =
  | { type: 'GET_STATUS' }
  | { type: 'PAIR'; code: string; deviceName: string }
  | { type: 'TOGGLE_SIDEBAR'; tabId: number }
  | { type: 'API_REQUEST'; path: string; method: 'GET' | 'POST'; body?: unknown }

export interface ExtensionStatus {
  paired: boolean
  apiOrigin: string
  lastErrorCode: string | null
}
