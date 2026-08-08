import { useEffect, useMemo, useState } from 'react'
import movimientoService from '../services/movimientoService'
import { productService } from '../services/productService'
import { bodegaService } from '../services/bodegaService'
import { existenciaService } from '../services/existenciaService'
import type { BodegaDTO } from '../services/bodegaService'
import type { ExistenciaDTO } from '../services/existenciaService'

type DetalleForm = { productoId?: number; cantidad: number; subtotal?: number }

export default function MovimientoForm({ onCancel, onSaved }: { onCancel: () => void; onSaved: () => void }) {
  const [productos, setProductos] = useState<any[]>([])
  const [bodegas, setBodegas] = useState<BodegaDTO[]>([])
  const [existencias, setExistencias] = useState<ExistenciaDTO[]>([])
  const [selectedBodegaId, setSelectedBodegaId] = useState<number | null>(null)
  const [selectedDestinoBodegaId, setSelectedDestinoBodegaId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<'ENTRADA'|'SALIDA'|'TRANSFERENCIA'>('ENTRADA')
  const [detalles, setDetalles] = useState<DetalleForm[]>([{ cantidad: 1 }])
  const [loading, setLoading] = useState(false)

  useEffect(() => { productService.list().then(setProductos).catch(() => setProductos([])) }, [])
  useEffect(() => { bodegaService.list().then(setBodegas).catch(() => setBodegas([])) }, [])
  useEffect(() => {
    if (!selectedBodegaId) {
      setExistencias([])
      setDetalles([{ cantidad: 1 }])
      return
    }

    existenciaService.listByBodega(selectedBodegaId)
      .then(setExistencias)
      .catch(() => setExistencias([]))
  }, [selectedBodegaId])

  const getExistenciaProductoId = (existencia: ExistenciaDTO): number | undefined => {
    if (typeof existencia.productoId === 'number') return existencia.productoId
    if (typeof existencia.producto === 'object' && existencia.producto?.id != null) return existencia.producto.id
    if (existencia.existenciaID?.productoId != null) return existencia.existenciaID.productoId
    return undefined
  }

  const productosDisponibles = useMemo(() => {
    const ids = new Set<number>(existencias.map(e => getExistenciaProductoId(e)).filter((id): id is number => id != null))
    return productos.filter(p => p.id != null && ids.has(p.id))
  }, [existencias, productos])

  const buildDetallesPayload = () => {
    return detalles.map(d => ({
      existencia: {
        existenciaID: {
          productoId: d.productoId,
          bodegaId: selectedBodegaId
        }
      },
      cantidad: d.cantidad,
      subtotal: d.subtotal
    }))
  }

  const isTransferencia = tipo === 'TRANSFERENCIA'

  function updateDetalle(idx: number, patch: Partial<DetalleForm>) {
    setDetalles(prev => prev.map((d, i) => i === idx ? {
      ...d,
      ...patch,
      subtotal: (patch.cantidad ?? d.cantidad) * (productos.find(p => p.id === (patch.productoId ?? d.productoId))?.precioProveedor ?? 0)
    } : d))
  }

  function addDetalle() { setDetalles(prev => [...prev, { cantidad: 1 }]) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBodegaId) {
      alert('Seleccione una bodega antes de guardar el movimiento.')
      return
    }
    if (isTransferencia && (!selectedDestinoBodegaId || selectedDestinoBodegaId === selectedBodegaId)) {
      alert('Seleccione una bodega destino válida para la transferencia.')
      return
    }
    const hasValidDetalles = detalles.some(d => typeof d.productoId === 'number' && d.cantidad > 0)
    if (!hasValidDetalles) {
      alert('Agregue al menos un producto con cantidad válida.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        tipo,
        bodega: { id: selectedBodegaId },
        ...(isTransferencia ? { bodegaDestino: { id: selectedDestinoBodegaId } } : {}),
        detalles: buildDetallesPayload()
      }
      if (isTransferencia) {
        const cantidadTotal = detalles.reduce((sum, d) => sum + (d.cantidad > 0 ? d.cantidad : 0), 0)
        await movimientoService.transfer(payload as any, cantidadTotal)
      } else {
        await movimientoService.create(payload as any)
      }
      onSaved()
    } catch (err) {
      alert('Error al crear movimiento: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="product-form" onSubmit={submit}>
      <div className="form-header">
        <span className="form-header-icon"><i className="fas fa-exchange-alt"></i></span>
        <h3>Nuevo movimiento</h3>
      </div>

      <div className="form-group">
        <label>Tipo</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SALIDA">Salida</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
      </div>

      <div className="form-group">
        <label>Bodega</label>
        <select value={selectedBodegaId ?? ''} onChange={e => setSelectedBodegaId(e.target.value === '' ? null : parseInt(e.target.value, 10))}>
          <option value="">-- seleccionar bodega --</option>
          {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
      </div>

      {isTransferencia && (
        <div className="form-group">
          <label>Bodega destino</label>
          <select value={selectedDestinoBodegaId ?? ''} onChange={e => setSelectedDestinoBodegaId(e.target.value === '' ? null : parseInt(e.target.value, 10))}>
            <option value="">-- seleccionar bodega destino --</option>
            {bodegas.filter(b => b.id !== selectedBodegaId).map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
          <p className="text-muted">Selecciona la bodega a la que se transferirá el stock.</p>
        </div>
      )}

      <div className="form-group">
        <label>Detalles</label>
        {!selectedBodegaId ? (
          <p className="text-muted">Selecciona una bodega para ver los productos disponibles.</p>
        ) : existencias.length === 0 ? (
          <p className="text-muted">No hay productos disponibles en esta bodega.</p>
        ) : null}

        <div style={{ display: 'grid', gap: 8 }}>
          {detalles.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
              <select value={d.productoId ?? ''} onChange={e => updateDetalle(i, { productoId: e.target.value ? parseInt(e.target.value, 10) : undefined })}>
                <option value="">-- producto --</option>
                {productosDisponibles.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <input type="number" min={1} value={d.cantidad} onChange={e => updateDetalle(i, { cantidad: parseInt(e.target.value || '1', 10) })} />
            </div>
          ))}
          <button type="button" className="btn" onClick={addDetalle} disabled={!selectedBodegaId || productosDisponibles.length === 0}>Agregar detalle</button>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
