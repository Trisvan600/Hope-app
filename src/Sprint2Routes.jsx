import { Navigate, Route, Routes } from 'react-router-dom'
import UsersPage from './modules/users/UsersPage'
import CustomersSearchPage from './modules/customers/CustomersSearchPage'
import CustomerForm from './modules/customers/CustomersForm'
import ProductsPage from './modules/products/ProductsPage'
import ProductForm from './modules/products/ProductFormDialog'
import RequireApproval from './components/RequireApproval'
import AppLayout from './components/AppLayout'
import Home from './pages/Home'

export default function Sprint2Routes() {
  return (
    <RequireApproval>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />

          <Route path="/customers" element={<CustomersSearchPage />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:custno/edit" element={<CustomerForm />} />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:prodcode/edit" element={<ProductForm />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </RequireApproval>
  )
}