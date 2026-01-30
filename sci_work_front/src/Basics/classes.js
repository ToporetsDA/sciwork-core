// ==================================
// Main
// ==================================

// --- App.js ---

/*class State {
  constructor(page = "HomePage", project = undefined, activity = undefined, dialog = undefined, params = []) {
    this.currentPage = page               // string
    this.currentProject = project         // string | undefined
    this.currentActivity = activity       // string | undefined
    this.currentDialog = {
      name: dialog,                       // string | undefined
      params: params                      // any[]
    }
  }
}
export const createState = (page, project, activity, dialog, params) => new State(page, project, activity, dialog, params)*/

class Item {
  constructor(_id, name) {
    this.deleted = false

    this._id = _id
    this.name = name
  }

  getAccess = (userData = {}, id = this._id) => {
    const parts = id.split('.')
    const access =
      this
        .findItemWithParent(this.activities, "_id", id, parts[0]).item  // activity's _id is in meta in project
        .userList?.find(user => user.id === userData._id)?.access ??    // project or metaActivity
      this?.content?.listItems[parts[2]]
        .userList?.find(user => user.id === userData._id)?.access       // List-based activity's item
    

    return (typeof access === 'number') ? access : -1
  }

  getAccessType = (rightsType, user, id = this._id) => {
    return rightsType.includes(this.getAccess(user, id))
  }

  hasAccess = (userData = {}, id = this._id) => {
    return (this.getAccess(userData, id) >= 0)
  }

  goTo = (data, recentActivities, setRecentActivities) => {

    if (this._id.includes(".")) { // if activity
        //add this Item to recently visited
        const activityExists = recentActivities.some(recent => recent._id === this._id)
        if (activityExists === false) {
            setRecentActivities((prevActivities) => [
                ...prevActivities,
                this
            ])
        }
    }

    if (!this._id.includes(".")) {
        const project = data.find(p => p._id === this._id)
        return `/Project/${project._id}`
    }
    else if (this.page === true) {

        const project = data.find(p => p._id === this.getProjectId())
        const activity = project.activities.find(a => a._id === this._id)
        return `/Activity/${project._id}/${activity.id}`
    }
    else {
        const project = data.find(p => p._id === this.getProjectId())
        return `/Project/${project._id}`
    }
  }

  deleteItem = (deleted, data, setData, sendUpdate = true) => {

    const projectId = this._id.split('.')[0]
    
    const project = data.find(p => p._id === projectId)
    let activities

    if (this._id.includes(".")) {
        //delete activity
        activities = project.activities.map((activity) => {
            return activity._id === (this._id) ? { ...activity, deleted } : activity
        })
    }
    else {
        //delete project
        activities = project.activities.map((activity) => {
            return { ...activity,  }
        })
    }

    const updatedProject = {
        ...project,
        activities,
        ...(!this._id.includes(".") && {deleted})
    }

    console.log("deleted:", this._id)

    setData({ action: "edit", item: updatedProject }, sendUpdate)
  }
}

class Project extends Item {
  constructor(_id, name, dndCount, startDate, endDate, activities, userList, __v = 0) {
    super(_id, name)
    this.dndCount = dndCount
    this.startDate = startDate
    this.endDate = endDate
    this.activities = activities || {}
    this.userList = userList
    this.__v = __v
  }

  /*getAccess(userData = { _id: null }, id = this._id) {

    const found = id.includes('.')
      ? this.findItemWithParent(this.activities, "_id", id, this)
      : { item: this }

    const item = found?.item

    const direct = item?.userList?.find(u => u.id === userData._id)?.access

    return Number.isInteger(direct) ? direct : -1
  }*/

  findItemWithParent = (items = this.activities, field = "_id", target, parent = this) => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item[field] === target) {
            return { item, parent, index: i }
        }
        if (item.activities) {
            const result = this.findItemWithParent(item.activities, field, target, item)
            if (result.item) return result
        }
    }
    return { item: null, parent, index: null }
  }

  treeToArray = (list, field = "activities", result = []) => {
    const itemList = list ?? this[field]
    for (const item of itemList) {
        result.push(item)
        if (item[field]?.length) {
            this.treeToArray(item[field], field, result)
        }
    }
    return result
  }
}
export const createProject = (_id, name, dndCount, startDate, endDate, activities, userList, __v) =>
  new Project(
    _id,
    name, 
    dndCount,
    startDate,
    endDate,
    activities,
    userList,
    __v
  )
export const createProjects = (projects) =>
  projects.map(p =>
    createProject(
      p._id,
      p.name,
      p.dndCount,
      p.startDate,
      p.endDate,
      p.activities,
      p.userList,
      p.__v
    )
  )
export const projectVerUp = (project) =>
  createProject(
    project._id,
    project.name,
    project.dndCount,
    project.startDate,
    project.endDate,
    project.activities,
    project.userList,
    project.__v + 1)

class Activity extends Item {
  constructor(_id, name, template, content, __v = 0) {
    super(_id, name)
    this.template = template
    this.content = content
    this.__v = __v
  }

  getProjectId = () => {
    return this._id.split('.')[0]
  }

  setFieldValue = (dataPath, value) => {
    const parts = dataPath.split('.')
    const newContent = structuredClone(this.content) // deep clone
    let curr = newContent

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]
        const index = parseInt(key)
        const k = isNaN(index) ? key : index

        // Ensure path exists
        if (curr[k] === undefined) curr[k] = {}

        curr = curr[k]
    }

    const lastKey = parts[parts.length - 1]
    const lastIndex = parseInt(lastKey)
    curr[isNaN(lastIndex) ? lastKey : lastIndex] = value

    return { ...this, content: newContent }
  }
}
export const createActivity = (_id, name, template, content, __v) =>
  new Activity(
    _id,
    name,
    template,
    content,
    __v
  )
export const createActivities = (activity) =>
  activity.map(a =>
    createActivity(
      a._id,
      a.name,
      a.template,
      a.content,
      a.__v
    )
  )
export const activityVerUp = (activity) =>
  createProject(
    activity._id,
    activity.name,
    activity.template,
    activity.content,
    activity.__v + 1)

class UserData {
  //genStatus:
  // 0 - item creator/organisation owner,
  // 1 - manager (add/edit items),
  // 2 - supervisor,
  // 3 - user

  constructor() {
    this.genStatus = -1                   
    this.currentSettings = {
      notificationsPeriod: 5,
      notificationsDelay: 15,
      displayProjects: "grid"
    }
  }
}
export const createUserData = () => new UserData()

class Notification {
  constructor(_id, state, page, content = "Starts soon", now) {
    this._id = _id
    this.state = state
    this.page = page || false
    this.content = content
    this.generationDate = now.toISOString().slice(0, 10)
    this.generationTime = now.toTimeString().slice(0, 5)
  }

  changeState = (state) => {
    this.state = state
  }
}
export const createNotification = (_id, state, page, content, now) => new Notification(_id, state, page, content, now)

// ==================================
// Page base
// ==================================

// --- AppHeader.js ---

// --- AppNav.js ---

// --- AppDynamicContent.js ---

// --- AppContend.js ---

class ItemsToDisplay {
  constructor(projects, project) {
    this.projects = projects || []
    this.activities = project?.activities || []
  }
}
export const createItemsToDisplay = (projects, project) => new ItemsToDisplay(projects, project)

// ==================================
// Pages
// ==================================

// --- HomePage.js ---

// --- Notifications.js ---

// --- Profile.js ---

// --- Projects.js ---

// --- Schedule.js ---

// --- Settings.js ---

// ==================================
// Specific
// ==================================

// --- ScheduleBoard.js ---

export class ScheduleItem {
  constructor(item, type, kind, d = '') {

    const formatDate = (date) => {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0') // Add leading zero if needed
        const day = date.getDate().toString().padStart(2, '0') // Add leading zero if needed
        return `${year}-${month}-${day}`
    }

    this._id = item._id
    this.type = type
    this.isTimed = item?.isTimed || undefined

    switch (kind) {// name, startDate, endDate, eventId
      case "start": {
        this.name = `${item.name}${(kind) ? ` - .${kind}` : ''}`
        this.startDate = item.startDate
        this.endDate   = item.startDate
        this.eventId = `${item._id}.${kind}`
        break
      }
      case "repeat": {
        this.name = `${item.name}${(kind) ? ` - .${kind}` : ''}`
        this.startDate = formatDate(d)
        this.endDate   = formatDate(d)
        this.eventId = `${item._id}.${kind}_${d.toLocaleDateString()}`
        break
      }
      case "end": {
        this.name = `${item.name}${(kind) ? ` - .${kind}` : ''}`
        this.startDate = item.endDate
        this.endDate   = item.endDate
        this.eventId = `${item._id}.${kind}`
        break
      }
      default: {// no kind
        this.name = `${item.name}${(kind) ? ` - .${kind}` : ''}`
        this.startDate = item.startDate
        this.endDate   = item.endDate
        this.eventId = `${item._id}`
      }
    }
  }
}
export const createScheduleItem = (item, type, kind, d) => new ScheduleItem(item, type, kind, d)

// ==================================
// Shared
// ==================================

// --- AppContext.js ---

// --- ControlPanel.js ---

// --- CustomSelect.js ---

// --- Item.js ---

// --- ItemActions.js ---

// --- ItemTable.js ---

// --- ItemTiles.js ---

// --- ToggleButton.js ---

// ==================================
// Items
// ==================================

// --- Chat.js ---

export class Message {
  constructor(item, sender, content, date) {
    this._id = `${item._id}.${item.content?.messageCount}`
    this.sender = sender._id
    this.content = content
    this.dateTime = date
  }
}
export const createMessage = (item, sender, content, date) => new Message(item, sender, content, date)

// --- Dev.js ---

// --- Group.js ---

// --- List.js ---

// --- Project.js ---

// --- Text.js ---
