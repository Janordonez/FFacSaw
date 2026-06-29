import { useEffect, useState } from 'react'
import { categoryService } from '../services/categoryService'
import type { CategoriaDTO } from '../services/categoryService'

type Props = { categoria?: CategoriaDTO | null; onCancel: () => void; onSaved: () => void }

export default function CategoryForm({ categoria, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<CategoriaDTO>({ nombre: '', descripcion: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (categoria) setForm(categoria)
    else setForm({ nombre: '', descripcion: '' })
  }, [categoria])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (form.id) await categoryService.update(form)
      else await categoryService.create(form)
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
        <span className="form-header-icon"><i className="fas fa-tags"></i></span>
        <h3>{form.id ? 'Editar categoría' : 'Nueva categoría'}</h3>
      </div>

      <div className="form-group">
        <label className="form-group-required">Nombre</label>
        <input 
          type="text"
          value={form.nombre || ''} 
          onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} 
          required 
          placeholder="Ingrese el nombre de la categoría"
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea 
          value={form.descripcion || ''} 
          onChange={e => setForm(s => ({ ...s, descripcion: e.target.value }))}
          placeholder="Descripción de la categoría"
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
