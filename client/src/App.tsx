import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import CustomerLayout from '@/layouts/CustomerLayout'
import DashboardPage from '@/pages/DashboardPage'
import PropertiesPage from '@/pages/PropertiesPage'
import BookingsPage from '@/pages/BookingsPage'
import NewBookingPage from '@/pages/NewBookingPage'
import HistoryPage from '@/pages/HistoryPage'
import RepairApprovalsPage from '@/pages/RepairApprovalsPage'
import AssignmentsPage from '@/pages/AssignmentsPage'
import AssignmentDetailPage from '@/pages/AssignmentDetailPage'
import WorkOrdersPage from '@/pages/WorkOrdersPage'
import MyWorkOrdersPage from '@/pages/MyWorkOrdersPage'
import StaffPage from '@/pages/StaffPage'

function ProtectedRoutes() {
  return (
    <>
      <SignedIn>
        <Routes>
          <Route element={<CustomerLayout />}>
            {/* Customer routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/new" element={<NewBookingPage />} />
            <Route path="/repairs" element={<RepairApprovalsPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Staff routes */}
            <Route path="/my-assignments" element={<AssignmentsPage />} />
            <Route path="/my-assignments/:id" element={<AssignmentDetailPage />} />

            {/* Admin routes */}
            <Route path="/work-orders" element={<WorkOrdersPage />} />
            <Route path="/staff" element={<StaffPage />} />

            {/* Repair tech routes */}
            <Route path="/my-work-orders" element={<MyWorkOrdersPage />} />

            {/* Legacy redirects */}
            <Route path="/orders" element={<Navigate to="/bookings" replace />} />
            <Route path="/orders/new" element={<Navigate to="/bookings/new" replace />} />

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
