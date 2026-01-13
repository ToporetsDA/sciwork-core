// Libraries
import { useNavigate, useContext } from "react-router-dom"
// Styles, Classes, Constants
import '../../css/components/items/Project.css'
// Methods, Components
import * as Shared from '../pages/shared'

const Project = ({
    item,
    index
}) => {

    const {
        projects,
        recentActivities, setRecentActivities
    } = useContext(Shared.AppContext)

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
                navigate(Shared.goTo(item, projects, recentActivities, setRecentActivities))
            }}
        >
            <h3 className="name">
                {item.name}
            </h3>
            <p className="timeLimit">
                {item.startDate ? item.startDate : 'N/A'} - {item.endDate}
            </p>
            <Shared.ItemActions
                item={item}
            />
        </div>
    )
}

export default Project