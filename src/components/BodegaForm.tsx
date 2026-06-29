import { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import type { BodegaDTO } from '../services/bodegaService'

type Props = { bodega?: BodegaDTO | null; onCancel: () => void; onSaved: () => void }

export default function BodegaForm({ bodega, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<BodegaDTO>({ nombre: '', ubicacion: '', descripcion: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bodega) setForm(bodega)
    else setForm({ nombre: '', ubicacion: '', descripcion: '' })
  }, [bodega])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (form.id) await bodegaService.update(form)
      else await bodegaService.create(form)
      onSaved()
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <div className="form-header">
        <span className="form-header-icon"><i className="fas fa-warehouse"></i></span>
        <h3>{form.id ? 'Editar bodega' : 'Nueva bodega'}</h3>
      </div>

      <div className="form-group">
        <label className="form-group-required">Nombre</label>
        <input 
          type="text"
          value={form.nombre || ''} 
          onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} 
          required 
          placeholder="Ingrese el nombre de la bodega"
        />
      </div>

      <div className="form-group">
        <label className="form-group-required">Ubicación</label>
        <input 
          type="text"
          value={form.ubicacion || ''} 
          onChange={e => setForm(s => ({ ...s, ubicacion: e.target.value }))}
          required
          placeholder="Ej: Planta baja, Sector A"
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea 
          value={form.descripcion || ''} 
          onChange={e => setForm(s => ({ ...s, descripcion: e.target.value }))}
          placeholder="Información adicional sobre la bodega"
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
