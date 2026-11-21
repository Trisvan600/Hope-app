import { supabase } from '../../lib/supabase'
export async function listCustomers({ search = '', status = 'active' }) {
 let q = supabase.from('customers').select('*').order('name')
 if (search) {
 q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
 }
 if (status === 'active') q = q.is('deleted_at', null)
 if (status === 'deleted') q = q.not('deleted_at', 'is', null)
 return q
}