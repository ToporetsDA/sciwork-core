import { useMemo }  from 'react'
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
    // container,
    rights,
    recentActivities, setRecentActivities
}) => {

    const getAccess = (item) => {
        return item.userList?.find(user => user.id === userData._id)?.access || 0
    }
    
    //order metadata py "path"
    // const orderedMetaItems = useMemo(() => {
    //     if (!state.currentProject) {
    //         return itemsToDisplay
    //     }

    //     const field = "path"
    //     if (itemsToDisplay.length < 2) {
    //         return itemsToDisplay
    //     }
        
    //     return Object.values(itemsToDisplay).sort((a, b) => {
    //         const getSuffix = (val) => parseInt(val.split('.').pop(), 10)
    //         return getSuffix(a[field]) - getSuffix(b[field])
    //     })
    // }, [itemsToDisplay, state.currentProject])

    //order data based on orderedMetaDataItems "_id"s
    // const orderedItemsToDisplay = () => {
    //     if (!state.currentProject || !activities) {
    //         return itemsToDisplay
    //     }
    //     if (activities.length !== Shared.GetItemById(data, state.currentProject).dndCount) {
    //         return []
    //     }
    //     let sortedItems = []
    //     for (let i = 0; i < orderedMetaItems.length; i++) {
    //         sortedItems.push(activities.find(a => a._id === orderedMetaItems[i]._id))
    //     }
    //     return sortedItems
    // }

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
                            {itemsToDisplay.map((item, index) => (
                                <Shared.Item
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
                            ))}
                        </SortableContext>
                        {/* <SortableContext
                            items={/*orderedItemsToDisplay()/itemsToDisplay.map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {/*orderedItemsToDisplay()/itemsToDisplay.map((item, index) => {
                                return (
                                    <Shared.Item
                                        key={item._id}
                                        
                                        userData={userData}
                                        data={data}
                                        setData={setData}
                                        activities={activities}
                                        setActivities={setActivities}
                                        state={state}
                                        setState={setState}
                                        item={item}
                                        index={index}
                                        type={"Group"/*orderedMetaItems[index].type/}
                                        rights={rights}
                                        recentActivities={recentActivities}
                                        setRecentActivities={setRecentActivities}
                                        //dnd
                                        containers={containers}
                                        setContainers={setContainers}
                                        activeId={activeId}
                                        setActiveId={setActiveId}
                                        currentContainerId={currentContainerId}
                                        setCurrentContainerId={setCurrentContainerId}
                                        containerName={containerName}
                                        setContainerName={setContainerName}
                                        itemName={itemName}
                                        setItemName={setItemName}
                                        showAddContainerModal={showAddContainerModal}
                                        setShowAddContainerModal={setShowAddContainerModal}
                                        showAddItemModal={showAddItemModal}
                                        setShowAddItemModal={setShowAddItemModal}
                                    />
                                )
                            })}
                        </SortableContext> */}
                    </div>
                )
            }
        </>
    )
}

export default ItemTiles