import { useState } from 'react'
import { Plus, CalendarX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SlotItem } from './SlotItem'
import { SlotEditor } from './SlotEditor'
import { useSchedule } from '@/contexts/ScheduleContext'
import type { DaySchedule, Slot, DayOfWeek, TagType } from '@/types'
import { DAY_ORDER } from '@/types'

// ─── Badge variant por tagType ────────────────────────────────────────────────

const TAG_VARIANT: Record<TagType, 'jiu' | 'home' | 'namorada' | 'livre' | 'missa'> = {
  jiu: 'jiu',
  home: 'home',
  namorada: 'namorada',
  livre: 'livre',
  missa: 'missa',
}

// ─── Utilitário: data ISO do dia da semana atual ou futuro ────────────────────

function getDateForDayOfWeek(day: DayOfWeek): string {
  const today = new Date()
  const todayJs = today.getDay() // 0=Sun
  const targetJs = DAY_ORDER.indexOf(day) + 1 // seg=1..sab=6, dom=0
  const targetJsFixed = targetJs === 7 ? 0 : targetJs

  let diff = targetJsFixed - todayJs
  if (diff < 0) diff += 7

  const target = new Date(today)
  target.setDate(today.getDate() + diff)
  return format(target, 'yyyy-MM-dd')
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DayCardProps {
  daySchedule: DaySchedule
  isToday: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DayCard({ daySchedule, isToday }: DayCardProps) {
  const { toggleCheck, addSlot, updateSlot, deleteSlot, isChecked } = useSchedule()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  const date = getDateForDayOfWeek(daySchedule.day)
  const checkedCount = daySchedule.slots.filter((s) => isChecked(date, s.id)).length
  const progress = daySchedule.slots.length > 0
    ? Math.round((checkedCount / daySchedule.slots.length) * 100)
    : 0

  const openNewSlot = () => { setEditingSlot(null); setEditorOpen(true) }
  const openEditSlot = (slot: Slot) => { setEditingSlot(slot); setEditorOpen(true) }

  const handleSave = (data: Omit<Slot, 'id' | 'order'>) => {
    if (editingSlot) {
      updateSlot(daySchedule.day, editingSlot.id, data)
      toast.success('Slot atualizado')
    } else {
      addSlot(daySchedule.day, data)
      toast.success('Slot adicionado')
    }
  }

  const handleDelete = (slotId: string, slotName: string) => {
    deleteSlot(daySchedule.day, slotId)
    toast(`"${slotName}" removido`, { duration: 3000 })
  }

  return (
    <div className="flex flex-col">
      {/* Header do card — day name, tag, circular progress */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 rounded-xl mb-2',
          'bg-[var(--card)] border',
          isToday
            ? 'border-[var(--gold)] shadow-[0_0_0_1px_var(--gold)]'
            : 'border-[var(--border)]'
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn(
              'font-serif font-semibold text-lg',
              isToday ? 'text-[var(--gold)]' : 'text-[var(--text)]'
            )}>
              {daySchedule.label}
            </h3>
            {isToday && (
              <span className="text-xs bg-[color-mix(in_srgb,var(--gold)_20%,transparent)] text-[var(--gold)] px-1.5 py-0.5 rounded-full font-medium">
                Hoje
              </span>
            )}
          </div>
          <Badge variant={TAG_VARIANT[daySchedule.tagType]} className="mt-1">
            {daySchedule.tag}
          </Badge>
        </div>

        {/* Progress circular */}
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke="var(--border)"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke={isToday ? 'var(--gold)' : 'var(--text-muted)'}
              strokeWidth="3"
              strokeDasharray={`${(2 * Math.PI * 15 * progress) / 100} ${2 * Math.PI * 15}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[var(--text-muted)]">
            {checkedCount}/{daySchedule.slots.length}
          </span>
        </div>
      </div>

      {/* Lista de slots */}
      <div className="space-y-1.5 px-1">
        <AnimatePresence initial={false}>
          {daySchedule.slots.map((slot) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
            >
              <SlotItem
                slot={slot}
                checked={isChecked(date, slot.id)}
                onToggle={() => toggleCheck(date, slot.id)}
                onEdit={() => openEditSlot(slot)}
                onDelete={() => handleDelete(slot.id, slot.name)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {daySchedule.slots.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex flex-col items-center justify-center gap-2 py-10 text-[var(--text-muted)]"
            >
              <CalendarX className="w-6 h-6 opacity-40" />
              <p className="text-xs">Nenhum slot ainda.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botão adicionar */}
      <Button
        variant="ghost"
        onClick={openNewSlot}
        className="w-full mt-3 h-12 text-[var(--text-muted)] hover:text-[var(--gold)] gap-2 text-sm border border-dashed border-[var(--border)] rounded-xl hover:border-[var(--gold)]"
      >
        <Plus className="w-4 h-4" />
        Adicionar slot
      </Button>

      {/* Bottom sheet editor */}
      <SlotEditor
        slot={editingSlot}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
