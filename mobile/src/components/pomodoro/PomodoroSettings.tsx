import { useState } from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePomodoro } from '@/contexts/PomodoroContext'

export function PomodoroSettings() {
  const { config, updateConfig } = usePomodoro()
  const [open, setOpen] = useState(false)

  const [focus, setFocus] = useState(String(config.focusMinutes))
  const [short, setShort] = useState(String(config.shortBreak))
  const [long, setLong] = useState(String(config.longBreak))
  const [sessions, setSessions] = useState(String(config.sessionsUntilLong))
  const [sound, setSound] = useState(config.soundEnabled)

  const handleOpen = () => {
    setFocus(String(config.focusMinutes))
    setShort(String(config.shortBreak))
    setLong(String(config.longBreak))
    setSessions(String(config.sessionsUntilLong))
    setSound(config.soundEnabled)
    setOpen(true)
  }

  const handleSave = () => {
    updateConfig({
      focusMinutes: Math.max(1, parseInt(focus) || 25),
      shortBreak: Math.max(1, parseInt(short) || 5),
      longBreak: Math.max(1, parseInt(long) || 15),
      sessionsUntilLong: Math.max(1, parseInt(sessions) || 4),
      soundEnabled: sound,
    })
    setOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={handleOpen} className="text-[var(--text-muted)]">
        <Settings className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Configurações do Pomodoro</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {[
              { label: 'Foco (minutos)', value: focus, set: setFocus },
              { label: 'Pausa curta (minutos)', value: short, set: setShort },
              { label: 'Pausa longa (minutos)', value: long, set: setLong },
              { label: 'Sessões até pausa longa', value: sessions, set: setSessions },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <label className="text-sm text-[var(--text-muted)] flex-1">{label}</label>
                <Input
                  type="number"
                  min={1}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-20 text-center"
                />
              </div>
            ))}

            <div className="flex items-center justify-between">
              <label className="text-sm text-[var(--text-muted)]">Som de notificação</label>
              <button
                onClick={() => setSound(!sound)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer hover:opacity-80 ${sound ? 'bg-[var(--gold)]' : 'bg-[var(--border)]'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${sound ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
