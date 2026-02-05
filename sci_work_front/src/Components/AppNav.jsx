import { useContext } from 'react'
import { useTranslation } from "react-i18next"

import '../Styles/components/AppNav.sass'

import { AppContext } from './pageAssets/shared'

const AppNav = () => {
  
  const {
    navigate,
    currentPage, activityId,
    projects,
    isLoggedIn,
    organisationType,
    recentActivities, setRecentActivities
  } = useContext(AppContext)

  const { t } = useTranslation("base.nav")

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
          <h4>{t("recent.name")}</h4>
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
            {t("recent.reset")}
          </button>
        </ul>
      </>
      }
    </nav>
  )
}

export default AppNav
