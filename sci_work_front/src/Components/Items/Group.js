import { useNavigate } from "react-router-dom"
import '../../css/Items/Group.css'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

const Group = ({userData, data, setData, activities, setActivities, state, setState, item, index, rights, recentActivities, setRecentActivities}) => {

    const navigate = useNavigate()

    return (
        <>
            <Items.Text
                key={item._id}
                userData={userData}
                data={data}
                setData={setData}
                activities={activities}
                setActivities={setActivities}
                state={state}
                setState={setState}
                item={item}
                index={index}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
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
                {item.startDate ? item.startDate : 'N/A'} - {item.endDate}
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
        </>
    )
}

export default Group