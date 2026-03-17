import { NavLink } from 'react-router-dom'
import { CalendarDays, LayoutDashboard, Timer, LogOut, Tag, Waves, CalendarRange } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/', icon: CalendarDays, label: 'Cronograma', end: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { to: '/categorias', icon: Tag, label: 'Categorias' },
  { to: '/mensal', icon: CalendarRange, label: 'Mensal' },
]

export function Sidebar() {
  const { logout } = useAuth()

  return (
    <>
      {/* Sidebar — visível apenas em md+ */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-56 bg-[var(--menu-bg)] border-r border-[var(--menu-border)] flex-col z-40">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-[var(--menu-border)]">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[var(--gold-light)] shrink-0" />
            <h1 className="text-[var(--gold-light)] font-semibold text-lg leading-tight">
              Cadência
            </h1>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group cursor-pointer',
                  isActive
                    ? 'bg-[color-mix(in_srgb,var(--gold-light)_15%,transparent)] text-[var(--gold-light)]'
                    : 'text-[var(--menu-text-muted)] hover:text-[var(--menu-text)] hover:bg-[var(--menu-surface)]'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="px-2 py-3 border-t border-[var(--menu-border)]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[var(--menu-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Bottom Navigation — visível apenas em mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--menu-bg)] border-t border-[var(--menu-border)] flex items-center">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-200',
                isActive
                  ? 'text-[var(--gold-light)]'
                  : 'text-[var(--menu-text-muted)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200',
                  isActive && 'bg-[color-mix(in_srgb,var(--gold)_15%,transparent)]'
                )}>
                  <Icon className="w-5 h-5" />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
