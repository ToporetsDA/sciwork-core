const db = require("./db")

// export
const getActivityContent = (type) => {

  let content = {}

  switch(type) {
    case "Group": {
      content = {
        name: type,
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
        name: type,
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
    case "Report": {
      content = {
        name: type,
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
    case "Attendance": {
      content = {
        name: type,
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
        name: type,
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
        name: type,
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

//inner method
const treeToArray = (list, field, result = []) => {
    // Flatten activity tree into a flat array with full `_id` paths
    for (const item of list) {
        result.push(item)
        if (item[field]?.length) {
        treeToArray(item[field], field, result)
        }
    }
    return result
}

//inner method
const getAccess = (item, id) => {
    const access = item?.userList?.find(user => user.id === id)?.access
    return (typeof access === 'number') ? access : -1
}

//inner method
const hasOverlappingFields = (updateA, updateB, ignoredFields = ['_id', '__v']) => {
  return Object.keys(updateA).some(
    key => !ignoredFields.includes(key) && key in updateB
  )
}

//inner method
const getChangedFields = (updated, original, type = null, basePath = "") => {
  const excluded = ['_id', '__v', 'lastModifiedBy']
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
      const nestedDiff = getChangedFields(newVal, oldVal, null, path)
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
          const nested = getChangedFields(newVal[i], oldVal[i] || {}, null, `${path}.${i}`)
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

//inner method
const shouldApplyUpdate = (incomingVersion, existingVersion, overlap, accessLevel, existingAccess, rights, type) => {
    if (!rights.edit.includes(accessLevel) && type === "project") {
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

// export
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

// export
const updateItemFields = async (userId, updatedItem, itemId, type) => {

  // 1.1. Check if item exist

  let item = updatedItem
  let updatedMetaItem = null

  const existingItem = await db.Collections[type].findById(itemId)
  if (!existingItem) {
    return console.warn("Not found")
  }

  const incomingVersion = updatedItem.__v ?? 0
  const existingVersion = existingItem.__v ?? 0

  // only user and admins can update user -> low frequency, except currentSettings
  if (type !== "user") {

    // 1.2. Check if user has right to update

    const organisation = await db.Collections.organisation.findById(db.organisationId)
    const rights = organisation?.rights || { fullView: [], interact: [], edit: [], names: [] }

    const parts = updatedItem._id.split('.')
    const existingProject = await db.Collections.project.findById(parts[0])
    if (!existingProject) {
      return "Project not found. Can not add/edit"
    }

    // 2. Check if update should be discarded or adjusted
    // based on action

    const updatedMeta = findItemWithParent(existingProject.activities, "_id", updatedItem._id, existingProject)
    updatedMetaItem = (type === "activity") ? updatedMeta.item : updatedItem

    //updatedMeta.item exist only for update activity,
    //updatedMetaItem === updatedItem for create/update project
    if (!updatedMeta.item && updatedMetaItem !== updatedItem) {//result: only create activity

      if (updatedMetaItem) { // already created by another user
        const newId = `${existingProject._id}.${existingProject.dndCount}`
        const newMetaActivity = {
          ...updatedMetaItem,
          _id: newId
        }

        // Insert new activity into the meta parent’s activities
        const existingMeta = findItemWithParent(existingProject.activities, "_id", item._id, existingProject)
        const parent = existingMeta.parent //existingMeta.parent and updatedMeta.parent are the same for creation

        if (!parent.activities) {
          parent.activities = []
        }
        parent.activities.push(newMetaActivity)

        item = {
          ...item,
          activities: existingProject.activities,
          dndCount: existingProject.dndCount + 1
        }
      } else {
        // proceed without changes
      }
    }
    else {//item edit
      if (!updatedMetaItem && type === "activity") {
        return "Not found activity" + item.name + " with id " + item._id + " item for edit"
      }
      else {
        //proceed without changes
      }
    }

    // 3. Check if update should be discarded on overlap
    // based on rights

    const accessLevel = getAccess(updatedMetaItem, userId)
    const existingAccess = getAccess(existingItem?.lastModifiedBy?.userId || 0) || rights.names.length - 1
  
    // if fields overlap
    const overlap = (incomingVersion < existingVersion) ? hasOverlappingFields(item, existingItem) : false
    const allow = shouldApplyUpdate(incomingVersion, existingVersion, overlap, accessLevel, existingAccess, rights, type)

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

  }

  // 4. apply only the fields that changed
  const changedFields = getChangedFields(item, existingItem, updatedMetaItem?.type)

  console.log("changedFields", changedFields)

  await db.Collections[type].updateOne(
    { _id: itemId, __v: incomingVersion },
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

// export
const send = (ws, message, sessionToken, type, data) => {
    ws.send(JSON.stringify({ message, sessionToken, data: { type, data } }))
}

// export
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