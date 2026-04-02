import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, Outlet} from 'react-router-dom'

import AppShell from './components/layout/AppShell/AppShell'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import Home from './pages/Home'
import { Toaster } from './components/common/ui/Toaster'
import MentorDashboard from './pages/mentor-dashboard/MentorDashboard'

// Lazy Loading for non-critical pages
const AuthPage = lazy(() => import('./pages/auth/AuthPage'))
const TermsPage = lazy(() => import('./pages/legal/TermsPage'))
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'))
const RegisterPage = lazy(() => import('./pages/register/RegisterPage'))
const RegisterLayout = lazy(() => import('./pages/register/RegisterLayout'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const HomeLogged = lazy(() => import('./pages/logged/HomeLogged'))
const BookSessionWithMentor = lazy(() => import('./pages/book-session/BookSessionWithMentor'))
const MentoriasPage = lazy(() => import('./pages/mentoria/MentoriasPage'))

function App() {
  return (
    <>
    <Suspense fallback={<div className="loading-state">Carregando...</div>}>
    <Toaster />
    <Routes>

        {/* HOME / LOGIN */}
        <Route
          element={
            <AppShell
              sidebar={null}
              header={<Header isAuthenticated={false} />}
              footer={<Footer />}
            >
              <Outlet />
            </AppShell>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
        </Route>

        {/* REGISTER */}
        <Route element={<RegisterLayout />}>
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* 🔥 ÁREA LOGADA */}
        <Route
          element={
            <AppShell
              sidebar={null}
              header={<Header isAuthenticated={true} />}
              footer={<Footer />}
              children={null}
            />
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* INSTITUCIONAL */}
        {/* =====================
           HOME LOGGED
        ===================== */}
        <Route path="/home-logged" element={<HomeLogged />} />
        <Route path="/mentorias" element={<MentoriasPage />} />

        {/* =====================
           BOOK SESSION WITH MENTOR
        ===================== */}
        <Route path="/book-session" element={<BookSessionWithMentor />} />

        {/* =====================
           MENTOR DASHBOARD
        ===================== */}
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />

        {/* =====================
           INSTITUCIONAL (FORA DO APPSHELL)
        ===================== */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Suspense>
  </>
  )
}

export default App
