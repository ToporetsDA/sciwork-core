import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/pages/sharedComponents/Item.css'

import * as Shared from "./"
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
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const types = {
        Dev: "Dev",
        Group: "Group",
        List: "List",
        Table: "List",
        Attendance: "List",
        Report: "Report",
        Chat: "Chat",
        Page: "Dev"
    }

    const isItem = (item !== true)

    const getComponentType = () => {
        const itemsType = types[item.type] || "Dev"
        let type
        if (isItem) {
            switch (containerType) {
                case "Dev": {
                    type = Items.Dev
                    break
                }
                // Project
                case "Project": {
                    type = Items[itemsType]
                    break
                }
                // activities
                case "Group": {
                    type = Items[itemsType]
                    break
                }
                case "Attendance":
                case "Table"://separate from ItemTiles
                case "List": {
                    type = SubItems.ListItem
                    break
                }
                case "Chat": {
                    type = Items[itemsType]
                    break
                }
                // case "Report": //save comment, save files on private server instances to client's storage
                // case "Test": {
                //     type = SubItems.Question
                //     break
                // }
                // subActivities
                default: {
                    console.warn(`Unknown item type: ${item?.type} in container: ${containerType}`)
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

    const parts = item._id.split('.')
    const accessCheck = (parts.length > 2) ? true : item?.userList.some(user => user.id === userData._id)

    return (
        <div
            className={'activity-item'}
            ref={setNodeRef}
            {...attributes}
            style={style}
        >
            {/* ➕ Add below button */}
            {Shared.GetDialogButton(
                setState,
                "add-button",
                (!['List', 'Attendance'].includes(containerType)) ? 'AddEditItem' : 'AddEditContent',
                [true, false, index, containerId, "Add Item"],
                "➕",
                false
            )}
            <>
                {isItem && accessCheck &&
                    <>
                    {/* 🔘 DRAG HANDLE (6-dots) */}
                    <div
                        className="drag-handle"
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                    >
                        ⋮⋮
                    </div>
                    <Shared.ItemActions
                        userData={userData}
                        projects={projects}
                        setData={setData}
                        setState={setState}
                        item={item}
                        rights={rights}
                    />
                    <ItemComponent
                        key={item._id}
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        item={item}
                        index={index}
                        containerId={containerId}
                        containerType={containerType}
                        rights={rights}
                        users={users}
                        setUsers={setUsers}
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