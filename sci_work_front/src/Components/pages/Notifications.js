import React from 'react'
import '../../css/pages/Notifications.css'

import * as Shared from './sharedComponents/index'

const Notifications = ({data, setData, state, setState, notifications, setNotifications, recentActivities, setRecentActivities}) => {

    const ItemList = Shared.LinkList

    return (
        <div className="notificationsContainer">
            <ItemList
                data={data}
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