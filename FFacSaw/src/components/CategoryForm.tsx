import React, { useEffect, useState } from 'react'
import { categoryService } from '../services/categoryService'
import type { CategoriaDTO } from '../services/categoryService'

type Props = { categoria?: CategoriaDTO | null; onCancel: () => void; onSaved: () => void }

export default function CategoryForm({ categoria, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<CategoriaDTO>({ nombre: '', descripcion: '' })

  useEffect(() => {
    if (categoria) setForm(categoria)
    else setForm({ nombre: '', descripcion: '' })
  }, [categoria])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (form.id) await categoryService.update(form)
      else await categoryService.create(form)
      onSaved()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <h3>{form.id ? 'Editar categoría' : 'Nueva categoría'}</h3>
      <label>Nombre</label>
      <input value={form.nombre || ''} onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} required />

      <label>Descripción</label>
      <input value={form.descripcion || ''} onChange={e => setForm(s => ({ ...s, descripcion: e.target.value }))} />

      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}
