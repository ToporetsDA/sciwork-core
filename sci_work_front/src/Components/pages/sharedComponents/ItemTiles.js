import { useMemo }  from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import '../../../css/pages/sharedComponents/ItemTiles.css'

import * as Shared from './'
import * as Items from '../../Items'

const ItemTiles = ({userData, data, setData, activities, setActivities, state, setState, itemsToDisplay, container, rights, recentActivities, setRecentActivities}) => {

    const getAccess = (item) => {
        return item.userList?.find(user => user.id === userData._id)?.access || 0
    }
    
    const orderedItemsToDisplay = useMemo(() => {
        const field = (state.currentProject) ? "path" : "_id"
        return Object.values(itemsToDisplay).sort((a, b) => {
            const getSuffix = (val) => parseInt(val.split('.').pop(), 10)
            return getSuffix(a[field]) - getSuffix(b[field])
        })
    }, [itemsToDisplay, state.currentProject])

    return (
        <>
            {(state.currentPage === "Projects" || !rights.edit.includes(getAccess(container))) ?
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
                            items={orderedItemsToDisplay.map(item => item.dnd)}
                            strategy={verticalListSortingStrategy}
                        >
                            {orderedItemsToDisplay.map((item) => {
                                return (
                                    <Shared.Item
                                        key={item.dnd}
                                        
                                        userData={userData}
                                        data={data}
                                        setData={setData}
                                        state={state}
                                        setState={setState}
                                        item={item}
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