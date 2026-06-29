import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import type { Producto } from '../services/productService'
import { categoryService } from '../services/categoryService'
import type { CategoriaDTO } from '../services/categoryService'
import { proveedorService } from '../services/proveedorService'
import type { ProveedorDTO } from '../services/proveedorService'

type Props = {
  producto?: Producto | null
  onCancel: () => void
  onSaved: () => void
}

export default function ProductForm({ producto, onCancel, onSaved }: Props) {
  const [form, setForm] = useState<Producto>({ nombre: '', descripcion: '', impuesto: false })
  const [categorias, setCategorias] = useState<CategoriaDTO[]>([])
  const [proveedores, setProveedores] = useState<ProveedorDTO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (producto) {
      setForm(producto)
    } else {
      setForm({ 
        nombre: '', 
        descripcion: '', 
        impuesto: false,
        cantVentAnio: undefined,
        ventasPorAño: undefined
      })
    }
  }, [producto])

  useEffect(() => {
    categoryService.list().then(setCategorias).catch(() => setCategorias([]))
    proveedorService.list().then(setProveedores).catch(() => setProveedores([]))
  }, [])

  function onChange<K extends keyof Producto>(k: K, v: any) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Al actualizar, se preservan los campos cantVentAnio y ventasPorAño del producto original
      if (form.id) await productService.update(form.id, form)
      else await productService.create(form)
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
        <span className="form-header-icon"><i className="fas fa-box"></i></span>
        <h3>{form.id ? 'Editar producto' : 'Nuevo producto'}</h3>
      </div>

      <div className="form-group">
        <label className="form-group-required">Nombre</label>
        <input 
          type="text"
          value={form.nombre || ''} 
          onChange={e => onChange('nombre', e.target.value)} 
          required 
          placeholder="Ingrese el nombre del producto"
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea 
          value={form.descripcion || ''} 
          onChange={e => onChange('descripcion', e.target.value)}
          placeholder="Descripción detallada del producto"
        />
      </div>

      <div className="form-group">
        <label>Categoría</label>
        <select value={form.categoria?.id ?? ''} onChange={e => {
          const id = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
          const selected = categorias.find(c => c.id === id)
          onChange('categoria', selected ? { id: selected.id, nombre: selected.nombre } : undefined)
        }}>
          <option value="">-- sin categoría --</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label>Precio</label>
          <input 
            type="number" 
            step="0.01" 
            value={form.precio ?? ''} 
            onChange={e => onChange('precio', parseFloat(e.target.value || '0'))}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Proveedor</label>
          <select value={form.proveedor?.id ?? ''} onChange={e => {
            const id = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
            const selected = proveedores.find(p => p.id === id)
            onChange('proveedor', selected)
          }}>
            <option value="">-- sin proveedor --</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombreComercial}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label>Precio proveedor</label>
          <input 
            type="number" 
            step="0.01" 
            value={form.precioProveedor ?? ''} 
            onChange={e => onChange('precioProveedor', parseFloat(e.target.value || '0'))}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Precio venta</label>
          <input 
            type="number" 
            step="0.01" 
            value={form.precioVenta ?? ''} 
            onChange={e => onChange('precioVenta', parseFloat(e.target.value || '0'))}
            placeholder="0.00"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label>Stock mínimo</label>
          <input 
            type="number" 
            value={form.stockMinimo ?? ''} 
            onChange={e => onChange('stockMinimo', parseInt(e.target.value || '0', 10))}
            placeholder="0"
          />
        </div>
        
        <div className="form-group">
          <label>Stock seguridad</label>
          <input 
            type="number" 
            value={form.stockSeguridad ?? ''} 
            onChange={e => onChange('stockSeguridad', parseInt(e.target.value || '0', 10))}
            placeholder="0"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label>Costo mantenimiento</label>
          <input 
            type="number" 
            step="0.01" 
            value={form.costoMantenimiento ?? ''} 
            onChange={e => onChange('costoMantenimiento', parseFloat(e.target.value || '0'))}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Clasificación</label>
          <select  value={form.clasificacion}
          onChange={(e) => onChange('clasificacion', e.target.value)}
          className={form.clasificacion ? 'selected' : ''}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>
      

      <div className="form-group-checkbox">
        <input 
          type="checkbox" 
          id="impuesto"
          checked={!!form.impuesto} 
          onChange={e => onChange('impuesto', e.target.checked)} 
        />
        <label htmlFor="impuesto">Aplicar impuesto</label>
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
