export interface AuditEntry {
    id?: number;
    timestamp?: string; // ISO date string if available
    user?: string;
    operation?: string;
    // Additional fields from server may persist here but are ignored by default
}

// transform raw JSON entry into AuditEntry structure
function toAuditEntry(raw: any): AuditEntry {
  const entry: AuditEntry = {}
 // Server sometimes returns array entries of the form:
  // [ {entity fields}, {id,timestamp,usuario,...}, "OP" ]
  if (Array.isArray(raw)) {
    const meta = raw[1] || {}
    if (meta.id != null) entry.id = Number(meta.id)
    if (meta.timestamp != null) {
      if (typeof meta.timestamp === 'number') {
        entry.timestamp = new Date(meta.timestamp).toISOString()
      } else {
        entry.timestamp = String(meta.timestamp)
      }
    }
      if (meta.usuario != null) entry.user = String(meta.usuario)
    if (meta.user != null) entry.user = String(meta.user)
    // operation might be third element or inside meta
    const op = raw[2] != null ? raw[2] : meta.operation
    if (typeof op === 'string') entry.operation = op
    return entry
  }

  if (raw == null) return entry
  if (raw.id != null) entry.id = Number(raw.id)
  if (raw.timestamp != null) {
    // timestamp could be epoch milliseconds or ISO string
    if (typeof raw.timestamp === 'number') {
      entry.timestamp = new Date(raw.timestamp).toISOString()
    } else {
      entry.timestamp = String(raw.timestamp)
    }
  }
  if (raw.usuario != null) entry.user = String(raw.usuario)
  if (raw.user != null) entry.user = String(raw.user)
  if (raw.operation != null) entry.operation = String(raw.operation)
  if (typeof raw === 'string') {
    entry.operation = raw
  }
  // if server returns a top-level field that looks like "ADD" etc we observe above
  return entry
}

import { API } from './apiConfig'

// Audit service: fetch audits from server endpoints.
// - To get all audits for an entity:  `/{entity}/auditoria`
// - To get audits for a specific id: `/{entity}/auditoriaid/{id}`
export async function getAudits(entity: string, id?: number): Promise<AuditEntry[]> {
  const safeEntity = encodeURIComponent(String(entity))
  const url = id != null
    ? `${API}/${safeEntity}/auditoriaid/${encodeURIComponent(String(id))}`
    : `${API}/${safeEntity}/auditoria`


  try {
    const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Failed to fetch audits: ${res.status} ${res.statusText} ${text}`)
    }
    const raw = await res.json()
    if (Array.isArray(raw)) {
      return raw.map(toAuditEntry)
    }
    // if server returns single object wrap it
    return [toAuditEntry(raw)]
  } catch (err) {
    console.error('auditService.getAudits error', err)
    throw err
  }
}

