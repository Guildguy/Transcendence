import { Routes, Route, Navigate } from 'react-router-dom'

import AppShell from './components/layout/AppShell/AppShell'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import Sidebar from './components/layout/Sidebar/Sidebar'

import AuthPage from './pages/auth/AuthPage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import Home from './pages/Home'

function App() {
  return (
    <Routes>

      {/* =====================
         PUBLIC ROUTES
      ===================== */}
      <Route
        element={
          <AppShell
            sidebar={null}
            header={<Header isAuthenticated={true} />}
            footer={<Footer />}
          />
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
      </Route>

      {/* =====================
         PRIVATE ROUTES
      ===================== */}
      <Route
        element={
          <AppShell
            sidebar={<Sidebar />}
            header={<Header isAuthenticated={true} />}
            footer={<Footer />}
          />
        }
      >
        {/* rotas futuras */}
      </Route>

      {/* =====================
         INSTITUCIONAL
      ===================== */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* =====================
         FALLBACK
      ===================== */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  )
}

export default App
