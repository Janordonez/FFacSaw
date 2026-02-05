export interface BodegaDTO { id?: number; nombre: string; ubicacion?: string; descripcion?: string }

const BASE = 'http://localhost:8081'

export const bodegaService = {
  async list(): Promise<BodegaDTO[]> {
    const res = await fetch(`${BASE}/bodega/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list bodegas: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  },
  async create(b: BodegaDTO): Promise<BodegaDTO> {
    const res = await fetch(`${BASE}/bodega/crear`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
    if (!res.ok) throw new Error(`Error crear bodega: ${res.status}`)
    return res.json()
  },
  async update(b: BodegaDTO): Promise<BodegaDTO> {
    const res = await fetch(`${BASE}/bodega/actualizar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
    if (!res.ok) throw new Error(`Error actualizar bodega: ${res.status}`)
    return res.json()
  },
  async remove(id: number): Promise<void> {
    const res = await fetch(`${BASE}/bodega/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error borrar bodega: ${res.status}`)
  }
}

export default bodegaService
