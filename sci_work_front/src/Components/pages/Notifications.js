import React from 'react'
import '../../css/pages/Notifications.css'

import * as Shared from './sharedComponents/index'

const Notifications = ({data, setData, state, setState, notifications, setNotifications, RecentActivities, setRecentActivities}) => {

    const ItemList = Shared.LinkList

    return (
        <div className="notificationsContainer">
            <ItemList
                data={data}
                state={state}
                setState={setState}
                list={notifications}
                setList={setNotifications}
                RecentActivities={RecentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    );
}

export default Notifications