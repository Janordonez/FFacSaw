import React, { useState } from 'react'
import './App.css'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import CategoryList from './components/CategoryList'
import CategoryForm from './components/CategoryForm'
import BodegaList from './components/BodegaList'
import BodegaForm from './components/BodegaForm'
import Existencias from './components/Existencias'
import type { Producto } from './services/productService'
import type { CategoriaDTO } from './services/categoryService'
import type { BodegaDTO } from './services/bodegaService'

function App() {
  console.log('App component render')
  const [editing, setEditing] = useState<Producto | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [view, setView] = useState<'productos'|'categorias'|'bodegas'|'existencias'>('productos')
  const [editingCat, setEditingCat] = useState<CategoriaDTO | null>(null)
  const [editingBodega, setEditingBodega] = useState<BodegaDTO | null>(null)

  function onCreate() {
    setEditing(null)
    setShowForm(true)
  }

  function onEdit(p: Producto) {
    setEditing(p)
    setShowForm(true)
  }

  function onCreateCat() {
    setEditingCat(null)
    setShowForm(true)
  }

  function onEditCat(c: CategoriaDTO) {
    setEditingCat(c)
    setShowForm(true)
  }

  function onSavedCat() {
    setShowForm(false)
    setEditingCat(null)
    setRefreshSignal(s => s + 1)
  }

  function onCreateBodega() {
    setEditingBodega(null)
    setShowForm(true)
  }

  function onEditBodega(b: BodegaDTO) {
    setEditingBodega(b)
    setShowForm(true)
  }

  function onSavedBodega() {
    setShowForm(false)
    setEditingBodega(null)
    setRefreshSignal(s => s + 1)
  }

  function onSaved() {
    setShowForm(false)
    setEditing(null)
    setRefreshSignal(s => s + 1)
  }

  return (
    <div className="app" style={{ padding: 16 }}>
      <div style={{ border: '2px dashed #ddd', padding: 12, marginBottom: 12 }}>
        <strong>Debug:</strong> componente App montado correctamente
      </div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Inventario</h1>
        <div>
          <button onClick={() => { setView('productos'); setShowForm(false) }} style={{ marginRight: 8 }}>Productos</button>
          <button onClick={() => { setView('categorias'); setShowForm(false) }} style={{ marginRight: 8 }}>Categorías</button>
          <button onClick={() => { setView('bodegas'); setShowForm(false) }} style={{ marginRight: 8 }}>Bodegas</button>
          <button onClick={() => { setView('existencias'); setShowForm(false) }}>Existencias</button>
        </div>
      </header>
      <main>
          <div className="left">
          {view === 'productos' ? (
            <ProductList onEdit={onEdit} onCreate={onCreate} refreshSignal={refreshSignal} />
          ) : view === 'categorias' ? (
            <CategoryList onEdit={onEditCat} onCreate={onCreateCat} refreshSignal={refreshSignal} />
          ) : view === 'bodegas' ? (
            <BodegaList onEdit={onEditBodega} onCreate={onCreateBodega} refreshSignal={refreshSignal} />
          ) : (
            <Existencias />
          )}
        </div>
        <aside className="right">
          {showForm ? (
            view === 'productos' ? (
              <ProductForm producto={editing} onCancel={() => setShowForm(false)} onSaved={onSaved} />
            ) : view === 'categorias' ? (
              <CategoryForm categoria={editingCat} onCancel={() => setShowForm(false)} onSaved={onSavedCat} />
            ) : view === 'bodegas' ? (
              <BodegaForm bodega={editingBodega} onCancel={() => setShowForm(false)} onSaved={onSavedBodega} />
            ) : (
              <div className="placeholder">
                <p>Seleccione una bodega a la izquierda y administre las existencias allí.</p>
              </div>
            )
          ) : (
            <div className="placeholder">
              {view === 'productos' ? (
                <>
                  <p>Seleccione un producto o cree uno nuevo.</p>
                  <button onClick={onCreate}>Crear producto</button>
                </>
              ) : view === 'categorias' ? (
                <>
                  <p>Administra las categorías aquí.</p>
                  <button onClick={onCreateCat}>Crear categoría</button>
                </>
              ) : view === 'bodegas' ? (
                <>
                  <p>Administra las bodegas aquí.</p>
                  <button onClick={onCreateBodega}>Crear bodega</button>
                </>
              ) : (
                <>
                  <p>Seleccione una bodega a la izquierda y administre las existencias allí.</p>
                </>
              )}
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
