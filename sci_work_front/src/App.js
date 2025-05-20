import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import { useTimer } from './Components/pages/sharedComponents'

import AppConnection from './Components/AppConnection'
import AppHeader from './Components/AppHeader'
import AppNav from './Components/AppNav'
import AppDynamicContent from './Components/AppDynamicContent'

import * as Shared from './Components/pages/sharedComponents'

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
      types: { many: false, options: ['group', 'text', 'chat', 'list', 'table', 'attendance', 'report', 'test']}
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
        startTime: '',
        endTime: '',
        type: 'Dev',
        page: false,
        repeat: false,
        days: [],
        thirdParty: false,
        serviceName: ''
      }
    }
  }, [])

  const [data, setData] = useState([])

  const [activities, setActivities] = useState([])

  //header
  const isCompany = true

  //nav
  const [recentActivities, setRecentActivities] = useState([])

  //login
  const [isLoggedIn, setLoggedIn] = useState(false)

  //connection

  const [isUserUpdatingData, setIsUserUpdatingData] = useState(false)
  const [isUserUpdatingUserData, setIsUserUpdatingUserData] = useState(false)

  const [users, setUsers] = useState()

  const updateData = (data) => {
    const { action, item } = data
    setIsUserUpdatingData(item._id)

    if (action === "add") {
      setData(prevData => [ ...prevData, item ])
    }
    if (action === "edit") {
      setData(prevData => 
        prevData.map(d => 
          d._id === item._id ? item : d
        )
      )
    }
  }

  const updateUser = (newData, currentSettingsEdit) => {
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
    data.forEach((project) => {
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
  }, [data])

  //load existing messages on log in
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }

    const loaded = Shared.LocalStorage(true, "SciWork notifications", userData._id, null)
    if (loaded) {

      //delete old notifications
      const recentNotifications = loaded.filter(notification => {
        return Shared.DaysTillEvent(1, notification.generationDate, notification.generationTime)
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

    const parsed = Shared.LocalStorage(true, "SciWork notifications", null, null)
    const updated = parsed.filter(entry => entry.userId !== userData._id)

    // Add fresh data
    updated.push({
      userId: userData._id,
      data: notifications
    })
    Shared.LocalStorage(false, "SciWork notifications", null, updated)
  }, [notifications, isLoggedIn, userData._id])
  
  // Run the timer hook every set minutes
  useTimer(checkActivities, period, delay, isLoggedIn)

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
          <AppNav
            data={data}
            state={state}
            isLoggedIn={isLoggedIn}
            organisationType={isCompany}
            recentActivities={recentActivities}
            setRecentActivities={setRecentActivities}
          />
          <Routes>
            <Route path="*" element={
              <AppDynamicContent
                userData={userData}
                setUserData={updateUser}
                profileData={defaultProfileData}
                state={state}
                setState={setState}
                isLoggedIn={isLoggedIn}
                data={data}
                setData={updateData}
                activities={activities}
                setActivities={setActivities}
                rights={rights}
                users={users}
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
      data={data}
      setData={setData}
      activities={activities}
      setActivities={setActivities}
      isLoggedIn={isLoggedIn}
      setLoggedIn={setLoggedIn}
      setRights={setRights}
      setUsers={setUsers}
      isUserUpdatingData={isUserUpdatingData}
      setIsUserUpdatingData={setIsUserUpdatingData}
      isUserUpdatingUserData={isUserUpdatingUserData}
      setIsUserUpdatingUserData={setIsUserUpdatingUserData}
    />
  </Router>
  )
}

export default App