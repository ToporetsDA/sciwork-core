import React, { useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom"

import AppContent from './AppContent'

const AppDynamicContent = ({userData, setUserData, profileData, state, setState, data, setData, rights, users, itemStructure, defaultStructure, isCompany, notifications, setNotifications, recentActivities, setRecentActivities }) => {
    
  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)

    const updateState = (page, project, activity) => {
      if (state.currentPage === page && state.currentProject === project && state.currentActivity === activity) {
        return
      }
      setState((prevState) => ({
        ...prevState,
        currentPage: page,
        currentProject: project,
        currentActivity: activity
      }))
    }

    let page = state.currentPage
    let pr = state.currentProject
    let act = state.currentActivity

    switch (pathParts.length) {
      case 0: {
        navigate('/HomePage', { replace: true })
        return
      }
      case 1: {
        if (state.currentPage === pathParts[0]) {
          return
        }
        page = pathParts[0]
        pr = undefined
        act = undefined
        break
      }
      case 2: {
        const project = data.find(project => project._id === pathParts[1]) || undefined

        if (state.currentProject !== project) {
          page = pathParts[0]
          pr = project
          act = undefined
        }
        break
      }
      case 3: {
        const project = data.find(project => project._id === pathParts[1]) || undefined
        const activity = (project) ? project.activities.find(activity => activity.id === pathParts[2]) || undefined : undefined

        if (state.currentProject !== project) {
          page = pathParts[0]
          pr = project
          act = activity
        }
        break
      }
      default: {}
    }

    updateState(page, pr, act)

  }, [location.pathname, state, setState, data, navigate])
  
  return (
    <AppContent
      userData={userData}
      setUserData={setUserData}
      profileData={profileData}
      state={state}
      setState={setState}
      data={data}
      setData={setData}
      rights={rights}
      users={users}
      itemStructure={itemStructure}
      defaultStructure={defaultStructure}
      isCompany={isCompany}
      notifications={notifications}
      setNotifications={setNotifications}
      recentActivities={recentActivities}
      setRecentActivities={setRecentActivities}
    />
  )
}

export default AppDynamicContent