import { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import type { BodegaDTO } from '../services/bodegaService'
import AuditModal from './AuditModal'
import { getAudits } from '../services/auditService'

export default function BodegaList({ onEdit, onCreate, refreshSignal }: { onEdit: (b: BodegaDTO) => void; onCreate: () => void; refreshSignal: number }) {
  const [items, setItems] = useState<BodegaDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditData, setAuditData] = useState<import('../services/auditService').AuditEntry[] | null>(null)

  useEffect(() =>  { 
    bodegaService.list().then(setItems).catch(() => setItems([]))
  }, [refreshSignal])

  const filteredItems = items.filter((b) => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return true
    return [b.nombre, b.ubicacion, b.descripcion]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  })

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Bodegas</h2>
        <button className="btn btn-primary" onClick={onCreate}>Nueva bodega</button>
      </div>
      <div className="inventory-controls">
        <div className="inventory-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar bodegas..."
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.ubicacion}</td>
              <td>{b.descripcion}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => onEdit(b)}>Editar</button>
                  <button className="btn btn-sm" onClick={async () => { const d = await getAudits('bodega', b.id); setAuditData(d); setAuditOpen(true) }} style={{ marginLeft: 8 }}>Ver auditorías</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <AuditModal open={auditOpen} onClose={() => setAuditOpen(false)} data={auditData} title="Auditorías - Bodega" />
    </div>
  )
}
