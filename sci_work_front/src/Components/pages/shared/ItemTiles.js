// Libraries
import { useContext }  from 'react'
import { SortableContext } from '@dnd-kit/sortable'
// Styles, Classes, Constants
import '../../../css/components/pages/shared/ItemTiles.css'
import { ITEM_TYPES_LIST_BASED } from '../../../constants'
// Methods, Components
import * as Shared from './'
import * as Items from '../../items'

const ItemTiles = ({
    itemsToDisplay,
    containerId,
    containerType
}) => {

    const {
        userData,
        projects,
        state,
        rights
    } = useContext(Shared.AppContext)

    const getItem = (item, index, dnd) => {
        const Component = (dnd) ? Shared.Item : Items.Project
        return (
            <Component
                key={item._id}
                
                item={item}
                index={index}
                containerId={containerId}//
                containerType={containerType}//
            />
        )
    }
    
    const getAccess = () => {
        const parts = containerId?.split('.')
        if (!parts) {
            return rights.edit.includes(userData.genStatus)
        }
        const project = Shared.getItemById(projects, parts[0])
        const { item: activity } = Shared.findItemWithParent(project.activities, "_id", containerId, project)
        const access = (parts.length === 1)
            ? Shared.getAccess(project, userData)
            : Shared.getAccess(activity, userData)
        return rights.edit.includes(access)
    }

    const noItems = itemsToDisplay.length === 0
    const canEdit = getAccess()
    const noParent = !containerId
    const isInContainerItem = containerType === "Group"
    const isInListBasedItem = ITEM_TYPES_LIST_BASED.includes(containerType)

    return (
        <>
            {(state.currentPage === "Projects" /*|| !rights.edit.includes(getAccess(container))*/) ?
                (
                    itemsToDisplay.map((item, index) => (
                        getItem(item, index, false)
                    ))
                ) : (
                    <div
                        className="item-tiles"
                    >
                        <SortableContext items={itemsToDisplay.map((i) => i._id)}>
                            {itemsToDisplay.map((item, index) => (
                                getItem(item, index, true)
                            ))}
                            {noItems && canEdit && (!noParent || isInContainerItem || isInListBasedItem) &&
                                getItem(true, 0, true)
                            }
                        </SortableContext>
                    </div>
                )
            }
        </>
    )
}

export default ItemTiles