import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { z } from 'zod'
import { normalizeEmail } from '@mailtracker/shared'
import { ApiError } from './api'
import { getAdminDb } from './firebase-admin'

export function ownerCollection(uid: string, collection: string) {
  return getAdminDb().collection('users').doc(uid).collection(collection)
}

function serialize(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (Array.isArray(value)) return value.map(serialize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, serialize(child)]))
  }
  return value
}

export function serializeDoc(doc: FirebaseFirestore.DocumentSnapshot) {
  const data = serialize(doc.data())
  return { id: doc.id, ...(data && typeof data === 'object' ? data : {}) } as Record<string, unknown>
}

export async function listRecords(uid: string, collection: string) {
  const snapshot = await ownerCollection(uid, collection).orderBy('updatedAt', 'desc').limit(100).get()
  return snapshot.docs.map(serializeDoc)
}

export async function createRecord<T extends z.ZodType>(
  uid: string,
  collection: string,
  schema: T,
  input: unknown,
) {
  const data = schema.parse(input) as Record<string, unknown>
  const ref = ownerCollection(uid, collection).doc()
  await ref.set({ ...data, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() })
  return serializeDoc(await ref.get())
}

export async function updateRecord<T extends z.ZodObject>(
  uid: string,
  collection: string,
  id: string,
  schema: T,
  input: unknown,
) {
  const ref = ownerCollection(uid, collection).doc(id)
  if (!(await ref.get()).exists) throw new ApiError(`${collection.toUpperCase()}_NOT_FOUND`, 'Record not found', 404)
  const data = schema.partial().parse(input)
  await ref.update({ ...data, updatedAt: FieldValue.serverTimestamp() })
  return serializeDoc(await ref.get())
}

export async function archiveRecord(uid: string, collection: string, id: string) {
  const ref = ownerCollection(uid, collection).doc(id)
  const existing = await ref.get()
  if (!existing.exists) throw new ApiError(`${collection.toUpperCase()}_NOT_FOUND`, 'Record not found', 404)
  if (collection === 'contacts') {
    const email = existing.data()?.normalizedPrimaryEmail as string | undefined
    await getAdminDb().runTransaction(async (transaction) => {
      transaction.update(ref, { status: 'archived', updatedAt: FieldValue.serverTimestamp() })
      if (email) transaction.delete(ownerCollection(uid, 'contactEmailReservations').doc(email))
    })
  } else {
    await ref.update({ status: 'archived', updatedAt: FieldValue.serverTimestamp() })
  }
  return serializeDoc(await ref.get())
}

export async function updateContact(uid: string, schema: z.ZodObject, id: string, input: unknown) {
  const ref = ownerCollection(uid, 'contacts').doc(id)
  const data = schema.partial().parse(input) as Record<string, unknown> & { primaryEmail?: string }
  return getAdminDb().runTransaction(async (transaction) => {
    const existing = await transaction.get(ref)
    if (!existing.exists) throw new ApiError('CONTACT_NOT_FOUND', 'Contact not found', 404)
    const oldEmail = existing.data()?.normalizedPrimaryEmail as string
    const newEmail = data.primaryEmail ? normalizeEmail(data.primaryEmail) : oldEmail
    if (newEmail !== oldEmail) {
      const newReservation = ownerCollection(uid, 'contactEmailReservations').doc(newEmail)
      if ((await transaction.get(newReservation)).exists) {
        throw new ApiError('CONTACT_DUPLICATE', 'An active contact already uses this email', 409)
      }
      transaction.delete(ownerCollection(uid, 'contactEmailReservations').doc(oldEmail))
      transaction.create(newReservation, { contactId: id, createdAt: FieldValue.serverTimestamp() })
    }
    transaction.update(ref, { ...data, normalizedPrimaryEmail: newEmail, updatedAt: FieldValue.serverTimestamp() })
    return { id, ...existing.data(), ...data, normalizedPrimaryEmail: newEmail }
  })
}

export async function createContact(uid: string, schema: z.ZodType, input: unknown) {
  const data = schema.parse(input) as Record<string, unknown> & { primaryEmail: string }
  const normalizedPrimaryEmail = normalizeEmail(data.primaryEmail)
  return getAdminDb().runTransaction(async (transaction) => {
    const reservation = ownerCollection(uid, 'contactEmailReservations').doc(normalizedPrimaryEmail)
    if ((await transaction.get(reservation)).exists) throw new ApiError('CONTACT_DUPLICATE', 'An active contact already uses this email', 409)
    const ref = ownerCollection(uid, 'contacts').doc()
    transaction.create(reservation, { contactId: ref.id, createdAt: FieldValue.serverTimestamp() })
    transaction.create(ref, {
      ...data,
      normalizedPrimaryEmail,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    return { id: ref.id, ...data, normalizedPrimaryEmail }
  })
}
