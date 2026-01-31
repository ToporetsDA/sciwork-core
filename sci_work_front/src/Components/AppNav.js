// Libraries
import { useContext, useParams, useLocation } from 'react'
import { useNavigate } from "react-router-dom"
// Styles, Classes, Constants
import '../css/components/AppNav.css'
// Methods, Components
import * as Shared from './pages/shared'

const AppNav = () => {
  
  const {
    projects,
    isLoggedIn,
    organisationType,
    recentActivities, setRecentActivities
  } = useContext(Shared.AppContext)

  const navigate = useNavigate()
  const { activityId } = useParams()

  const { pathname } = useLocation()
  const currentPage = pathname.split("/")[1] || "HomePage"

  //project.name and activity.name pairs
  const clearRecent = () => {
    setRecentActivities([])
  }

  // create html for nested list item
  const getLi = (activity) => {
    return (
      <li
        key={activity._id}
        onClick={
          () => {navigate(activity.goTo(projects, recentActivities, setRecentActivities))}
        }
        className={
          activityId === activity._id ? 'active' : ''
        }
        style={activityId === activity._id ? {
          fontWeight: 'bold',
          pointerEvents: 'none',
          opacity: 0.5,
        } : {
          fontWeight: 'normal',
          pointerEvents: 'auto',
          opacity: 1,
        }}
      >
        {activity.name}
      </li>
    )
  }

  const isInRecent = (item) => {
    return recentActivities.filter(recent => (recent._id.includes(item._id))).length > 0
  }

  // get list of nested items (activities)
  const getList = (list, itemsField, isListField, checkVal, comparator) => {

    const filteredList = (comparator)
      ? list[itemsField].filter(item => {
          const val = (item[isListField] === checkVal) ? (
            !!getList(item, itemsField, isListField, checkVal, comparator) || comparator(item)
          ) : (
            comparator(item)
          )
          return val
        })
      : list[itemsField]

    if (filteredList.length === 0) {
      return false
    }
    
    return (
      <ul
        key={list._id}
      >
        {filteredList.map((item) => {
          if (item[isListField] === checkVal) {
            const list = getList(item, itemsField, isListField, checkVal, comparator)

            if (!list) {
              if (comparator ? comparator(item) : false) {
                return (
                  <div key={item._id}>
                    {getLi(item)}
                  </div>
                )
              }
              return <div key={item._id}></div>
            }
            return (
              <div key={item._id}>
                {getLi(item)}
                <ul>
                  {list}
                </ul>
              </div>
            )
          }
          return (
            <div key={item._id}>
              {getLi(item)}
            </div>
          )
        })}
      </ul>
    )
  }
  
  return (
    <nav>
      {isLoggedIn === true &&
      <>
        <ul className="nav-items">
          <h4
            className={currentPage === 'Projects' ? 'active' : ''}
            style={{
            fontWeight: currentPage === 'Projects' ? 'bold' : 'normal',
            pointerEvents: currentPage === 'Projects' ? 'none' : 'auto',
            opacity: currentPage === 'Projects' ? 0.5 : 1,
            }}
          >
            {organisationType === true ? 'Projects' : 'Subjects'}
          </h4>

          {projects.map((project) => (
            <li key={project._id}>
              <details>
                <summary>{project.name}</summary>
                {getList(project, "activities", "type", "Group")}
              </details>
            </li>
            ))}
        </ul>
          
        <ul className="nav-items">
          <h4>Recent</h4>
          {projects.map((project) => {
            if (isInRecent(project)) {
              return (
                <li key={project._id}>
                  <details>
                    <summary>{project.name}</summary>
                    {getList(project, "activities", "type", "Group", isInRecent)}
                  </details>
                </li>
              )
            }
            else {
              return null
            }
          })}

          <button
            className='button-secondary'
            style={{ display: recentActivities.length === 0 ? 'none' : 'block' }}
            onClick={clearRecent}
          >
            Clear recent
          </button>
        </ul>
      </>
      }
    </nav>
  )
}

export default AppNav
