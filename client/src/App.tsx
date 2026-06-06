import { Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

// Pages (to be created)
// import DashboardPage from '@/pages/DashboardPage'
// import PropertiesPage from '@/pages/PropertiesPage'

export default function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <>
            <SignedIn>
              {/* <DashboardPage /> */}
              <div>Dashboard coming soon</div>
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
    </Routes>
  )
}
