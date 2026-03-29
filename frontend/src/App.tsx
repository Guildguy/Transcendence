import { Routes, Route, Navigate, Outlet} from 'react-router-dom'

import AppShell from './components/layout/AppShell/AppShell'
import Header from './components/layout/Header/Header'
import Footer from './components/layout/Footer/Footer'
import AuthPage from './pages/auth/AuthPage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import Home from './pages/Home'
import RegisterPage from './pages/register/RegisterPage'
import RegisterLayout from './pages/register/RegisterLayout'
import ProfilePage from './pages/profile/ProfilePage'
import HomeLogged from './pages/logged/HomeLogged'
import BookSessionWithMentor from './pages/book-session/BookSessionWithMentor'
import MentoriasPage from './pages/mentoria/MentoriasPage'
import { Toaster } from './components/common/ui/Toaster'


function App() {
  return (
    <>
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
         INSTITUCIONAL (FORA DO APPSHELL)
      ===================== */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  </>
  )
}

export default App
