import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import AppConnection from './Components/AppConnection'
import AppHeader from './Components/AppHeader'
import AppDynamicContent from './Components/AppDynamicContent'

// import * as Shared from './Components/pages/shared'

const App = () => {

  const [state, setState] = useState({
    currentPage: 'HomePage',   //string
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

  const [logs, setLogs] = useState([])

  //header
  const isCompany = true

  //login
  const [isLoggedIn, setLoggedIn] = useState(false)

  //connection

  const [isUserUpdatingItems, setIsUserUpdatingItems] = useState(false)
  const [isUserUpdatingUserData, setIsUserUpdatingUserData] = useState(false)

  const [users, setUsers] = useState()

  const updateUsers = (itemId) => {
    // this method will get users's data of users related to Item
    // for now all users are loaded at login
  }

  const previousVersionsRef = useRef({})

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
          organisationType={isCompany}
        />
        <div>
          <Routes>
            <Route path="*" element={
              <AppDynamicContent
                userData={userData}
                setUserData={updateUser}
                profileData={defaultProfileData}
                state={state}
                setState={setState}
                isLoggedIn={isLoggedIn}
                rights={rights}
                users={users}
                setUsers={updateUsers}
                itemStructure={defaultItemStructure}
                defaultStructure={defaultStructure}
                isCompany={isCompany}
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
      isLoggedIn={isLoggedIn}
      setLoggedIn={setLoggedIn}
      setRights={setRights}
      setUsers={setUsers}
      isUserUpdatingItems={isUserUpdatingItems}
      setIsUserUpdatingItems={setIsUserUpdatingItems}
      isUserUpdatingUserData={isUserUpdatingUserData}
      setIsUserUpdatingUserData={setIsUserUpdatingUserData}
      previousVersionsRef={previousVersionsRef}
    />
  </Router>
  )
}

export default App