import React, { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import type { Producto } from '../services/productService'

export default function ProductList({ onEdit, onCreate, refreshSignal }: { onEdit: (p: Producto) => void; onCreate: () => void; refreshSignal: number }) {
  const [productos, setProductos] = useState<Producto[]>([])

  useEffect(() => {
    productService.list().then(setProductos)
  }, [refreshSignal])

  const handleDelete = (id?: number) => {
    if (!id) return
    if (!confirm('¿Eliminar este producto?')) return
    productService.remove(id).then(() => productService.list().then(setProductos))
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Productos</h2>
        <button onClick={onCreate}>Nuevo producto</button>
      </div>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Impuesto</th>
            <th>Precio proveedor</th>
            <th>Precio venta</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.categoria?.nombre}</td>
              <td>{p.impuesto ? 'Sí' : 'No'}</td>
              <td>{p.precioProveedor}</td>
              <td>{p.precioVenta}</td>
              <td>
                <button onClick={() => onEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
