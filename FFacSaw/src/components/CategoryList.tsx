import { useEffect, useState } from 'react'
import { categoryService } from '../services/categoryService'
import type { CategoriaDTO } from '../services/categoryService'
import AuditModal from './AuditModal'
import { getAudits } from '../services/auditService'

export default function CategoryList({ onEdit, onCreate, refreshSignal }: { onEdit: (c: CategoriaDTO) => void; onCreate: () => void; refreshSignal: number }) {
  const [cats, setCats] = useState<CategoriaDTO[]>([])
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditData, setAuditData] = useState<import('../services/auditService').AuditEntry[] | null>(null)

  useEffect(() => {
    categoryService.list().then(setCats).catch(() => setCats([]))
  }, [refreshSignal])

  const handleDelete = (id?: number) => {
    if (!id) return
    if (!confirm('¿Eliminar esta categoría?')) return
    categoryService.remove(id).then(() => categoryService.list().then(setCats)).catch(err => alert(err.message))
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Categorías</h2>
        <button className="btn btn-primary" onClick={onCreate}>Nueva categoría</button>
      </div>
      <div className="table-responsive">
        <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nombre}</td>
              <td>{c.descripcion}</td>
              <td>
                <div className="table-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => onEdit(c)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Borrar</button>
                  <button className="btn btn-sm" onClick={async () => { const d = await getAudits('categoria', c.id); setAuditData(d); setAuditOpen(true) }} style={{ marginLeft: 8 }}>Ver auditorías</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <AuditModal open={auditOpen} onClose={() => setAuditOpen(false)} data={auditData} title="Auditorías - Categoría" />
    </div>
  )
}
