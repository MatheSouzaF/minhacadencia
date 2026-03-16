import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSchedule } from '@/contexts/ScheduleContext'
import { DayCard } from './DayCard'
import { DAY_ORDER, getTodayDayOfWeek } from '@/types'
import { cn } from '@/utils/cn'
import type { DayOfWeek } from '@/types'

const DAY_SHORT: Record<DayOfWeek, string> = {
  segunda: 'Seg',
  terca:   'Ter',
  quarta:  'Qua',
  quinta:  'Qui',
  sexta:   'Sex',
  sabado:  'Sáb',
  domingo: 'Dom',
}

export function DayTabs() {
  const { state } = useSchedule()
  const today = getTodayDayOfWeek()
  const todayIndex = DAY_ORDER.indexOf(today)
  const [activeIndex, setActiveIndex] = useState(todayIndex >= 0 ? todayIndex : 0)
  const [direction, setDirection] = useState(0)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Ordered schedule entries (in canonical week order)
  const ordered = DAY_ORDER
    .map((day) => state.schedule.find((d) => d.day === day))
    .filter(Boolean)

  // Scroll the active chip into view
  useEffect(() => {
    const chip = chipRefs.current[activeIndex]
    if (chip && scrollRef.current) {
      chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [activeIndex])

  const handleTabChange = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day chips scroll */}
      <div
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar shrink-0 border-b border-[var(--border)]"
      >
        {DAY_ORDER.map((day, i) => {
          const isActive = i === activeIndex
          const isToday = day === today
          return (
            <button
              key={day}
              ref={(el) => { chipRefs.current[i] = el }}
              onClick={() => handleTabChange(i)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[var(--gold)] text-[var(--bg)]'
                  : isToday
                    ? 'bg-[color-mix(in_srgb,var(--gold)_15%,transparent)] text-[var(--gold)] border border-[color-mix(in_srgb,var(--gold)_40%,transparent)]'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
              )}
            >
              {DAY_SHORT[day]}
            </button>
          )
        })}
      </div>

      {/* Active day card — animated */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {ordered[activeIndex] && (
              <DayCard
                daySchedule={ordered[activeIndex]!}
                isToday={ordered[activeIndex]!.day === today}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
