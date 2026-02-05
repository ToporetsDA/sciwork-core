import { useContext } from 'react'
import { useTranslation } from "react-i18next"

import '../../Styles/components/pages/Notifications.sass'

import { AppContext, ItemTable } from '../pageAssets/shared'

const Notifications = () => {

    const {
        navigate,
        notifications, setNotifications
    } = useContext(AppContext)

    const { t } = useTranslation("pages.notifications")

    // ==================================
    // notification logic management
    // ==================================

    const changeNotificationState = (id) => {
        setNotifications((prevNotifications) => ([
            ...prevNotifications.map(n => {
                if (n._id === id) {
                    const copy = new Notification(
                        n._id,
                        "read",
                        n.page,
                        n.content,
                        new Date(`${n.generationDate}T${n.generationTime}:00`)
                    )
                return copy
                }
                else {
                    return n
                }
            })
        ]))
    }

    const handleClick = (id) => {
        navigate(`/Projects/${id}`)
        changeNotificationState(id)
    }

    // ==================================
    // notification display management
    // ==================================

    const getStateDiv = (state) => {
        return (
            <div className={`notification-state ${state}`}>
                {(state === "seen") &&
                    <div className="notification-circle"></div>
                }
                {t(`state.${state}`)}
            </div>
        )
    }

    const notificationsToDisplay = notifications.map(n => {
        return {
            ...n,
            state: getStateDiv(n.state)
        }
    })

    // ==================================

    return (
        <div className="notifications-container .page-wrapper-no-cp">
            <ItemTable
                itemsToDisplay={notificationsToDisplay}
                itemKeys={["state", "name", "generationTime", "generationDate"]}
                //itemTypes
                editable={false}
                isItem={false}
                linkActions={handleClick}
            />
        </div>
    )
}

export default Notifications