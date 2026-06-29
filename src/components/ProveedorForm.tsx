import { useEffect, useState } from 'react'
import { proveedorService, type ProveedorDTO } from '../services/proveedorService'

type Props = {
  proveedor?: ProveedorDTO | null
  onCancel: () => void
  onSaved: () => void
}

export default function ProveedorForm({ proveedor, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<ProveedorDTO>({
    nombreComercial: '',
    razonSocial: '',
    direccion: '',
    telefono: '',
    email: '',
    RUC: '',
    numeroDeCuenta: '',
    fechaEntregas: '',
    costoPorPedido: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (proveedor) setForm(proveedor)
    else setForm({
      nombreComercial: '',
      razonSocial: '',
      direccion: '',
      telefono: '',
      email: '',
      RUC: '',
      numeroDeCuenta: '',
      fechaEntregas: '',
      costoPorPedido: ''
    })
  }, [proveedor])

  function onChange<K extends keyof ProveedorDTO>(key: K, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (form.id) await proveedorService.update(form)
      else await proveedorService.create(form)
      onSaved()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <div className="form-header">
        <span className="form-header-icon"><i className="fas fa-truck"></i></span>
        <h3>{form.id ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
      </div>

      <div className="form-group">
        <label className="form-group-required">Nombre comercial</label>
        <input
          type="text"
          value={form.nombreComercial || ''}
          onChange={e => onChange('nombreComercial', e.target.value)}
          required
          placeholder="Ingrese el nombre comercial"
        />
      </div>

      <div className="form-group">
        <label className="form-group-required">Razón social</label>
        <input
          type="text"
          value={form.razonSocial || ''}
          onChange={e => onChange('razonSocial', e.target.value)}
          required
          placeholder="Ingrese la razón social"
        />
      </div>

      <div className="form-group">
        <label className="form-group-required">Dirección</label>
        <input
          type="text"
          value={form.direccion || ''}
          onChange={e => onChange('direccion', e.target.value)}
          required
          placeholder="Ingrese la dirección"
        />
      </div>

      <div className="form-group">
        <label className="form-group-required">Teléfono</label>
        <input
          type="text"
          value={form.telefono || ''}
          onChange={e => onChange('telefono', e.target.value)}
          required
          placeholder="Ingrese el teléfono"
        />
      </div>

      <div className="form-group">
        <label className="form-group-required">Email</label>
        <input
          type="email"
          value={form.email || ''}
          onChange={e => onChange('email', e.target.value)}
          required
          placeholder="Ingrese el correo electrónico"
        />
      </div>

      <div className="form-group">
        <label className="form-group-required">RUC</label>
        <input
          type="text"
          value={form.RUC || ''}
          onChange={e => onChange('RUC', e.target.value)}
          required
          placeholder="Ingrese el RUC"
        />
      </div>

      <div className="form-group">
        <label>Número de cuenta</label>
        <input
          type="text"
          value={form.numeroDeCuenta || ''}
          onChange={e => onChange('numeroDeCuenta', e.target.value)}
          placeholder="Número de cuenta (opcional)"
        />
      </div>

      <div className="form-group">
        <label>Fechas de entregas</label>
        <input
          type="text"
          value={form.fechaEntregas || ''}
          onChange={e => onChange('fechaEntregas', e.target.value)}
          placeholder="Formato libre: días o frecuencia"
        />
      </div>

      <div className="form-group">
        <label>Costo por pedido</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.costoPorPedido ?? ''}
          onChange={e => onChange('costoPorPedido', e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="Ingrese el costo por pedido"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
