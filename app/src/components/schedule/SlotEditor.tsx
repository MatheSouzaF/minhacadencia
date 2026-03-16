import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import type { Slot } from '@/types'
import { useCategories } from '@/contexts/CategoryContext'

interface SlotEditorProps {
  slot: Slot | null
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Slot, 'id' | 'order'>) => void
}

export function SlotEditor({ slot, open, onClose, onSave }: SlotEditorProps) {
  const { categories } = useCategories()
  const isNew = slot === null
  const defaultCategory = categories[0]?.id ?? ''

  const [time, setTime] = useState(slot?.time ?? '')
  const [name, setName] = useState(slot?.name ?? '')
  const [note, setNote] = useState(slot?.note ?? '')
  const [category, setCategory] = useState(slot?.category ?? defaultCategory)

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      onClose()
    } else if (isNew) {
      setTime(''); setName(''); setNote(''); setCategory(defaultCategory)
    } else {
      setTime(slot?.time ?? '')
      setName(slot?.name ?? '')
      setNote(slot?.note ?? '')
      setCategory(slot?.category ?? defaultCategory)
    }
  }

  const selectedCat = categories.find((c) => c.id === category)

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      time: time.trim(),
      name: name.trim(),
      note: note.trim() || undefined,
      category,
      icon: selectedCat?.emoji,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Novo slot' : 'Editar slot'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-muted)]">Horário</label>
            <Input
              placeholder="ex: 06h00 ou 06h00–08h00"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-muted)]">
              Nome <span className="text-[var(--rose)]">*</span>
            </label>
            <Input
              placeholder="ex: Jiu-Jitsu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-muted)]">Categoria</label>
            {categories.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Nenhuma categoria cadastrada. Crie em Categorias.</p>
            ) : (
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue>
                    {selectedCat && (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: selectedCat.color }} />
                        {selectedCat.emoji} {selectedCat.name}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: cat.color }} />
                        {cat.emoji} {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-muted)]">Nota (opcional)</label>
            <Textarea
              placeholder="ex: Presencial, Academia, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isNew ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
