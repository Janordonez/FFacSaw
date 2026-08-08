import { API } from './apiConfig'

export interface ProveedorDTO {
  id?: number
  nombreComercial: string
  razonSocial: string
  direccion: string
  telefono: string
  email: string
  RUC: string
  numeroDeCuenta?: string
  fechaEntregas?: string
  costoPorPedido?: number | string
}

export const proveedorService = {
  async list(): Promise<ProveedorDTO[]> {
    const res = await fetch(`${API}/proveedor/all`, { method: 'GET' })
    if (!res.ok) throw new Error(`Error list proveedores: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return Array.isArray(data) ? data : []
  },

  async create(proveedor: ProveedorDTO): Promise<ProveedorDTO> {
    const res = await fetch(`${API}/proveedor/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proveedor)
    })
    if (!res.ok) throw new Error(`Error crear proveedor: ${res.status} ${res.statusText}`)
    return res.json()
  },

  async update(proveedor: ProveedorDTO): Promise<ProveedorDTO> {
    const res = await fetch(`${API}/proveedor/actualizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proveedor)
    })
    if (!res.ok) throw new Error(`Error actualizar proveedor: ${res.status} ${res.statusText}`)
    return res.json()
  }
}

export default proveedorService
