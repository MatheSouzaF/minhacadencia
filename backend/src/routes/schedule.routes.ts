import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import { getSchedule, upsertDay, addSlot, updateSlot, deleteSlot, reorderSlots } from '../controllers/schedule.controller'
import { getChecks, toggleCheck } from '../controllers/checks.controller'
import { getDateSlots, addDateSlot, deleteDateSlot } from '../controllers/date-slots.controller'
import { getPomodoroConfig, upsertPomodoroConfig } from '../controllers/pomodoro.controller'

const router = Router()

router.use(requireAuth)

router.get('/schedule', getSchedule)
router.put('/schedule/:day', upsertDay)
router.post('/schedule/:day/slots', addSlot)
router.put('/schedule/:day/slots/reorder', reorderSlots)
router.put('/schedule/:day/slots/:slotId', updateSlot)
router.delete('/schedule/:day/slots/:slotId', deleteSlot)

router.get('/checks', getChecks)
router.post('/checks/toggle', toggleCheck)

router.get('/date-slots', getDateSlots)
router.post('/date-slots', addDateSlot)
router.delete('/date-slots/:id', deleteDateSlot)

router.get('/pomodoro/config', getPomodoroConfig)
router.put('/pomodoro/config', upsertPomodoroConfig)

export default router
