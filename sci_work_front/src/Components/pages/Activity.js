import { Suspense } from 'react'
import { useNavigate } from "react-router-dom"
import '../../css/pages/Activity.css'

import * as Shared from './sharedComponents'

const Activity = ({ userData, setUserData, state, setState, data, setData, itemsToDisplay, setItemsToDisplay, rights, recentActivities, setRecentActivities }) => {

    const navigate = useNavigate()

    //open activity
    const goTo = Shared.GoTo

    const getAccess = (item) => {
        return item.userList.find(item => item.id === userData._id).access
    }

    return (
        <Suspense fallback={<div>Loading activities...</div>}>
            {state.currentProject && state.currentProject.activities ? (
                itemsToDisplay.activities.map((activity, index) => (
                    <div
                        key={index}
                        className={`
                            card
                            ${(new Date(activity.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
                            ${(new Date(activity.endDate) < new Date()) ? 'expired' : ''}
                        `}
                        onClick={() => {
                            navigate(goTo(activity, data, recentActivities, setRecentActivities))
                        }}
                    >
                        <h3 className='name'>{activity.name}</h3>
                        <p className='timeLimit'>
                            {activity.startDate ? activity.startDate : 'N/A'} - {activity.endDate}
                        </p>
                        <p className='details'>
                            {activity.thirdParty ? `Service: ${activity.serviceName}` : 'No third-party service'}
                        </p>
                        {!activity.deleted && rights.edit.includes(getAccess(state.currentProject)) &&
                            <div className='actions'>
                            <button
                                className='gearButton'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setState((prevState) => ({
                                        ...prevState,
                                        currentDialog: {
                                            name: 'AddEditItem',
                                            params: [activity]},
                                    }))
                                }}
                            >
                                ⚙️
                            </button>
                            <button
                                className='deleteButton'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    Shared.deleteItem(data, setData, activity._id)
                                }}
                            >
                                🗑️
                            </button>
                        </div>
                        }
                    </div>
                ))
            ) : (
                <div>No activities available</div>
            )}
        </Suspense>
    )
}

export default Activity