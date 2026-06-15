'use client'

import { useEffect, useState } from 'react'

export function ResourceTable({ endpoint, emptyMessage }: { endpoint: string; emptyMessage: string }) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    void fetch(endpoint).then(async (response) => {
      if (!response.ok) return setMessage('Sign in to view this data.')
      const result = (await response.json()) as { data: Record<string, unknown>[] }
      setRecords(result.data)
      setMessage(result.data.length ? '' : emptyMessage)
    })
  }, [emptyMessage, endpoint])

  if (!records.length) return <p aria-live="polite">{message}</p>
  const columns = Object.keys(records[0]!).filter((key) => !['createdAt', 'updatedAt'].includes(key)).slice(0, 6)
  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{records.map((record) => <tr key={String(record.id)}>{columns.map((column) => <td key={column}>{format(record[column])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function format(value: unknown) {
  if (value === null || value === undefined) return '-'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
