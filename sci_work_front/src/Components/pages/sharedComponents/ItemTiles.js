import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import '../../../css/pages/sharedComponents/ItemTable.css'

import * as Items from '../../Items'

//!!! setItemsToDisplay DOESNT EXIST YET !!!
// need to implement storage for items order
const ItemTiles = ({userData, data, setData, state, setState, itemsToDisplay, setItemsToDisplay, rights, recentActivities, setRecentActivities}) => {

    const handleDragEnd = (result) => {
        if (!result.destination) return

        const updatedItems = Array.from(itemsToDisplay)
        const [movedItem] = updatedItems.splice(result.source.index, 1)
        updatedItems.splice(result.destination.index, 0, movedItem)

        setItemsToDisplay(updatedItems)
    }

    const handleAddAfter = (index) => {
        setState(prev => ({
            ...prev,
            currentDialog: {
                name: 'AddEditItem',
                params: [true, index + 1] // You’ll need to support this index in the dialog
            }
        }))
    }

    const createDraggableItem = (item, index) => {
        const ItemComponent = Items[item._id.includes(".") ? item.type : "Project"]

        return (
            <Draggable key={item._id} draggableId={item._id} index={index}>
            {(provided, snapshot) => (
                <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                className={`draggable-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                >
                    <div className="hover-wrapper">
                        <div className="drag-and-item">
                            {/* ➕ Add below button */}
                            <button
                                className="add-button"
                                onClick={(e) => {
                                e.stopPropagation()
                                handleAddAfter(index)
                                }}
                            >
                                ➕ Add Below
                            </button>
                            {/* 🔘 DRAG HANDLE (6-dots) */}
                            <div
                            className="drag-handle"
                            {...provided.dragHandleProps}
                            onClick={(e) => e.stopPropagation()}
                            >
                                ⋮⋮
                            </div>

                            {/* 🧩 Your actual item */}
                            <ItemComponent
                            userData={userData}
                            data={data}
                            setData={setData}
                            state={state}
                            setState={setState}
                            item={item}
                            index={index}
                            rights={rights}
                            recentActivities={recentActivities}
                            setRecentActivities={setRecentActivities}
                            />
                        </div>
                    </div>
                </div>
            )}
            </Draggable>
        )
    }

    return (
        <>
            {(state.currentPage === "Projects") ?
                (
                    <>
                        {itemsToDisplay.map((item, index) => {
                            const ItemComponent = Items[(item._id.includes(".")) ? item.type : "Project"]
                            return (
                                <ItemComponent
                                    key={item._id}
                                    userData={userData}
                                    data={data}
                                    setData={setData}
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
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="itemTiles">
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="item-tiles">
                                    {itemsToDisplay.map((item, index) => {
                                        return createDraggableItem(item, index)
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )
            }
        </>
    )
}

export default ItemTiles