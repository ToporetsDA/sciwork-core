import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/pages/sharedComponents/Item.css'

import * as Items from '../../Items'

/*const handleAddAfter = (_id) => {

    const parts = _id.split(".");
    const itemId = Number(parts.pop()) + 1
    const newId = [...parts, itemId.toString()].join(".")

    setState(prev => ({
        ...prev,
        currentDialog: {
            name: 'AddEditItem',
            params: [true, newId] // You’ll need to support this index in the dialog
        }
    }))
}*/

const Item = ({userData, data, setData, state, setState, item, index, rights, recentActivities, setRecentActivities }) => {
    
    const ItemComponent = Items[item.type]

    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({ id: item.dnd })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    return (
        <div
            className='activity-item'
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
        >
            {/* ➕ Add below button */}
            {<button
                className="add-button"
                onClick={(e) => {
                e.stopPropagation()
                // handleAddAfter(item._id)
                }}
            >
                ➕
            </button>}
            {/* 🔘 DRAG HANDLE (6-dots) */}
            {<div
                className="drag-handle"
                // {...provided.dragHandleProps}
                onClick={(e) => e.stopPropagation()}
            >
                ⋮⋮
            </div>}
            <ItemComponent
                key={item._id}
                userData={userData}
                data={data}
                setData={setData}
                state={state}
                setState={setState}
                item={item}
                index={index}
                rights={rights}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        </div>
    )
}

export default Item