import { useState, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSchedule } from '@/contexts/ScheduleContext'
import { DayCard } from './DayCard'
import { DAY_ORDER, getTodayDayOfWeek, type DaySchedule } from '@/types'

const TOTAL           = DAY_ORDER.length
const DESKTOP_SIDE_SCALE = 0.84
const DESKTOP_GAP        = 16

function getOffset(index: number, active: number) {
  let off = index - active
  if (off > TOTAL / 2) off -= TOTAL
  if (off < -TOTAL / 2) off += TOTAL
  return off
}

export function WeekGrid() {
  const { state }  = useSchedule()
  const today      = getTodayDayOfWeek()
  const todayIndex = Math.max(0, DAY_ORDER.indexOf(today))

  const [activeIndex, setActiveIndex] = useState(todayIndex)
  const [direction, setDirection]     = useState<1 | -1>(1)
  const [containerW, setContainerW]   = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef      = useRef<{ startX: number } | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerW(el.offsetWidth)
    const ro = new ResizeObserver(() => setContainerW(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isMobile = containerW > 0 && containerW < 640

  // Dimensões desktop
  const cardW = containerW > 0
    ? (containerW - 2 * DESKTOP_GAP) / (1 + 2 * DESKTOP_SIDE_SCALE)
    : 300
  const sideW  = cardW * DESKTOP_SIDE_SCALE
  const xStep  = cardW / 2 + DESKTOP_GAP + sideW / 2

  const ordered = DAY_ORDER
    .map((day) => state.schedule.find((d) => d.day === day))
    .filter(Boolean) as DaySchedule[]

  const activeDay = ordered[activeIndex]

  function navigate(dir: 1 | -1) {
    setDirection(dir)
    setActiveIndex((i) => (i + dir + TOTAL) % TOTAL)
  }

  // Desktop swipe
  function onPointerDown(e: React.PointerEvent) {
    const target = e.target as HTMLElement
    if (target.closest('button, input, select, textarea, a, [role="button"], [role="combobox"], [role="listbox"]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX }
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current) return
    const diff = dragRef.current.startX - e.clientX
    dragRef.current = null
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1)
  }

  // ─── Mobile: card único full-width ───────────────────────────────────────
  if (isMobile) {
    const variants = {
      enter:  (d: number) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit:   (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
    }

    return (
      <div ref={containerRef} className="flex-1 flex flex-col gap-3 overflow-hidden select-none">
        {/* Card único com animação de slide */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeDay.day}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="absolute inset-0 flex flex-col"
            >
              <DayCard
                daySchedule={activeDay}
                isToday={activeDay.day === today}
                isActive
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegação mobile */}
        <div className="flex items-center justify-between px-1 pb-1 shrink-0 gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)] active:scale-95 transition-all duration-150 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {ordered.map((day, i) => (
              <button
                key={day.day}
                onClick={() => { setDirection(i > activeIndex ? 1 : -1); setActiveIndex(i) }}
                className="rounded-full transition-all duration-200"
                style={{
                  width:      i === activeIndex ? 18 : 6,
                  height:     6,
                  background: i === activeIndex ? 'var(--gold)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => navigate(1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--gold)] hover:border-[var(--gold)] active:scale-95 transition-all duration-150 text-sm font-medium"
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ─── Desktop: carrossel 3 cards ───────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden select-none">
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {containerW > 0 && ordered.map((day, index) => {
          const offset = getOffset(index, activeIndex)
          const absOff = Math.abs(offset)
          const scale   = absOff === 0 ? 1 : absOff === 1 ? DESKTOP_SIDE_SCALE : 0.70
          const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.60 : 0
          const x       = offset * xStep
          const zIndex  = 10 - absOff * 3

          if (absOff > 1) return null

          return (
            <motion.div
              key={day.day}
              animate={{ scale, opacity, x, zIndex }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 flex flex-col"
              style={{ width: cardW, left: `calc(50% - ${cardW / 2}px)` }}
              onClick={() => {
                if (absOff !== 0) navigate(offset > 0 ? 1 : -1)
              }}
            >
              <DayCard
                daySchedule={day}
                isToday={day.day === today}
                isActive={index === activeIndex}
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
