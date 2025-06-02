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

//methods
const FindItemWithParent = (items, field, target, parent) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item[field] === target) {
      return { item, parent, index: i }
    }
    if (item.activities) {
      const result = FindItemWithParent(item.activities, field, target, item)
      if (result.item) return result
    }
  }
  return { item: null, parent, index: null }
}

//response handler
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

      // Flatten activity tree into a flat array with full `_id` paths
      const flattenActivities = (list, result = []) => {
        for (const activity of list) {
          result.push(activity)
          if (activity.activities?.length) {
            flattenActivities(activity.activities, result)
          }
        }
        return result
      }

      // Get all accessible metadata entries
      const allActivities = flattenActivities(project.activities)
      const accessibleMetadata = allActivities.filter(activity =>
        activity.userList?.some(u => u.id === user._id.toString())
      )

      // Now fetch *only* the full activity data for those the user can access
      const activityIds = accessibleMetadata.map(a => a._id)
      const activities = await Collections.activity.find({
        _id: { $in: activityIds }
      })
      
      data = activities
      break
    }
    case "activity": {
      
      // Fetch Fetch user by login
      const user = await Collections.user.findOne(login)
      if (!user) {
        throw new Error(`User not found for login: ${login}`)
      }

      const activity = await Collections.activity.findById(_id)
      if (!activity) {
        throw new Error(`Activity not found with _id: ${_id}`)
      }
      
      data = activity
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
    default: {
      throw new Error(`Invalid type: ${type}`)
    }
  }
  send(ws, "data", sessionToken, type, data)
}

//case handlers
const handleAddEdit = async (sessionToken, updatedItem, itemId, type) => {
  try {
    // 1. Fetch the original project BEFORE updating
    const originalProject = await Collections.project.findById(itemId.split('.')[0])
    if (!originalProject) {
      console.error(`Original project with ID ${itemId} not found.`)
      return
    }

    const originalDndCount = originalProject.dndCount

    // 2. Perform the update
    const item = await Collections[type].findByIdAndUpdate(itemId, updatedItem, { new: true, upsert: true })
    if (!item) {
      console.error(`Failed to update ${type} with ID ${itemId}.`)
      return
    }

    console.log(`Item ${itemId} updated successfully.`)

    // 3. Check if activity was added
    if (
      type === "project" &&
      typeof originalDndCount === "number" &&
      item.dndCount === originalDndCount + 1
    ) {
      const newActivityId = item._id + '.' + (item.dndCount - 1)

      // Use the metadata tree to locate the new activity
      const { item: newMetaActivity } = FindItemWithParent(updatedItem.activities, '_id', newActivityId, updatedItem)

      if (newMetaActivity) {
        // 4. Insert a new document into the activity collection
        await Collections.activity.create({
          _id: newMetaActivity._id,
          name: newMetaActivity.name,
          template: "none",
          content: {}
        })

        const socket = clients.get(sessionToken).socket
        const login = clients.get(sessionToken).login

        getData("activity", {login}, socket, sessionToken, newMetaActivity._id)

        console.log(`New activity created in DB: ${newActivityId}`)
      } else {
        console.warn(`New metadata activity ${newActivityId} not found in tree.`)
      }
    }

    let userList = null

    if (type === "project") {
      userList = item.userList
    }
    else if (type === "activity") {

      const { item: metaActivity } = FindItemWithParent(originalProject.activities, '_id', item._id, originalProject)

      if (!metaActivity || !Array.isArray(metaActivity.userList)) {
        console.error(`User list not found in metadata for activity ${item._id}`)
        return
      }

      console.log("meta activity", metaActivity)

      userList = metaActivity.userList
    }

    // 5. Broadcast the updated project to all relevant users except the sender
    if (!userList || !Array.isArray(userList)) {
      console.error("Error: userList is either undefined or not an array.")
      return
    }

    for (const user of userList) {
      const objectId = new ObjectId(user.id)

      const userData = await Collections.user.findById(objectId)
      if (!userData) {
        console.error(`No user found with ID: ${user.id}`)
        continue
      }

      // Find session token for this login
      const targetClientToken = [...clients.entries()].find(([_, v]) => v.login === userData.login)?.[0]
      if (!targetClientToken) {
        console.error(`No client found with login: ${userData.login}`)
        continue
      }

      const targetClient = clients.get(targetClientToken)
      if (!targetClient || targetClient.login === clients.get(sessionToken).login) continue

      if (targetClient.socket.readyState === WebSocket.OPEN) {
        console.log(`Notifying client: ${targetClient.login}`)
        getData(type, { login: targetClient.login }, targetClient.socket, targetClientToken, item._id)
      }
    }

  } catch (err) {
    console.error(`Error in handleAddEdit: ${err.message}`)
  }
}

const handleEditUser = async (sessionToken, updatedUserData, userId) => {
  try {
    const user = await Collections.user.findByIdAndUpdate(userId, updatedUserData, { new: true })

    if (!user) {
      console.error(`Failed to update user with ID ${userId}.`)
      return
    }

    console.log(`User ${userId} updated successfully.`)

    const sender = clients.get(sessionToken)
    const senderLogin = sender?.login

    // Notify relevant WebSocket client (not the sender)
    const targetClient = clients.get(user.login)?.socket

    if (user.login !== senderLogin && targetClient?.readyState === WebSocket.OPEN) {
      getData("user", senderLogin, sender.socket, sessionToken, userId)
    }
  } catch (err) {
    console.error(`Error updating user with ID ${userId}:`, err.message)
  }
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
            
            handleAddEdit(sessionToken, updatedItem, itemId, "project")
            break
          }
          case "addEditContent": {
            const updatedItem = parsedMessage.data
            const itemId = updatedItem._id
            
            handleAddEdit(sessionToken, updatedItem, itemId, "activity")
            break
          }
          case "addEditUser": {
            const updatedUserData = parsedMessage.data
            const userId = updatedUserData._id
        
            handleEditUser(sessionToken, updatedUserData, userId)
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
