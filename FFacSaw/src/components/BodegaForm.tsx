import React, { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import type { BodegaDTO } from '../services/bodegaService'

type Props = { bodega?: BodegaDTO | null; onCancel: () => void; onSaved: () => void }

export default function BodegaForm({ bodega, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<BodegaDTO>({ nombre: '', ubicacion: '', descripcion: '' })

  useEffect(() => {
    if (bodega) setForm(bodega)
    else setForm({ nombre: '', ubicacion: '', descripcion: '' })
  }, [bodega])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (form.id) await bodegaService.update(form)
      else await bodegaService.create(form)
      onSaved()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <h3>{form.id ? 'Editar bodega' : 'Nueva bodega'}</h3>
      <label>Nombre</label>
      <input value={form.nombre || ''} onChange={e => setForm(s => ({ ...s, nombre: e.target.value }))} required />

      <label>Ubicación</label>
      <input value={form.ubicacion || ''} onChange={e => setForm(s => ({ ...s, ubicacion: e.target.value }))} />

      <label>Descripción</label>
      <input value={form.descripcion || ''} onChange={e => setForm(s => ({ ...s, descripcion: e.target.value }))} />

      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}
