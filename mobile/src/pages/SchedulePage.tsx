import { TooltipProvider } from '@/components/ui/tooltip'
import { DayTabs } from '@/components/schedule/DayTabs'

export function SchedulePage() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col flex-1 min-h-0">
        <DayTabs />
      </div>
    </TooltipProvider>
  )
}
