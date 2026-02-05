import React, { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import type { Producto } from '../services/productService'
import { categoryService } from '../services/categoryService'
import type { CategoriaDTO } from '../services/categoryService'

type Props = {
  producto?: Producto | null
  onCancel: () => void
  onSaved: () => void
}

export default function ProductForm({ producto, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<Producto>({ nombre: '', descripcion: '', impuesto: false })
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([])

  useEffect(() => {
    if (producto) setForm(producto)
    else setForm({ nombre: '', descripcion: '', impuesto: false })
  }, [producto])

  useEffect(() => {
    categoryService.list().then(setCategorias).catch(() => setCategorias([]))
  }, [])

  function onChange<K extends keyof Producto>(k: K, v: any) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (form.id) await productService.update(form.id, form)
      else await productService.create(form)
      onSaved()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <h3>{form.id ? 'Editar producto' : 'Nuevo producto'}</h3>
      <label>Nombre</label>
      <input value={form.nombre || ''} onChange={e => onChange('nombre', e.target.value)} required />

      <label>Descripción</label>
      <input value={form.descripcion || ''} onChange={e => onChange('descripcion', e.target.value)} />

      <label>Categoría</label>
      <select value={form.categoria?.id ?? ''} onChange={e => {
        const id = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
        const selected = categorias.find(c => c.id === id)
        onChange('categoria', selected ? { id: selected.id, nombre: selected.nombre } : undefined)
      }}>
        <option value="">-- sin categoría --</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>

      <label>Precio proveedor</label>
      <input type="number" step="0.01" value={form.precioProveedor ?? ''} onChange={e => onChange('precioProveedor', parseFloat(e.target.value || '0'))} />

      <label>Precio venta</label>
      <input type="number" step="0.01" value={form.precioVenta ?? ''} onChange={e => onChange('precioVenta', parseFloat(e.target.value || '0'))} />

      <label>
        <input type="checkbox" checked={!!form.impuesto} onChange={e => onChange('impuesto', e.target.checked)} /> Impuesto
      </label>

      <div className="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}
