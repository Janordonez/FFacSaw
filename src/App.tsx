import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import CategoryList from './components/CategoryList'
import CategoryForm from './components/CategoryForm'
import BodegaList from './components/BodegaList'
import BodegaForm from './components/BodegaForm'
import ProveedorList from './components/ProveedorList'
import ProveedorForm from './components/ProveedorForm'
import Existencias from './components/Existencias'
import MovimientoList from './components/MovimientoList'
import MovimientoForm from './components/MovimientoForm'
import type { Producto } from './services/productService'
import type { CategoriaDTO } from './services/categoryService'
import type { BodegaDTO } from './services/bodegaService'
import type { ProveedorDTO } from './services/proveedorService'

interface MenuModule {
  id: string
  label: string
  icon: string
  description?: string
}

function App() {
  console.log('App component render')
  const [editing, setEditing] = useState<Producto | null>(null)
  const [editingProveedor, setEditingProveedor] = useState<ProveedorDTO | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [view, setView] = useState<'dashboard'| 'productos'|'categorias'|'bodegas'|'proveedores'|'existencias'|'movimientos'>('dashboard')
  const [editingCat, setEditingCat] = useState<CategoriaDTO | null>(null)
  const [editingBodega, setEditingBodega] = useState<BodegaDTO | null>(null)

  const modules: MenuModule[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home', description: 'Vista general' },
    { id: 'productos', label: 'Productos', icon: 'fas fa-box', description: 'Gestión de productos' },
    { id: 'categorias', label: 'Categorías', icon: 'fas fa-tags', description: 'Administrar categorías' },
    { id: 'bodegas', label: 'Bodegas', icon: 'fas fa-warehouse', description: 'Gestión de bodegas' },
    { id: 'proveedores', label: 'Proveedores', icon: 'fas fa-truck', description: 'Administrar proveedores' },
    { id: 'existencias', label: 'Existencias', icon: 'fas fa-chart-bar', description: 'Reportes de inventario' },
    { id: 'movimientos', label: 'Movimientos', icon: 'fas fa-exchange-alt', description: 'Movimientos de inventario' },
  ]

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

  function onCreateProveedor() {
    setEditingProveedor(null)
    setShowForm(true)
  }

  function onEditProveedor(p: ProveedorDTO) {
    setEditingProveedor(p)
    setShowForm(true)
  }

  function onSavedProveedor() {
    setShowForm(false)
    setEditingProveedor(null)
    setRefreshSignal(s => s + 1)
  }

  function onSaved() {
    setShowForm(false)
    setEditing(null)
    setRefreshSignal(s => s + 1)
  }

  const getModuleTitle = (): string => {
    const module = modules.find(m => m.id === view)
    return module?.label || 'Inventario'
  }

  return (
    <div className="app-layout">
      <Sidebar activeModule={view} onModuleChange={(id: any) => { setView(id); setShowForm(false) }} modules={modules} />
      
      <div className="main-container">
        <Header 
          title={getModuleTitle()} 
          showActions={view !== 'existencias' && view !== 'movimientos'}
          onAction={() => {
            switch(view) {
              case 'dashboard': break;
              case 'productos': onCreate(); break;
              case 'categorias': onCreateCat(); break;
              case 'bodegas': onCreateBodega(); break;
              case 'proveedores': onCreateProveedor(); break;
            }
          }}
          actionLabel="Nuevo"
        />

        <div className="content-wrapper">
          <div className="content-main">
            {view === 'dashboard' ? (
              <Dashboard />
            ) : view === 'productos' ? (
              <ProductList onEdit={onEdit} onCreate={onCreate} refreshSignal={refreshSignal} />
            ) : view === 'categorias' ? (
              <CategoryList onEdit={onEditCat} onCreate={onCreateCat} refreshSignal={refreshSignal} />
            ) : view === 'bodegas' ? (
              <BodegaList onEdit={onEditBodega} onCreate={onCreateBodega} refreshSignal={refreshSignal} />
            ) : view === 'proveedores' ? (
              <ProveedorList onEdit={onEditProveedor} onCreate={onCreateProveedor} refreshSignal={refreshSignal} />
            ) : view === 'movimientos' ? (
              <MovimientoList refreshSignal={refreshSignal} onCreate={() => { setShowForm(true) }} />
            ) : (
              <Existencias />
            )}
          </div>

          {showForm && view === 'productos' && (
            <div className="modal-overlay visible">
              <div className="modal-panel">
                <div className="modal-header">
                  <h3 className="modal-title">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
                  <button className="modal-close" onClick={() => { setShowForm(false); setEditing(null) }} aria-label="Cerrar">✕</button>
                </div>
                <ProductForm
                  producto={editing}
                  onCancel={() => { setShowForm(false); setEditing(null) }}
                  onSaved={() => { onSaved(); setEditing(null) }}
                />
              </div>
            </div>
          )}

          {showForm && view === 'categorias' && (
            <div className="modal-overlay visible">
              <div className="modal-panel">
                <div className="modal-header">
                  <h3 className="modal-title">{editingCat ? 'Editar categoría' : 'Nueva categoría'}</h3>
                  <button className="modal-close" onClick={() => { setShowForm(false); setEditingCat(null) }} aria-label="Cerrar">✕</button>
                </div>
                <CategoryForm
                  categoria={editingCat}
                  onCancel={() => { setShowForm(false); setEditingCat(null) }}
                  onSaved={() => { onSavedCat(); setEditingCat(null) }}
                />
              </div>
            </div>
          )}

          {showForm && view === 'proveedores' && (
            <div className="modal-overlay visible">
              <div className="modal-panel">
                <div className="modal-header">
                  <h3 className="modal-title">{editingProveedor ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
                  <button className="modal-close" onClick={() => { setShowForm(false); setEditingProveedor(null) }} aria-label="Cerrar">✕</button>
                </div>
                <ProveedorForm
                  proveedor={editingProveedor}
                  onCancel={() => { setShowForm(false); setEditingProveedor(null) }}
                  onSaved={() => { onSavedProveedor(); setEditingProveedor(null) }}
                />
              </div>
            </div>
          )}

          {showForm && view === 'bodegas' && (
            <div className="modal-overlay visible">
              <div className="modal-panel">
                <div className="modal-header">
                  <h3 className="modal-title">{editingBodega ? 'Editar bodega' : 'Nueva bodega'}</h3>
                  <button className="modal-close" onClick={() => { setShowForm(false); setEditingBodega(null) }} aria-label="Cerrar">✕</button>
                </div>
                <BodegaForm
                  bodega={editingBodega}
                  onCancel={() => { setShowForm(false); setEditingBodega(null) }}
                  onSaved={() => { onSavedBodega(); setEditingBodega(null) }}
                />
              </div>
            </div>
          )}

          {showForm && view === 'movimientos' && (
            <div className="modal-overlay visible">
              <div className="modal-panel">
                <div className="modal-header">
                  <h3 className="modal-title">Nuevo movimiento</h3>
                  <button className="modal-close" onClick={() => { setShowForm(false) }} aria-label="Cerrar">✕</button>
                </div>
                <MovimientoForm
                  onCancel={() => { setShowForm(false) }}
                  onSaved={() => { setShowForm(false); setRefreshSignal(s => s + 1) }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
