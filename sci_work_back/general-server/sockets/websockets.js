const WebSocket = require("ws")
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const User = require("../models/User")
const Project = require("../models/Project")
const Organisation = require("../models/Organisation")
const Activity = require("../models/Activity")

// Map to store WebSocket connections by session token
const clients = new Map() // This will store WebSocket connections keyed by session token

const send = (ws, message, sessionToken, type, data) => {
  ws.send(JSON.stringify({ message, sessionToken, data: { type, data } }))
}

const getData = async (type, login, ws, sessionToken) => {

  let data

  switch (type) {
    case "all": {

      // Fetch all data (user, projects, and organisation)
      const user = await User.findOne({ login })
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }
      const items = await Project.find({
        "userList.id": user._id
      })

      const organisation = await Organisation.findOne({
        name: "default"
      })

      const users = await User.find({}, {
        login: 0,
        password: 0,
        currentSettings: 0,
        notifications: 0,
        statusName: 0
      })

      data = { user, items, organisation, users }
      break
    }
    case "user": {

      // Fetch user by login
      const user = await User.findOne({ login })
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }
      data =  user
      break
    }
    case "data": {

      // Fetch projects where user is in userList
      const user = await User.findOne({ login })
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }
      let items
      if (admins.get(sessionToken).projectId) {
        items = await Project.find({
          "userList.id": user._id
        })
      }
      else {
        items = await Activity.find({
          _id: { $regex: `^${admins.get(sessionToken).projectId}\\.` }
        })
      }
      

      data = items
      break
    }
    case "organisation": {

      // Fetch organisation with name "default"
      const organisation = await Organisation.findOne({ name: "default" })
      if (!organisation) {
        throw new Error("Organisation with name 'default' not found")
      }
      data = organisation
      break
    }
    case "users": {
      const users = await User.find({}, {
        login: 0,
        password: 0,
        currentSettings: 0,
        notifications: 0,
        statusName: 0
      })
      data = users
    }
    default: {
      throw new Error(`Invalid type: ${type}`)
    }
  }
  send(ws, "data", sessionToken, type, data)
} 

// start the WebSocket server
const startWebSocketServer = (port) => {
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
            sessionToken = parsedMessage.sessionToken // Store session token
            if (sessionToken) {
              // Store WebSocket connection with session token
              clients.set(sessionToken, {socket: ws, login: parsedMessage.data.login}) // Add WebSocket connection to the map
              console.log(`WebSocket connection associated with session token: ${sessionToken}`)
              
              getData("all",  parsedMessage.data.login, ws, sessionToken)
            }
            else {
              ws.send(JSON.stringify({ error: "Session token missing" }))
            }
            break
          }
          case "goTo": {
            admins.get(sessionToken).projectId = parsedMessage.data

            getData("activities", parsedMessage.data.login, ws, sessionToken)
            break
          }
          case "addEditData": {
            const updatedProject = parsedMessage.data
            const projectId = updatedProject._id || new mongoose.Types.ObjectId()
            
            // Update project in the database
            Project.findByIdAndUpdate(projectId, updatedProject, { new: true, upsert: true })
            .then(project => {
              if (!project) {
                console.error(`Failed to update project with ID ${projectId}.`)
                return
              }
              console.log(`Project ${projectId} updated successfully.`)

              // Broadcast the updated project to all relevant users except the sender
              if (!project.userList || !Array.isArray(project.userList)) {
                console.error("Error: project.userList is either undefined or not an array.")
                return
              }
              project.userList.forEach(user => {
                const objectId = new ObjectId(user.id)
                // Fetch user data from the database to get login
                User.findById(objectId)
                .then(userData => {
                  if (!userData) {
                    console.error(`No user found with ID: ${user.id}`)
                    return
                  }
                  // Iterate over the clients map to find the sessionToken where the login matches
                  let targetClientKey = null
                  for (let [key, value] of clients) {
                    if (value.login === userData.login) {
                      targetClientKey = key // Found the sessionToken corresponding to userData.login
                      break // Exit loop after finding the match
                    }
                  }
            
                  // If the sessionToken was found, proceed with the WebSocket logic
                  if (!targetClientKey) {
                    console.error(`No client found with login: ${userData.login}`)
                  }
                  const targetClient = clients.get(targetClientKey).socket // Get the WebSocket socket for the matched client
          
                  // Ensure this is not the sender and the target client is ready
                  if (userData.login !== clients.get(sessionToken).login && targetClient.readyState === WebSocket.OPEN) {
                    console.log(clients.get(targetClientKey).login)
                    // Send the data to the target client
                    send(targetClient, "addEdit", sessionToken, "project", project)
                  }
                })
                .catch(userErr => {
                  console.error(`Error fetching user data for ID ${user.id}:`, userErr.message)
                })
              })
            })
            .catch(err => {
              console.error(`Error updating project: ${err.message}`)
            })
            break
          }
          case "addEditUser": {
            const updatedUserData = parsedMessage.data
            const userId = updatedUserData._id
        
            User.findByIdAndUpdate(userId, updatedUserData, { new: true })
            .then((user) => {
              if (user) {
                console.error(`Failed to update user with ID ${userId}.`)
                return
              }
              console.log(`User ${userId} updated successfully.`)

              // Ensure the user is not the sender before broadcasting the update
              const senderLogin = clients.get(sessionToken).login

              // Notify relevant WebSocket client (not the sender)
              const targetClient = clients.get(user.login)?.socket

              if (user.login !== senderLogin && targetClient.readyState === WebSocket.OPEN) {
                send(targetClient, "addEdit", sessionToken, "user", user)
              }
            })
            .catch((err) => {
              console.error(`Error updating user with ID ${userId}:`, err.message)
            })
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
        clients.delete(sessionToken)  // Remove from the clients map when the connection closes
      }
    })
  })

  return wss // Return the WebSocket server
}

// get WebSocket by session token
const getWebSocketByToken = (sessionToken) => {
  return clients.get(sessionToken) || null // Fetch WebSocket instance by session token
}

module.exports = { startWebSocketServer, getWebSocketByToken, clients }
