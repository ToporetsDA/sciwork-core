import React from 'react'
import '../../../css/components/items/subItems/Message.css'

import * as Shared from '../../pages/shared'
import * as Items from '../../items'

const Message = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    item,
    index,
    containerId,
    containerType,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const getSender = (id) => {
        const user = Shared.getItemById(users, id)
        return user.name + " " + user.middleName + " " + user.surName + " " + user.patronimic
    }

    return (
        <div className={`message ${userData._id === item.sender ? 'message-own' : ''}`}>
            { userData._id !== item.sender &&
                <div className="sender">{getSender(item.sender)}</div>
            }
            <div className="content">{item.content}</div>
            <div className="date-time">{item.dateTime}</div>
        </div>
    )
}

export default Message