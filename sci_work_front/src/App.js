import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import AppConnection from './Components/AppConnection'
import AppHeader from './Components/AppHeader'
import AppNav from './Components/AppNav'
import AppDynamicContent from './Components/AppDynamicContent'

import * as Shared from './Components/pages/sharedComponents'

const App = () => {

  const [state, setState] = useState({
    currentPage: 'HomePage',   //string
    currentProject: undefined,  //object
    currentActivity: undefined, //string
    currentDialog: {
      name: undefined,  //string
      params: []        //[any]
    }
  })
  
  //user
  
  //genStatus: 0 - item creator/organisation owner, 1 - manager (add/edit items), 2 - supervisor, 3 - user
  const [userData, setUserData] = useState({ genStatus: -1, notificationsPeriod: 5, notificationsDelay: 15})

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
      repeat: 'checkbox',
      days: 'days',
      thirdParty: 'checkbox',
      serviceName: 'text'
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
        page: false,
        repeat: false,
        days: [],
        thirdParty: false,
        serviceName: ''
      }
    }
  }, [])

  const [data, setData] = useState([])

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
    console.log("from updateData: ", data)
  }

  const updateUser = (newData) => {
    setIsUserUpdatingUserData(true)
    setUserData((prevUserData) => ({
        ...prevUserData,
        ...newData,
    }))
  }

  //notifications
  const [notifications, setNotifications] = useState([])
  const notificationsRef = useRef([])

  const checkActivities = useCallback((now, period, delay) => {
    const updated = [...notificationsRef.current]
    // Loop through users and their activities
    data.forEach((project) => {
      project.activities?.forEach((activity) => {

        const activityStartTime = new Date(`${activity.startDate}T${activity.startTime}:00`)

        // Get the difference in minutes
        const diffMins = (activityStartTime.getMinutes() - now.getMinutes()) / (1000 * 60)
        if (diffMins > delay - period && diffMins <= delay) {
          
          const _id = `${activity._id}`
          const alreadyNotified = updated.some(n => n._id === _id)

          if (!alreadyNotified) {
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
      })
    })

    if (updated.length !== notificationsRef.current.length) {
      setNotifications(updated)
    }
  }, [data])

  //load existing messages on log in
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }

    const saved = localStorage.getItem("notifications")
    let loaded = []

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        loaded = Array.isArray(parsed) ? parsed : []
      } catch (err) {
        console.error("Invalid localStorage data:", err)
      }

      //delete old notifications
      const now = new Date()
      const recentNotifications = loaded.filter(notification => {
        return Shared.DaysTillEvent(1, notification.generationDate, notification.generationTime)
      })
      setNotifications(recentNotifications)
      checkActivities(now, 15, userData.notificationsDelay)
    }
  }, [checkActivities, userData.notificationsDelay, isLoggedIn])
  
  //save existing messages to storage on each change
  useEffect(() => {
    if (isLoggedIn !== true) {
      return
    }
    notificationsRef.current = notifications
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications, isLoggedIn])
  
  // Run the timer hook every set minutes
  Shared.Timer(checkActivities, userData.notificationsPeriod, userData.notificationsDelay)
  
  //Html
  return (
    <Router>
      <div className="App">
        <AppHeader
          state={state}
          setState={setState}
          userData={userData}
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
                data={data}
                setData={updateData}
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