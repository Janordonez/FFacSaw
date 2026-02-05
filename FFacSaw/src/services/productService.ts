export interface Categoria { id?: number; nombre: string }

export interface Producto {
  id?: number
  nombre: string
  descripcion?: string
  categoria?: Categoria
  stock?: number
  precioProveedor?: number
  precioVenta?: number
  impuesto?: boolean
}

const BASE = 'http://localhost:8081'

function normalizeNumber(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isNaN(n) ? undefined : n
}

function normalizeProducto(raw: any): Producto {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    categoria: raw.categoria,
    stock: raw.stock != null ? parseInt(String(raw.stock), 10) : undefined,
    precioProveedor: normalizeNumber(raw.precioProveedor),
    precioVenta: normalizeNumber(raw.precioVenta),
    impuesto: raw.impuesto === true || raw.impuesto === 'true'
  }
}

export const productService = {
  async list(): Promise<Producto[]> {
    const res = await fetch(`${BASE}/producto/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list: ${res.status} ${res.statusText}`)
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(normalizeProducto)
  },
  async get(id: number): Promise<Producto | undefined> {
    const res = await fetch(`${BASE}/producto/${id}`, { method: 'GET' })
    if (!res.ok) return undefined
    const data = await res.json()
    return normalizeProducto(data)
  },
  async create(product: Producto): Promise<Producto> {
    const body = { ...product }
    const res = await fetch(`${BASE}/producto/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Error create: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return normalizeProducto(data)
  },
  async update(id: number, product: Producto): Promise<Producto> {
    const body = { ...product, id }
    // endpoint indicado: /producto/actualizar
    const res = await fetch(`${BASE}/producto/actualizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Error update: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return normalizeProducto(data)
  },
  async remove(id: number): Promise<void> {
    // Intento razonable: DELETE /producto/{id}
    const res = await fetch(`${BASE}/producto/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error delete: ${res.status} ${res.statusText}`)
    return
  }
}

export default productService
