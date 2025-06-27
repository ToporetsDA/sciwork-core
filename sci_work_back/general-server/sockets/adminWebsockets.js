const WebSocket = require("ws")
const mongoose = require('mongoose')

const methods = require("./wsDependencies/methods")
const handlers = require("./wsDependencies/handlers")

// Map to store WebSocket connections by session token
const admins = new Map() // This will store WebSocket connections keyed by session token

// start the WebSocket server
const startAdminWebSocketServer = (port) => {
  const wss = new WebSocket.Server({ port })

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection established.")
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

              console.log(`WebSocket connection associated with session token: ${sessionToken}`)
              
              methods.getData("all",  parsedMessage.data, ws, sessionToken)
            }
            else {
              ws.send(JSON.stringify({ error: "Session token missing" }))
            }
            break
          }
          case "addEditUser": {
            const updatedUserData = parsedMessage.data
            const userId = updatedUserData._id
        
            handlers.handleEditUser(admins, sessionToken, updatedUserData, userId, "user")
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
