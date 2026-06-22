import { extensionStorageKeys } from '../../../shared/ExtensionStorageKeys'
import type { TrackedEmailHistoryRecord } from '../../../shared/TrackedEmailHistoryRecord'

export class TrackedEmailHistoryRepository {
  async getHistoryRecords(): Promise<TrackedEmailHistoryRecord[]> {
    const values = await chrome.storage.local.get(extensionStorageKeys.sentEmailHistoryRecords)
    const records = values[extensionStorageKeys.sentEmailHistoryRecords]
    return Array.isArray(records) ? records as TrackedEmailHistoryRecord[] : []
  }

  async saveHistoryRecord(record: TrackedEmailHistoryRecord): Promise<void> {
    const records = await this.getHistoryRecords()
    const recordsWithoutDuplicate = records.filter((existingRecord) => {
      return existingRecord.trackingToken !== record.trackingToken
    })

    await chrome.storage.local.set({
      [extensionStorageKeys.sentEmailHistoryRecords]: [record, ...recordsWithoutDuplicate].slice(0, 100),
    })
  }

  async saveHistoryRecords(records: TrackedEmailHistoryRecord[]): Promise<void> {
    await chrome.storage.local.set({
      [extensionStorageKeys.sentEmailHistoryRecords]: records.slice(0, 100),
    })
  }
}
