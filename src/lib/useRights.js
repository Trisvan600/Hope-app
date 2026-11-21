import { usePermissions } from './permissions'

// Use in pages: const { can } = useRights()
// can('products', 'add' | 'edit' | 'delete'), can('customers', 'add' | 'edit' | 'delete')
// Restore counts as 'delete'.
export function useRights() {
  const { can, loading, role } = usePermissions()
  return { can, loading, role }
}