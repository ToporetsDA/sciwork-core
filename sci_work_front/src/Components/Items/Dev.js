// Libraries
import { useContext } from 'react'
import { useNavigate } from "react-router-dom"
// Styles, Classes, Constants
import '../../css/components/items/Dev.css'
// Methods, Components
import * as Shared from '../pages/shared'

const Dev = ({
    item,
    index
}) => {
    
    const navigate = useNavigate()

    const {
        projects,
        recentActivities, setRecentActivities
    } = useContext(Shared.AppContext)

    return (
        <div
            key={index}
            className={`
            wrapper
            ${(new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
            ${(new Date(item.endDate) < new Date()) ? 'expired' : ''}
            `}
            onClick={() => {
                navigate(Shared.goTo(item, projects, recentActivities, setRecentActivities))
            }}
        >
            <h3 className="name">{item.name}</h3>
            <p className="time-limit">
                Dev type Activity. Testing ONLY
            </p>
        </div>
    )
}

export default Dev
