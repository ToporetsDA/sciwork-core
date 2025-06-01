import '../../css/Items/Group.css'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

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
                key={item._id}
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