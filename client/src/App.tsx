import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import CustomerLayout from '@/layouts/CustomerLayout'
import DashboardPage from '@/pages/DashboardPage'
import PropertiesPage from '@/pages/PropertiesPage'
import OrdersPage from '@/pages/OrdersPage'
import HistoryPage from '@/pages/HistoryPage'

function ProtectedRoutes() {
  return (
    <>
      <SignedIn>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default function App() {
  return <ProtectedRoutes />
}
