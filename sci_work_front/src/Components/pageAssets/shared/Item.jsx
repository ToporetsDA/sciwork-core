// Libraries
import { useContext }  from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import '../../../Styles/components/pageAssets/shared/Item.sass'

import { ACTIVITY_TYPES, SUB_ACTIVITY_TYPES, NO_ACTIONS_CONTAINER } from '../../../lib/constants'
import { getDialogButton, getItemById} from '../../../lib/helpers'

import { AppContext, ItemActions } from "."

import * as Items from '../../items'
import * as SubItems from '../../itemAssets/subItems'

const Item = ({
    item,
    index,
    containerId,
    containerType
}) => {

    const {
        userData,
        projects,
        setDialog,
        rights
    } = useContext(AppContext)

    const isItem = (item !== true)
    //if there are no Items in project ➕ Add below button is always visible
    const classCondition = (!isItem && index === 0)

    const project = getItemById(projects, item?._id.split('.')[0])
    
    const ItemComponent = Items[ACTIVITY_TYPES[item.type]] ?? SubItems[SUB_ACTIVITY_TYPES[item.type]] ?? Items["Dev"]

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

    const accessCheck = () => {
        const parts = item._id.split('.')
        const project = getItemById(projects, parts[0])
        const projectAccess = project.getAccessType(rights.fullView, userData)
        const activityView = (parts.length > 2) ?
            project.getAccessType(rights.fullView, userData, parts[0] + '.' + parts[1])
            : null
        const activityInteract = (parts.length > 2) ?
            project.getAccessType(rights.interact, userData, parts[0] + '.' + parts[1])
            : null
        
        const result = (item === true)
            ? item?.deleted
                ? (parts.length > 2)
                    ? activityView
                    : projectAccess
                : item.hasAccess(userData) || activityInteract
            : true
        
        return result
    }

    const deleted = item?.deleted ? "deleted" : ""

    return accessCheck() ? (
        <div
            className={`activity-item ${deleted}`}
            ref={setNodeRef}
            {...attributes}
            style={style}
        >
            {!NO_ACTIONS_CONTAINER.includes(containerType) &&
                <div
                    className='item-actions'
                >
                    {/* ➕ Add below button */}
                    {(isItem ? project.getAccessType(rights.edit, userData) : true) &&
                        getDialogButton(
                            setDialog,
                            `add-button ${classCondition ? 'button-mini' : 'button-tool'}`,
                            (!['List', 'Attendance', 'Report'].includes(containerType)) ? 'AddEditItem' : 'AddEditContent',
                            [true, false, index, containerId, "Add Item"],
                            "➕",
                            false
                        )
                    }
                    {(isItem ? project.getAccessType(rights.edit, userData) : true) && /* 🔘 DRAG HANDLE (6-dots) */
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
                    {!NO_ACTIONS_CONTAINER.includes(containerType) &&
                        <ItemActions
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