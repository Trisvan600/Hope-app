export default function Dialog({ title, onClose, children, footer }) {
  return (
    <div className="u-overlay" onClick={onClose}>
      <div className="u-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="u-dialog-head">
          <h3>{title}</h3>
          <button type="button" className="u-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="u-dialog-body">{children}</div>
        {footer && <div className="u-dialog-foot">{footer}</div>}
      </div>
    </div>
  )
}