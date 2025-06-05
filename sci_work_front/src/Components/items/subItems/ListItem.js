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