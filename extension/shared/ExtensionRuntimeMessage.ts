import type { ExtensionDisplayMode } from './ExtensionDisplayMode'
import type { TrackingTokenCreationRequest } from './TrackingTokenCreationRequest'

export type ExtensionRuntimeMessage =
  | { messageType: 'getCurrentGmailTabStatus' }
  | { messageType: 'savePreferredDisplayMode'; preferredDisplayMode: ExtensionDisplayMode }
  | { messageType: 'saveSidebarEnabled'; sidebarEnabled: boolean }
  | { messageType: 'toggleSidebarForCurrentTab' }
  | { messageType: 'createTrackingToken'; request: TrackingTokenCreationRequest }

export interface CurrentGmailTabStatus {
  isGmailTabOpen: boolean
  isGmailAuthenticated: boolean
  preferredDisplayMode: ExtensionDisplayMode
  sidebarEnabled: boolean
  backendBaseUrl: string
  statusMessage: string
}
