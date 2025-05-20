import { useMemo }  from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import '../../../css/pages/sharedComponents/ItemTiles.css'

import * as Shared from './'
import * as Items from '../../Items'

const ItemTiles = ({userData, data, setData, activities, setActivities, state, setState, itemsToDisplay, container, rights, recentActivities, setRecentActivities}) => {

    const getAccess = (item) => {
        return item.userList?.find(user => user.id === userData._id)?.access || 0
    }
    
    const orderedMetaItems = useMemo(() => {
        if (!state.currentProject) {
            return itemsToDisplay
        }

        const field = "path"
        if (itemsToDisplay.length < 2) {
            return itemsToDisplay
        }
        
        return Object.values(itemsToDisplay).sort((a, b) => {
            const getSuffix = (val) => parseInt(val.split('.').pop(), 10)
            return getSuffix(a[field]) - getSuffix(b[field])
        })
    }, [itemsToDisplay, state.currentProject])

    if (state.currentProject && !activities) {
        return (
            <>Loading Activities</>
        )
    }

    const orderedItemsToDisplay = () => {
        if (!state.currentProject || !activities) {
            return itemsToDisplay
        }
        if (activities.length !== Shared.GetItemById(data, state.currentProject).dndCount) {
            return []
        }
        let sortedItems = []
        for (let i = 0; i < orderedMetaItems.length; i++) {
            sortedItems.push(activities.find(a => a._id === orderedMetaItems[i]._id))
        }
        return sortedItems
    }

    return (
        <>
            {(state.currentPage === "Projects" || !rights.edit.includes(getAccess(container))) ?
                (
                    <>
                        {orderedItemsToDisplay().map((item, index) => {
                            return (
                                <Items.Project
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
                        <SortableContext
                            items={orderedItemsToDisplay().map(item => item._id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {orderedItemsToDisplay().map((item, index) => {
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
                                        type={orderedMetaItems[index].type}
                                        rights={rights}
                                        recentActivities={recentActivities}
                                        setRecentActivities={setRecentActivities}
                                    />
                                )
                            })}
                        </SortableContext>
                    </div>
                )
            }
        </>
    )
}

export default ItemTiles