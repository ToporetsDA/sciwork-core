import { useEffect } from 'react'
import '../../css/components/pages/Notifications.css'

import * as Shared from './sharedComponents'

const Notifications = ({
    userData, setUserData,
    state, setState,
    projects, 
    activities,
    setData,
    rights,
    users, setUsers,
    notifications, setNotifications,
    recentActivities, setRecentActivities
}) => {
    
    //need to set all unseen notifications as seen on component close/unmount (user uses navigate through whatever way)
    // useEffect(() => {
    //     setNotifications
    // }, [])

    const changeNotificationState = (id) => {
        setNotifications((prevNotifications) => ([
            ...prevNotifications.map(n => {
                console.log("note", n, id)
                if (n._id === id) {
                    return {
                        ...n,
                        state: "read"
                    }
                }
                else {
                    return n
                }
            })
        ]))
    }

    const notificationsToDisplay = notifications.map(n => {
        //here replace state field with div of style=n.state
        return n
    })

    return (
        <div className="notificationsContainer .page-wrapper-no-cp">
            <Shared.ItemTable
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                itemsToDisplay={notificationsToDisplay}
                itemKeys={["state", "name", "generationTime", "generationDate"]}
                //itemTypes
                editable={false}
                isItem={false}
                linkActions={changeNotificationState}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    );
}

export default Notifications