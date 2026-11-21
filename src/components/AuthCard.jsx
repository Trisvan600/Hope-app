import { isSupabaseConfigured } from '../lib/supabase'

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="center-screen">
      <div className="card">
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
        {!isSupabaseConfigured && (
          <div className="alert alert-error">
            Supabase is not configured. Copy <code>.env.example</code> to <code>.env</code> and add your project URL and anon key, then restart the dev server.
          </div>
        )}
        {children}
        {footer && <div className="footer-links">{footer}</div>}
      </div>
    </div>
  )
}

export function Alert({ type = 'error', children }) {
  if (!children) return null
  return <div className={`alert alert-${type}`}>{children}</div>
}