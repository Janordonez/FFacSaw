interface HeaderProps {
  title: string
  showActions?: boolean
  onAction?: () => void
  actionLabel?: string
}

export default function Header({ title, showActions, onAction, actionLabel }: HeaderProps) {
  return (
    <header className="main-header">
      <div className="header-content">
        <h2 className="header-title">{title}</h2>
        {showActions && (
          <div>
            <button className="btn btn-primary" onClick={onAction}>{actionLabel ?? 'Nuevo'}</button>
          </div>
        )}
      </div>
    </header>
  )
}
