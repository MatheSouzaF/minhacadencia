import { TooltipProvider } from '@/components/ui/tooltip'
import { useProgress } from '@/hooks/useProgress'
import { DayProgress } from '@/components/dashboard/DayProgress'
import { WeekProgress } from '@/components/dashboard/WeekProgress'
import { MonthProgress } from '@/components/dashboard/MonthProgress'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { MonthlyGoalsWidget } from '@/components/dashboard/MonthlyGoalsWidget'

export function DashboardPage() {
  const { dayProgress, weekProgress, monthProgress } = useProgress()

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Linha 1 — Hoje + Semana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DayProgress data={dayProgress} />
          <WeekProgress data={weekProgress} />
        </div>

        {/* Linha 2 — Mês + Categorias da semana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MonthProgress data={monthProgress} />
          <CategoryBreakdown
            categories={dayProgress.byCategory}
            title="Categorias — hoje"
          />
        </div>

        {/* Linha 3 — Metas mensais */}
        <MonthlyGoalsWidget />
      </div>
    </TooltipProvider>
  )
}
