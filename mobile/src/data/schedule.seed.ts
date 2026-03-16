import { v4 as uuidv4 } from 'uuid'
import type { DaySchedule, PomodoroConfig } from '@/types'

export const seedSchedule: DaySchedule[] = [
  // ─── Segunda-feira ───────────────────────────────────────────────
  {
    day: 'segunda',
    label: 'Segunda',
    tag: 'Jiu + Empresa',
    tagType: 'jiu',
    slots: [
      { id: uuidv4(), time: '05h45', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '06h00–08h10', name: 'Jiu-Jitsu', icon: '🥋', note: 'Academia', category: 'jiu', order: 1 },
      { id: uuidv4(), time: '08h35–12h00', name: 'Trabalho', icon: '💼', note: 'Presencial', category: 'work', order: 2 },
      { id: uuidv4(), time: '12h00–13h00', name: 'Leitura', icon: '📚', note: 'Almoço', category: 'read', order: 3 },
      { id: uuidv4(), time: '13h00–18h30', name: 'Trabalho', icon: '💼', note: 'Presencial', category: 'work', order: 4 },
      { id: uuidv4(), time: '19h30–21h00', name: 'Gravar vídeo 1', icon: '🎥', note: 'Roteiro pronto', category: 'video', order: 5 },
      { id: uuidv4(), time: '21h30', name: 'Oração noturna', icon: '🙏', category: 'pray', order: 6 },
    ],
  },
  // ─── Terça-feira ─────────────────────────────────────────────────
  {
    day: 'terca',
    label: 'Terça',
    tag: 'Home Office',
    tagType: 'home',
    slots: [
      { id: uuidv4(), time: '08h30', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '09h00–12h00', name: 'Trabalho', icon: '💼', note: 'Home office', category: 'work', order: 1 },
      { id: uuidv4(), time: '12h00–13h00', name: 'Leitura', icon: '📚', note: 'Almoço', category: 'read', order: 2 },
      { id: uuidv4(), time: '13h00–18h00', name: 'Trabalho', icon: '💼', note: 'Home office', category: 'work', order: 3 },
      { id: uuidv4(), time: '18h30–20h00', name: 'Estudos Igreja', icon: '⛪', note: 'Sessão 1', category: 'study', order: 4 },
      { id: uuidv4(), time: '20h00–21h30', name: 'Editar vídeo 1', icon: '🎥', note: 'Gravado na segunda', category: 'video', order: 5 },
      { id: uuidv4(), time: '21h30', name: 'Oração noturna', icon: '🙏', category: 'pray', order: 6 },
    ],
  },
  // ─── Quarta-feira ────────────────────────────────────────────────
  {
    day: 'quarta',
    label: 'Quarta',
    tag: 'Jiu + Namorada',
    tagType: 'namorada',
    slots: [
      { id: uuidv4(), time: '05h45', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '06h00–08h10', name: 'Jiu-Jitsu', icon: '🥋', note: 'Academia', category: 'jiu', order: 1 },
      { id: uuidv4(), time: '08h35–12h00', name: 'Trabalho', icon: '💼', note: 'Presencial', category: 'work', order: 2 },
      { id: uuidv4(), time: '12h00–13h00', name: 'Leitura', icon: '📚', note: 'Almoço', category: 'read', order: 3 },
      { id: uuidv4(), time: '13h00–18h00', name: 'Trabalho', icon: '💼', note: 'Presencial', category: 'work', order: 4 },
      { id: uuidv4(), time: '18h00–19h30', name: 'Deslocamento', icon: '🚌', note: 'Até a namorada', category: 'travel', order: 5 },
      { id: uuidv4(), time: '19h30–22h00', name: 'Namorada', icon: '💚', category: 'free', order: 6 },
      { id: uuidv4(), time: '22h00', name: 'Oração noturna', icon: '🙏', note: 'Podem rezar juntos', category: 'pray', order: 7 },
    ],
  },
  // ─── Quinta-feira ────────────────────────────────────────────────
  {
    day: 'quinta',
    label: 'Quinta',
    tag: 'Home Office',
    tagType: 'home',
    slots: [
      { id: uuidv4(), time: '08h30', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '09h00–12h00', name: 'Trabalho', icon: '💼', note: 'Home office', category: 'work', order: 1 },
      { id: uuidv4(), time: '12h00–13h00', name: 'Leitura', icon: '📚', note: 'Almoço', category: 'read', order: 2 },
      { id: uuidv4(), time: '13h00–18h30', name: 'Trabalho', icon: '💼', note: 'Home office', category: 'work', order: 3 },
      { id: uuidv4(), time: '18h30–20h30', name: 'Gravar vídeo 2', icon: '🎥', note: 'Roteiro pronto', category: 'video', order: 4 },
      { id: uuidv4(), time: '20h30–22h00', name: 'Estudos Igreja', icon: '⛪', note: 'Sessão 2', category: 'study', order: 5 },
      { id: uuidv4(), time: '22h00', name: 'Oração noturna', icon: '🙏', category: 'pray', order: 6 },
    ],
  },
  // ─── Sexta-feira ─────────────────────────────────────────────────
  {
    day: 'sexta',
    label: 'Sexta',
    tag: 'Jiu + Namorada',
    tagType: 'namorada',
    slots: [
      { id: uuidv4(), time: '05h45', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '06h00–08h10', name: 'Jiu-Jitsu', icon: '🥋', note: 'Academia', category: 'jiu', order: 1 },
      { id: uuidv4(), time: '08h35–12h00', name: 'Trabalho', icon: '💼', note: 'Presencial', category: 'work', order: 2 },
      { id: uuidv4(), time: '12h00–13h00', name: 'Leitura', icon: '📚', note: 'Almoço', category: 'read', order: 3 },
      { id: uuidv4(), time: '13h00–18h00', name: 'Trabalho', icon: '💼', note: 'Presencial', category: 'work', order: 4 },
      { id: uuidv4(), time: '18h00–19h20', name: 'Deslocamento', icon: '🚌', note: 'Até a namorada', category: 'travel', order: 5 },
      { id: uuidv4(), time: '19h20–22h00', name: 'Namorada', icon: '💚', category: 'free', order: 6 },
      { id: uuidv4(), time: '22h00', name: 'Oração noturna', icon: '🙏', category: 'pray', order: 7 },
    ],
  },
  // ─── Sábado ──────────────────────────────────────────────────────
  {
    day: 'sabado',
    label: 'Sábado',
    tag: 'Na namorada',
    tagType: 'namorada',
    slots: [
      { id: uuidv4(), time: '08h30', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '09h00–10h30', name: 'Leitura', icon: '📚', note: 'Bloco mais longo', category: 'read', order: 1 },
      { id: uuidv4(), time: '10h30–13h00', name: 'Gravar + Editar vídeo 3', icon: '🎥', note: 'Produção completa', category: 'video', order: 2 },
      { id: uuidv4(), time: '13h00–22h00', name: 'Namorada', icon: '💚', note: 'Tempo de qualidade', category: 'free', order: 3 },
      { id: uuidv4(), time: '22h00', name: 'Oração noturna', icon: '🙏', category: 'pray', order: 4 },
    ],
  },
  // ─── Domingo ─────────────────────────────────────────────────────
  {
    day: 'domingo',
    label: 'Domingo',
    tag: 'Missa + Descanso',
    tagType: 'missa',
    slots: [
      { id: uuidv4(), time: '08h30', name: 'Oração matinal', icon: '🙏', category: 'pray', order: 0 },
      { id: uuidv4(), time: '09h30–10h00', name: 'Deslocamento para Missa', icon: '🚌', category: 'travel', order: 1 },
      { id: uuidv4(), time: '10h00–11h30', name: 'Missa', icon: '✝️', note: 'Destaque da semana', category: 'missa', order: 2 },
      { id: uuidv4(), time: '11h30–14h00', name: 'Almoço em família / Descanso', icon: '💚', category: 'free', order: 3 },
      { id: uuidv4(), time: '14h00–15h30', name: 'Leitura', icon: '📚', category: 'read', order: 4 },
      { id: uuidv4(), time: '15h30–17h00', name: 'Editar vídeos da semana', icon: '🎥', note: 'Fechamento semanal', category: 'video', order: 5 },
      { id: uuidv4(), time: '17h00–21h30', name: 'Descanso total', icon: '💚', category: 'free', order: 6 },
      { id: uuidv4(), time: '21h30', name: 'Oração noturna', icon: '🙏', category: 'pray', order: 7 },
    ],
  },
]

export const defaultPomodoroConfig: PomodoroConfig = {
  focusMinutes: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsUntilLong: 4,
  soundEnabled: true,
}
