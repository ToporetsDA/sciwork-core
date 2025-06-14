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
    
    useEffect(() => {
        return () => {
            setNotifications(prev => (
                prev.map(n => n.state === "unseen"
                    ? { ...n, state: "seen" }
                    : n)
            ))
        }
    }, [])

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

    const getStateDiv = (state) => {
        return (
            <div className={`notification-state ${state}`}>
                {(state === "unread") &&
                    <div className="notification-circle"></div>
                }
                {state}
            </div>
        )
    }

    const notificationsToDisplay = notifications.map(n => {
        return {
            ...n,
            state: getStateDiv(n.state)
        }
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
    )
}

export default Notifications