import { useContext } from 'react'
import { useNavigate } from "react-router-dom"

import '../../Styles/components/items/Dev.sass'

import { AppContext } from '../pageAssets/shared'

const Dev = ({
    item,
    index
}) => {
    
    const navigate = useNavigate()

    const {
        projects,
        recentActivities, setRecentActivities
    } = useContext(AppContext)

    return (
        <div
            key={index}
            className={`
            wrapper
            ${(new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
            ${(new Date(item.endDate) < new Date()) ? 'expired' : ''}
            `}
            onClick={() => {
                navigate(item.goTo(projects, recentActivities, setRecentActivities))
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
