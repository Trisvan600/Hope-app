import { useState } from 'react'
import { usePermissions } from '../../lib/permissions'
import { createUser, updateUser } from './api'
import Dialog from './Dialog'

// S1-DEV-05: Add User and Edit User (pass `user` to edit, nothing to add)
export default function UserFormDialog({ user, onClose, onSaved }) {
  const { isSuperadmin } = usePermissions()
  const isEdit = Boolean(user)
  const [v, setV] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    password: '',
    role: user?.role ?? 'user',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onChange = (e) => setV((x) => ({ ...x, [e.target.name]: e.target.value }))

  function validate() {
    if (!v.full_name.trim()) return 'Name is required.'
    if (!isEdit) {
      if (!/^\S+@\S+\.\S+$/.test(v.email)) return 'Enter a valid email.'
      if (v.password.length < 8) return 'Password must be at least 8 characters.'
    }
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const problem = validate()
    if (problem) return setError(problem)
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        const changes = { full_name: v.full_name.trim() }
        if (isSuperadmin && v.role !== user.role) changes.role = v.role
        await updateUser(user.id, changes)
        onSaved('User updated.')
      } else {
        await createUser({
          email: v.email.trim(),
          password: v.password,
          full_name: v.full_name.trim(),
          role: isSuperadmin ? v.role : 'user',
          activate: isSuperadmin,
        })
        onSaved(isSuperadmin
          ? 'User created and activated.'
          : 'User created. It stays Pending until a superadmin approves it.')
      }
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Dialog title={isEdit ? 'Edit user' : 'Add user'} onClose={onClose}>
      <form className="s2-form" onSubmit={onSubmit}>
        {error && <p className="s2-error">{error}</p>}

        <label>Full name *
          <input name="full_name" value={v.full_name} onChange={onChange} autoFocus />
        </label>
        <label>Email {isEdit ? '(cannot be changed)' : '*'}
          <input name="email" type="email" value={v.email} onChange={onChange} disabled={isEdit} />
        </label>
        {!isEdit && (
          <label>Temporary password *
            <input name="password" type="password" value={v.password} onChange={onChange} autoComplete="new-password" />
          </label>
        )}
        {isSuperadmin && (
          <label>Role
            <select name="role" value={v.role} onChange={onChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}

        <div className="s2-form-actions">
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Dialog>
  )
}