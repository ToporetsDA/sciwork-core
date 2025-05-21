import { Suspense, useState, useEffect }  from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors, } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, } from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid'
import '../../css/pages/Projects.css'
import ControlPanel from './sharedComponents/ControlPanel'

import * as Shared from './sharedComponents'

const Projects = ({
    userData, setUserData,
    state, setState,
    data, setData,
    activities,
    itemsToDisplay, setItemsToDisplay,
    rights,
    recentActivities, setRecentActivities }) => {

    const displayOptions = new Map([
        ['tiles', 'grid'],
        ['list', 'flex'],
        ['table', 'table']
    ])

    /* const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const project = Shared.GetItemById(data, state.currentProject)
        const activities = project.activities

        // Step 1: Find the moved item and its parent
        const fromInfo = Shared.FindItemWithParent(activities, "dnd", active.id, project)
        if (!fromInfo) return

        const { item: movedItem, parent: fromParent, index: oldIndex } = fromInfo
        const fromArray = fromParent ? fromParent.activities : activities

        // Remove the item from its original array
        fromArray.splice(oldIndex, 1)

        // Step 2: Find the drop target and its parent
        const toInfo = Shared.FindItemWithParent(activities, "dnd", over.id, project)
        if (!toInfo) return

        console.log("fromTo", fromInfo, toInfo)

        const { item: overItem, parent: toParent, index: newIndexInTarget } = toInfo

        // Step 3: Decide target array and index
        let toArray, insertIndex

        if (overItem.activities) {
            // Dropped over a container → insert as first child
            toArray = overItem.activities
            insertIndex = newIndexInTarget
        } else {
            // Dropped over sibling → insert next to it
            toArray = toParent.activities
            insertIndex = newIndexInTarget
            console.log("insert index", insertIndex)
            if (toArray === fromArray && oldIndex <= insertIndex) {
                insertIndex += 1
            }
            console.log("insert index", insertIndex)
            if (insertIndex === -1) insertIndex = toArray.length
            console.log("insert index", insertIndex)
        }

        // Insert the moved item into the new array
        toArray.splice(insertIndex, 0, movedItem)

        // Step 4: Update UI
        setItemsToDisplay((prev) => ({
            ...prev,
            activities: activities,
        }))

        // Step 5: Normalize path values
        Shared.NormalizeItemsPath(activities, project, state.currentProject, setData)
    }*/

    //activities + current Project
    const [dndItems, setDndItems] = useState([])
    //habdle loading delay!
    useEffect(() => {
        if (state.currentProject) {
            setDndItems(state.currentProject ? [/*...activities,*/ Shared.GetItemById(data, state.currentProject)] : [] )
        }
    }, [data, activities, state.currentProject])
    
    const [activeId, setActiveId] = useState(null)
    const [currentContainerId, setCurrentContainerId] = useState()
    const [containerName, setContainerName] = useState('')
    const [itemName, setItemName] = useState('')
    const [showAddContainerModal, setShowAddContainerModal] = useState(false)
    const [showAddItemModal, setShowAddItemModal] = useState(false)

    // Find the value of the items
    const findValueOfItems = (id) => {
        return dndItems.find((item) => item._id === id)
    }

    const findItemTitle = (id) => {
        const container = findValueOfItems(id)
        if (!container) return ''
        const item = container.items.find((item) => item.id === id)
        if (!item) return ''
        return item.title
    }

    const findContainerTitle = (id) => {
        const container = findValueOfItems(id)
        if (!container) return ''
        return container.title
    }

    const findContainerItems = (id) => {
        const container = findValueOfItems(id)
        if (!container) return []
        return container.items
    }

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleDragStart = (event) => {
        const { active } = event
        const { id } = active
        console.log("handleDragStart: setActiveId", id)
        setActiveId(id)
    }

    const handleDragMove = (event) => {
        const { active, over } = event
        console.log("handleDragMove")
        // Handle Items Sorting
        if (
        active.id.includes('.') &&
        over?.id.includes('.') &&
        active &&
        over &&
        active.id !== over.id
        ) {
            // Find the active container and over container
            const activeContainer = findValueOfItems(active.id)
            const overContainer = findValueOfItems(over.id)

            console.log("from to container ids", activeContainer, overContainer)

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return

            // Find the index of the active and over container
            let parts

            parts = activeContainer?.path.split('.') || [activeContainer._id]
            const activeContainerIndex = parts[parts.length - 1]

            parts = overContainer?.path.split('.') || [activeContainer._id]
            const overContainerIndex = parts[parts.length - 1]

            console.log("from to container indexs", activeContainerIndex, overContainerIndex)

            // Find the index of the active and over item
            parts = activeContainer.activities.find(
                (item) => item._id === active.id,
            ).path.split('.')
            const activeitemIndex = parts[parts.length - 1]
            
            parts = overContainer.activities.find(
                (item) => item._id === over.id,
            ).path.split('.')
            const overitemIndex = parts[parts.length - 1]

            console.log("from to item indexs", activeitemIndex, overitemIndex)

            if (activeContainerIndex === overContainerIndex) {
                console.log("same container")
                // In the same container

                activeContainer.activities = arrayMove(
                    activeContainer.activities,
                    activeitemIndex,
                    overitemIndex,
                )
                //update metadata tree in app component
                setData({ item: activeContainer, action: "edit" })
            } else {
                console.log("to another container")
                // In different containers
                const [removeditem] = activeContainer.activities.splice( activeitemIndex, 1 )
                overContainer.activities.splice( overitemIndex, 0, removeditem )
                setData({ item: activeContainer, action: "edit" })
                setData({ item: overContainer, action: "edit" })
            }
        }
    }

  // This is the function that handles the sorting of the containers and items when the user is done dragging.
    const handleDragEnd = (event) => {
        const { active, over } = event

        // Handling Container Sorting
        if (
            active.id.includes('container') &&
            over?.id.includes('container') &&
            active &&
            over &&
            active.id !== over.id
        ) {
        // Find the index of the active and over container
        const activeContainerIndex = dndItems.findIndex(
            (container) => container.id === active.id,
        )
        const overContainerIndex = dndItems.findIndex(
            (container) => container.id === over.id,
        )
        // Swap the active and over container
        let newItems = [...dndItems]
        newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex)
        setDndItems(newItems)
        }

        // Handling item Sorting
        if (
        active.id.toString().includes('item') &&
        over?.id.toString().includes('item') &&
        active &&
        over &&
        active.id !== over.id
        ) {
        // Find the active and over container
        const activeContainer = findValueOfItems(active.id, 'item')
        const overContainer = findValueOfItems(over.id, 'item')

        // If the active or over container is not found, return
        if (!activeContainer || !overContainer) return
        // Find the index of the active and over container
        const activeContainerIndex = dndItems.findIndex(
            (container) => container.id === activeContainer.id,
        )
        const overContainerIndex = dndItems.findIndex(
            (container) => container.id === overContainer.id,
        )
        // Find the index of the active and over item
        const activeitemIndex = activeContainer.items.findIndex(
            (item) => item.id === active.id,
        )
        const overitemIndex = overContainer.items.findIndex(
            (item) => item.id === over.id,
        )

        // In the same container
        if (activeContainerIndex === overContainerIndex) {
            let newItems = [...dndItems]
            newItems[activeContainerIndex].items = arrayMove(
            newItems[activeContainerIndex].items,
            activeitemIndex,
            overitemIndex,
            )
            setDndItems(newItems)
        } else {
            // In different containers
            let newItems = [...dndItems]
            const [removeditem] = newItems[activeContainerIndex].items.splice(
            activeitemIndex,
            1,
            )
            newItems[overContainerIndex].items.splice(
            overitemIndex,
            0,
            removeditem,
            )
            setDndItems(newItems)
        }
        }
        // Handling item dropping into Container
        if (
        active.id.toString().includes('item') &&
        over?.id.toString().includes('container') &&
        active &&
        over &&
        active.id !== over.id
        ) {
        // Find the active and over container
        const activeContainer = findValueOfItems(active.id, 'item')
        const overContainer = findValueOfItems(over.id, 'container')

        // If the active or over container is not found, return
        if (!activeContainer || !overContainer) return
        // Find the index of the active and over container
        const activeContainerIndex = dndItems.findIndex(
            (container) => container.id === activeContainer.id,
        )
        const overContainerIndex = dndItems.findIndex(
            (container) => container.id === overContainer.id,
        )
        // Find the index of the active and over item
        const activeitemIndex = activeContainer.items.findIndex(
            (item) => item.id === active.id,
        )

        let newItems = [...dndItems]
        const [removeditem] = newItems[activeContainerIndex].items.splice(
            activeitemIndex,
            1,
        )
        newItems[overContainerIndex].items.push(removeditem)
        setDndItems(newItems)
        }
        setActiveId(null)
    }

    return (
        <>
            <ControlPanel
                userData={userData}
                setUserData={setUserData}
                state={state}
                setState={setState}
                data={data}
                rights={rights}
                setItemsToDisplay={setItemsToDisplay}
            />
            <div className={`itemList ${displayOptions.get(userData.currentSettings.displayProjects)}`}>
                {(state.currentPage === "Projects") ? (
                    <Suspense fallback={<div>Loading projects...</div>}>
                        {displayOptions.get(userData.currentSettings.displayProjects) !== 'table' ?
                        (
                            <Shared.ItemTiles
                                userData={userData}
                                data={data}
                                setData={setData}
                                state={state}
                                setState={setState}
                                itemsToDisplay={itemsToDisplay.projects}
                                container={{userList: {}}}
                                rights={rights}
                                recentActivities={recentActivities}
                                setRecentActivities={setRecentActivities}
                            />
                        ) : (
                            <Shared.ItemTable
                                userData={userData}
                                data={data}
                                setData={setData}
                                state={state}
                                setState={setState}
                                itemsToDisplay={itemsToDisplay.projects}
                                rights={rights}
                                recentActivities={recentActivities}
                                setRecentActivities={setRecentActivities}
                            />
                        )}
                    </Suspense>
                ) : (
                    <Suspense fallback={<div>Loading activities...</div>}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragMove={handleDragMove}
                            onDragEnd={handleDragEnd}
                        >
                            <Shared.ItemTiles
                                userData={userData}
                                data={data}
                                setData={setData}
                                activities={activities}
                                state={state}
                                setState={setState}
                                itemsToDisplay={itemsToDisplay.activities}
                                container={Shared.GetItemById(data, state.currentProject)}
                                rights={rights}
                                recentActivities={recentActivities}
                                setRecentActivities={setRecentActivities}
                            />
                            {/* <DragOverlay adjustScale={false}>
                                {/* Drag Overlay For item Item /}
                                {activeId && activeId.toString().includes('item') && (
                                    <Items id={activeId} title={findItemTitle(activeId)} />
                                )}
                                {/* Drag Overlay For Container /}
                                {activeId && activeId.toString().includes('container') && (
                                    <Container id={activeId} title={findContainerTitle(activeId)}>
                                    {findContainerItems(activeId).map((i) => (
                                        <Items key={i.id} title={i.title} id={i.id} />
                                    ))}
                                    </Container>
                                )}
                            </DragOverlay> */}
                        </DndContext>
                    </Suspense>
                )}
            </div>
        </>
    )}

export default Projects
