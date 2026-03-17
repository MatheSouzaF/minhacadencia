import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { CategoryProvider } from '@/contexts/CategoryContext'
import { ScheduleProvider } from '@/contexts/ScheduleContext'
import { PomodoroProvider } from '@/contexts/PomodoroContext'
import { MonthlyProvider } from '@/contexts/MonthlyContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { SchedulePage } from '@/pages/SchedulePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PomodoroPage } from '@/pages/PomodoroPage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { MonthlyPage } from '@/pages/MonthlyPage'
import { GoalAutoSync } from '@/components/GoalAutoSync'
import LoginPage from '@/pages/LoginPage'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' as const } },
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <Routes location={location}>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/mensal" element={<MonthlyPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-56">
        <TopBar />
        <main className="flex-1 flex flex-col min-h-0 pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <PomodoroWidget />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          },
        }}
      />
    </div>
  )
}

function ProtectedApp() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--text)] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <CategoryProvider>
      <ScheduleProvider>
        <MonthlyProvider>
          <PomodoroProvider>
            <GoalAutoSync />
            <Layout>
              <AnimatedRoutes />
            </Layout>
            <OnboardingModal />
          </PomodoroProvider>
        </MonthlyProvider>
      </ScheduleProvider>
    </CategoryProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </BrowserRouter>
  )
}
