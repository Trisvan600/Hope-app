import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import UsersPage from './modules/users/UsersPage'
import CustomerForm from './modules/users/customers/CustomerForm'
import ProductDetail from './modules/users/customers/ProductDetail'
import CustomersSearchPage from './modules/customers/CustomersSearchPage'
import CustomersPage from './modules/customers/CustomersPage'


export default function Sprint2Routes() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '16px', padding: '12px' }}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/users">Users</NavLink>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/products">Products</NavLink>
      </nav>

      <main style={{ padding: '12px' }}>
        <Routes>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers" element={<CustomersSearchPage />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/products" element={<ProductDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}