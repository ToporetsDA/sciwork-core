const db = require("./db")

//inner methods

const treeToArray = (list, field, result = []) => {
    // Flatten activity tree into a flat array with full `_id` paths
    for (const item of list) {
        result.push(item)
        if (item[field].length) {
        treeToArray(item[field], result)
        }
    }
    return result
}

const getAccess = (item, id) => {
    const access = item.userList?.find(user => user.id === id)?.access
    return (typeof access === 'number') ? access : -1
}

const hasOverlappingFields = (updateA, updateB, ignoredFields = ['_id', '__v']) => {
  return Object.keys(updateA).some(
    key => !ignoredFields.includes(key) && key in updateB
  )
}

const getChangedFields = (updated, original) => {
  const excluded = ['_id', '__v', 'lastModifiedBy']
  const changed = {}

  for (const key in updated) {
    if (excluded.includes(key)) continue

    const newVal = updated[key]
    const oldVal = original[key]

    const isObject = (val) => {
        return typeof val === 'object' && val !== null
    }

    const bothAreObjects = isObject(newVal) && isObject(oldVal)

    if (
      (bothAreObjects && JSON.stringify(newVal) !== JSON.stringify(oldVal)) ||
      (!bothAreObjects && newVal !== oldVal)
    ) {
      changed[key] = newVal
    }
  }

  return changed
}

const shouldApplyUpdate = (incomingVersion, existingVersion, overlap, accessLevel, existingAccess, rights) => {
    if (!rights.edit.includes(accessLevel)) {
        return null //user does not have access to send update. NOT SUPPOSED TO HAPPEND
    }

    if (!overlap) return true

    if (incomingVersion >= existingVersion) {
        return true // safe: update is fresh
    }

    if (accessLevel < existingAccess) {
        return true // higher-priority user overwrites old data
    }

    return false // lower-priority + stale + overlapping → wait
}

// exports

const findItemWithParent = (items, field, target, parent) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item[field] === target) {
      return { item, parent, index: i }
    }
    if (item.activities) {
      const result = findItemWithParent(item.activities, field, target, item)
      if (result.item) return result
    }
  }
  return { item: null, parent, index: null }
}

const getActivityContent = (type) => {

  let content = {}

  switch(type) {
    case "Group": {
      content = {
        name: "Group name",
        currentSettings: {}
      }
      break
    }
    case "Text": {
      content = {
        currentSettings: {},
        text: "text"
      }
      break
    }
    case "List": {
      content = {
        name: "List name",
        currentSettings: {
            type: "ul"
        },
        listItems: [],
        liStructure: {
          text: "text"
        }
      }
      break
    }
    case "Attendance": {
      content = {
        name: "Attendance",
        currentSettings: {
            markable: true
        },
        listItems: [],
        liStructure: {
          markable: "markable"
        }
      }
      break
    }
    case "Table": {
      content = {
        name: "Table name",
        currentSettings: {},
        listItems: [],
        liStructure: {
          text: "text"
        }
      }
      break
    }
    case "Chat": {
      content = {
        name: "Chat name",
        currentSettings: {},
        messageCount: 0,
        listItems: [],
        liStructure: {
          sender: "plain",
          content: "plain",
          dateTime: "plain"
        }
      }
      break
    }
    // case "": {
    //   content = {
    //     currentSettings: {}
    //   }
    //   break
    // }
    default: {
      content = {
        currentSettings: {}
      }
    }
  }
  return content
}

const updateItemFields = async (userId, updatedItem, itemId, type) => {

    const existingItem = await db.Collections[type].findById(itemId)
    if (!existingItem) return console.error("Not found")

    const incomingVersion = updatedItem.__v ?? 0
    const existingVersion = existingItem.__v ?? 0

    console.log("userId in updateItemFields is ", userId, updatedItem)

    const organisation = await db.Collections.organisation.findById(db.organisationId)
    const rights = organisation?.rights || { fullView: [], interact: [], edit: [], names: [] }

    const parts = updatedItem._id.split('.')
    const project = await db.Collections.project.findById(parts[0])
    const { item: metaItem } = findItemWithParent(project.activities, "_id", updatedItem._id, project)

    const accessLevel = getAccess(metaItem, userId)
    const existingAccess = getAccess(existingItem?.lastModifiedBy?.userId || 0) || rights.names.length - 1

    // if fields overlap
    const overlap = (incomingVersion < existingVersion) ? hasOverlappingFields(updatedItem, existingItem) : false
    const allow = shouldApplyUpdate(incomingVersion, existingVersion, overlap, accessLevel, existingAccess, rights)

    // user is not supposed to reach here
    if (allow === null) {
        const msg = "User " + userId + " has no right to update item " + existingItem._id + " !"
        console.warn(msg)
        return msg
    }

    // skip due to overlap
    if (allow === false) {
        const msg = "Update skipped due to priority/overlap"
        console.warn(msg)
        return msg
    }

    // apply only the fields that changed
    const changedFields = getChangedFields(updatedItem, existingItem)

    await db.Collections[type].updateOne(
        { _id: itemId },
        {
        $set: {
            ...changedFields,
            lastModifiedBy: {
                userId,
                timestamp: Date.now()
            }
        },
        $inc: { __v: 1 }
        }
    )

    return await db.Collections[type].findById(itemId)
}

const send = (ws, message, sessionToken, type, data) => {
    ws.send(JSON.stringify({ message, sessionToken, data: { type, data } }))
}

const getData = async (type, login, ws, sessionToken, _id) => {

    let data

    switch (type) {
        case "all": {
            // Fetch Fetch user by login
            const user = await db.Collections.user.findOne(login)
            if (!user) {
                throw new Error(`User not found for login: ${login}`)
            }

            // Fetch all data (user, projects, and organisation)
            const items = await db.Collections.project.find({
                "userList.id": user._id
            })

            const organisation = await db.Collections.organisation.findOne({
                name: "default"
            })

            const users = await db.Collections.user.find({}, {
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
            const users = await db.Collections.user.find({}, {
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
            const user = await db.Collections.user.findOne(login)
            if (!user) {
                throw new Error(`User not found for login: ${login}`)
            }

            // Fetch user by login
            data =  user
            break
        }
        case "data": {
            // Fetch Fetch user by login
            const user = await db.Collections.user.findOne(login)
            if (!user) {
                throw new Error(`User not found for login: ${login}`)
            }

            const projects = await db.Collections.project.find({
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
            const user = await db.Collections.user.findOne(login)
            if (!user) {
                throw new Error(`User not found for login: ${login}`)
            }

            const project = await db.Collections.project.findById(_id)
            if (!project) {
                throw new Error(`Project not found with _id: ${_id}`)
            }

            data = project
            break
        }
        case "activities": {
            // Fetch Fetch user by login
            const user = await db.Collections.user.findOne(login)
            if (!user) {
                throw new Error(`User not found for login: ${login}`)
            }

            const project = await db.Collections.project.findById(_id)
            if (!project) {
                throw new Error(`Project not found with _id: ${_id}`)
            }

            // Get all accessible metadata entries
            const allActivities = treeToArray(project.activities, "activities")
            // const accessibleMetadata = allActivities.filter(activity =>
            //   activity.userList?.some(u => u.id === user._id.toString())
            // )

            // Now fetch *only* the full activity data for those the user can access
            const activityIds = allActivities.map(a => a._id)
            const activities = await db.Collections.activity.find({
                _id: { $in: activityIds }
            })
            
            data = activities
            break
        }
        case "activity": {
        
            // Fetch Fetch user by login
            const user = await db.Collections.user.findOne(login)
            if (!user) {
                throw new Error(`User not found for login: ${login}`)
            }

            const activity = await db.Collections.activity.findById(_id)
            if (!activity) {
                throw new Error(`Activity not found with _id: ${_id}`)
            }
            
            data = activity
            break
        }
        case "organisation": {
            // Fetch organisation with name "default"
            const organisation = await db.Collections.organisation.findOne({ name: "default" })
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

module.exports = { findItemWithParent, getActivityContent, updateItemFields, getData, send }