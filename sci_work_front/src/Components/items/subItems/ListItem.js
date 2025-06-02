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

    return (
        <div className="listItem-wrapper">
            <Items.Text
                key={item._id}
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                item={item}
                data="content"
                rights={rights}
            />
        </div>
    )
}

export default ListItem