const db = require("./db")
const methods = require("./methods")

const handleAddEdit = async (clients, sessionToken, updatedItem, itemId, type) => {
  try {

    const socket = clients.get(sessionToken).socket
    const login = clients.get(sessionToken).login
    
    // 1. Fetch the original project BEFORE updating (add project handled here)

    const parts = itemId.split('.')
    const originalProject = await db.Collections.project.findById(parts[0])
    if (!originalProject) {
      if(parts.length === 1 && updatedItem?.activities?.length === 0) {//if _id of project and it's empty
        await db.Collections.project.create(updatedItem)
        console.log(`Project ${itemId} created.`)
        return
      }
      else {
        console.error(`Original project with ID ${itemId} not found.`)
        return
      }
    }
    const originalDndCount = originalProject?.dndCount

    // 2. Perform the update

    const user = await db.Collections.user.findOne({ login: clients.get(sessionToken).login })
    const item = await methods.updateItemFields(user._id, updatedItem, itemId, type)
    
    //handle update result
    if (typeof item === "string") {
      methods.send(socket, "data", sessionToken, "error", item)
    }
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
      const newActivityId = parts[0] + '.' + (item.dndCount - 1)

      // Use the metadata tree to locate the new activity
      const { item: newMetaActivity } = methods.findItemWithParent(updatedItem.activities, '_id', newActivityId, updatedItem)

      if (newMetaActivity) {// 4. Insert a new document into the activity collection
        
        await db.Collections.activity.create({
          _id: newMetaActivity._id,
          name: newMetaActivity.name,
          template: "none",
          content: {
            name: newMetaActivity.name,
            ...methods.getActivityContent(newMetaActivity.type)
          }
        })

        methods.getData("activity", {login}, socket, sessionToken, newMetaActivity._id)

        console.log(`New activity created in DB: ${newActivityId}`)
      } else {
        console.warn(`New metadata activity ${newActivityId} not found in tree.`)
      }
    }

    let userList = []

    //set userList let value
    if (type === "project") {
      userList = item.userList
    }
    else if (type === "activity") {

      const { item: metaActivity } = methods.findItemWithParent(originalProject.activities, '_id', item._id, originalProject)

      console.log("metaActivity", item, originalProject._id, methods.findItemWithParent(originalProject.activities, '_id', item._id, originalProject))

      if (!metaActivity || !Array.isArray(metaActivity.userList)) {
        console.error(`User list not found in metadata for activity ${item._id}`)
        return
      }

      userList = metaActivity.userList
    }

    // 5. Broadcast the updated project to all relevant users except the sender
    if (!userList || !Array.isArray(userList)) {
      console.error("Error: userList is either undefined or not an array.")
      return
    }

    for (const user of userList) {

      const objectId = new db.ObjectId(user.id)
      const userData = await db.Collections.user.findById(objectId)

      if (!userData) {
        console.error(`No user found with ID: ${user.id}`)
        continue
      }

      const targetClientToken = [...clients.entries()].find(([_, v]) => v.login === userData.login)?.[0]
      if (!targetClientToken) {
        console.error(`No client found with login: ${userData.login}`)
        continue
      }

      const targetClient = clients.get(targetClientToken)

      if (!targetClient || targetClient.login === clients.get(sessionToken).login) {
        continue
      }

      if (targetClient.socket.readyState === WebSocket.OPEN) {
        console.log(`Notifying client: ${targetClient.login}`)
        methods.getData(type, { login: targetClient.login }, targetClient.socket, targetClientToken, item._id)
      }
    }
  } catch (err) {
    console.error(`Error in handleAddEdit: ${err.message}`)
  }
}

const handleEditUser = async (clients, sessionToken, updatedUserData, userId) => {
  try {
    const user = await methods.updateItemFields(userId, updatedUserData, userId, type)
    if (typeof user === "string") {
      methods.send(socket, "data", sessionToken, "error", item)
    }
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
      methods.getData("user", senderLogin, sender.socket, sessionToken, userId)
    }
  } catch (err) {
    console.error(`Error updating user with ID ${userId}:`, err.message)
  }
}

module.exports = { handleAddEdit, handleEditUser }