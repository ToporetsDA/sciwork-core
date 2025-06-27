import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import AppConnection from './Components/AppConnection'
import AppHeader from './Components/AppHeader'
import AppDynamicContent from './Components/AppDynamicContent'

import * as Shared from './Components/pages/shared'

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

  //logs

  const [logs, setLogs] = useState([])

  //header
  const isCompany = true

  //login
  const [isLoggedIn, setLoggedIn] = useState(false)

  //connection

  const [isUserUpdatingUserData, setIsUserUpdatingUserData] = useState(false)

  const [users, setUsers] = useState()

  const updateUsers = (action, userId, access) => {

    let user = Shared.getItemById(users, userId)

    switch(action) {
      case "access": {
        user.genStatus = access
        setIsUserUpdatingUserData({id: user, action})
        break
      }
      case "delete": {
        setIsUserUpdatingUserData({id: user, action})
        break
      }
      default:
    }
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
      isUserUpdatingUserData={isUserUpdatingUserData}
      setIsUserUpdatingUserData={setIsUserUpdatingUserData}
      previousVersionsRef={previousVersionsRef}
    />
  </Router>
  )
}

export default App