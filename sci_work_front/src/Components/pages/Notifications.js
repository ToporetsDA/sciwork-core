import React from 'react'
import '../../css/components/pages/Notifications.css'

import * as Shared from './sharedComponents/index'

const Notifications = ({
    projects,
    setData,
    state, setState,
    notifications, setNotifications,
    recentActivities, setRecentActivities
}) => {

    const ItemList = Shared.LinkList

    return (
        <div className="notificationsContainer">
            <ItemList
                data={projects}
                state={state}
                setState={setState}
                list={notifications}
                setList={setNotifications}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    );
}

export default Notifications