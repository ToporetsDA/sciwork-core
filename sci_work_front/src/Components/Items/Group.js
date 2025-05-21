import '../../css/Items/Group.css'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

const Group = ({userData, data, setData, activities, state, setState, item, index, rights, recentActivities, setRecentActivities}) => {

    // console.log("item in Group component", activities)
    return (
        <div
            className='group-wrapper'    
        >
            {/* <Items.Text
                key={item._id}
                userData={userData}
                data={data}
                setData={setData}
                activities={activities}
                setActivities={setActivities}
                state={state}
                setState={setState}
                item={item}
                index={index}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            /> */}
            <Shared.ItemTiles
                userData={userData}
                data={data}
                setData={setData}
                activities={activities}
                state={state}
                setState={setState}
                itemsToDisplay={item.activities}
                container={Shared.GetItemById(data, state.currentProject)}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    )
}

export default Group