import React from 'react'
import '../../../css/components/items/subItems/ListItem.css'

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

    const activity = Shared.getItemById(activities, containerId)

    const parts = containerId.split('.')
    const project = Shared.getItemById(projects, parts[0])
    const {item: metaActivity} = Shared.findItemWithParent(project.activities, "_id", containerId, project)

    const fieldsToRender = activity.content?.liStructure

    const getField = (key, type) => {
        
        return
    }

    return (
        <>
            {item?._id}
        </>
    )
}

export default Message