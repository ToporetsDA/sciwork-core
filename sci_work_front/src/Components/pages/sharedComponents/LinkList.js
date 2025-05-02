import React, { useMemo }  from 'react'
import { useNavigate } from "react-router-dom"
import '../../../css/pages/sharedComponents/LinkList.css'
import '../../../css/pages/Notifications.css'
import * as Shared from './index'

const LinkList = ({ data, state, setState, list, setList, setRecentActivities }) => {

    const navigate = useNavigate()
    const goTo = Shared.GoTo

    const projectId = (id) => {
        return id.split('.')[0]
    }

    const findEl = (id, array) => {
        return array.find(el => el._id === id)
    }

    const items = useMemo(() => {
        return list.flatMap((item, i) => {

            switch(state.currentPage) {
            case "Schedule": {
                const start = new Date(`${item.startDate}T${item.startTime || "01:00"}`).toLocaleString()
                const end = new Date(`${item.endDate}T${item.endTime || "02:45"}`).toLocaleString()
                return (
                    <div key={i} className='item' onClick={() => {
                        navigate(goTo(item, data, setRecentActivities))
                    }}>
                        <div className='content'>
                            <p>{`${item.name}`}</p>
                            <p>{`Start at ${start}`}</p>
                            <p>{`\nEnd at${end}`}</p>
                        </div>
                    </div>
                )
            }
            case "Notifications": {

                const tmpItem = (item._id.includes(".")) ? findEl(data, item._id) : findEl(findEl(data,  projectId(item._id)).activities, item._id)
                
                const projectName = findEl(data, projectId(item._id)).name
                const activityName = (item._id.includes(".")) ? findEl(findEl(data,  projectId(item._id)).activities, item._id).name : undefined
                
                return (
                    <div
                        key={i}
                        className={`item ${item.state}`}
                        onClick={
                            () => {
                                navigate(goTo(tmpItem, data, setRecentActivities))
                                const updatedItem = { ...item, state: 'read' }
            
                                setList(
                                    list.map((notification, index) =>
                                        index === i ? updatedItem : notification
                                    )
                                )
                            }
                        }
                        >
                        <div className='content'>
                            <p>{projectName}</p>
                            {(item._id.includes(".")) &&
                                <p>{activityName}</p>
                            }
                            <p>{item.content}</p>
                            <h6>{`${item.generationTime} ${item.generationDate}`}</h6>
                        </div>
                        {item.state === "unread" &&
                            <span className="notification-circle"></span>
                        }
                    </div>
                )
            }
            default: return <></>
            }
        })
    }, [data, state, list, goTo, navigate, setList, setRecentActivities])

    return (
        <div className='list'>
            {items}
        </div>
    )
}

export default LinkList