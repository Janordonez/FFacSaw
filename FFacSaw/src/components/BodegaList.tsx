import React, { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import type { BodegaDTO } from '../services/bodegaService'

export default function BodegaList({ onEdit, onCreate, refreshSignal }: { onEdit: (b: BodegaDTO) => void; onCreate: () => void; refreshSignal: number }) {
  const [items, setItems] = useState<BodegaDTO[]>([])

  useEffect(() => {
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
        <button onClick={onCreate}>Nueva bodega</button>
      </div>
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
                <button onClick={() => onEdit(b)}>Editar</button>
                <button onClick={() => handleDelete(b.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
