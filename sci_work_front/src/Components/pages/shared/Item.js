import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import '../../../css/components/pages/shared/Item.css'

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
        Text: "Text",
        List: "List",
        Table: "List",
        Attendance: "List",
        Report: "List",
        Chat: "Chat",
        Page: "Dev"
    }

    const isItem = (item !== true)
    //if there are no Items in project - ➕ Add below button is always visible
    const classCondition = (!isItem && index === 0)

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
                case "Text": {
                    console.log(item._id, "is text")
                    type = Items[itemsType]
                    break
                }
                case "Attendance":
                case "Table"://separate from ItemTiles
                case "Report":
                case "List": {
                    type = SubItems.ListItem
                    break
                }
                case "Chat": {
                    type = SubItems.Message
                    break
                }
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

    const getAccess = (rights, type, accessibleItem, userData) => {
        console.log("getAccess", item._id, rights, type, accessibleItem, userData)
        return rights[type].includes(Shared.getAccess(accessibleItem, userData))
    }

    const getProjectAccess = (rights, type, item, userData) => {
        console.log("getProjectAccess", item._id, rights, type, item, userData)
        return getAccess(rights, type, Shared.getItemById(projects, item._id.split('.')[0]), userData)
    }

    const accessCheck = () => {
        const parts = item._id.split('.')
        const project = Shared.getItemById(projects, parts[0])
        const projectAccess = getAccess(rights, "fullView", project, userData)
        return (parts.length > 2)
            ? projectAccess
            : item?.deleted
                ? projectAccess
                : item?.userList.some(user => user.id === userData._id)
    }

    const noActions = ["Chat"]

    const deleted = item?.deleted ? "deleted" : ""

    return accessCheck ? (
        <div
            className={`activity-item ${deleted}`}
            ref={setNodeRef}
            {...attributes}
            style={style}
        >
            {!noActions.includes(containerType) &&
                <div
                    className='item-actions'
                >
                    {/* ➕ Add below button */}
                    {(isItem ? getProjectAccess(rights, "edit", item, userData) : true) &&
                        Shared.getDialogButton(
                            setState,
                            `add-button ${classCondition ? 'button-mini' : 'button-tool'}`,
                            (!['List', 'Attendance', 'Report'].includes(containerType)) ? 'AddEditItem' : 'AddEditContent',
                            [true, false, index, containerId, "Add Item"],
                            "➕",
                            false
                        )
                    }
                    {(isItem ? getProjectAccess(rights, "edit", item, userData) : true) && /* 🔘 DRAG HANDLE (6-dots) */
                        <div
                            className="drag-handle button-tool"
                            {...listeners}
                            onClick={(e) => e.stopPropagation()}
                        >
                            ⋮⋮
                        </div>
                    }
                </div>
            }
            
            {isItem && accessCheck() &&
                <>
                    {!noActions.includes(containerType) &&
                        <Shared.ItemActions
                            userData={userData}
                            projects={projects}
                            setData={setData}
                            setState={setState}
                            item={item}
                            rights={rights}
                        />
                    }
                    {item?.deleted ? (
                        <p>{item?.name || item._id}</p>
                    ) : (
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
                    )
                    }
                </>
            }
        </div>
    ) : (
        <></>
    )
}

export default Item