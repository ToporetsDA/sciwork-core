import React from 'react'

// ==================================
// Main
// ==================================

// --- App.js ---

type User = {
  id: string
  access: number
}
type MetaActivity = {
  _id: string
  name: string
  type: []
  startDate: string
  endDate: string
  isTimed: boolean
  startTime: string
  endTime: string
  repeat: boolean
  days: []
  thirdParty: boolean
  serviceName: string
  userList: User[]
  activities: MetaActivity[]
}
// type ListItem = {
//   userList?: User[]
//   [key: string]: any
// }

// type ActivityContent = {
//   listItems?: ListItem[]
//   [key: string]: any
// }

abstract class Item {
  _id: string
  name: string
  deleted: boolean = false
  content?: any //ActivityContent
  page?: boolean

  constructor(_id: string, name: string, deleted: boolean = false) {
    this._id = _id
    this.name = name
    this.deleted = deleted
  }

  abstract getAccess(userData?: { _id?: string }, id?: string): number

  getAccessType(rightsType: number[], user: { _id?: string }, id: string = this._id): boolean {
    return rightsType.includes(this.getAccess(user, id))
  }

  hasAccess(userData: { _id?: string } = {}, id: string = this._id): boolean {
    return this.getAccess(userData, id) >= 0
  }

  isActivity(item: Item): item is Activity {
    return (item as Activity).getProjectId !== undefined
  }

  goTo(
    data: Project[],
    recentActivities: Item[],
    setRecentActivities: React.Dispatch<React.SetStateAction<Item[]>>
  ): string | void {
    if (this._id.includes(".")) {
      const exists = recentActivities.some((r) => r._id === this._id)
      if (!exists) {
        setRecentActivities((prev) => [...prev, this])
      }
    }

    if (!this._id.includes(".")) {
      const project = data.find((p) => p._id === this._id)
      return `/Project/${project?._id}`
    }
    else if (this.page === true && this.isActivity(this)) {
      const project = data.find((p) => p._id === (this as Activity).getProjectId())
      const activity = project?.activities.find((a) => a._id === this._id)
      return `/Activity/${project?._id}/${activity?._id}`
    }
    else if (this.isActivity(this)) {
      const project = data.find((p) => p._id === (this as Activity).getProjectId())
      return `/Project/${project?._id}`
    }
  }

  deleteItem(
    deleted: boolean,
    data: Project[],
    setData: (update: { action: string; item: Project }, sendUpdate?: boolean) => void,
    sendUpdate: boolean = true
  ): void {
    const projectId = this._id.split('.')[0]
    const project = data.find((p) => p._id === projectId)
    if (!project) {
      return
    }

    let activities = project.activities
    if (this._id.includes(".")) {
      activities = project.activities.map((activity) =>
        activity._id === this._id ? { ...activity, deleted } : activity
      )
    }

    const updatedProject = createProjectFromObject({ ...project, activities, ...(this._id.includes(".") ? {} : { deleted }) })
    console.log("deleted:", this._id)
    setData({ action: "edit", item: updatedProject }, sendUpdate)
  }
}

class Project extends Item {
  dndCount: number
  startDate: string
  endDate: string
  activities: MetaActivity[]
  userList: User[]
  __v: number

  constructor(
    _id: string,
    name: string,
    dndCount: number,
    startDate: string,
    endDate: string,
    activities: MetaActivity[] = [],
    userList: User[] = [],
    __v: number = 0,
    deleted: boolean = false
  ) {
    super(_id, name, deleted)
    this.dndCount = dndCount
    this.startDate = startDate
    this.endDate = endDate
    this.activities = activities
    this.userList = userList
    this.__v = __v
  }

  getAccess(userData: { _id?: string } = {}, id: string = this._id): number {
    const access =
      this.findItemWithParent(this.activities, "_id", id, this)?.item
        ?.userList?.find(u => u.id === userData._id)?.access

    return typeof access === "number" ? access : -1
  }

  findItemWithParent<T extends Project | MetaActivity>(
    items: T[] = this.activities as T[],
    field: keyof T = "_id" as keyof T,
    target: string,
    parent: Project | null = this
  ): { item: T | null; parent: Project | null; index: number | null } {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      if (item[field] === target) return { item, parent, index: i }

      // рекурсивно шукаємо у дочірніх activities, якщо вони є
      if ((item as any).activities?.length) {
        const result = this.findItemWithParent((item as any).activities, field, target, item as Project)
        if (result.item) return result
      }
    }

    return { item: null, parent, index: null }
  }

  treeToArray<T extends Project | MetaActivity>(
    list?: T[],
    field: keyof T = "activities" as keyof T,
    result: T[] = []
  ): T[] {
    const items = list ?? (this as any)[field] as T[]
    for (const item of items) {
      result.push(item)
      if ((item as any)[field]?.length) this.treeToArray((item as any)[field], field, result)
    }
    return result
  }
}
export const createProject = (
  _id: string,
  name: string,
  dndCount: number,
  startDate: string,
  endDate: string,
  activities: MetaActivity[],
  userList: User[],
  __v: number = 0,
  deleted: boolean = false
) => {
  return new Project(_id, name, dndCount, startDate, endDate, activities, userList, __v, deleted)
}
export const createProjectFromObject = (p: any) => {
  return createProject(
    p._id!,
    p.name!,
    p.dndCount!,
    p.startDate!,
    p.endDate!,
    p.activities ?? [],
    p.userList ?? [],
    p.__v ?? 0,
    p?.deleted
  )
}
export const createProjects = (projects: Partial<Project>[]): Project[] => {
  return projects.map(p =>
    createProject(
      p._id!,
      p.name!,
      p.dndCount!,
      p.startDate!,
      p.endDate!,
      p.activities ?? [],
      p.userList ?? [],
      p.__v ?? 0,
      p?.deleted
    )
  )
}
export const projectVerUp = (project: Project) => {
  return createProject(
    project._id,
    project.name,
    project.dndCount,
    project.startDate,
    project.endDate,
    project.activities,
    project.userList,
    project.__v + 1
  )
}

class Activity extends Item {
  template: string
  content: any //ActivityContent
  __v: number

  constructor(_id: string, name: string, template: string, content: any /*ActivityContent*/, __v: number = 0) {
    super(_id, name)
    this.template = template
    this.content = content
    this.__v = __v
  }

  getAccess(userData: { _id?: string } = {}, id: string = this._id): number {
    const parts = id.split('.')
    const access =
      this.content?.listItems?.[Number(parts[2])]
        ?.userList?.find((u: User) => u.id === userData._id)?.access

    return typeof access === "number" ? access : -1
  }

  getProjectId(): string {
    return this._id.split('.')[0]
  }

  setFieldValue(dataPath: string, value: any): Activity {
    const parts = dataPath.split('.')
    const newContent: any = structuredClone(this.content)
    let curr: any = newContent

    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i]
      const index = parseInt(key)
      const k = isNaN(index) ? key : index
      if (!curr[k]) curr[k] = {}
      curr = curr[k]
    }

    const lastKey = parts[parts.length - 1]
    const lastIndex = parseInt(lastKey)
    curr[isNaN(lastIndex) ? lastKey : lastIndex] = value

    return new Activity(this._id, this.name, this.template, newContent, this.__v)
  }
}
export const createActivity = (_id: string, name: string, template: string, content: any /*ActivityContent*/, __v: number = 0) => {
  return new Activity(_id, name, template, content, __v)
}
export const createActivities = (activities: any[]) => {
  return activities.map(a =>
    createActivity(a._id, a.name, a.template, a.content, a.__v)
  )
}
export const activityVerUp = (activity: Activity) => {
  return createActivity(activity._id, activity.name, activity.template, activity.content, activity.__v + 1)
}

class UserData {
  _id: string
  name: string
  middleName: string
  surName: string
  patronimic: string
  genStatus: number
  mail: string
  safetyMail: string
  phone: string
  safetyPhone: string
  currentSettings: {
    notificationsPeriod: number
    notificationsDelay: number
    displayProjects: string
  }
  login: string
  password: string
  __v: number

  constructor(
    data?: Partial<Omit<UserData, "constructor">> // дозволяємо передати часткові дані
  ) {
    this._id = data?._id ?? "placeholder"
    this.name = data?.name ?? ""
    this.middleName = data?.middleName ?? ""
    this.surName = data?.surName ?? ""
    this.patronimic = data?.patronimic ?? ""
    this.mail = data?.mail ?? ""
    this.safetyMail = data?.safetyMail ?? ""
    this.phone = data?.phone ?? ""
    this.safetyPhone = data?.safetyPhone ?? ""
    this.genStatus = data?.genStatus ?? -1
    this.currentSettings = data?.currentSettings ?? {
      notificationsPeriod: 5,
      notificationsDelay: 15,
      displayProjects: "grid",
    }
    this.login = data?.login ?? ""
    this.password = data?.password ?? ""
    this.__v = data?.__v ?? 0
  }
}
export const createUserData = (data?: Partial<UserData>): UserData => {
  return new UserData(data)
}

class Notification {
  _id: string
  state: string
  page: boolean
  content: string
  generationDate: string
  generationTime: string

  constructor(_id: string, state: string, page: boolean = false, content: string = "Starts soon", now: Date = new Date()) {
    this._id = _id
    this.state = state
    this.page = page
    this.content = content
    this.generationDate = now.toISOString().slice(0, 10)
    this.generationTime = now.toTimeString().slice(0, 5)
  }

  changeState(state: string) {
    this.state = state
  }
}
export const createNotification = (
  _id: string,
  state: string,
  page: boolean = false,
  content: string = "Starts soon",
  now: Date = new Date()
) => {
  return new Notification(_id, state, page, content, now)
}

/*class Item {
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
}*/

/*class Project extends Item {
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
  }* /

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
    project.__v + 1)*/

/*class Activity extends Item {
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
    activity.__v + 1)*/

/*class UserData {
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
export const createUserData = () => new UserData()*/

/*class Notification {
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
export const createNotification = (_id, state, page, content, now) => new Notification(_id, state, page, content, now)*/

// ==================================
// Page base
// ==================================

// --- AppHeader.js ---

// --- AppNav.js ---

// --- AppDynamicContent.js ---

// --- AppContend.js ---

class ItemsToDisplay {
  projects: Project[]
  activities: MetaActivity[]

  constructor(projects: Project[] = [], project?: Project) {
    this.projects = projects
    this.activities = project?.activities ?? []
  }
}
export const createItemsToDisplay = (
  projects: Project[] = [],
  project?: Project
): ItemsToDisplay => {
  return new ItemsToDisplay(projects, project)
}

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

type ScheduleKind = "start" | "repeat" | "end" | undefined

export class ScheduleItem {
  _id: string
  type: string
  name: string
  startDate: string
  endDate: string
  eventId: string
  isTimed?: boolean

  constructor(
    item: MetaActivity,   // або SchedulableItem
    type: string,
    kind?: ScheduleKind,
    d?: Date
  ) {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    this._id = item._id
    this.type = type
    this.isTimed = item.isTimed

    switch (kind) {
      case "start": {
        this.name = `${item.name} - .start`
        this.startDate = item.startDate
        this.endDate = item.startDate
        this.eventId = `${item._id}.start`
        break
      }
      case "repeat": {
        if (!d) throw new Error("Date is required for repeat kind")

        this.name = `${item.name} - .repeat`
        this.startDate = formatDate(d)
        this.endDate = formatDate(d)
        this.eventId = `${item._id}.repeat_${d.toLocaleDateString()}`
        break
      }
      case "end": {
        this.name = `${item.name} - .end`
        this.startDate = item.endDate
        this.endDate = item.endDate
        this.eventId = `${item._id}.end`
        break
      }
      default: {
        this.name = item.name
        this.startDate = item.startDate
        this.endDate = item.endDate
        this.eventId = item._id
      }
    }
  }
}
export const createScheduleItem = (
  item: MetaActivity,
  type: string,
  kind?: ScheduleKind,
  d?: Date
): ScheduleItem => {
  return new ScheduleItem(item, type, kind, d)
}

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

// export class Message {
//   constructor(item, sender, content, date) {
//     this._id = `${item._id}.${item.content?.messageCount}`
//     this.sender = sender._id
//     this.content = content
//     this.dateTime = date
//   }
// }
// export const createMessage = (item, sender, content, date) => new Message(item, sender, content, date)

export class Message {
  _id: string
  sender: string
  content: string
  dateTime: Date

  constructor(
    item: Activity,
    sender: UserData, // або UserData
    content: string,
    date: Date
  ) {
    this._id = `${item._id}.${item.content?.messageCount ?? 0}`
    this.sender = sender._id
    this.content = content
    this.dateTime = date
  }
}

export const createMessage = (
  item: Activity,
  sender: UserData,
  content: string,
  date: Date
): Message => {
  return new Message(item, sender, content, date)
}

// --- Dev.js ---

// --- Group.js ---

// --- List.js ---

// --- Project.js ---

// --- Text.js ---
