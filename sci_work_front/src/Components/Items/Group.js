import { useState } from 'react'
import '../../css/components/items/Group.css'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

/*structure
activity: {
    _id
    name
    template
    content: {
        currentSettings: {}
        name
    }
}
*/

const Group = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    item,
    rights,
    recentActivities,
    setRecentActivities
}) => {

    const [showActivities, setShowActivities] = useState(true)

    const toggleActivities = () => {
        setShowActivities(prev => !prev)
    }

    // console.log("item in Group component", activities)
    return (
        <div
            className='wrapper'    
        >
            {<Items.Text
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                item={item}
                data={"name"}
                rights={rights}
            />}
            <button
                className="group-toggle-button"
                onClick={toggleActivities}
            >
                {showActivities ? 'Hide' : 'Show'}
            </button>
            {showActivities &&
                <Shared.ItemTiles
                    userData={userData}
                    projects={projects}
                    activities={activities}
                    setData={setData}
                    state={state}
                    setState={setState}
                    itemsToDisplay={item.activities}
                    containerId={item._id}
                    containerType={item.type}
                    rights={rights}
                    recentActivities={recentActivities}
                    setRecentActivities={setRecentActivities}
                />
            }
        </div>
    )
}

export default Group