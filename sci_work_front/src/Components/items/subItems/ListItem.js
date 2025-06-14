import { useState } from 'react'
import '../../../css/components/items/subItems/ListItem.css'

import * as Shared from '../../pages/sharedComponents'
import * as Items from '../../items'

const ListItem = ({
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

    const activity = Shared.GetItemById(activities, containerId)

    const parts = containerId.split('.')
    const project = Shared.GetItemById(projects, parts[0])
    const {item: metaActivity} = Shared.FindItemWithParent(project.activities, "_id", containerId, project)

    const fieldsToRender = activity.content?.liStructure

    //for Report activity
    const [reportInput, setReportInput] = useState("")

    const saveChanges = (key, value, activity, index) => {

        const updatedActivity = Shared.SetFieldValue(
            activity,
            `listItems.${index}.${key}`,
            value
        )
        console.log("mark", key, value, updatedActivity)
        setData({action: "content", item: {type: "List", activity: updatedActivity}})
    }

    // get now "hh:mm"
    const getTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const handleMarkable = (key) => {

        const markable = activity?.content.listItems[index].markable
        const markableFields = ["checker" ,"name", "middleName", "surName", "patronimic"]
        const markableTypes = {
            name: 'plain',
            middleName: 'plain',
            surName: 'plain',
            patronimic: 'plain',
            checker: 'checker'
        }

        //allow marking if in time window
        const now = new Date()

        const allowedDay = new Date(markable.date)

        const start = new Date(allowedDay)
        const [startHours, startMinutes] = markable.startTime.split(":").map(Number)
        start.setHours(startHours, startMinutes, 0, 0)

        const end = new Date(allowedDay)
        const [endHours, endMinutes] = markable.endTime.split(":").map(Number)
        end.setHours(endHours, endMinutes, 0, 0)
        
        const inTimeWindow = (start < now ) && (now < end)

        const entryIndex = markable.userEntries.findIndex(e => e._id === userData._id)
        const keyPath = [key, "userEntries", entryIndex, "checker"].join('.')
        const check = markable?.userEntries[entryIndex]?.checker
            
        return (
            <div
                key={item._id + '.' + key}
            >
                <>
                    Markable for {markable.startTime}-{markable.endTime} on {markable.date}
                </>
                {(userData._id === item.creatorId) ? (//creator sees if other users left mark
                    <Shared.ItemTable
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        itemsToDisplay={markable.userEntries}
                        itemKeys={markableFields}
                        itemTypes={markableTypes}
                        nested={false}
                        rights={rights}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                ) : (containerType !== "Report") ? (//other users see checkbox
                        <>
                            {(!check[0]) ? (//if not checked - show checkbox
                                <input
                                    type="checkbox"
                                    checked={check[0] || false}
                                    disabled={!inTimeWindow}
                                    onChange={(e) => {saveChanges(keyPath, [e.target.checked, getTime()], activity, index)}}
                                />
                            ) : (//if checked - show time of it being checked
                                <>
                                    {check[1]}
                                </>
                            )}
                        </>
                    ) : (//other users see field(s) to save comment (and report, if it's private server with storage)
                        <div className="chat-input-row" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <input
                                type="text"
                                value={reportInput}
                                onChange={(e) => setReportInput(e.target.value)}
                                placeholder="Enter message"
                                style={{ flexGrow: 1 }}
                            />
                            {(!check[0]) ? (//if no saved value or editing
                                <button
                                    onClick={(e) => {saveChanges(keyPath, [true, getTime(), reportInput], activity, index)}}
                                >
                                    Save
                                </button>
                            ) : (//if already saved
                                <button
                                    onClick={(e) => {check[0] = false}}
                                >
                                    Edit
                                </button>
                            )
                            }
                        </div>
                    )
                }
            </div>
        )
    }

    const getField = (key, type) => {
        
        switch(type) {
            case "checkbox": {
                return (
                    <div
                        className='checkbox-wrapper'
                        key={item._id + '.' + key}
                    >
                        <p>{key}</p>
                        <input
                            type="checkbox"
                            checked={item[key] || false}
                            onChange={(e) => {saveChanges(key, e.target.checked, activity, index)}}
                        />
                    </div>
                )
            }
            case "text": {
                return (
                    <Items.Text
                        key={item._id + '.' + key}

                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        item={item}
                        data={`listItems.${index}.${key}`}
                        rights={rights}
                    />
                )
            }
            case "markable": {
                return handleMarkable(key)
            }
            default: {
                return
            }
        }
    }

    return (metaActivity.type === "List") ? (
        <li className="wrapper listItem">
            {Object.entries(fieldsToRender).map(([key, type]) => (
                getField(key, type)
            ))}
        </li>
    ) : (
        <div className="wrapper listItem">
            {Object.entries(fieldsToRender).map(([key, type]) => (
                getField(key, type)
            ))}
        </div>
    )
}

export default ListItem