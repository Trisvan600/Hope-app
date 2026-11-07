import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      const { data, error } = await supabase
        .from('customer')
        .select('custno, custname, address, payterm')
        .eq('is_deleted', false)
        .order('custno')

      if (error) setError(error.message)
      else setCustomers(data)
      setLoading(false)
    }
    loadCustomers()
  }, [])

  return (
    <div>
      <h2>Customers</h2>

      {loading && <p>Loading customers...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <p>Total: {customers.length}</p>
          <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
                <th>Cust No</th>
                <th>Name</th>
                <th>Address</th>
                <th>Pay Term</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.custno} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{c.custno}</td>
                  <td>{c.custname}</td>
                  <td>{c.address}</td>
                  <td>{c.payterm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}