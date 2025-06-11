import { useNavigate } from "react-router-dom"
import '../../css/components/items/Dev.css'

import * as Shared from '../pages/sharedComponents'

const Dev = ({
    userData, setUserData,
    state, setState,
    projects,
    activities,
    setData,
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
            wrapper
            ${(new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
            ${(new Date(item.endDate) < new Date()) ? 'expired' : ''}
            `}
            onClick={() => {
                navigate(Shared.GoTo(item, projects, recentActivities, setRecentActivities))
            }}
        >
            <h3 className="name">{item.name}</h3>
            <p className="timeLimit">
                Dev type Activity. Testing ONLY
            </p>
        </div>
    )
}

export default Dev
