import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/pages/sharedComponents/Item.css'

import * as Shared from './'
import * as Items from '../../Items'

const Item = ({
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

    const handleAddAfter = (_id) => {

        const project = Shared.GetItemById(projects, state.currentProject)
        const newId = project._id + '.' + project.dndCount

        setState(prev => ({
            ...prev,
            currentDialog: {
                name: 'AddEditItem',
                params: [true, newId, index, containerId]
            }
        }))
    }

    return (
        <div
            className={'activity-item'}
            ref={setNodeRef}
            {...attributes}
            style={style}
        >
            {/* ➕ Add below button */}
            {<button
                className="add-button"
                onClick={(e) => {
                e.stopPropagation()
                handleAddAfter(item._id)
                }}
            >
                ➕
            </button>}
            <>
                {item !== true &&
                    <>
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
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        item={item}
                        containerId={containerId}
                        rights={rights}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                </>
                }
            </>
        </div>
    )
}

export default Item