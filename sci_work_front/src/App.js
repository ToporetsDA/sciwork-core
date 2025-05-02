import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import AppConnection from './Components/AppConnection'
import AppHeader from './Components/AppHeader'
import AppNav from './Components/AppNav'
import AppDynamicContent from './Components/AppDynamicContent'

import * as Shared from 'Components/pages/sharedComponents'

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
  const [userData, setUserData] = useState({ genStatus: -1, notificationsPeriod: 5})

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

  const checkActivities = useCallback((now, period) => {
    
    // Loop through users and their activities
    data.forEach((project) => {
      project.activities?.forEach((activity) => {

        const activityStartTime = new Date(`${activity.startDate}T${activity.startTime}:00`)

        // Get the difference in minutes
        const diffMins = (activityStartTime.getMinutes() - now.getMinutes()) / (1000 * 60)

        if (diffMins > 0 && diffMins <= 15 - period) {
          
          const itemId = `${project._id}.${activity._id}`
          const alreadyNotified = notifications.some(n => n.itemId === itemId)

          if (!alreadyNotified) {
            const notification = {
              _id: itemId,
              state: "unseen",
              page: activity.page || false,
              content: "Starts soon",
              generationDate: now.toISOString().slice(0, 10),
              generationTime: now.toTimeString().slice(0, 5)
            }

            setNotifications(prev => [...prev, notification])
          }
        }
      })
    })
  }, [data, notifications])

  //load existing messages on App mount
  useEffect(() => {
    const saved = localStorage.getItem("notifications")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        //delete old notifications
        const now = new Date()
        const recentNotifications = parsed.filter(notification => {
          const [year, month, day] = notification.generationDate.split("-").map(Number)
          const [hours, minutes] = notification.generationTime.split(":").map(Number)
          const notifDate = new Date(year, month - 1, day, hours, minutes)

          const timeDiff = now - notifDate
          return (timeDiff <= 24 * 60 * 60 * 1000) // 24 hours in milliseconds
        })

        setNotifications(JSON.parse(recentNotifications))
        checkActivities(now, 15)
      } catch (err) {
        console.error("Invalid localStorage data:", err)
      }
    }
  }, [checkActivities])
  
  //save existing messages to storage on each change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications))
  }, [notifications])
  

  // Run the timer hook every set minutes
  Shared.useTimer(userData.notificationsPeriod, checkActivities)
  
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