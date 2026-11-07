import { useCallback, useEffect, useState } from 'react'
import { usePermissions } from '../../lib/permissions'
import { countPending } from './api'
import PendingApprovals from '../../pages/PendingApprovals'
import UserManagement from './UserManagement'
import '../../sprint2.css'
import './users.css'

// The /users page: "All users" for admins and superadmins, plus "Pending approvals" for superadmins.
export default function UsersPage() {
  const { isSuperadmin } = usePermissions()
  const [tab, setTab] = useState('all')
  const [version, setVersion] = useState(0)   // bump to make both tabs reload
  const [pending, setPending] = useState(0)

  const changed = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    countPending().then(setPending).catch(() => {})
  }, [version])

  return (
    <div>
      <div className="u-tabs">
        <button className={tab === 'all' ? 'active' : ''} onClick={() => setTab('all')}>All users</button>
        {isSuperadmin && (
          <button className={tab === 'pending' ? 'active' : ''} onClick={() => setTab('pending')}>
            Pending approvals{pending > 0 && <span className="u-count">{pending}</span>}
          </button>
        )}
      </div>

      {tab === 'all' || !isSuperadmin
        ? <UserManagement refreshKey={version} onChanged={changed} />
        : <PendingApprovals refreshKey={version} onChanged={changed} />}
    </div>
  )
}