import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/pages/sharedComponents/Item.css'

import * as Shared from '../sharedComponents'
import * as Items from '../../Items'

const Item = ({userData, data, setData, activities, setActivities, state, setState, item, index, type, rights, recentActivities, setRecentActivities }) => {
    
    const ItemComponent = Items[type]

    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({ id: item._id })

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    const handleAddAfter = (_id) => {

        const parent = Shared.GetItemById(data, state.currentProject)
        const newId = [parent._id, parent.dndCount].join(".")

        setState(prev => ({
            ...prev,
            currentDialog: {
                name: 'AddEditItem',
                params: [true, newId]
            }
        }))
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
            <button
                className="add-button"
                onClick={(e) => {
                e.stopPropagation()
                handleAddAfter(item._id)
                }}
            >
                ➕
            </button>
            {/* 🔘 DRAG HANDLE (6-dots) */}
            <div
                className="drag-handle"
                // {...provided.dragHandleProps}
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
                setActivities={setActivities}
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