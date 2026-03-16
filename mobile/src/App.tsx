import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'sonner'
import { ScheduleProvider } from '@/contexts/ScheduleContext'
import { PomodoroProvider } from '@/contexts/PomodoroContext'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNav } from '@/components/layout/BottomNav'
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget'
import { SchedulePage } from '@/pages/SchedulePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PomodoroPage } from '@/pages/PomodoroPage'

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
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
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
      >
        <Routes location={location}>
          <Route path="/" element={<SchedulePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScheduleProvider>
        <PomodoroProvider>
          {/* Mobile shell: fixed height = screen, flex-col, no body scroll */}
          <div className="flex flex-col h-dvh bg-[var(--bg)] overflow-hidden">
            <TopBar />
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <AnimatedRoutes />
            </main>
            <BottomNav />
          </div>

          <PomodoroWidget />

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              },
            }}
          />
        </PomodoroProvider>
      </ScheduleProvider>
    </BrowserRouter>
  )
}
