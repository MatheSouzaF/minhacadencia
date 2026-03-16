import { useState, useRef, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { useSchedule } from '@/contexts/ScheduleContext'
import { DayCard } from './DayCard'
import { DAY_ORDER, getTodayDayOfWeek, type DaySchedule } from '@/types'

const TOTAL      = DAY_ORDER.length
const SIDE_SCALE = 0.84
const GAP        = 16   // espaço entre o card ativo e os laterais

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
  const [containerW, setContainerW]   = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef      = useRef<{ startX: number } | null>(null)

  // Mede o container e reage a resize
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerW(el.offsetWidth)
    const ro = new ResizeObserver(() => setContainerW(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 3 cards sempre visíveis: active(cardW) + 2×side(cardW×SIDE_SCALE) + 2×GAP = containerW
  const cardW = containerW > 0
    ? (containerW - 2 * GAP) / (1 + 2 * SIDE_SCALE)
    : 300
  const sideW = cardW * SIDE_SCALE
  // deslocamento entre centros: metade do ativo + gap + metade do lateral
  const xStep = cardW / 2 + GAP + sideW / 2

  const ordered = DAY_ORDER
    .map((day) => state.schedule.find((d) => d.day === day))
    .filter(Boolean) as DaySchedule[]

  function navigate(dir: 1 | -1) {
    setActiveIndex((i) => (i + dir + TOTAL) % TOTAL)
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current) return
    const diff = dragRef.current.startX - e.clientX
    dragRef.current = null
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1)
  }

  return (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden select-none">
      {/* Carrossel */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {containerW > 0 && ordered.map((day, index) => {
          const offset = getOffset(index, activeIndex)
          const absOff = Math.abs(offset)
          const scale   = absOff === 0 ? 1 : absOff === 1 ? SIDE_SCALE : 0.70
          const opacity = absOff === 0 ? 1 : absOff === 1 ? 0.60 : 0
          const x       = offset * xStep
          const zIndex  = 10 - absOff * 3

          if (absOff > 1) return null   // só renderiza ativo + adjacentes

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
