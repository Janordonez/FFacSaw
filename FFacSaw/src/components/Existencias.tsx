import React, { useEffect, useState } from 'react'
import { bodegaService } from '../services/bodegaService'
import { existenciaService } from '../services/existenciaService'
import { productService } from '../services/productService'
import type { BodegaDTO } from '../services/bodegaService'
import type { Producto } from '../services/productService'

export default function Existencias() {
  const [bodegas, setBodegas] = useState<BodegaDTO[]>([])
  const [selected, setSelected] = useState<BodegaDTO | null>(null)
  const [productosEnBodega, setProductosEnBodega] = useState<any[]>([])
  const [productosAll, setProductosAll] = useState<Producto[]>([])
  const [filter, setFilter] = useState('')

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

  return (
    <div className="existencias-view" style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 280 }}>
        <h3>Bodegas</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {bodegas.map(b => (
            <li key={b.id} style={{ padding: 8, cursor: 'pointer', background: selected?.id === b.id ? '#eef' : 'transparent' }} onClick={() => setSelected(b)}>
              {b.nombre}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }}>
        {selected ? (
          <div>
            <h3>Productos en {selected.nombre}</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input placeholder="Buscar producto..." value={filter} onChange={e => setFilter(e.target.value)} />
              <select onChange={async e => {
                const pid = parseInt(e.target.value || '0', 10)
                if (!pid) return
                // pedir stock y crear existencia
                const raw = prompt('Ingrese stock inicial para este producto:', '0')
                if (raw === null) return
                const stock = parseInt(raw.trim() || '0', 10)
                if (Number.isNaN(stock) || stock < 0) { alert('Stock inválido'); return }
                try {
                  await existenciaService.create({ productoId: pid, bodegaId: selected!.id!, stock })
                  existenciaService.productsByBodega(selected!.id!).then(setProductosEnBodega)
                } catch (err) { alert((err as Error).message) }
                // reset select
                (e.target as HTMLSelectElement).value = ''
              }} defaultValue="">
                <option value="">Agregar producto a esta bodega...</option>
                {productosAll.filter(pa => !productosEnBodega.some(pb => pb.id === pa.id)).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <table className="inventory-table">
              <thead>
                <tr><th>Producto</th><th>Precio</th><th>Descripción</th><th>Stock</th><th>Acciones</th></tr>
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
                        <button style={{ marginRight: 8 }} onClick={async () => {
                          // Transferir: elegir bodega destino y cantidad
                          const opciones = bodegas.filter(b => b.id !== selected!.id)
                          const lista = opciones.map(o => `${o.id}: ${o.nombre}`).join('\n')
                          const destRaw = prompt(`Bodegas destino:\n${lista}\nIngrese id de bodega destino:`)
                          if (destRaw === null) return
                          const destinoId = parseInt(destRaw.trim() || '0', 10)
                          if (!opciones.some(o => o.id === destinoId)) { alert('Bodega destino inválida'); return }
                          const cantidadRaw = prompt('Ingrese cantidad a transferir:', '0')
                          if (cantidadRaw === null) return
                          const cantidad = parseInt(cantidadRaw.trim() || '0', 10)
                          if (Number.isNaN(cantidad) || cantidad <= 0) { alert('Cantidad inválida'); return }
                          try {
                            const productoId = Number(prod.id ?? prod.productoId ?? prod.producto?.id)
                            const origenStock = Number(p.stock ?? p.existencia?.stock ?? 0)

                            // obtener existencia en bodega destino (si existe)
                            const existenciasDestino = await existenciaService.listByBodega(destinoId)
                            const foundDestino = existenciasDestino.find((ex: any) => {
                              return (ex.existenciaID && Number(ex.existenciaID.productoId) === productoId) || (ex.producto && Number(ex.producto.id) === productoId) || Number(ex.productoId) === productoId
                            })

                            const existenciaOrigen = { existenciaID: { productoId, bodegaId: selected!.id! }, stock: origenStock }
                            const existenciaDestino = foundDestino ? { existenciaID: { productoId, bodegaId: destinoId }, stock: Number(foundDestino.stock ?? 0) } : { existenciaID: { productoId, bodegaId: destinoId }, stock: 0 }

                            await existenciaService.transfer(existenciaOrigen, existenciaDestino, cantidad)
                            const refreshed = await existenciaService.productsByBodega(selected!.id!)
                            setProductosEnBodega(refreshed)
                          } catch (err) { alert((err as Error).message) }
                        }}>Transferir</button>

                        <button onClick={async () => {
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
                          } catch (err) {
                            alert((err as Error).message)
                          }
                        }}>Actualizar stock</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Seleccione una bodega para ver sus productos.</p>
        )}
      </div>
    </div>
  )
}
