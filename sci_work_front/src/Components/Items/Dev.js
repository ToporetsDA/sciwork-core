import { useNavigate } from "react-router-dom"
import '../../css/Items/Dev.css'

import * as Shared from '../pages/sharedComponents'

const Dev = ({ userData, setUserData, state, setState, data, setData, item, index, rights, recentActivities, setRecentActivities }) => {
    
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
                navigate(Shared.GoTo(item, data, recentActivities, setRecentActivities))
            }}
        >
            <h3 className="name">{item.name}</h3>
            <p className="timeLimit">
                Dev type Activity. Testing ONLY
            </p>
            <Shared.ItemActions
                userData={userData}
                data={data}
                setData={setData}
                setState={setState}
                item={item}
                rights={rights}
            />
        </div>
    )
}

export default Dev
