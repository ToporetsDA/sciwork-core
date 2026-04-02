import { useContext }  from 'react'
import { SortableContext } from '@dnd-kit/sortable'

import '../../../Styles/components/pageAssets/shared/ItemTiles.sass'

import { ITEM_TYPES_LIST_BASED } from '../../../lib/constants'
import { getItemById } from '../../../lib/helpers'

import { AppContext, Item } from '.'
import * as Items from '../../items'

const ItemTiles = ({
    itemsToDisplay,
    containerId,
    containerType
}) => {

    const {
        currentPage,
        userData,
        projects,
        rights
    } = useContext(AppContext)

    // ==================================
    // const, helpers and state management
    // ==================================

    const noItems = itemsToDisplay.length === 0
    const noParent = !containerId
    const isInContainerItem = containerType === "Group"
    const isInListBasedItem = ITEM_TYPES_LIST_BASED.includes(containerType)

    // ==================================
    // list management
    // ==================================

    const getItem = (item, index, dnd) => {
        const Component = (dnd) ? Item : Items.Project
        return (
            <Component
                key={item._id}
                
                item={item}
                index={index}
                containerId={containerId}
                containerType={containerType}
            />
        )
    }
    
    const canEdit = () => {

        const parts = containerId?.split('.')
        if (!parts) {
            return rights.edit.includes(userData.genStatus)
        }

        const project = getItemById(projects, parts[0])
        
        return project.getAccessType(rights.edit, userData, containerId)
    }

    // ==================================

    return (
        <>
            {(currentPage === "Projects" /*|| !rights.edit.includes(getAccess(container))*/) ?
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
                            {noItems && canEdit() && (!noParent || isInContainerItem || isInListBasedItem) &&
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