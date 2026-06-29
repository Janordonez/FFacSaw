import { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import type { BodegaDTO } from '../services/bodegaService'
import AuditModal from './AuditModal'
import { getAudits } from '../services/auditService'

export default function BodegaList({ onEdit, onCreate, refreshSignal }: { onEdit: (b: BodegaDTO) => void; onCreate: () => void; refreshSignal: number }) {
  const [items, setItems] = useState<BodegaDTO[]>([])
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditData, setAuditData] = useState<import('../services/auditService').AuditEntry[] | null>(null)

  useEffect(() =>  { 
    bodegaService.list().then(setItems).catch(() => setItems([]))
  }, [refreshSignal])

  const handleDelete = (id?: number) => {
    if (!id) return
    if (!confirm('¿Eliminar esta bodega?')) return
    bodegaService.remove(id).then(() => bodegaService.list().then(setItems)).catch(err => alert(err.message))
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Bodegas</h2>
        <button className="btn btn-primary" onClick={onCreate}>Nueva bodega</button>
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
          {items.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.ubicacion}</td>
              <td>{b.descripcion}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => onEdit(b)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Borrar</button>
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
