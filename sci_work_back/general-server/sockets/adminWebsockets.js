const WebSocket = require("ws")
const mongoose = require('mongoose')

const methods = require("./wsDependencies/methods")
const handlers = require("./wsDependencies/handlers")
const db = require("./wsDependencies/db")

// Map to store WebSocket connections by session token
const admins = new Map() // This will store WebSocket connections keyed by session token

const updateUser = async (userId, updatedUserData, overwrite = true) => {
  await db.Collections.user.findByIdAndUpdate(userId, updatedUserData, { overwrite })
}

// start the WebSocket server
const startAdminWebSocketServer = (port) => {
  const wss = new WebSocket.Server({ port })

  wss.on("connection", (ws, req) => {
    console.log("New admin WebSocket connection established.")
    let sessionToken = null

    // When the WebSocket receives a message
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message)
        // Handle login message (associating WebSocket with sessionToken)
        if (!parsedMessage.sessionToken) {
          return
        }

        switch(parsedMessage.type) {
          case "login": {
            // Store session token
            sessionToken = parsedMessage.sessionToken
            if (sessionToken) {
              // Store WebSocket connection with session token
              admins.set(sessionToken, {socket: ws, login: parsedMessage.data.login})

              console.log(`WebSocket (admin) connection associated with session token: ${sessionToken}`)
              
              methods.getData("all-admin",  parsedMessage.data, ws, sessionToken)
            }
            else {
              ws.send(JSON.stringify({ error: "Session token missing" }))
            }
            break
          }
          case "addEditUser": {
            const updatedUserData = parsedMessage.data
            const userId = updatedUserData.item._id
            
            try {
              updateUser(userId, updatedUserData.item, { overwrite: true })
              console.log("User updated:", userId)

              // Optionally notify the user or clients
              admins.get(sessionToken)?.socket.send(JSON.stringify({
                type: "userUpdated",
                data: updatedUserData
              }))
            } catch (error) {
              console.error("Failed to update user:", error.message)
              admins.get(sessionToken)?.socket.send(JSON.stringify({
                type: "error",
                message: "Failed to update user",
                error: error.message
              }))
            }
            // handlers.handleEditUser(admins, sessionToken, updatedUserData, userId, "user")
            break
          }
          default: {
            console.log("Received unidentified message:", parsedMessage)
            ws.send(JSON.stringify({ message: "Message received" }))
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error.message)
      }
    })

    // Handle WebSocket connection close
    ws.on('close', () => {
      if (sessionToken) {
        console.log(`WebSocket for session token ${sessionToken} disconnected.`)
        admins.delete(sessionToken)  // Remove from the clients map when the connection closes
      }
    })
  })

  return wss // Return the WebSocket server
}

// get WebSocket by session token
const getAdminWebSocketByToken = (sessionToken) => {
  return admins.get(sessionToken) || null // Fetch WebSocket instance by session token
}

module.exports = { startAdminWebSocketServer, getAdminWebSocketByToken, admins }
