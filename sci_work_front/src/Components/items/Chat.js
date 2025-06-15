import { useState } from 'react'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

const List = ({
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

    // const activity = Shared.GetItemById(activities, item._id)
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

        const newMessage = {
            // _id: `${activity._id}.${activity.content?.messageCount}`,
            sender: userData._id,
            content: trimmed,
            dateTime: date
        }

        // updatedActivity.content.messageCount++
        // updatedActivity.content.listItems.push(newMessage)

        setData({ action: "content", item: { type: "Chat", activity: newMessage } })
        setChatInput("") // clear input after sending
    }


    return (
        <div className="wrapper">
            <Shared.ItemTiles
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                itemsToDisplay={[]}
                containerId={state.currentProject}
                containerType={item}
                rights={rights}
                users={users}
                setUsers={setUsers}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
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

export default List