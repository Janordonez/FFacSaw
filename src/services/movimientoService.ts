import { API } from './apiConfig'

export interface DetalleMovimiento {
  producto?: { id?: number; nombre?: string; nombreProducto?: string }
  cantidad: number
  subtotal?: number
  nombreProducto?: string
}

export interface MovimientoDTO {
  id?: number
  tipo: string
  bodega?: { id?: number; nombre?: string }
  detalles: DetalleMovimiento[]
}

export interface MovimientoInventarioDTO {
  id?: number
  nombreBodega?: string
  tipo?: string
  fecha?: string | null
  cantDetalles?: number
  total?: number | string | null
  detalles?: DetalleMovimiento[]
}

const extractDisplayName = (value: any): string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const text = value.trim()
    return text ? text : undefined
  }
  if (typeof value !== 'object') return undefined

  const candidates = [
    value.nombre,
    value.nombreProducto,
    value.productoNombre,
    value.name,
    value.displayName,
    value.producto?.nombre,
    value.producto?.nombreProducto,
    value.producto?.productoNombre,
    value.producto?.name,
    value.product?.nombre,
    value.product?.nombreProducto,
    value.product?.productoNombre,
    value.product?.name,
    value.producto?.producto?.nombre,
    value.producto?.producto?.nombreProducto,
    value.producto?.producto?.productoNombre,
    value.producto?.producto?.name
  ]

  for (const candidate of candidates) {
    const resolved = extractDisplayName(candidate)
    if (resolved) return resolved
  }

  return undefined
}

const normalizeDetalle = (d: any): DetalleMovimiento => {
  const productoPayload = d.producto ?? d.productoDetalle ?? d.productoDTO ?? d.productoEntity ?? d.productoInventario
  const existenciaPayload = d.existencia ?? d.existenciaDTO ?? d.existenciaDetalle
  const nombreProducto = extractDisplayName(
    d.nombreProducto ??
    d.productoNombre ??
    d.producto?.nombre ??
    d.producto?.nombreProducto ??
    d.producto?.productoNombre ??
    d.producto?.producto ??
    d.producto?.product ??
    existenciaPayload?.nombreProducto ??
    existenciaPayload?.nombre ??
    existenciaPayload?.producto?.nombre ??
    existenciaPayload?.producto?.nombreProducto ??
    d
  )
  const productoId = productoPayload?.id ?? existenciaPayload?.ProductoID ?? existenciaPayload?.productoId ?? d.productoId ?? d.producto?.id ?? d.id

  return {
    producto: productoPayload || existenciaPayload ? {
      id: productoId,
      nombre: nombreProducto,
      nombreProducto
    } : undefined,
    cantidad: d.cantidad,
    subtotal: d.subtotal,
    nombreProducto
  }
}

const normalizeMovimientoInventario = (m: any): MovimientoInventarioDTO => ({
  id: m.id,
  nombreBodega: m.nombreBodega ?? m.bodega?.nombre ?? '-',
  tipo: m.tipo,
  fecha: m.fecha,
  cantDetalles: typeof m.cantDetalles === 'number' ? m.cantDetalles : (Array.isArray(m.detalles) ? m.detalles.length : 0),
  total: typeof m.total === 'number' ? m.total : (typeof m.total === 'string' ? Number(m.total) : undefined),
  detalles: Array.isArray(m.detalles) ? m.detalles.map(normalizeDetalle) : []
})

const movimientoService = {
  async list(): Promise<MovimientoInventarioDTO[]> {
    const res = await fetch(`${API}/movimiento/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list movimientos: ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(normalizeMovimientoInventario)
  },

  async listByBodega(id: number): Promise<MovimientoInventarioDTO[]> {
    const res = await fetch(`${API}/movimiento/filtrar/bodega/${id}`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error filtrar movimientos: ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(normalizeMovimientoInventario)
  },

  async getById(id: number): Promise<MovimientoInventarioDTO | null> {
    const res = await fetch(`${API}/movimiento/filtrar/${id}`, { method: 'GET' })
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data !== 'object') return null
    return normalizeMovimientoInventario(data)
  },

  async create(mov: MovimientoDTO): Promise<MovimientoDTO> {
    const res = await fetch(`${API}/movimiento/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mov)
    })
    if (!res.ok) throw new Error(`Error create movimiento: ${res.status}`)
    const data = await res.json()
    return {
      id: data?.id,
      tipo: data?.tipo,
      bodega: data?.bodega,
      detalles: Array.isArray(data?.detalles) ? data.detalles.map(normalizeDetalle) : []
    }
  },

  async transfer(mov: MovimientoDTO, cantidad: number): Promise<MovimientoDTO> {
    const res = await fetch(`${API}/movimiento/transferir/${cantidad}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mov)
    })
    if (!res.ok) throw new Error(`Error transferir movimiento: ${res.status}`)
    const data = await res.json()
    return {
      id: data?.id,
      tipo: data?.tipo,
      bodega: data?.bodega,
      detalles: Array.isArray(data?.detalles) ? data.detalles.map(normalizeDetalle) : []
    }
  }
}

export default movimientoService
