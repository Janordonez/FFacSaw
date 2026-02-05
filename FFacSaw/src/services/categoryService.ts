export interface CategoriaDTO { id?: number; nombre: string; descripcion?: string }

const BASE = 'http://localhost:8081'

export const categoryService = {
  async list(): Promise<CategoriaDTO[]> {
    const res = await fetch(`${BASE}/categoria/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list categorias: ${res.status}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  },
  async create(c: CategoriaDTO): Promise<CategoriaDTO> {
    const res = await fetch(`${BASE}/categoria/crear`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c)
    })
    if (!res.ok) throw new Error(`Error crear categoria: ${res.status}`)
    return res.json()
  },
  async update(c: CategoriaDTO): Promise<CategoriaDTO> {
    const res = await fetch(`${BASE}/categoria/actualizar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c)
    })
    if (!res.ok) throw new Error(`Error actualizar categoria: ${res.status}`)
    return res.json()
  },
  async remove(id: number): Promise<void> {
    const res = await fetch(`${BASE}/categoria/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error borrar categoria: ${res.status}`)
  }
}

export default categoryService
