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
    // When switching month, don't keep a cross-month selected day
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* Left: Calendar */}
        <MonthCalendar
          month={currentMonth}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onChangeMonth={handleChangeMonth}
        />

        {/* Right: Goals + Day Detail */}
        <div className="space-y-4">
          <GoalsList month={currentMonth} />
          <DayDetail date={selectedDay} />
        </div>
      </div>
    </div>
  )
}
