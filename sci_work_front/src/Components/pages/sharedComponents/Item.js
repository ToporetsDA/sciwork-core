import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/pages/sharedComponents/Item.css'

import * as Items from '../../items'
import * as SubItems from '../../items/subItems'

const Item = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    item,
    index,
    containerId,
    containerType,
    rights,
    recentActivities, setRecentActivities
}) => {

    const isItem = (item !== true)

    const getComponentType = () => {
        let type
        if (isItem) {
            switch (containerType) {
                // Project
                case "Project": {
                    type = Items[item.type]
                    break
                }
                // activities
                case "Group": {
                    type = Items[item.type]
                    break
                }
                case "List":
                case "Table":
                case "Attendance": {
                    type = SubItems.ListItem
                    break
                }
                // case "Report": //maybe stored files
                // case "Chat": {
                //     type = SubItems.Message
                //     break
                // }
                // case "Test": {
                //     type = SubItems.Question
                //     break
                // }
                // subActivities
                default: {
                    console.warn(`Unknown item type: ${item?.type} in container: ${containerType}`)
                    type = Items.Dev
                }
            }
        }
        return type
    }
    
    const ItemComponent = getComponentType()

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

    const handleAddAfter = () => {
        console.log("containerType", containerType)
        setState(prev => ({
            ...prev,
            currentDialog: {
                name: (containerType !== 'List') ? 'AddEditItem' : 'AddEditContent',
                params: [true, false, index, containerId]
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
                handleAddAfter()
                }}
            >
                ➕
            </button>}
            <>
                {isItem &&
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