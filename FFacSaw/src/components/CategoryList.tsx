import React, { useEffect, useState } from 'react'
import { categoryService } from '../services/categoryService'
import type { CategoriaDTO } from '../services/categoryService'

export default function CategoryList({ onEdit, onCreate, refreshSignal }: { onEdit: (c: CategoriaDTO) => void; onCreate: () => void; refreshSignal: number }) {
  const [cats, setCats] = useState<CategoriaDTO[]>([])

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
        <button onClick={onCreate}>Nueva categoría</button>
      </div>
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
                <button onClick={() => onEdit(c)}>Editar</button>
                <button onClick={() => handleDelete(c.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
