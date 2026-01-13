// Libraries
import { useContext }  from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
// Styles, Classes, Constants
import '../../../css/components/pages/shared/Item.css'
import { ITEM_TYPES } from '../../../constants'
// Methods, Components
import * as Shared from "./"
import * as Items from '../../items'
import * as SubItems from '../../items/subItems'

const Item = ({
    item,
    index,
    containerId,
    containerType
}) => {

    const {
        userData,
        projects,
        setState,
        rights
    } = useContext(Shared.AppContext)

    const isItem = (item !== true)
    //if there are no Items in project - ➕ Add below button is always visible
    const classCondition = (!isItem && index === 0)

    const getComponentType = () => {
        const itemsType = ITEM_TYPES[item.type] || "Dev"
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
        return rights[type].includes(Shared.getAccess(accessibleItem, userData))
    }

    const getProjectAccess = (rights, type, item, userData) => {
        return getAccess(rights, type, Shared.getItemById(projects, item._id.split('.')[0]), userData)
    }

    const noActions = ["Chat"]

    const accessCheck = () => {
        const parts = item._id.split('.')
        const project = Shared.getItemById(projects, parts[0])
        const projectAccess = getAccess(rights, "fullView", project, userData)
        const { item: activity } = Shared.findItemWithParent(project.activities, "_id", parts[0] + '.' + parts[1], project)
        const activityView = (parts.length > 2) ? getAccess(rights, "fullView", activity, userData) : null
        const activityInteract = (parts.length > 2) ? getAccess(rights, "interact", activity, userData) : null
        
        const result = (item === true)
            ? item?.deleted
                ? (parts.length > 2)
                    ? activityView
                    : projectAccess
                : item?.userList?.some(user => user.id === userData._id) || activityInteract
            : true
        
        return result
    }

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
                            item={item}
                        />
                    }
                    {item?.deleted ? (
                        <p>{item?.name || item._id}</p>
                    ) : (
                        <ItemComponent
                            key={item._id}

                            item={item}
                            index={index}
                            containerId={containerId}
                            containerType={containerType}
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