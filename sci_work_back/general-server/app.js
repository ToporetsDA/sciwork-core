require("dotenv").config()

const createError = require("http-errors")
const express = require("express")
const path = require('path')
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const mongoose = require("mongoose")
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const axios = require("axios")

//routes
const usersRouter = require("./routes/users")
//admin routes
const usersAdminRouter = require("./routes/adminUsers")

const { startWebSocketServer } = require('./sockets/websockets')
const { startAdminWebSocketServer } = require('./sockets/adminWebsockets')

const app = express()

const cors = require('cors')
app.use(cors());

const coordinatorAddress = process.env.COORDINATOR_ADDRESS || "http://localhost:3000"
const dbURI = process.env.DB_URI || "mongodb://127.0.0.1:27017/SciWork"
const port = process.env.PORT || 5000

// MongoDB connection
mongoose.connect(dbURI, {})

const idFilePath = path.join(__dirname, 'serverId.txt')
let serverId = uuidv4()                           // ID загального сервера
const serverAddress = `http://localhost:${port}`  // Адреса цього сервера
const serverName = fs.readFileSync(path.join(__dirname, 'serverName.txt'), 'utf-8')

const wss = startWebSocketServer(port + 1)
const awss = startAdminWebSocketServer(port + 2)

// Підключення до бази даних
mongoose.connect("mongodb://127.0.0.1:27017/SciWork", {})
mongoose.connection.on("error", console.error.bind(console, "DB connection error:"))
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!")
})

// Налаштування середовища
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// routes
app.use("/users", usersRouter)
// admin routes
app.use("/admin/users", usersAdminRouter)

// Налаштування ID
if (fs.existsSync(idFilePath)) {
  serverId = fs.readFileSync(idFilePath, 'utf-8')
  console.log(`Loaded existing server ID: ${serverId}`)
}
else {
  serverId = uuidv4();
  fs.writeFileSync(idFilePath, serverId)
  console.log(`Generated new server ID: ${serverId}`)
}

console.log(`Assigned server ID: ${serverId}`)

// Функція для реєстрації сервера
const registerToCoordinator = async () => {
  try {
    const registerResponse = await axios.post(`${coordinatorAddress}/servers/register`, {
      id: serverId,
      address: serverAddress,
      name: serverName
    })

    console.log("Registered to coordinator:", registerResponse.data.message)
  } catch (error) {
    console.error("Error during registration:", error.message)
  }
}
registerToCoordinator() // Виклик при запуску сервера

// Функція для підтримки з'єднання з координатором

let heartbeatFailures = 0
const sendHeartbeat = async () => {
  if (!serverId) {
    console.error("Server is not registered yet. Cannot send heartbeat.")
    return
  }

  try {
    await axios.post(`${coordinatorAddress}/servers/heartbeat`, {
      id: serverId,
      address: serverAddress
    })
    heartbeatFailures = 0 // Скидаємо лічильник при успішному з'єднанні
  } catch (error) {
    console.error("Error sending heartbeat:", error.message)
    heartbeatFailures++

    // Якщо кількість невдалих спроб перевищує 3, спробувати перереєстрацію
    if (heartbeatFailures > 3) {
      console.log("Too many heartbeat failures. Attempting to re-register...")
      await registerToCoordinator()
    }
  }
}
// Запуск серцебиття кожні 30 секунд
setInterval(sendHeartbeat, 30000)

// Обробка 404 та помилок
app.use(function (req, res, next) {
  next(createError(404))
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app