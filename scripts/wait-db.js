const net = require('net')

const HOST = 'localhost'
const PORT = 5432
const MAX_RETRIES = 40
const INTERVAL_MS = 1000

let attempts = 0

function tryConnect() {
  const socket = net.connect(PORT, HOST)

  socket.on('connect', () => {
    socket.destroy()
    console.log('[wait-db] PostgreSQL está pronto ✓')
    process.exit(0)
  })

  socket.on('error', () => {
    socket.destroy()
    attempts++
    if (attempts >= MAX_RETRIES) {
      console.error(`[wait-db] Timeout: PostgreSQL não respondeu após ${MAX_RETRIES}s`)
      process.exit(1)
    }
    process.stdout.write(`\r[wait-db] Aguardando PostgreSQL... ${attempts}s`)
    setTimeout(tryConnect, INTERVAL_MS)
  })
}

tryConnect()
