import React  from 'react'
import { SortableContext } from '@dnd-kit/sortable'
import '../../../css/pages/sharedComponents/ItemTiles.css'

import * as Shared from './'
import * as Items from '../../Items'

const ItemTiles = ({
    userData,
    data, setData,
    activities,
    state, setState,
    itemsToDisplay,
    containerId,
    rights,
    recentActivities, setRecentActivities
}) => {
    
    return (
        <>
            {(state.currentPage === "Projects" /*|| !rights.edit.includes(getAccess(container))*/) ?
                (
                    <>
                        {itemsToDisplay.map((item, index) => {
                            return (
                                <Items.Project
                                    key={item._id}
                                    
                                    userData={userData}
                                    data={data}
                                    setData={setData}
                                    activities={activities}
                                    state={state}
                                    setState={setState}
                                    item={item}
                                    index={index}
                                    rights={rights}
                                    recentActivities={recentActivities}
                                    setRecentActivities={setRecentActivities}
                                />
                            )
                        })}
                    </>
                ) : (
                    <div
                        className="item-tiles"
                    >
                        <SortableContext items={itemsToDisplay.map((i) => i._id)}>
                            {itemsToDisplay.map((item) => (
                                <Shared.Item
                                    key={item._id}
                                    
                                    userData={userData}
                                    data={data}
                                    setData={setData}
                                    activities={activities}
                                    state={state}
                                    setState={setState}
                                    item={item}
                                    containerId={containerId}
                                    rights={rights}
                                    recentActivities={recentActivities}
                                    setRecentActivities={setRecentActivities}
                                />
                            ))}
                        </SortableContext>
                    </div>
                )
            }
        </>
    )
}

export default ItemTiles