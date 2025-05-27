import React, { useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom"

import AppContent from './AppContent'

import * as Shared from './pages/sharedComponents'

const AppDynamicContent = ({
  userData, setUserData,
  profileData,
  state, setState,
  isLoggedIn,
  projects,
  activities,
  setData,
  rights,
  users,
  itemStructure,
  defaultStructure,
  isCompany,
  notifications, setNotifications,
  recentActivities, setRecentActivities
}) => {

  const location = useLocation()
  const navigate = useNavigate()
  
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean)

    if (!isLoggedIn && pathParts[0] !== "HomePage") {
      navigate('/HomePage', { replace: true })
    }

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
        const project = Shared.GetItemById(projects, pathParts[1]) || undefined
        page = pathParts[0]
        pr = project._id
        act = undefined
        break
      }
      case 3: {
        const project = Shared.GetItemById(projects, pathParts[1]) || undefined
        const activity = (project) ? Shared.GetItemById(project.activities, pathParts[2]) || undefined : undefined

        if (state.currentProject !== project) {
          page = pathParts[0]
          pr = project._id
          act = activity._id
        }
        break
      }
      default: {}
    }

    updateState(page, pr, act)

  }, [location.pathname, state, setState, projects, isLoggedIn, navigate])
  
  return (
    <AppContent
      userData={userData}
      setUserData={setUserData}
      profileData={profileData}
      state={state}
      setState={setState}
      projects={projects}
      activities={activities}
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