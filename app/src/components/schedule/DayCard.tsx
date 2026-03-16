import { useState } from 'react'
import { Plus, CalendarX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { format } from 'date-fns'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  const targetJsFixed = targetJs === 7 ? 0 : targetJs // domingo

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
  isActive?: boolean
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function DayCard({ daySchedule, isToday, isActive = false }: DayCardProps) {
  const { toggleCheck, addSlot, updateSlot, deleteSlot, reorderSlots, isChecked } = useSchedule()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  const date = getDateForDayOfWeek(daySchedule.day)
  const checkedCount = daySchedule.slots.filter((s) => isChecked(date, s.id)).length
  const progress = daySchedule.slots.length > 0
    ? Math.round((checkedCount / daySchedule.slots.length) * 100)
    : 0

  // Drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = daySchedule.slots.findIndex((s) => s.id === active.id)
    const newIndex = daySchedule.slots.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(daySchedule.slots, oldIndex, newIndex).map((s, i) => ({
      ...s, order: i,
    }))
    reorderSlots(daySchedule.day, reordered)
  }

  // Editor
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
    <div
      className={cn(
        'bg-[var(--card)] border rounded-xl flex flex-col h-full',
        'transition-all duration-200',
        isToday
          ? 'border-[var(--gold)] shadow-[0_0_0_1px_var(--gold)]'
          : isActive
            ? 'border-[color-mix(in_srgb,var(--border)_60%,var(--text-muted))]'
            : 'border-[var(--border)]',
        isActive && !isToday && 'shadow-[0_4px_24px_rgba(0,0,0,0.18)]'
      )}
    >
      {/* Header do card */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className={cn(
              'font-serif font-semibold text-base',
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

        {/* Progress circular simplificado */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-10 h-10 shrink-0 cursor-help rounded-full transition-all duration-200 hover:ring-2 hover:ring-[color-mix(in_srgb,var(--gold)_40%,transparent)]">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="var(--gold)"
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
          </TooltipTrigger>
          <TooltipContent>{progress}% concluído</TooltipContent>
        </Tooltip>
      </div>

      {/* Lista de slots */}
      <div className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={daySchedule.slots.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence initial={false}>
              {daySchedule.slots.map((slot) => (
                <SlotItem
                  key={slot.id}
                  slot={slot}
                  checked={isChecked(date, slot.id)}
                  onToggle={() => toggleCheck(date, slot.id)}
                  onEdit={() => openEditSlot(slot)}
                  onDelete={() => handleDelete(slot.id, slot.name)}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        <AnimatePresence>
          {daySchedule.slots.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center gap-2 py-8 text-[var(--text-muted)]"
            >
              <CalendarX className="w-6 h-6 opacity-40" />
              <p className="text-xs">Nenhum slot ainda.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rodapé — botão adicionar */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={openNewSlot}
          className="w-full text-[var(--text-muted)] hover:text-[var(--gold)] gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar slot
        </Button>
      </div>

      {/* Editor */}
      <SlotEditor
        slot={editingSlot}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}
