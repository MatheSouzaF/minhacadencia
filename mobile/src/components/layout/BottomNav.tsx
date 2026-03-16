import { NavLink } from 'react-router-dom'
import { CalendarDays, BarChart2, Timer } from 'lucide-react'
import { cn } from '@/utils/cn'

const tabs = [
  { path: '/',           icon: CalendarDays, label: 'Agenda'    },
  { path: '/dashboard',  icon: BarChart2,    label: 'Dashboard' },
  { path: '/pomodoro',   icon: Timer,        label: 'Foco'      },
]

export function BottomNav() {
  return (
    <nav className="shrink-0 bg-[var(--surface)] border-t border-[var(--border)] flex items-stretch safe-area-bottom">
      {tabs.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-200',
              isActive
                ? 'text-[var(--gold)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={cn('w-5 h-5 transition-transform duration-200', isActive && 'scale-110')}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
