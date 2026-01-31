// Libraries
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, } from 'react-router-dom'
//Styles, Classes, Constants
import './App.css'
import { createUserData, createNotification } from './Basics/classes'
import { DEFAULT_PROFILE_DATA, DEFAULT_ITEM_STRUCTURE } from './Basics/constants'
//Methods, Components
import * as Shared        from './Components/pages/shared'
import { useTimer }       from './Components/pages/shared'
import AppConnection      from './Components/AppConnection'
import AppHeader          from './Components/AppHeader'
import AppNav             from './Components/AppNav'
import AppContent         from './Components/AppContent'

const App = () => {

  //user
  
  const [userData, setUserData] = useState(() => createUserData())
  const [rights, setRights] = useState()

  //items

  const defaultStructure = useMemo(() => DEFAULT_ITEM_STRUCTURE, [])
  const [projects, setProjects] = useState([])
  const [activities, setActivities] = useState([])

  //header !!!has to be mutable!!!

  const isCompany = true

  //nav

  const [recentActivities, setRecentActivities] = useState([])

  // dialogs

  const [dialog, setDialog] = useState(() => {
    this.name = undefined
    this.params = []
  })

  //login

  const [isLoggedIn, setLoggedIn] = useState(false)

  //connection

  const [isUserUpdatingProjects, setIsUserUpdatingProjects] = useState(false)
  const [isUserUpdatingActivities, setIsUserUpdatingActivies] = useState(false)
  const [isUserUpdatingUserData, setIsUserUpdatingUserData] = useState(false)

  const [users, setUsers] = useState()

  const updateUsers = (itemId) => {
    // this method will get users's data of users related to Item
    // for now all users are loaded at login
  }

  const previousVersionsRef = useRef({})

  const updateData = (data, sendUpdate = true) => {

    const { action, item } = data

    if (!previousVersionsRef.current[item._id]) {
      previousVersionsRef.current[item._id] = structuredClone(item) // or deep copy
    }

    //by default update data
    // let source = projects || []
    let setter
    let flag

    const setPr = () => {
      //projects
      setter = setProjects
      flag = setIsUserUpdatingProjects
    }
    const setAct = () =>  {
      //activities
      setter = setActivities
      flag = setIsUserUpdatingActivies
    }

    const saveChanges = (item) => { // save changes to item and set it's _id as flag
      if (!sendUpdate) {
        flag(item._id)
      }
      setter(prevItems => 
        prevItems.map(i =>
          i._id === item._id ? item : i
        )
      )
    }

    switch(action) {
      case "add": {
        setPr()
        //projects
        if (!item._id.includes('.')) {
          //save changes
          flag(item._id)
          setter(prevItems => [ ...prevItems, item ])
        }
        //activities
        else {
          const {containerId, index, activity} = item

          let clone = Shared.getItemById(projects, dialog.currentProject)
          clone.dndCount++

          const project = clone
          if (!project) return // fallback in case project is not found

          const { parent: container } = project.findItemWithParent(project.activities, "_id", containerId, project)
          if (!container) return // fallback in case container is not found

          if (!container.activities) {
            container.activities = []
          }

          if (index === false || index === null || index >= container.activities.length) {
            // push to the end
            container.activities.push(activity)
          } else {
            // insert after the index
            container.activities.splice(index + 1, 0, activity)
          }
          
          saveChanges(project)
        }
        break
      }
      case "edit": {
        setPr()
        //project
        if (!item._id.includes('.')) {
          saveChanges(item)
        }
        //activity
        else {
          const project = Shared.getItemById(projects, dialog.currentProject)
          if (!project) return

          const { item: activity } = project.findItemWithParent(project.activities, "_id", item._id, project)
          if (!activity) return

          Object.assign(activity, item)
          
          saveChanges(project)
        }
        break
      }
      case "content": {
        setAct()
        const { type, activity } = item

        switch(type) {
          case "Text":
          case "Table":
          case "Attendance":
          case "Report":
          case "List": {
            saveChanges(activity)
            break
          }
          case "Chat": {
            if (!activity) {
              const { message } = item
              console.log("send message", message)
            }
            else {
              saveChanges(activity)
            }
            break
          }
          default: {
            console.warn("No such activity type")
          }
        }
        
        break
      }
      default: {
        console.log("No such action to updateData")
      }
    }
  }

  const updateUser = (newData, currentSettingsEdit) => {

    if (!previousVersionsRef.current[userData._id]) {
      previousVersionsRef.current[userData._id] = structuredClone(userData) // or deep copy
    }

    setIsUserUpdatingUserData(true)

    if (currentSettingsEdit) {
      setUserData((prevUserData) => ({
          ...prevUserData,
          currentSettings: {
              ...prevUserData.currentSettings,
              ...newData
          }
      }))
    }
    else {
      setUserData((prevUserData) => ({
          ...prevUserData,
          ...newData,
      }))
    }
  }

  //notifications
  const [notifications, setNotifications] = useState([]) // [{userId, notifications[obj, ...]}, ...]
  const notificationsRef = useRef([])

  const period = useMemo(() => userData.currentSettings.notificationsPeriod, [userData])
  const delay = useMemo(() => userData.currentSettings.notificationsDelay, [userData])

  //create Notifications
  const checkActivities = useCallback((now, period, delay) => {

    const updated = [...notificationsRef.current]
    // Loop through users and their activities
    projects.forEach((project) => {
      project.activities?.forEach((activity) => {
        const activityStartTime = new Date(`${activity.startDate}T${activity.startTime}:00`)

        const isWithinDateRange = now >= new Date(activity.startDate) && now <= new Date(activity.endDate)

        // Get the difference in minutes
        const diffMins = (activityStartTime.getHours() - now.getHours()) * 60 + activityStartTime.getMinutes() - now.getMinutes()
        const _id = `${activity._id}`

        const add    = diffMins > delay - period && diffMins <= delay         && isWithinDateRange
        const remove = diffMins > delay          || activity.deleted === true || !isWithinDateRange

        if (add) {
          const alreadyNotified = updated.find(n => n._id === _id)
          if (!alreadyNotified && activity.deleted !== true) {
            updated.push(createNotification(_id, "unseen", activity.page, "Starts soon", now))
          }
        }
        if (remove) {
          const falselyNotified = updated.findIndex(n => n._id === _id)
          if (falselyNotified !== -1) {
            updated.splice(falselyNotified, 1)
          }
        }
      })
    })

    const isSameArray = (a, b) => {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (a[i].state !== b[i].state) return false
      }
      return true
    }

    if (!isSameArray(updated, notificationsRef.current)) {
      setNotifications(updated)
    }
  }, [projects])

  // (V) load existing messages on log in
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }

    const loaded = Shared.getFromLocalStorage(true, "SciWork notifications", userData._id, null)
    if (loaded) {

      //delete old notifications
      const recentNotifications = loaded.filter(notification => {
        return Shared.daysTillEvent(1, notification.generationDate, notification.generationTime)
      })
      notificationsRef.current = recentNotifications
      setNotifications(recentNotifications)
      checkActivities(new Date(), 15, delay)
    }
  }, [checkActivities, delay, userData._id, isLoggedIn])
  
  // (V) save existing messages to storage on each change
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }

    notificationsRef.current = notifications

    const parsed = Shared.getFromLocalStorage(true, "SciWork notifications", null, null)
    const updated = parsed.filter(entry => entry.userId !== userData._id)

    // Add fresh data
    updated.push({
      userId: userData._id,
      data: notifications
    })
    Shared.getFromLocalStorage(false, "SciWork notifications", null, updated)
  }, [notifications, isLoggedIn, userData._id])
  
  // Run the timer hook every set minutes
  useTimer(checkActivities, period, delay, isLoggedIn)

  /*!!! for beta-version !!!

  profile image (optional)

  locale related settings
  last login dateTime

  account status          (active, disabled, suspended)

  list of devices         (optional, may be required)
  list of allowed devices (optional)

  more organisation data  (like class, department) (optional)
  */

  // Values for Provider
  const vals = {
    //tech
    dialog: dialog,
    isLoggedIn: isLoggedIn,
    isCompany: isCompany,
    rights: rights,
    organisationType: isCompany,
    profileData: DEFAULT_PROFILE_DATA,
    itemStructure: DEFAULT_ITEM_STRUCTURE,
    defaultStructure: defaultStructure,
    //data
    userData: userData,
    projects: projects,
    activities: activities,
    users: users,
    //metadata
    notifications: notifications,
    recentActivities: recentActivities,
    
    //tech
    setDialog: setDialog,
    setLoggedIn: setLoggedIn,
    //data
    setUserData: updateUser,
    setData: updateData,
    setUsers: updateUsers,
    //metadata
    setNotifications: setNotifications,
    setRecentActivities: setRecentActivities,
  }

  //Html
  return (
    <Router>
      <Shared.AppProvider
        vals={vals}
      >
        <div className="App">
            <AppHeader/>
            <div>
              {isLoggedIn &&
                <AppNav/>
              }
              <AppContent/>
            </div>
        </div>
        <AppConnection
          //data
          setProjects={setProjects}
          setActivities={setActivities}
          //tech+meta
          setRights={setRights}
          setUsers={setUsers}
          //flags
          isUserUpdatingProjects={isUserUpdatingProjects}
          setIsUserUpdatingProjects={setIsUserUpdatingProjects}
          isUserUpdatingActivities={isUserUpdatingActivities}
          setIsUserUpdatingActivities={setIsUserUpdatingActivies}
          isUserUpdatingUserData={isUserUpdatingUserData}
          setIsUserUpdatingUserData={setIsUserUpdatingUserData}
          //buffer
          previousVersionsRef={previousVersionsRef}
        />
      </Shared.AppProvider>
  </Router>
  )
}

export default App