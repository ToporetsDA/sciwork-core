// Libraries
import { useState } from 'react'
// Styles, Classes, Constants
import '../../css/components/items/Group.css'
// Methods, Components
import * as Shared from '../pages/shared'

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
                <Shared.ItemTiles
                    itemsToDisplay={item.activities}
                    containerId={item._id}
                    containerType={item.type}
                />
            }
        </div>
    )
}

export default Group