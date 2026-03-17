import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const EMOJI_GROUPS = [
  {
    label: 'Atividades',
    emojis: ['⭐','🔥','✅','🎯','💪','🏃','🚴','🏋️','🧘','🤸','🚶','🏊','⚽','🏀','🎾','🎮','🎵','🎨','📚','✏️','📝','🖊️','💡','🔬','🔭','🧪','💻','📱','🖥️','⌨️'],
  },
  {
    label: 'Vida',
    emojis: ['🙏','❤️','💚','💛','💙','💜','🤍','😊','😄','😌','🥰','🤩','🧠','👁️','👂','🫀','🦷','💤','☕','🍎','🥗','🍕','🍜','🥤','🛏️','🏠','🚗','🚌','✈️','🌍'],
  },
  {
    label: 'Trabalho',
    emojis: ['💼','📊','📈','📉','💰','🏦','🤝','📞','📧','📅','📆','🗓️','🗂️','📂','📁','🖨️','🖱️','💾','📡','🔧','🔨','⚙️','🔑','🔒','📋','📌','📍','🗒️','✂️','📏'],
  },
  {
    label: 'Natureza',
    emojis: ['🌟','⚡','🌈','☀️','🌙','⭐','🌸','🌺','🌻','🌹','🍀','🌿','🌱','🌲','🌳','🦋','🐝','🦅','🐶','🐱','🦁','🐯','🦊','🐺','🦝','🐻','🐼','🐨','🐸','🦎'],
  },
]

interface Props {
  value: string
  onChange: (v: string) => void
}

export function EmojiPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  function openPicker() {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const popoverHeight = 280
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow >= popoverHeight
      ? rect.bottom + 8
      : rect.top - popoverHeight - 8
    setPos({ top, left: rect.left })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      const target = e.target as Node
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openPicker}
        title="Escolher emoji"
        className={`w-12 h-9 flex items-center justify-center text-xl bg-[var(--surface)] border rounded-lg transition-colors ${
          open ? 'border-[var(--text-muted)]' : 'border-[var(--border)] hover:border-[var(--text-muted)]'
        }`}
      >
        {value || '⭐'}
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] w-72 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="max-h-64 overflow-y-auto p-2 pb-4 space-y-3">
            {EMOJI_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1 mb-1.5">
                  {group.label}
                </p>
                <div className="grid grid-cols-10 gap-0.5">
                  {group.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onChange(emoji); setOpen(false) }}
                      className={`w-7 h-7 flex items-center justify-center text-lg rounded-md transition-colors hover:bg-gray-200 ${
                        value === emoji ? 'bg-gray-300' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
