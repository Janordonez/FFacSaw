function renderCell(value: any) {
  if (value === null || value === undefined) return <span className="audit-empty">—</span>
  if (typeof value === 'object') return <pre className="audit-json">{JSON.stringify(value, null, 2)}</pre>
  return <span className="audit-scalar">{String(value)}</span>
}

export default function AuditModal({ open, onClose, data, title }: { open: boolean; onClose: () => void; data: import('../services/auditService').AuditEntry[] | null; title?: string }) {
  if (!open) return null

  const content = (() => {
    if (data == null) return <div className="audit-empty">No hay auditorías para mostrar.</div>

    if (Array.isArray(data)) {
      if (data.length === 0) return <div className="audit-empty">No hay auditorías para mostrar.</div>
      const objectItems = data.filter(d => d && typeof d === 'object' && !Array.isArray(d))
      const keysSet = new Set<string>()
      objectItems.forEach((o: any) => Object.keys(o).forEach(k => keysSet.add(k)))
      const keys = Array.from(keysSet)

      if (keys.length > 0) {
        return (
          <table className="audit-table">
            <thead>
              <tr>
                <th>#</th>
                {keys.map(k => <th key={k}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  {keys.map(k => <td key={k}>{renderCell(item && typeof item === 'object' ? item[k] : undefined)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )
      }

      return (
        <table className="audit-table">
          <thead>
            <tr><th>#</th><th>Valor</th></tr>
          </thead>
          <tbody>
            {data.map((item: any, idx: number) => (
              <tr key={idx}><td>{idx + 1}</td><td>{renderCell(item)}</td></tr>
            ))}
          </tbody>
        </table>
      )
    }

    if (typeof data === 'object') {
      const keys = Object.keys(data)
      return (
        <table className="audit-table">
          <thead><tr>{keys.map(k => <th key={k}>{k}</th>)}</tr></thead>
          <tbody><tr>{keys.map(k => <td key={k}>{renderCell((data as any)[k])}</td>)}</tr></tbody>
        </table>
      )
    }

    return <div>{renderCell(data)}</div>
  })()

  return (
    <div className="modal-overlay visible">
      <div className="modal-panel">
        <div className="modal-header">
          <h3 className="modal-title">{title ?? 'Auditorías'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          {content}
        </div>

      </div>
    </div>
  )
}
