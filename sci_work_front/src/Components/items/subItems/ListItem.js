import React from 'react'
import '../../../css/items/subItems/ListItem.css'

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
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    // console.log("List item", item)

    const activity = Shared.GetItemById(activities, containerId)

    const fieldsToRender = activity.content?.liStructure

    const saveChanges = (key, value, activity, index) => {

        const updatedActivity = Shared.SetFieldValue(
            activity,
            `listItems.${index}.${key}`,
            value
        )

        setData({action: "content", item: {type: "List", activity: updatedActivity}})
    }

    // get now "hh:mm"
    const getTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getField = (key, type) => {
        
        switch(type) {
            case "checkbox": {
                return (
                    <div
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
                const markable = activity?.content.listItems[index].markable
                const markableFields = ["checker" ,"name", "middleName", "surName", "patronimic"]
                const markableTypes = {
                    name: 'plain',
                    middleName: 'plain',
                    surName: 'plain',
                    patronimic: 'plain',
                    checker: 'checker'
                }
                console.log("markable item", markable)
                    
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
                        ) : (//other users see checkbox
                            <>
                                {(item[key][0] === false) ? (//if not checked - show checkbox
                                    <input
                                        type="checkbox"
                                        checked={item[key][0] || false}
                                        onChange={(e) => {saveChanges(key, [e.target.checked, getTime()], activity, index)}}
                                    />
                                ) : (//if checked - show time of it being checked
                                    <>
                                        {item[key][1]}
                                    </>
                                )}
                            </>
                        )
                        }
                    </div>
                )
            }
            default: {
                return
            }
        }
    }

    return (
        <li className="listItem-wrapper">
            {Object.entries(fieldsToRender).map(([key, type]) => (
                getField(key, type)
            ))}
        </li>
    )
}

export default ListItem