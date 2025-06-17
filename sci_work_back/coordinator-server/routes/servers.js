var express = require('express')
var router = express.Router()

const activeServers = {}
const lastHeartbeat = {}

/*
 * Реєстрація серверів
 * POST /servers/register
 * Body: { id: string, address: string, name: string }
 */
router.post('/register', (req, res) => {
  const { id, address, name } = req.body

  if (!id || !address) {
    console.log(`serverId: ${id}, serverAddress: ${address}, serverName: ${name}`)
    return res.status(400).json({ message: 'ID, address and name are required' })
  }

  if (activeServers[id]) {
    if (activeServers[id].address === address) {
      console.log(`Server ID=${id} is already registered with the same address. Updating heartbeat.`)
      lastHeartbeat[id] = Date.now() // Оновлюємо час останнього heartbeat
    }
    else {
      console.log(`Server ID=${id} is already registered with a different address. Updating address.`)
      activeServers[id].address = address // Оновлюємо адресу
      activeServers[id].name = name // Оновлюємо ім'я
      lastHeartbeat[id] = Date.now() // Оновлюємо час останнього heartbeat
    }
  } else {
    console.log(`Registering new server: ID=${id}, Address=${address}`)
    activeServers[id] = { address, name }
    lastHeartbeat[id] = Date.now() // Ініціалізуємо час останнього heartbeat
  }

  res.json({ message: 'Server registered successfully' })
})

/*
 * Обробник для отримання heartbeat
 * POST /servers/heartbeat
 * Body: { id: string, address: string }
 */
router.post('/heartbeat', (req, res) => {
  const { id, address } = req.body

  if (!id || !activeServers[id]) {
    return res.status(400).json({ message: 'Invalid server ID' })
  }

  const serverAddress = activeServers[id].address
  if (serverAddress !== address) { // Перевіряємо IP-адресу запиту
    return res.status(400).json({ message: 'Server address mismatch' })
  }

  // Оновлюємо час останнього heartbeat
  lastHeartbeat[id] = Date.now()

  res.json({ message: 'Heartbeat received' })
})

// Моніторинг серверів, щоб видалити неактивні
setInterval(() => {
  const now = Date.now()
  const timeout = 60000 // Час у мс для визнання сервера "мертвим" (60 секунд)

  for (const id in lastHeartbeat) {
    if (now - lastHeartbeat[id] > timeout) {
      console.log(`Server with ID=${id} is considered disconnected`)
      delete activeServers[id]
      delete lastHeartbeat[id]
    }
  }
}, 30000) // Перевірка кожні 30 секунд

/**
 * Отримання списку серверів
 * GET /servers/list
 */
router.get('/list', (req, res) => {
  const serverList = Object.keys(activeServers).map((id) => ({
    id,
    address: activeServers[id].address,
    name: activeServers[id].name
  }))
  res.json(serverList)
})

module.exports = router
