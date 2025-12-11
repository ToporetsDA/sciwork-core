import { useEffect, useContext } from 'react'
import { useLocation, useNavigate } from "react-router-dom"

import AppContent from './AppContent'

import * as Shared from './pages/shared'

const AppDynamicContent = () => {

  const {
    state, setState,
    isLoggedIn,
    projects,
  } = useContext(Shared.AppContext)

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
        currentActivity: activity,
        currentDialog: {
          name: undefined,
          params: []
        }
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
        const project = Shared.getItemById(projects, pathParts[1]) || undefined
        page = pathParts[0]
        pr = project._id
        act = undefined
        break
      }
      case 3: {
        const project = Shared.getItemById(projects, pathParts[1]) || undefined
        const activity = (project) ? Shared.getItemById(project.activities, pathParts[2]) || undefined : undefined

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
    <AppContent/>
  )
}

export default AppDynamicContent