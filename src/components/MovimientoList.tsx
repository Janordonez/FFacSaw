import { useEffect, useState } from 'react'
import movimientoService from '../services/movimientoService'
import { bodegaService } from '../services/bodegaService'
import type { MovimientoInventarioDTO } from '../services/movimientoService'
import type { BodegaDTO } from '../services/bodegaService'

export default function MovimientoList({ refreshSignal, onCreate }: { refreshSignal: number; onCreate?: () => void }) {
  const [movimientos, setMovimientos] = useState<MovimientoInventarioDTO[]>([])
  const [bodegas, setBodegas] = useState<BodegaDTO[]>([])
  const [selectedBodegaId, setSelectedBodegaId] = useState('all')
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoInventarioDTO | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (selectedBodegaId === 'all') {
      movimientoService.list().then(setMovimientos).catch(() => setMovimientos([]))
      return
    }

    const bodegaId = Number(selectedBodegaId)
    if (!Number.isNaN(bodegaId)) {
      movimientoService.listByBodega(bodegaId).then(setMovimientos).catch(() => setMovimientos([]))
    }
  }, [refreshSignal, selectedBodegaId])

  useEffect(() => {
    bodegaService.list().then(setBodegas).catch(() => setBodegas([]))
  }, [])

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('es-ES')
  }

  const openDetalle = async (id?: number) => {
    if (!id) return
    try {
      const movimiento = await movimientoService.getById(id)
      setSelectedMovimiento(movimiento)
      setIsDetailOpen(true)
    } catch {
      alert('No se pudo cargar el movimiento completo.')
    }
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <div>
          <h2>Movimientos</h2>
          <p className="text-muted">Registro de movimientos de inventario</p>
        </div>
        <div className="inventory-controls">
          <label className="inventory-filter">
            <span>Bodega</span>
            <select value={selectedBodegaId} onChange={e => setSelectedBodegaId(e.target.value)}>
              <option value="all">Todas</option>
              {bodegas.map(b => (
                <option key={b.id ?? b.nombre} value={String(b.id ?? '')}>{b.nombre}</option>
              ))}
            </select>
          </label>
          {onCreate && (
            <button className="btn btn-primary" onClick={onCreate}>Nuevo movimiento</button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Bodega</th>
              <th>Fecha</th>
              <th>Detalles</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-muted">No hay movimientos para la bodega seleccionada.</td>
              </tr>
            ) : (
              movimientos.map(m => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.tipo}</td>
                  <td>{m.nombreBodega ?? '-'}</td>
                  <td>{formatDate(m.fecha)}</td>
                  <td>{m.cantDetalles ?? 0}</td>
                  <td>{Number(m.total ?? 0).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openDetalle(m.id)}>Ver completo</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`modal-overlay ${isDetailOpen ? 'visible' : ''}`} onClick={() => setIsDetailOpen(false)}>
        <div className="modal-panel" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Detalle del movimiento</h3>
            <button className="modal-close" onClick={() => setIsDetailOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            {!selectedMovimiento ? (
              <p className="text-muted">No hay información disponible.</p>
            ) : (
              <>
                <div className="transfer-info">
                  <p><strong>ID:</strong> {selectedMovimiento.id}</p>
                  <p><strong>Tipo:</strong> {selectedMovimiento.tipo}</p>
                  <p><strong>Bodega:</strong> {selectedMovimiento.nombreBodega ?? '-'}</p>
                  <p><strong>Fecha:</strong> {formatDate(selectedMovimiento.fecha)}</p>
                  <p><strong>Detalles:</strong> {selectedMovimiento.cantDetalles ?? 0}</p>
                  <p><strong>Total:</strong> {Number(selectedMovimiento.total ?? 0).toFixed(2)}</p>
                </div>
                <div className="table-responsive">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedMovimiento.detalles || []).map((detalle, index) => (
                        <tr key={`${selectedMovimiento.id ?? 'mov'}-${index}`}>
                          <td>{detalle.nombreProducto ?? detalle.producto?.nombre ?? detalle.producto?.nombreProducto ?? detalle.producto?.id ?? '-'}</td>
                          <td>{detalle.cantidad}</td>
                          <td>{Number(detalle.subtotal ?? 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
