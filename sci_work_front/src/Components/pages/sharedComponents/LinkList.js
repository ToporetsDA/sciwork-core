import { useMemo }  from 'react'
import { useNavigate } from "react-router-dom"
import '../../../css/components/pages/sharedComponents/LinkList.css'
import * as Shared from './index'

const LinkList = ({ projects, activities, state, setState, list, setList, recentActivities, setRecentActivities }) => {

    const navigate = useNavigate()
    const goTo = Shared.GoTo

    const projectId = (id) => {
        return id.split('.')[0]
    }

    const findEl = (array, id) => {
        return array.find(el => el._id === id)
    }

    const items = useMemo(() => {
        return list.flatMap((item, i) => {

            switch(state.currentPage) {
            case "Notifications": {

                const tmpItem = (!item._id.includes(".")) ? findEl(projects, item._id) : findEl(findEl(projects,  projectId(item._id)).activities, item._id)
                
                const projectName = findEl(projects, projectId(item._id)).name
                const activityName = (item._id.includes(".")) ? findEl(findEl(projects,  projectId(item._id)).activities, item._id).name : undefined
                
                return (
                    <div
                        key={i}
                        className={`item ${item.state}`}
                        onClick={
                            () => {
                                navigate(goTo(tmpItem, projects, recentActivities, setRecentActivities))
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
    }, [projects, state, list, goTo, navigate, setList, recentActivities, setRecentActivities])

    return (
        <div className='list'>
            {items}
        </div>
    )
}

export default LinkList