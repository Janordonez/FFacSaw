import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import type { Producto } from '../services/productService'
import AuditModal from './AuditModal'
import { getAudits } from '../services/auditService'

export default function ProductList({ onEdit, onCreate, refreshSignal }: { onEdit: (p: Producto) => void; onCreate: () => void; refreshSignal: number }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditData, setAuditData] = useState<import('../services/auditService').AuditEntry[] | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  useEffect(() => {
    productService.list().then(setProductos)
  }, [refreshSignal])

  const filteredProductos = productos.filter((p) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [
      p.nombre,
      p.categoria?.nombre,
      p.clasificacion,
      p.estado,
      p.proveedor?.nombre,
      p.proveedor?.nombreComercial,
      p.proveedor?.razonSocial,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })

  const totalProducts = productos.length
  const productsWithTax = productos.filter(p => p.impuesto).length
  const averageSalePrice = totalProducts > 0 ? productos.reduce((sum, p) => sum + Number(p.precioVenta ?? 0), 0) / totalProducts : 0
  const uniqueCategories = new Set(productos.map(p => p.categoria?.nombre).filter(Boolean)).size

  return (
    <div className="inventory">
      <div className="inventory-header">
        <div>
          <h2>Productos</h2>
          <p className="text-muted">Resumen clave de productos y precios para gestión rápida.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreate}>Nuevo producto</button>
      </div>

      <div className="panel-summary" style={{ marginBottom: 20 }}>
        <div className="summary-card">
          <strong>{totalProducts}</strong>
          <span>Total de productos</span>
        </div>
        <div className="summary-card">
          <strong>{productsWithTax}</strong>
          <span>Productos con impuesto</span>
        </div>
        <div className="summary-card">
          <strong>{averageSalePrice.toFixed(2)}</strong>
          <span>Precio venta promedio</span>
        </div>
        <div className="summary-card">
          <strong>{uniqueCategories}</strong>
          <span>Categorías activas</span>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="inventory-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Clasificación</th>
              <th>Estado</th>
              <th>Precio proveedor</th>
              <th>Precio venta</th>
              <th>Stock</th>
              <th>Stock mínimo</th>
              <th>Stock seguridad</th>
              <th>Costo mant.</th>
              <th>Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria?.nombre}</td>
                <td>{p.clasificacion ?? '-'}</td>
                <td>{p.estado ?? 'Activo'}</td>
                <td>{p.precioProveedor?.toFixed(2)}</td>
                <td>{p.precioVenta?.toFixed(2)}</td>
                <td>{p.stock ?? '-'}</td>
                <td>{p.stockMinimo ?? '-'}</td>
                <td>{p.stockSeguridad ?? '-'}</td>
                <td>{p.costoMantenimiento?.toFixed(2)}</td>
                <td>{p.proveedor?.nombre ?? p.proveedor?.nombreComercial ?? p.proveedor?.razonSocial ?? '-'}</td>
                <td>
                  <div className="action-menu">
                    <button className="action-menu-button" onClick={() => setOpenMenuId(prev => prev === (p.id ?? null) ? null : (p.id ?? null))}>⋮</button>
                    <div className={`action-menu-list${openMenuId === p.id ? ' visible' : ''}`}>
                      <button className="action-menu-item" onClick={() => { setOpenMenuId(null); onEdit(p) }}>Editar</button>
                      <button className="action-menu-item" onClick={async () => {
                        setOpenMenuId(null)
                        try {
                          const d = await getAudits('producto', p.id)
                          setAuditData(d)
                          setAuditOpen(true)
                        } catch (err) {
                          alert('Error al cargar auditorías: ' + (err as Error).message)
                        }
                      }}>Ver auditorías</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AuditModal open={auditOpen} onClose={() => setAuditOpen(false)} data={auditData} title="Auditorías - Producto" />
    </div>
  )
}
