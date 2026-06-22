import type { ExtensionDisplayMode } from '../shared/ExtensionDisplayMode'
import { extensionStorageKeys } from '../shared/ExtensionStorageKeys'

export class ExtensionPreferenceRepository {
  async getPreferredDisplayMode(): Promise<ExtensionDisplayMode> {
    const values = await chrome.storage.local.get(extensionStorageKeys.preferredDisplayMode)
    return values[extensionStorageKeys.preferredDisplayMode] === 'popup' ? 'popup' : 'sidebar'
  }

  async savePreferredDisplayMode(preferredDisplayMode: ExtensionDisplayMode): Promise<void> {
    await chrome.storage.local.set({ [extensionStorageKeys.preferredDisplayMode]: preferredDisplayMode })
  }

  async getSidebarEnabled(): Promise<boolean> {
    const values = await chrome.storage.local.get(extensionStorageKeys.sidebarEnabled)
    return values[extensionStorageKeys.sidebarEnabled] === false ? false : true
  }

  async saveSidebarEnabled(sidebarEnabled: boolean): Promise<void> {
    await chrome.storage.local.set({ [extensionStorageKeys.sidebarEnabled]: sidebarEnabled })
  }

  async getBackendBaseUrl(): Promise<string> {
    const values = await chrome.storage.local.get(extensionStorageKeys.backendBaseUrl)
    return typeof values[extensionStorageKeys.backendBaseUrl] === 'string'
      ? values[extensionStorageKeys.backendBaseUrl]
      : 'https://crm.d14.app'
  }
}
