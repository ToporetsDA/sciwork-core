import { useNavigate, useContext } from "react-router-dom"

import '../../Styles/components/items/Project.sass'

import { AppContext, ItemActions } from '../pageAssets/shared'

const Project = ({
    item,
    index
}) => {

    const {
        projects,
        recentActivities, setRecentActivities
    } = useContext(AppContext)

    const navigate = useNavigate()

    return (
        <div
            key={index}
            className={`
            card
            ${item?.deleted ? "deleted" : ""}
            ${(new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
            ${(new Date(item.endDate) < new Date()) ? 'expired' : ''}
            `}
            onClick={() => {
                navigate(item.goTo(projects, recentActivities, setRecentActivities))
            }}
        >
            <h3 className="name">
                {item.name}
            </h3>
            <p className="timeLimit">
                {item.startDate ? item.startDate : 'N/A'} - {item.endDate}
            </p>
            <ItemActions
                item={item}
            />
        </div>
    )
}

export default Project