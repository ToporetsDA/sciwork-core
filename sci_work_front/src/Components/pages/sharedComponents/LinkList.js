import { useMemo }  from 'react'
import { useNavigate } from "react-router-dom"
import '../../../css/components/pages/sharedComponents/LinkList.css'
import * as Shared from './'

const LinkList = ({ projects, activities, state, setState, list, setList, recentActivities, setRecentActivities }) => {

    const navigate = useNavigate()
    const goTo = Shared.GoTo

    const projectId = (id) => {
        return id.split('.')[0]
    }

    const items = useMemo(() => {
        return list.flatMap((item, i) => {

            switch(state.currentPage) {
            case "Notifications": {

                const project = Shared.GetItemById(projects, projectId(item._id))

                const { item: metaItem } = Shared.FindItemWithParent(project.activities, "_id", item._id, project)

                const items = item._id.includes(".") ? activities : projects

                console.log("item in LinkList", projectId(item._id), metaItem, items)
                
                return (
                    <div
                        key={i}
                        className={`item ${item.state}`}
                        onClick={
                            () => {
                                navigate(Shared.GoTo(metaItem, items, recentActivities, setRecentActivities))
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
                            <p>{project.name}</p>
                            {(item._id.includes(".")) &&
                                <p>{metaItem.name}</p>
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