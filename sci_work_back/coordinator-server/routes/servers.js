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
  const { id, address, name, canReg } = req.body

  const getChangedFields = (updated, original, basePath = "") => {
    const excluded = ['id']
    const changed = {}

    const isObject = (val) => {
      return typeof val === 'object' && val !== null
    }

    const isArrayOfObjects = (arr) => {
      return Array.isArray(arr) && arr.every(el => typeof el === 'object' && el !== null)
    }

    const deepEqual = (a, b) => {
      //variables
      if (a === b) {
        return true
      }
      //arrays
      if (Array.isArray(a) && Array.isArray(b)) {
        return JSON.stringify(a) === JSON.stringify(b)
      }
      return false
    }

    const makePath = (key) => {
      return basePath ? `${basePath}.${key}` : key
    }

    for (const key in updated) {
      if (excluded.includes(key)) {
        continue
      }

      const newVal = updated[key]
      const oldVal = original[key]
      const path = makePath(key)

      // 1. Scalar
      if ((!isObject(newVal) || !isObject(oldVal)) && newVal !== oldVal) {
        changed[path] = newVal
      }
      // 2. Object
      else if (isObject(newVal) && isObject(oldVal)) {
        const nestedDiff = getChangedFields(newVal, oldVal, path)
        if (Object.keys(nestedDiff).length > 0) {
          Object.assign(changed, nestedDiff)
        }
      }
      // 3. Array of objects
      else if (isArrayOfObjects(newVal) && isArrayOfObjects(oldVal)) {
        if (newVal.length !== oldVal.length) {// Safe fallback: replace full array on addition/deletion
          changed[path] = newVal
        }
        else {
          for (let i = 0; i < newVal.length; i++) {
            const nested = getChangedFields(newVal[i], oldVal[i] || {}, `${path}.${i}`)
            Object.assign(changed, nested)
          }
        }
      }
      // 4. Mismatched types or non-object arrays
      else if (!deepEqual(newVal, oldVal)) {
        changed[path] = newVal
      }
    }

    return changed
  }

  if (!id || !address) {
    console.log(`serverId: ${id}, serverAddress: ${address}, serverName: ${name}`)
    return res.status(400).json({ message: 'ID, address and name are required' })
  }

  const newServer = {
    address,
    name,
    canReg
  }

  if (activeServers[id]) {
    if (getChangedFields(newServer, activeServers[id]).length === 0) {
      console.log(`Server ID=${id} is already registered, no changes in data. Updating heartbeat.`)
      lastHeartbeat[id] = Date.now() // Оновлюємо час останнього heartbeat
    }
    else {
      console.log(`Server ID=${id} is already registered with a different data. Updating server data.`)
      activeServers[id] = { address, name, canReg }
      lastHeartbeat[id] = Date.now() // Оновлюємо час останнього heartbeat
    }
  } else {
    console.log(`Registering new server: ID=${id}, Address=${address}`)
    activeServers[id] = { address, name, canReg }
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
    ...activeServers[id]
  }))
  res.json(serverList)
})

module.exports = router
