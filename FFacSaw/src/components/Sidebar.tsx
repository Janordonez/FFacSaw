interface MenuModule {
  id: string
  label: string
  icon: string
  description?: string
}

interface SidebarProps {
  activeModule: string
  onModuleChange: (moduleId: string) => void
  modules: MenuModule[]
}

export default function Sidebar({ activeModule, onModuleChange, modules }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="app-logo">
          <i className="fas fa-box"></i>
        </div>
        <h1 className="app-title">FFacSaw</h1>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-section-title">Módulos</h3>
          <div className="nav-modules">
            {modules.map(module => (
              <button
                key={module.id}
                className={`nav-module ${activeModule === module.id ? 'active' : ''}`}
                onClick={() => onModuleChange(module.id)}
                title={module.description}
              >
                <span className="module-icon"><i className={module.icon}></i></span>
                <span className="module-label">{module.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-item">
          <i className="fas fa-cog footer-icon"></i>
          <span>Configuración</span>
        </div>
        <div className="footer-item">
          <i className="fas fa-question-circle footer-icon"></i>
          <span>Ayuda</span>
        </div>
      </div>
    </aside>
  )
}
