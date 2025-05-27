const WebSocket = require("ws")
const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const User = require("../models/User")
const Project = require("../models/Project")
const Organisation = require("../models/Organisation")
const Activity = require("../models/Activity")

const Collections = {
  user: User,
  project: Project,
  organisation: Organisation,
  activity: Activity
}

// Map to store WebSocket connections by session token
const clients = new Map() // This will store WebSocket connections keyed by session token

const send = (ws, message, sessionToken, type, data) => {
  ws.send(JSON.stringify({ message, sessionToken, data: { type, data } }))
}

const getData = async (type, login, ws, sessionToken, _id) => {

  let data

  switch (type) {
    case "all": {
      // Fetch Fetch user by login
      const user = await Collections.user.findOne(login)
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }

      // Fetch all data (user, projects, and organisation)
      const items = await Collections.project.find({
        "userList.id": user._id
      })

      const organisation = await Collections.organisation.findOne({
        name: "default"
      })

      const users = await Collections.user.find({}, {
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
      // Fetch Fetch user by login
      const user = await Collections.user.findOne(login)
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }

      // Fetch user by login
      data =  user
      break
    }
    case "data": {
      // Fetch Fetch user by login
      const user = await Collections.user.findOne(login)
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }

      const projects = await Collections.project.find({
        "userList.id": user._id
      })
      if (!projects) {
        throw new Error(`Projects not found for user: ${user._id}`)
      }

      data = projects
      break
    }
    case "project": {
      // Fetch Fetch user by login
      const user = await Collections.user.findOne(login)
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }

      const project = await Collections.project.findById(_id)
      if (!project) {
        throw new Error(`Project not found with _id: ${_id}`)
      }

      data = project
      break
    }
    case "activities": {
      // Fetch Fetch user by login
      const user = await Collections.user.findOne(login)
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }

      const project = await Collections.project.findById(_id)
      if (!project) {
        throw new Error(`Project not found with _id: ${_id}`)
      }

      // Fetch all activities whose _id starts with `${_id}.`
      let activities = await Collections.activity.find({
        _id: { $regex: `^${_id}\\.` }
      })

      activities = activities.filter(a => a.userList?.some(u => u.id === user._id.toString()))
      data = activities
      break
    }
    case "organisation": {
      // Fetch organisation with name "default"
      const organisation = await Collections.organisation.findOne({ name: "default" })
      if (!organisation) {
        throw new Error("Organisation with name 'default' not found")
      }
      data = organisation
      break
    }
    case "users": {
      const users = await Collections.user.find({}, {
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
              
              getData("all",  parsedMessage.data, ws, sessionToken)
            }
            else {
              ws.send(JSON.stringify({ error: "Session token missing" }))
            }
            break
          }
          case "goTo": {
            const {page, isId} = parsedMessage.data
            clients.get(sessionToken).page = page
            if (isId) {
              const login = clients.get(sessionToken).login
              getData("activities", {login}, ws, sessionToken, page)
            }
            break
          }
          case "addEditData": {
            const updatedItem = parsedMessage.data
            const itemId = updatedItem._id || new mongoose.Types.ObjectId()

            const type = (itemId.includes(".")) ? "activity" : "project"
            
            // Update project in the database
            Collections[type].findByIdAndUpdate(itemId, updatedItem, { new: true, upsert: true })
            .then(item => {
              if (!item) {
                console.error(`Failed to update project with ID ${itemId}.`)
                return
              }
              console.log(`Item ${itemId} updated successfully.`)

              // Broadcast the updated project to all relevant users except the sender
              if (!item.userList || !Array.isArray(item.userList)) {
                console.error("Error: item.userList is either undefined or not an array.")
                return
              }
              item.userList.forEach(user => {
                const objectId = new ObjectId(user.id)
                // Fetch user data from the database to get login
                Collections.user.findById(objectId)
                .then(userData => {
                  if (!userData) {
                    console.error(`No user found with ID: ${user.id}`)
                    return
                  }
                  // Iterate over the clients map to find the sessionToken where the login matches
                  let targetClientToken = null
                  for (let [key, value] of clients) {
                    if (value.login === userData.login) {
                      targetClientToken = key // Found the sessionToken corresponding to userData.login
                      break // Exit loop after finding the match
                    }
                  }
            
                  // If the sessionToken was found, proceed with the WebSocket logic
                  if (!targetClientToken) {
                    console.error(`No client found with login: ${userData.login}`)
                  }
                  const targetClientWs = clients.get(targetClientToken).socket
                  const targetClientLogin = clients.get(targetClientToken).login
          
                  // Ensure this is not the sender and the target client is ready
                  if (userData.login !== clients.get(sessionToken).login && targetClientWs.readyState === WebSocket.OPEN) {
                    console.log(targetClientLogin)
                    // Send the data to the target client
                    getData("project", {login: targetClientLogin}, targetClientWs, targetClientToken, item._id)
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
            console.log(updatedUserData, userId)
        
            Collections.user.findByIdAndUpdate(userId, updatedUserData, { new: true })
            .then((user) => {
              if (!user) {
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
