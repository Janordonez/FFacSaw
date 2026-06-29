import { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import { existenciaService } from '../services/existenciaService'
import { productService } from '../services/productService'
import type { BodegaDTO } from '../services/bodegaService'
import type { Producto } from '../services/productService'
import AuditModal from './AuditModal'
import { getAudits } from '../services/auditService'

export default function Existencias() {
  const [bodegas, setBodegas] = useState<BodegaDTO[]>([])
  const [selected, setSelected] = useState<BodegaDTO | null>(null)
  const [productosEnBodega, setProductosEnBodega] = useState<any[]>([])
  const [productosAll, setProductosAll] = useState<Producto[]>([])
  const [filter, setFilter] = useState('')
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditData, setAuditData] = useState<import('../services/auditService').AuditEntry[] | null>(null)
  const [addProductOpen, setAddProductOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('')
  const [newStock, setNewStock] = useState('0')
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferProduct, setTransferProduct] = useState<any>(null)
  const [transferDestinoBodegaId, setTransferDestinoBodegaId] = useState<number | ''>('')
  const [transferCantidad, setTransferCantidad] = useState('0')

  useEffect(() => { bodegaService.list().then(setBodegas).catch(() => setBodegas([])) }, [])
  useEffect(() => { productService.list().then(setProductosAll).catch(() => setProductosAll([])) }, [])

  useEffect(() => {
    if (!selected) return setProductosEnBodega([])
    existenciaService.productsByBodega(selected.id!).then(setProductosEnBodega).catch(err => { console.error(err); setProductosEnBodega([]) })
  }, [selected])

  const filtered = productosEnBodega.filter(p => {
    const nombre = p.nombre ?? p.producto?.nombre ?? ''
    return (nombre as string).toLowerCase().includes(filter.toLowerCase())
  })

  const totalStock = filtered.reduce((sum, p) => sum + Number(p.stock ?? p.existencia?.stock ?? 0), 0)
  const productCount = filtered.length
  const lowStockCount = filtered.filter(p => Number(p.stock ?? p.existencia?.stock ?? 0) <= 5).length

  return (
    <div className="existencias-view">
      <aside className="existencias-sidebar">
        <p className="overline">Bodegas</p>
        <ul className="inventory-list">
          {bodegas.map(b => (
            <li
              key={b.id}
              className={`inventory-list-item ${selected?.id === b.id ? 'active' : ''}`}
              onClick={() => setSelected(b)}
            >
              {b.nombre}
            </li>
          ))}
        </ul>
      </aside>

      <section className="existencias-content">
        {selected ? (
          <div className="existencias-panel">
            <div className="existencias-panel-header">
              <p className="overline">Inventario de la bodega</p>
              <h2>Productos en {selected.nombre}</h2>
              <p className="text-muted">Monitorea y ajusta el stock de la bodega con acciones rápidas y datos claros.</p>
            </div>

            <div className="panel-summary">
              <div className="summary-card">
                <strong>{productCount}</strong>
                <span>Productos listados</span>
              </div>
              <div className="summary-card">
                <strong>{totalStock}</strong>
                <span>Unidades en stock</span>
              </div>
              <div className="summary-card">
                <strong>{lowStockCount}</strong>
                <span>Productos con stock bajo</span>
              </div>
            </div>

            <div className="existencias-toolbar">
              <input
                className="filter-input"
                placeholder="Buscar producto..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
              <div className="toolbar-buttons">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setSelectedProductId('')
                    setNewStock('0')
                    setAddProductOpen(true)
                  }}
                  title="Agregar nuevo producto a esta bodega"
                >
                  <i className="fas fa-plus"></i>
                  Agregar producto
                </button>
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="table-responsive">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Precio</th>
                      <th>Descripción</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const prod = p.producto ?? p
                      const stock = p.stock ?? p.existencia?.stock ?? '-'
                      const key = prod.id ?? `${prod.nombre}-${stock}`
                      return (
                        <tr key={key}>
                          <td>{prod.nombre}</td>
                          <td>{prod.precio}</td>
                          <td>{prod.descripcion}</td>
                          <td>{stock}</td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-secondary btn-sm" onClick={() => {
                                setTransferProduct(p)
                                setTransferDestinoBodegaId('')
                                setTransferCantidad('0')
                                setTransferOpen(true)
                              }} title="Transferir este producto a otra bodega">
                                <i className="fas fa-arrow-right"></i>
                                Transferir
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={async () => {
                                const raw = prompt('Ingrese nuevo stock para este producto:', String(stock === '-' ? '0' : stock))
                                if (raw === null) return
                                const newStock = parseInt(raw.trim() || '0', 10)
                                if (Number.isNaN(newStock) || newStock < 0) { alert('Stock inválido'); return }
                                try {
                                  const productoId = prod.id ?? prod.productoId ?? prod.producto?.id
                                  const bodegaId = selected!.id!
                                  await existenciaService.update({ productoId: Number(productoId), bodegaId: Number(bodegaId), stock: newStock })
                                  const refreshed = await existenciaService.productsByBodega(selected!.id!)
                                  setProductosEnBodega(refreshed)
                                } catch (err) { alert((err as Error).message) }
                              }}>
                                <i className="fas fa-edit"></i>
                                Actualizar stock
                              </button>
                              <button className="btn btn-sm" onClick={async () => {
                                try {
                                  const productoId = Number(prod.id ?? prod.productoId ?? prod.producto?.id)
                                  const d = await getAudits('existencia', productoId || undefined)
                                  setAuditData(d)
                                  setAuditOpen(true)
                                } catch (err) { console.error(err) }
                              }}>
                                <i className="fas fa-history"></i>
                                Ver auditorías
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                No se encontraron productos para esta bodega.
              </div>
            )}

            <AuditModal open={auditOpen} onClose={() => setAuditOpen(false)} data={auditData} title={`Auditorías - ${selected?.nombre ?? ''}`} />
            <div className={`modal-overlay${addProductOpen ? ' visible' : ''}`}>
              {addProductOpen && (
                <div className="modal-panel">
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title">Agregar producto</h3>
                      <p className="text-muted">Selecciona un producto y define el stock inicial.</p>
                    </div>
                    <button className="modal-close" onClick={() => setAddProductOpen(false)} aria-label="Cerrar">✕</button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Producto</label>
                      <select
                        className="select-input"
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(parseInt(e.target.value || '0', 10) || '')}
                      >
                        <option value="">Seleccione un producto</option>
                        {productosAll.filter(pa => !productosEnBodega.some(pb => pb.id === pa.id)).map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Stock inicial</label>
                      <input
                        className="filter-input"
                        type="number"
                        min="0"
                        value={newStock}
                        onChange={e => setNewStock(e.target.value)}
                      />
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-secondary" onClick={() => setAddProductOpen(false)}>Cancelar</button>
                      <button className="btn btn-primary" onClick={async () => {
                        if (!selectedProductId) {
                          alert('Seleccione un producto.');
                          return
                        }
                        const stock = parseInt(newStock.trim() || '0', 10)
                        if (Number.isNaN(stock) || stock < 0) {
                          alert('Stock inválido');
                          return
                        }
                        try {
                          await existenciaService.create({ productoId: selectedProductId, bodegaId: selected!.id!, stock })
                          await existenciaService.productsByBodega(selected!.id!).then(setProductosEnBodega)
                          setAddProductOpen(false)
                        } catch (err) {
                          alert((err as Error).message)
                        }
                      }}>Agregar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`modal-overlay${transferOpen ? ' visible' : ''}`}>
              {transferOpen && transferProduct && (
                <div className="modal-panel">
                  <div className="modal-header">
                    <div>
                      <h3 className="modal-title"><i className="fas fa-exchange-alt"></i> Transferir producto</h3>
                      <p className="text-muted">Mueve stock de este producto a otra bodega.</p>
                    </div>
                    <button className="modal-close" onClick={() => setTransferOpen(false)} aria-label="Cerrar">✕</button>
                  </div>
                  <div className="modal-body">
                    <div className="transfer-info">
                      <p><strong>Producto:</strong> {transferProduct.producto?.nombre ?? transferProduct.nombre}</p>
                      <p><strong>Bodega origen:</strong> {selected?.nombre}</p>
                      <p><strong>Stock disponible:</strong> <span className="highlight">{transferProduct.stock ?? 0}</span> unidades</p>
                    </div>
                    <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />
                    <div className="form-group">
                      <label className="form-group-required">Bodega destino</label>
                      <select
                        className="select-input"
                        value={transferDestinoBodegaId}
                        onChange={e => setTransferDestinoBodegaId(parseInt(e.target.value || '0', 10) || '')}
                      >
                        <option value="">Seleccione una bodega</option>
                        {bodegas.filter(b => b.id !== selected!.id).map(b => (
                          <option key={b.id} value={b.id}>{b.nombre} ({b.ubicacion})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-group-required">Cantidad a transferir</label>
                      <input
                        className="filter-input"
                        type="number"
                        min="1"
                        max={transferProduct.stock ?? 0}
                        value={transferCantidad}
                        onChange={e => setTransferCantidad(e.target.value)}
                        placeholder="Ingrese cantidad"
                      />
                      <small className="text-muted">Máximo: {transferProduct.stock ?? 0} unidades</small>
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-secondary" onClick={() => setTransferOpen(false)}>Cancelar</button>
                      <button className="btn btn-primary" onClick={async () => {
                        if (!transferDestinoBodegaId) {
                          alert('Seleccione una bodega destino.');
                          return
                        }
                        const cantidad = parseInt(transferCantidad.trim() || '0', 10)
                        if (Number.isNaN(cantidad) || cantidad <= 0) {
                          alert('Ingrese una cantidad válida.');
                          return
                        }
                        const stockDisponible = Number(transferProduct.stock ?? 0)
                        if (cantidad > stockDisponible) {
                          alert(`No hay suficiente stock. Disponible: ${stockDisponible}`);
                          return
                        }
                        try {
                          const productoId = Number(transferProduct.id ?? transferProduct.productoId ?? transferProduct.producto?.id)
                          const origenStock = Number(transferProduct.stock ?? 0)
                          const existenciasDestino = await existenciaService.listByBodega(transferDestinoBodegaId as number)
                          const foundDestino = existenciasDestino.find((ex: any) => {
                            return (ex.existenciaID && Number(ex.existenciaID.productoId) === productoId) || (ex.producto && Number(ex.producto.id) === productoId) || Number(ex.productoId) === productoId
                          })
                          const existenciaOrigen = { existenciaID: { productoId, bodegaId: selected!.id! }, stock: origenStock }
                          const existenciaDestino = foundDestino
                            ? { existenciaID: { productoId, bodegaId: transferDestinoBodegaId as number }, stock: Number(foundDestino.stock ?? 0) }
                            : { existenciaID: { productoId, bodegaId: transferDestinoBodegaId as number }, stock: 0 }
                          await existenciaService.transfer(existenciaOrigen, existenciaDestino, cantidad)
                          const refreshed = await existenciaService.productsByBodega(selected!.id!)
                          setProductosEnBodega(refreshed)
                          setTransferOpen(false)
                          alert('Transferencia completada exitosamente.')
                        } catch (err) {
                          alert('Error: ' + (err as Error).message)
                        }
                      }}><i className="fas fa-check"></i> Transferir</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            Seleccione una bodega para ver sus productos.
          </div>
        )}
      </section>
    </div>
  )
}
