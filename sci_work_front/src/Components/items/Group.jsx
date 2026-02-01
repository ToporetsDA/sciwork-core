import { useState } from 'react'

import '../../Styles/components/items/Group.sass'

import { ItemTiles } from '../pageAssets/shared'

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
    item
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
            {item?.name}
            <button
                className="group-toggle-button"
                onClick={toggleActivities}
            >
                {showActivities ? 'Hide' : 'Show'}
            </button>
            {showActivities && !item?.deleted &&
                <ItemTiles
                    itemsToDisplay={item.activities}
                    containerId={item._id}
                    containerType={item.type}
                />
            }
        </div>
    )
}

export default Group