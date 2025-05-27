import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/pages/sharedComponents/Item.css'

import * as Items from '../../Items'

const Item = ({
    userData,
    data, setData,
    activities,
    state, setState,
    item,
    containerId,
    rights,
    recentActivities, setRecentActivities
}) => {
    
    const ItemComponent = Items[item.type]

    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: item._id, 
        data: {
            type: (!containerId.includes('.')) ? "Group" : "item"
        }
    })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: (isDragging) ? 0.5 : 1
    }

    // const handleAddAfter = (_id) => {

    //     const parent = Shared.GetItemById(data, state.currentProject)
    //     const newId = [parent._id, parent.dndCount].join(".")

    //     setState(prev => ({
    //         ...prev,
    //         currentDialog: {
    //             name: 'AddEditItem',
    //             params: [true, newId]
    //         }
    //     }))
    // }

    return (
        <div
            className={'activity-item'}
            ref={setNodeRef}
            {...attributes}
            style={style}
        >
            {/* ➕ Add below button */}
            {/* <button
                className="add-button"
                onClick={(e) => {
                e.stopPropagation()
                // handleAddAfter(item._id)
                }}
            >
                ➕
            </button> */}
            {/* 🔘 DRAG HANDLE (6-dots) */}
            <div
                className="drag-handle"
                {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                ⋮⋮
            </div>
            <ItemComponent
                key={item._id}
                userData={userData}
                data={data}
                setData={setData}
                activities={activities}
                state={state}
                setState={setState}
                item={item}
                containerId={containerId}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    )
}

export default Item