import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import { useTimer } from './Components/pages/shared'

import AppConnection from './Components/AppConnection'
import AppHeader from './Components/AppHeader'
import AppNav from './Components/AppNav'
import AppDynamicContent from './Components/AppDynamicContent'

import * as Shared from './Components/pages/shared'

const App = () => {

  const [state, setState] = useState({
    currentPage: 'HomePage',   //string
    currentProject: undefined,  //string
    currentActivity: undefined, //string
    currentDialog: {
      name: undefined,  //string
      params: []        //[any]
    }
  })
  
  //user
  
  //genStatus: 0 - item creator/organisation owner, 1 - manager (add/edit items), 2 - supervisor, 3 - user
  const [userData, setUserData] = useState(
    {
      genStatus: -1,
      currentSettings: {
        notificationsPeriod: 5,
        notificationsDelay: 15,
        displayProjects: "grid"
      }
    }
  )

  const [rights, setRights] = useState()

  const defaultProfileData = {// [isRequired, type]
    basic: {
      name:         [true,  'string'],
      middleName:   [false, 'string'],
      surName:      [true,  'string'],
      patronimic:   [false, 'string'],
      statusName:   [true,  'string'],
      mail:         [true,  'mail'],
      safetyMail:   [false, 'mail'],
      phone:        [false, 'phone'],
      safetyPhone:  [false, 'phone'],
    },
    fixed: ['genStatus', 'statusName', 'id'],//fields that can not be edited
    additional: {
      //will be added in beta-version
    }
  }

  //items

  const defaultItemStructure = {
    project: {
      name: 'text',
      startDate: 'date',
      endDate: 'date',
    },
    activity: {
      name: 'text',
      startDate: 'date',
      endDate: 'date',
      isTimed: 'checkbox',
      startTime: 'time',
      endTime: 'time',
      type: 'list',
      repeat: 'checkbox',
      days: 'list',
      thirdParty: 'checkbox',
      serviceName: 'text'
    },
    lists: {
      days: { many: true, options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']},
      type: { many: false, options: [/*'Dev',*/ 'Group', 'Text', 'Chat', 'List', 'Table', 'Attendance', 'Report', /*'Test'*/]}
    },
    checks: {
      days:         {val: true, dep: "repeat"},
      serviceName:  {val: true, dep: "thirdParty"},
      startTime:    {val: true, dep: "isTimed"},
      endTime:      {val: true, dep: "isTimed"},
    }
  }

  const defaultStructure = useMemo(() => {
    return {
      project: {
        name: '',
        startDate: '',
        endDate: '',
        activities: [],
        userList: []
      },
      activity: {
        name: '',
        startDate: '',
        endDate: '',
        isTimed: true,
        startTime: '',
        endTime: '',
        type: 'Dev',
        repeat: false,
        days: [],
        thirdParty: false,
        serviceName: ''
      }
    }
  }, [])

  const [projects, setProjects] = useState([])

  const [activities, setActivities] = useState([])

  //header
  const isCompany = true

  //nav
  const [recentActivities, setRecentActivities] = useState([])

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

  const updateData = (data) => {

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

    switch(action) {
      case "add": {
        setPr()
        //projects
        if (!item._id.includes('.')) {

          flag(item._id)
          setter(prevItems => [ ...prevItems, item ])
        }
        //activities
        else {
          const {containerId, index, activity} = item

          let clone = Shared.getItemById(projects, state.currentProject)
          clone.dndCount++

          const project = clone
          if (!project) return // fallback in case project is not found

          const { parent: container } = Shared.findItemWithParent(project.activities, "_id", containerId, project)
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
          
          flag(project._id)
          setter(prevItems => 
            prevItems.map(i =>
              i._id === clone._id ? clone : i
            )
          )
        }
        break
      }
      case "edit": {
        setPr()
        //project
        if (!item._id.includes('.')) {
          flag(item._id)
          setter(prevItems => 
            prevItems.map(i =>
              i._id === item._id ? item : i
            )
          )
        }
        //activity
        else {
          const project = Shared.getItemById(projects, state.currentProject)
          if (!project) return

          const { item: target } = Shared.findItemWithParent(project.activities, "_id", item._id, project)
          if (!target) return

          Object.assign(target, item)
          console.log("now I should have updated activity", project, target, item)
          flag(project._id)
          setter(prevItems => 
            prevItems.map(i =>
              i._id === project._id ? project : i
            )
          )
        }
        break
      }
      case "content": {
        setAct()
        const { type, activity } = item

        //update whole activity
        const regularUpdate = (activity) => {
          flag(activity._id)
          setter(prevItems => 
            prevItems.map(i =>
              i._id === activity._id ? activity : i
            )
          )
        }

        switch(type) {
          case "Text":
          case "Table":
          case "Attendance":
          case "Report":
          case "List": {
            regularUpdate(activity)
            break
          }
          case "Chat": {
            if (!activity) {
              const { message } = item
              console.log("send message", message)
            }
            else {
              regularUpdate(activity)
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
    // console.log("from updateData: ", data)
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
            updated.push({
              _id,
              state: "unseen",
              page: activity.page || false,
              content: "Starts soon",
              generationDate: now.toISOString().slice(0, 10),
              generationTime: now.toTimeString().slice(0, 5)
            })
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

  //load existing messages on log in
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
  
  //save existing messages to storage on each change
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

  //Html
  return (
    <Router>
      <div className="App">
        <AppHeader
          state={state}
          setState={setState}
          userData={userData}
          setUserData={setUserData}
          isLoggedIn={isLoggedIn}
          setLoggedIn={setLoggedIn}
          notifications={notifications}
          setNotifications={setNotifications}
          organisationType={isCompany}
        />
        <div>
          {isLoggedIn &&
            <AppNav
              projects={projects}
              activities={activities}
              state={state}
              isLoggedIn={isLoggedIn}
              organisationType={isCompany}
              recentActivities={recentActivities}
              setRecentActivities={setRecentActivities}
            />
          }
          <Routes>
            <Route path="*" element={
              <AppDynamicContent
                userData={userData}
                setUserData={updateUser}
                profileData={defaultProfileData}
                state={state}
                setState={setState}
                isLoggedIn={isLoggedIn}
                projects={projects}
                activities={activities}
                setData={updateData}
                rights={rights}
                users={users}
                setUsers={updateUsers}
                itemStructure={defaultItemStructure}
                defaultStructure={defaultStructure}
                isCompany={isCompany}
                notifications={notifications}
                setNotifications={setNotifications}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
              />
            } />
          </Routes>
        </div>
      </div>
    <AppConnection
      state={state}
      setState={setState}
      userData={userData}
      setUserData={setUserData}
      projects={projects}
      setProjects={setProjects}
      activities={activities}
      setActivities={setActivities}
      isLoggedIn={isLoggedIn}
      setLoggedIn={setLoggedIn}
      setRights={setRights}
      setUsers={setUsers}
      isUserUpdatingProjects={isUserUpdatingProjects}
      setIsUserUpdatingProjects={setIsUserUpdatingProjects}
      isUserUpdatingActivities={isUserUpdatingActivities}
      setIsUserUpdatingActivities={setIsUserUpdatingActivies}
      isUserUpdatingUserData={isUserUpdatingUserData}
      setIsUserUpdatingUserData={setIsUserUpdatingUserData}
      previousVersionsRef={previousVersionsRef}
    />
  </Router>
  )
}

export default App