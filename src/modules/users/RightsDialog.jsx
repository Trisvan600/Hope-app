import { useEffect, useState } from 'react'
import Dialog from './Dialog'
import { ACTIONS, MODULES } from './module'
import { getUserRights, saveUserRights } from './api'

export default function RightsDialog({ user, onClose }) {
  const [checked, setChecked] = useState(null)   // Set of 'module:action'
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    getUserRights(user.id)
      .then(setChecked)
      .catch((e) => { setErr(e.message); setChecked(new Set()) })
  }, [user.id])

  function toggle(key) {
    const next = new Set(checked)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setChecked(next)
  }

  function toggleRow(m) {
    const keys = ACTIONS.map((a) => `${m.key}:${a.key}`)
    const all = keys.every((k) => checked.has(k))
    const next = new Set(checked)
    keys.forEach((k) => (all ? next.delete(k) : next.add(k)))
    setChecked(next)
  }

  async function save() {
    setBusy(true)
    setErr('')
    try {
      await saveUserRights(user.id, checked)
      onClose()
    } catch (e) {
      setErr(e.message)
      setBusy(false)
    }
  }

  return (
    <Dialog
      title={`Rights: ${user.full_name || user.email}`}
      onClose={onClose}
      footer={
        <>
          <button className="u-btn" onClick={onClose}>Cancel</button>
          <button className="u-btn primary" onClick={save} disabled={busy || !checked}>
            {busy ? 'Saving…' : 'Save rights'}
          </button>
        </>
      }
    >
      {!checked ? <p>Loading…</p> : (
        <table className="u-table">
          <thead>
            <tr>
              <th>Module</th>
              {ACTIONS.map((a) => <th key={a.key}>{a.label}</th>)}
              <th>All</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.key}>
                <td>{m.label}</td>
                {ACTIONS.map((a) => {
                  const key = `${m.key}:${a.key}`
                  return (
                    <td key={a.key}>
                      <input type="checkbox" checked={checked.has(key)} onChange={() => toggle(key)} />
                    </td>
                  )
                })}
                <td>
                  <input
                    type="checkbox"
                    checked={ACTIONS.every((a) => checked.has(`${m.key}:${a.key}`))}
                    onChange={() => toggleRow(m)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {err && <p className="s2-error">{err}</p>}
    </Dialog>
  )
}