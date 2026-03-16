import { TooltipProvider } from '@/components/ui/tooltip'
import { useProgress } from '@/hooks/useProgress'
import { DayProgress } from '@/components/dashboard/DayProgress'
import { WeekProgress } from '@/components/dashboard/WeekProgress'
import { MonthProgress } from '@/components/dashboard/MonthProgress'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'

export function DashboardPage() {
  const { dayProgress, weekProgress, monthProgress } = useProgress()

  return (
    <TooltipProvider delayDuration={200}>
      {/* Single-column layout — stacked cards with vertical scroll */}
      <div className="px-4 py-4 space-y-4 pb-6">
        <DayProgress data={dayProgress} />
        <WeekProgress data={weekProgress} />
        <MonthProgress data={monthProgress} />
        <CategoryBreakdown
          categories={dayProgress.byCategory}
          title="Categorias — hoje"
        />
      </div>
    </TooltipProvider>
  )
}
