import React  from 'react'
import { SortableContext } from '@dnd-kit/sortable'
import '../../../css/components/pages/shared/ItemTiles.css'

import * as Shared from './'
import * as Items from '../../items'

const ItemTiles = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    itemsToDisplay,
    containerId,
    containerType,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const getItem = (item, index, dnd) => {
        const Component = (dnd) ? Shared.Item : Items.Project
        return (
            <Component
                key={item._id}
                
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                item={item}
                index={index}
                containerId={containerId}//
                containerType={containerType}//
                rights={rights}
                users={users}
                setUsers={setUsers}
                recentActivities={recentActivities}
                setRecentActivities={setRecentActivities}
            />
        )
    }

    const noItems = itemsToDisplay.length === 0
    const noParent = !containerId
    const isInContainerItem = containerType === "Group"

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
                            {noItems && (noParent || isInContainerItem) &&
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