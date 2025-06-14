import React from 'react'
import { useNavigate } from "react-router-dom"
import '../css/components/AppNav.css'

import * as Shared from './pages/sharedComponents'

const AppNav = ({ projects, activities, state, isLoggedIn, organisationType, recentActivities, setRecentActivities }) => {
  
  const navigate = useNavigate()

  //project.name and activity.name pairs
  const clearRecent = () => {
    setRecentActivities([])
  }

  const getLi = (activity) => {
    return (
      <li
        key={activity._id}
        onClick={
          () => {navigate(Shared.GoTo(activity, projects, recentActivities, setRecentActivities))}
        }
        className={
          state.currentActivity === activity._id ? 'active' : ''
        }
        style={state.currentActivity === activity._id ? {
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
              if (comparator(item)) {
                return (
                  <div key={item._id}>
                    {getLi(item)}
                  </div>
                )
              }
              else {
                return <div key={item._id}></div>
              }
            }
            else {
              return (
                <div key={item._id}>
                  {getLi(item)}
                  <ul>
                    {list}
                  </ul>
                </div>
              )
            }
          }
          else {
            return getLi(item)
          }
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
            className={state.currentPage === 'Projects' ? 'active' : ''}
            style={{
            fontWeight: state.currentPage === 'Projects' ? 'bold' : 'normal',
            pointerEvents: state.currentPage === 'Projects' ? 'none' : 'auto',
            opacity: state.currentPage === 'Projects' ? 0.5 : 1,
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
