import '../../css/items/Group.css'

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

    // console.log("item in Group component", activities)
    return (
        <div
            className='group-wrapper'    
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
            <Shared.ItemTiles
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                itemsToDisplay={item.activities}
                containerId={item._id}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    )
}

export default Group