// Libraries
import { useState, useContext } from 'react'
// Styles, Classes, Constants
import { createMessage } from '../../classes'
// Methods, Components
import * as Shared from '../pages/shared'

const Chat = ({
    item
}) => {

    const {
        userData,
        activities,
        setData
    } = useContext(Shared.AppContext)

    const activity = Shared.getItemById(activities, item._id)
    //will need to save tmp message as "sending..."

    const [chatInput, setChatInput] = useState("")

    const formatDate = (date) => {
        const pad = n => String(n).padStart(2, '0')

        const hours = pad(date.getHours())
        const minutes = pad(date.getMinutes())
        const day = pad(date.getDate())
        const month = pad(date.getMonth() + 1) // Months are 0-indexed
        const year = date.getFullYear()

        return `${hours}:${minutes}-${day}.${month}.${year}`
    }

    const handleAddMessage = () => {
        const trimmed = chatInput.trim()
        if (!trimmed) return

        const date = formatDate(new Date())

        const newMessage = createMessage(activity, userData, trimmed, date)

        activity.content.messageCount++
        activity.content.listItems.push(newMessage)

        setData({ action: "content", item: { type: "Chat", activity } })
        setChatInput("") // clear input after sending
    }

    console.log("messages", activity?.content?.listItems)

    return (
        <div className="wrapper">
            {item?.name}
            <Shared.ItemTiles
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