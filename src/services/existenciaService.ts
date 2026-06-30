export interface ExistenciaDTO {
  productoId?: number
  bodegaId?: number
  producto?: { id?: number; nombre?: string } | string
  existenciaID?: { productoId?: number; bodegaId?: number }
  bodega?: string
  stock: number
}

const API = import.meta.env.VITE_API_URL

export const existenciaService = {
  async listByBodega(bodegaId: number): Promise<ExistenciaDTO[]> {
    const res = await fetch(`${API}/existencia/filtrar/${bodegaId}`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list existencias: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  },
  async listAll(): Promise<ExistenciaDTO[]> {
    const res = await fetch(`${API}/existencia/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list all existencias: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  },
  async productsByBodega(bodegaId: number): Promise<any[]> {
    const res = await fetch(`${API}/existencia/filtrar/${bodegaId}`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list productos por bodega: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  },
  async create(e: { productoId: number; bodegaId: number; stock: number }): Promise<ExistenciaDTO> {
    const body = { existenciaID: { productoId: e.productoId, bodegaId: e.bodegaId }, stock: e.stock }
    const res = await fetch(`${API}/existencia/crear`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })  
    console.log('Create existencia response:', res)
    if (!res.ok) throw new Error(`Error crear existencia: ${res.status}`)
    return res.json()
  },
  async update(e: { productoId: number; bodegaId: number; stock: number }): Promise<ExistenciaDTO> {
    const body = { existenciaID: { productoId: e.productoId, bodegaId: e.bodegaId }, stock: e.stock }
    const res = await fetch(`${API}/existencia/actualizar`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error(`Error actualizar existencia: ${res.status}`)
    return res.json()
  },
  async transfer(existenciaOrigen: { existenciaID: { productoId: number; bodegaId: number }; stock: number }, existenciaDestino: { existenciaID: { productoId: number; bodegaId: number }; stock: number }, cantidad: number): Promise<any> {
    const body = { existenciaOrigen, existenciaDestino }
    const res = await fetch(`${API}/existencia/transferir/${cantidad}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return res.json()
  },
  async remove(bodegaId: number, productoId: number): Promise<void> {
    const res = await fetch(`${API}/existencia/${bodegaId}/${productoId}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error borrar existencia: ${res.status}`)
  }
}

export default existenciaService
