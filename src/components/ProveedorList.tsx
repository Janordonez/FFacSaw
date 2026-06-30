import { useEffect, useState } from 'react'
import { proveedorService, type ProveedorDTO } from '../services/proveedorService'

type Props = {
  onEdit: (p: ProveedorDTO) => void
  onCreate: () => void
  refreshSignal: number
}

export default function ProveedorList({ onEdit, onCreate, refreshSignal }: Props) {
  const [items, setItems] = useState<ProveedorDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    proveedorService.list().then(setItems).catch(() => setItems([]))
  }, [refreshSignal])

  const filteredItems = items.filter((p) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [p.nombreComercial, p.razonSocial, p.email, p.telefono, p.RUC]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })

  return (
    <div className="inventory">
      <div className="inventory-header">
        <div>
          <h2>Proveedores</h2>
          <p className="text-muted">Registra y actualiza los datos de tus proveedores.</p>
        </div>
        <button className="btn btn-primary" onClick={onCreate}>Nuevo proveedor</button>
      </div>
      <div className="inventory-controls">
        <div className="inventory-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar proveedores..."
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre comercial</th>
              <th>Razón social</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>RUC</th>
              <th>Costo por pedido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(p => (
              <tr key={p.id}> 
                <td>{p.id}</td>
                <td>{p.nombreComercial}</td>
                <td>{p.razonSocial}</td>
                <td>{p.telefono}</td>
                <td>{p.email}</td>
                <td>{p.RUC}</td>
                <td>{p.costoPorPedido != null ? Number(p.costoPorPedido).toFixed(2) : '-'}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(p)}>Editar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
