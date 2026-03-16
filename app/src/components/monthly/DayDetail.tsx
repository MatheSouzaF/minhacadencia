import { useState } from 'react'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Circle, Plus, Repeat2, CalendarDays, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSchedule } from '@/contexts/ScheduleContext'
import { SlotEditor } from '@/components/schedule/SlotEditor'
import type { DayOfWeek, Slot } from '@/types'
import { cn } from '@/utils/cn'

interface DayDetailProps {
  date: string  // "2026-03-16"
}

const DOW_LABEL: Record<string, string> = {
  domingo: 'Domingo', segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta',
  quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado',
}

function dateToDayOfWeek(date: Date): DayOfWeek {
  const map: Record<number, DayOfWeek> = {
    0: 'domingo', 1: 'segunda', 2: 'terca', 3: 'quarta',
    4: 'quinta', 5: 'sexta', 6: 'sabado',
  }
  return map[date.getDay()]
}

type AddMode = 'choose' | 'date' | 'recurring' | null

export function DayDetail({ date }: DayDetailProps) {
  const { state, getDayChecks, getDateSlots, toggleCheck, addSlot, addDateSlot, deleteDateSlot } = useSchedule()
  const [addMode, setAddMode] = useState<AddMode>(null)

  const dateObj = parse(date, 'yyyy-MM-dd', new Date())
  const dow = dateToDayOfWeek(dateObj)
  const daySchedule = state.schedule.find((d) => d.day === dow)
  const dayCheck = getDayChecks(date)
  const specificSlots = getDateSlots(date)

  const weeklySlots = daySchedule?.slots ?? []
  const allSlots = [...weeklySlots, ...specificSlots]
  const checked = allSlots.filter((s) => dayCheck.checks[s.id]).length
  const total = allSlots.length
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0

  const dayLabel = format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })
  const todayISO = format(new Date(), 'yyyy-MM-dd')
  const isFuture = date > todayISO

  function handleSaveDate(data: Omit<Slot, 'id' | 'order'>) {
    addDateSlot(date, data)
    setAddMode(null)
  }

  function handleSaveRecurring(data: Omit<Slot, 'id' | 'order'>) {
    addSlot(dow, data)
    setAddMode(null)
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-serif font-semibold text-[var(--text)] capitalize text-base leading-tight">
            {dayLabel}
          </h3>
          {isFuture && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
              planejamento
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">{checked}/{total} slots</span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                backgroundColor: percent === 100 ? 'var(--green)' : 'var(--gold)',
              }}
            />
          </div>
          {percent > 0 && (
            <span className="text-xs font-semibold text-[var(--gold)]">{percent}%</span>
          )}
        </div>
      </div>

      {/* Slots list */}
      <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
        {/* Weekly (recurring) slots */}
        {weeklySlots.map((slot) => {
          const isChecked = !!dayCheck.checks[slot.id]
          return (
            <button
              key={slot.id}
              onClick={() => toggleCheck(date, slot.id)}
              className={cn(
                'group w-full flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors text-left',
                isChecked ? 'bg-zinc-800/40' : 'bg-[var(--surface)] hover:bg-zinc-800'
              )}
            >
              {isChecked
                ? <CheckCircle2 className="w-4 h-4 text-[var(--green)] shrink-0" />
                : <Circle className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              }
              <span className="text-xs text-[var(--text-muted)] w-10 shrink-0 font-mono">{slot.time}</span>
              <span className={cn('text-xs flex-1 text-left', isChecked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]')}>
                {slot.icon && <span className="mr-1">{slot.icon}</span>}
                {slot.name}
              </span>
              <Repeat2 className="w-3 h-3 text-[var(--border)] shrink-0" />
            </button>
          )
        })}

        {/* Date-specific slots */}
        <AnimatePresence initial={false}>
          {specificSlots.map((slot) => {
            const isChecked = !!dayCheck.checks[slot.id]
            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className={cn(
                  'group flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors',
                  'border border-[var(--gold)]/20',
                  isChecked
                    ? 'bg-zinc-800/40'
                    : 'bg-[color-mix(in_srgb,var(--gold)_5%,var(--surface))] hover:bg-[color-mix(in_srgb,var(--gold)_8%,var(--surface))]'
                )}>
                  <button onClick={() => toggleCheck(date, slot.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                    {isChecked
                      ? <CheckCircle2 className="w-4 h-4 text-[var(--green)] shrink-0" />
                      : <Circle className="w-4 h-4 text-[var(--gold)] shrink-0" />
                    }
                    <span className="text-xs text-[var(--text-muted)] w-10 shrink-0 font-mono">{slot.time}</span>
                    <span className={cn('text-xs flex-1 min-w-0 truncate', isChecked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]')}>
                      {slot.icon && <span className="mr-1">{slot.icon}</span>}
                      {slot.name}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteDateSlot(date, slot.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--rose)] cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {total === 0 && (
          <p className="text-xs text-[var(--text-muted)] py-2 text-center">Nenhum slot planejado.</p>
        )}
      </div>

      {/* Add button */}
      {addMode === null && (
        <button
          onClick={() => setAddMode('choose')}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:border-zinc-600 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar slot
        </button>
      )}

      {/* Mode chooser */}
      <AnimatePresence>
        {addMode === 'choose' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAddMode('date')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--gold)]/60 hover:bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] transition-all group"
              >
                <CalendarDays className="w-5 h-5 text-[var(--gold)] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[var(--text)]">Só neste dia</span>
                <span className="text-[10px] text-[var(--text-muted)] text-center">
                  {format(dateObj, "d 'de' MMM", { locale: ptBR })}
                </span>
              </button>
              <button
                onClick={() => setAddMode('recurring')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--blue)]/60 hover:bg-[color-mix(in_srgb,var(--blue)_8%,transparent)] transition-all group"
              >
                <Repeat2 className="w-5 h-5 text-[var(--blue)] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-[var(--text)]">Todo {DOW_LABEL[dow]}</span>
                <span className="text-[10px] text-[var(--text-muted)] text-center">Aparece toda semana</span>
              </button>
            </div>
            <button
              onClick={() => setAddMode(null)}
              className="w-full py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SlotEditor modals */}
      <SlotEditor
        slot={null}
        open={addMode === 'date'}
        onClose={() => setAddMode(null)}
        onSave={handleSaveDate}
      />
      <SlotEditor
        slot={null}
        open={addMode === 'recurring'}
        onClose={() => setAddMode(null)}
        onSave={handleSaveRecurring}
      />
    </div>
  )
}
