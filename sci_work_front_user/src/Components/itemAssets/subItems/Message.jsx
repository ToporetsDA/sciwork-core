import { useContext } from 'react'

import '../../../Styles/components/itemAssets/Message.sass'

import { getItemById } from '../../../lib/helpers'

import { AppContext } from '../../pageAssets/shared'
// import * as Items from '../../items'

const Message = ({
    item
}) => {

    const {
        userData,
        users
    } = useContext(AppContext)

    const getSender = (id) => {
        const user = getItemById(users, id)
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