import { useState, useContext } from 'react'

import '../../Styles/components/items/Chat.sass'

import { createMessage } from '../../lib/classes'
import { getItemById } from '../../lib/helpers'

import { AppContext, ItemTiles } from '../pageAssets/shared'

const Chat = ({
    item
}) => {

    const {
        activityId,
        userData,
        activities,
        setData
    } = useContext(AppContext)

    // ==================================
    // const, helpers and state management
    // ==================================

    const activity = getItemById(activities, activityId)
    //will need to save tmp message as "sending..."

    const [chatInput, setChatInput] = useState("")

    // --- helpers ---

    const formatDate = (date) => {
        const pad = n => String(n).padStart(2, '0')

        const hours = pad(date.getHours())
        const minutes = pad(date.getMinutes())
        const day = pad(date.getDate())
        const month = pad(date.getMonth() + 1) // Months are 0-indexed
        const year = date.getFullYear()

        return `${hours}:${minutes}-${day}.${month}.${year}`
    }

    // ==================================
    // chat logic
    // ==================================

    const handleAddMessage = () => {
        const trimmed = chatInput.trim()
        if (!trimmed) {
            return
        }

        const date = formatDate(new Date())
        const newMessage = createMessage(activity, userData, trimmed, date)

        setData({
            domain: "activities",
            id: activity._id,
            recipe: (draft) => {
                draft.content.messageCount++
                draft.content.listItems.push(newMessage)
            }
        })

        setChatInput("") // clear input after sending
    }

    // ==================================

    // console.log("messages", activity?.content?.listItems)
    return (
        <div className="wrapper">
            {item?.name}
            <ItemTiles
                itemsToDisplay={activity?.content?.listItems || []}
                containerId={item._id}
                containerType={item.type}
            />
            <div className="chat-input-row" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Enter message"
                    style={{ flexGrow: 1 }}
                />
                <button
                    className='button-main'
                    onClick={handleAddMessage}
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default Chat