import { useEffect, useContext } from 'react'
import '../../css/components/pages/Notifications.css'

import * as Shared from './shared'

const Notifications = () => {

    const {
        notifications, setNotifications
    } = useContext(Shared.AppContext)
    
    useEffect(() => {
        return () => {
            setNotifications(prev => (
                prev.map(n => n.state === "unseen"
                    ? { ...n, state: "seen" }
                    : n)
            ))
        }
    }, [setNotifications])

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
        <div className="notifications-container .page-wrapper-no-cp">
            <Shared.ItemTable
                itemsToDisplay={notificationsToDisplay}
                itemKeys={["state", "name", "generationTime", "generationDate"]}
                //itemTypes
                editable={false}
                isItem={false}
                linkActions={changeNotificationState}
            />
        </div>
    )
}

export default Notifications