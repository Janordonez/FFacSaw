export interface Categoria { id?: number; nombre: string }

export interface ProveedorDTO {
  id?: number
  nombre?: string
  nombreComercial?: string
  razonSocial?: string
}

export interface Producto {
  id?: number
  nombre: string
  descripcion?: string
  categoria?: Categoria
  clasificacion?: string
  precioProveedor?: number
  precioVenta?: number
  impuesto?: boolean
  proveedor?: ProveedorDTO
  stockMinimo?: number
  costoMantenimiento?: number
  stockSeguridad?: number
  stock?: number
  cantVentAnio?: number
  ventasPorAño?: number
  estado?: 'Activo' | 'Inactivo' | string
}

const API = import.meta.env.VITE_API_URL

function normalizeNumber(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isNaN(n) ? undefined : n
}

function normalizeProveedor(rawProveedor: any): ProveedorDTO | undefined {
  if (!rawProveedor) return undefined

  const nombre = rawProveedor.nombre ?? rawProveedor.nombreComercial ?? rawProveedor.razonSocial ?? rawProveedor.nombreProveedor ?? ''

  return {
    id: rawProveedor.id,
    nombre: nombre || undefined,
    nombreComercial: rawProveedor.nombreComercial,
    razonSocial: rawProveedor.razonSocial
  }
}

function normalizeProducto(raw: any): Producto {
  return {
    id: raw.id,
    nombre: raw.nombre,
    descripcion: raw.descripcion,
    categoria: raw.categoria,
    clasificacion: raw.clasificacion,
    precioProveedor: normalizeNumber(raw.precioProveedor),
    precioVenta: normalizeNumber(raw.precioVenta),
    impuesto: raw.impuesto === true || raw.impuesto === 'true',
    proveedor: normalizeProveedor(raw.proveedor),
    stockMinimo: normalizeNumber(raw.stockMinimo),
    costoMantenimiento: normalizeNumber(raw.costoMantenimiento),
    stockSeguridad: normalizeNumber(raw.stockSeguridad),
    stock: raw.stock != null ? parseInt(String(raw.stock), 10) : undefined,
    cantVentAnio: raw.cantVentAnio != null ? parseInt(String(raw.cantVentAnio), 10) : undefined,
    ventasPorAño: normalizeNumber(raw.ventasPorAño),
    estado: raw.estado ?? 'Activo'
  }
}

export const productService = {
  async list(): Promise<Producto[]> {
    const res = await fetch(`${API}/producto/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list: ${res.status} ${res.statusText}`)
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(normalizeProducto)
  },
  async get(id: number): Promise<Producto | undefined> {
    const res = await fetch(`${API}/producto/${id}`, { method: 'GET' })
    if (!res.ok) return undefined
    const data = await res.json()
    return normalizeProducto(data)
  },
  async create(product: Producto): Promise<Producto> {
    const body = { ...product }
    const res = await fetch(`${API}/producto/crear`, {
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
    const res = await fetch(`${API}/producto/actualizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)  
    })
    if (!res.ok) throw new Error(`Error update: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return normalizeProducto(data)
  },
  async remove(id: number): Promise<void> {
    // Intento razonable: DELETE /producto/{id}
    const res = await fetch(`${API}/producto/borrar/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Error delete: ${res.status} ${res.statusText}`)
    return
  }
}

export default productService
