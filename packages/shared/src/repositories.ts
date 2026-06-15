import type { ContactInput } from './schemas'

export interface OwnedRecord {
  id: string
  ownerUid: string
  createdAt: Date
  updatedAt: Date
}

export type ContactRecord = OwnedRecord &
  Omit<ContactInput, 'id'> & {
  normalizedPrimaryEmail: string
}

export interface ContactRepository {
  list(ownerUid: string): Promise<ContactRecord[]>
  get(ownerUid: string, contactId: string): Promise<ContactRecord | null>
  findByEmail(ownerUid: string, normalizedEmail: string): Promise<ContactRecord | null>
  create(ownerUid: string, input: ContactInput): Promise<ContactRecord>
  update(ownerUid: string, contactId: string, input: Partial<ContactInput>): Promise<ContactRecord>
  archive(ownerUid: string, contactId: string): Promise<ContactRecord>
}

export interface OwnedRepository<Record extends OwnedRecord> {
  list(ownerUid: string): Promise<Record[]>
  get(ownerUid: string, id: string): Promise<Record | null>
}

export type CompanyRepository = OwnedRepository<OwnedRecord>
export type DealRepository = OwnedRepository<OwnedRecord>
export type TaskRepository = OwnedRepository<OwnedRecord>
export type TrackedEmailRepository = OwnedRepository<OwnedRecord>
export type ActivityRepository = OwnedRepository<OwnedRecord>
export type NotificationRepository = OwnedRepository<OwnedRecord>
