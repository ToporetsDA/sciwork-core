import { useState, useEffect, useRef, useMemo, useCallback, useNavigate, useParams, useLocation } from 'react'
import { BrowserRouter as Router, } from 'react-router-dom'
import { produceWithPatches } from "immer"

import './App.css'

import { createUserData, createNotification, createDisplaySettings, createFunctionalSettings } from './lib/classes'
import { DEFAULT_PROFILE_DATA, DEFAULT_ITEM_STRUCTURE, DEFAULT_DISPLAY_SETTINGS } from './lib/constants'
import { getItemById, getFromLocalStorage, daysTillEvent, nowUTC, diffTime } from './lib/helpers'
import { useTimer, useDeepTranslation } from './lib/hooks'

import { AppProvider } from './Components/pageAssets/shared'

import AppConnection  from './Components/AppConnection'

import AppHeader      from './Components/_base/AppHeader'
import AppNav         from './Components/_base/AppNav'
import AppContent     from './Components/_base/AppContent'

const App = () => {

  // ==================================
  // const, helpers and state management
  // ==================================

  //user
  const [userData, setUserData] = useState(createUserData())
  const [rights, setRights] = useState()

  //settings
  const [displaySettings, setDisplaySettings] = useState(createDisplaySettings())
  const [functionalSettings, setFunctionalSettings] = useState(createFunctionalSettings())

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

  //other users
  const [users, setUsers] = useState()

  //page state
  const { pathname } = useLocation()
  const currentPage = pathname.split("/")[1] || "HomePage"
  const { projectId, activityId } = useParams()
  const lastSentPage = useRef({
    currentPage: 'HomePage',
    currentProject: undefined,
    currentActivity: undefined
  })

  // --- helpers ---

  // remove all spaces
  const format = (str) => {
      return str.replace(/\s+/g, '')
  }

  // ==================================

  // const updateUsers = (itemId) => {
  //   // this method will get users's data of users related to Item
  //   // for now all users are loaded at login
  // }

  // ==================================
  // update logic
  // ==================================

  const socketRef = useRef(null)
  const previousVersionsRef = useRef(null)

  const sendPatch = (type, id, patches) => {

    //null handling on not logged in
    if (!socketRef.current) {
      console.warn("Socket not ready yet")
      return
    }

    socketRef.current("update", {
      _id: id,
      fields: patches.map(p => ({
        path: p.path,   // масив ключів/індексів Immer
        value: p.value
      }))
    })
  }

  const updateWithPatches = (setter, getState, recipe, onPatch) => {
    const [nextState, patches] = produceWithPatches(getState(), recipe)

    setter(nextState)
    if (patches.length) {
      onPatch(patches)
    }
  }

  const updateData = ({ domain, id, recipe }) => { //user update entry point

    const domainTypeMap = {
      projects: "Project",
      activities: "Activity",
      user: "UserData"
    }
    const getDraft = (item) => {
      if (item) {
        previousVersionsRef.current[id] = {
          type: domainTypeMap[domain],
          val: structuredClone(item)
        }
        recipe(item)
      }
    }

    let setter
    let prevState
    let getDraftItem

    switch(domain) {
      case "projects": {
        setter = setProjects
        prevState = projects
        getDraftItem = (draft, id) => getItemById(draft, id)
        break
      }

      case "activities": {
        setter = setActivities
        prevState = activities
        getDraftItem = (draft, id) => getItemById(draft, id)
        break
      }

      case "user": {
        setter = setUserData
        prevState = userData
        getDraftItem = (draft) => draft
        break
      }
      default: {
        console.warn("No such item domain. Update not sent")
        return
      }
    }

    updateWithPatches(
      setter,
      () => prevState,
      draft => {
        const item = getDraftItem(draft, id)
        getDraft(item)
      },
      patches => sendPatch(domain, id, patches)
    )
  }

  // page tracker
  
  useEffect(() => {
    if (
      (lastSentPage.current.currentPage === currentPage && lastSentPage.current.currentProject === projectId)
      || !isLoggedIn
    ) {
      return
    }
    const location = projectId || currentPage
    socketRef.current("goTo", { page: format(location), isId: (!!projectId)})
    lastSentPage.current = {
      currentPage: currentPage,
      currentProject: projectId,
      currentActivity: activityId
    }
  }, [ currentPage, projectId, activityId, isLoggedIn])

  // ==================================
  // notifications logic
  // ==================================

  const [notifications, setNotifications] = useState([]) // [{userId, notifications[obj, ...]}, ...]
  const notificationsRef = useRef([])

  const period = useMemo(() => functionalSettings.notificationsPeriod, [functionalSettings])
  const delay = useMemo(() => functionalSettings.notificationsDelay, [functionalSettings])

  //create Notifications
  const checkActivities = useCallback((now, period, delay) => {

    const updated = [...notificationsRef.current]
    // Loop through users and their activities
    projects.forEach((project) => {
      project.activities?.forEach((activity) => {

        const activityStartTime = new Date(`${activity.startDate}T${activity.startTime}:00`)
        
        const startRange = new Date(activity.startDate)
        const endRange   = new Date(activity.endDate)
        const isWithinDateRange = (startRange <= now) && (now <= endRange)

        // Get the difference in minutes
        const diffMins = diffTime(activityStartTime, now, "minutes")
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

  // load existing messages on log in
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }

    const loaded = getFromLocalStorage(true, "SciWork notifications", userData._id, null)
    if (loaded) {

      //delete old notifications
      const recentNotifications = loaded.filter(notification => {
        return daysTillEvent(1, notification.generationDate, notification.generationTime)
      })
      notificationsRef.current = recentNotifications
      setNotifications(recentNotifications)
      checkActivities(nowUTC(), 15, delay)
    }
  }, [checkActivities, delay, userData._id, functionalSettings.timeZone, isLoggedIn])
  
  // save existing messages to storage on each change
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }

    notificationsRef.current = notifications

    const parsed = getFromLocalStorage(true, "SciWork notifications", null, null)
    const updated = parsed.filter(entry => entry.userId !== userData._id)

    // Add fresh data
    updated.push({
      userId: userData._id,
      data: notifications
    })
    getFromLocalStorage(false, "SciWork notifications", null, updated)
  }, [notifications, isLoggedIn, userData._id])
  
  // Run the timer hook every set minutes
  useTimer(checkActivities, period, delay, isLoggedIn)

  // ==================================

  /*!!! for beta-version !!!

  profile image (optional)

  locale related settings
  last login dateTime

  account status          (active, disabled, suspended)

  list of devices         (optional, may be required)
  list of allowed devices (optional)

  more organisation data  (like class, department) (optional)
  */

  // ==================================
  // Provider logic
  // ==================================

  // Values for Provider
  const vals = {
    //tech
    currentPage,
    projectId,
    activityId,
    dialog,
    isLoggedIn,
    isCompany,
    rights,
    organisationType: isCompany,
    formatOfProfileData: DEFAULT_PROFILE_DATA,
    formatOfDisplaySettings: DEFAULT_DISPLAY_SETTINGS,
    itemStructure: DEFAULT_ITEM_STRUCTURE,
    defaultStructure,
    //data
    userData,
    projects,
    activities,
    users,
    displaySettings,
    functionalSettings,

    //metadata
    notifications,
    recentActivities,
    
    //tech
    setDialog,
    setLoggedIn,
    useLocale: useDeepTranslation,
    //data
    setData: updateData,
    setDisplaySettings,
    setFunctionalSettings,
    //metadata
    setNotifications,
    setRecentActivities,

    //hooks
    navigate: useNavigate()
  }

  // ==================================

  return (
    <Router>
      <AppProvider
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
          onReady={fn => socketRef.current = fn}
          //data
          setProjects={setProjects}
          setActivities={setActivities}
          //tech+meta
          setRights={setRights}
          setUsers={setUsers}
          previousVersionsRef={previousVersionsRef}
        />
      </AppProvider>
  </Router>
  )
}

export default App