import { useNavigate } from "react-router-dom"
import '../../css/components/items/Project.css'

import * as Shared from '../pages/sharedComponents'

const Project = ({
    userData,
    projects,
    setData,
    state,
    setState,
    item,
    index,
    rights,
    recentActivities, setRecentActivities
}) => {

    const navigate = useNavigate()

    return (
        <div
            key={index}
            className={`
            card
            ${(new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
            ${(new Date(item.endDate) < new Date()) ? 'expired' : ''}
            `}
            onClick={() => {
                navigate(Shared.GoTo(item, projects, recentActivities, setRecentActivities))
            }}
        >
            <h3 className="name">{item.name}</h3>
            <p className="timeLimit">
            {item.startDate ? item.startDate : 'N/A'} - {item.endDate}
            </p>
            <Shared.ItemActions
                userData={userData}
                projects={projects}
                setData={setData}
                setState={setState}
                item={item}
                rights={rights}
            />
        </div>
    )
}

export default Project