import { TooltipProvider } from '@/components/ui/tooltip'
import { WeekGrid } from '@/components/schedule/WeekGrid'

export function SchedulePage() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="p-3 md:p-4 h-[calc(100dvh-56px-64px)] md:h-[calc(100vh-56px)] flex flex-col">
        <WeekGrid />
      </div>
    </TooltipProvider>
  )
}
