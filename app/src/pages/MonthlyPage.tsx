import { useState } from 'react'
import { format } from 'date-fns'
import { useMonthly } from '@/contexts/MonthlyContext'
import { MonthCalendar } from '@/components/monthly/MonthCalendar'
import { DayDetail } from '@/components/monthly/DayDetail'
import { GoalsList } from '@/components/monthly/GoalsList'

export function MonthlyPage() {
  const { currentMonth, setCurrentMonth } = useMonthly()
  const [selectedDay, setSelectedDay] = useState<string>(() =>
    format(new Date(), 'yyyy-MM-dd')
  )

  function handleChangeMonth(month: string) {
    setCurrentMonth(month)
  }

  return (
    <div className="h-full overflow-hidden p-4 md:p-6 flex gap-4">
      {/* Left: Calendar grande — preenche todo o espaço */}
      <div className="flex-1 min-w-0 min-h-0">
        <MonthCalendar
          month={currentMonth}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onChangeMonth={handleChangeMonth}
        />
      </div>

      {/* Right: Goals + Day Detail — sidebar fixa */}
      <div className="hidden lg:flex w-96 shrink-0 flex-col gap-4 overflow-y-auto">
        <GoalsList month={currentMonth} />
        <DayDetail date={selectedDay} />
      </div>
    </div>
  )
}
