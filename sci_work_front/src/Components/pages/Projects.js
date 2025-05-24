import { Suspense, useState, useEffect, useCallback }  from 'react'
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

    const getItems = useCallback((item) => {
        let arr = []
        const amount = item?.activities.length || 0
        for (let i = 0; i < amount; i++) {
            let items = Shared.GetItemById(activities, item.activities[i]._id)
            items = {
                ...items,
                activities: getItems(items)
            }
            arr.push(items)
        }
        return arr
    }, [activities])

    const [containers, setContainers] = useState(Shared.GetItemById(data, state.currentProject))
    useEffect(() => {
        if (state.currentProject) {
            const project = Shared.GetItemById(data, state.currentProject)
            if (activities.length === project.dndCount) {
                const groups = getItems(project)
                const tree = {
                    ...project,
                    activities: groups
                }
                // setContainers(tree)
                setContainers([...activities, Shared.GetItemById(data, state.currentProject)])
            }
        }
    }, [getItems, data, activities, state.currentProject])

    const [activeId, setActiveId] = useState(null)
    const [currentContainerId, setCurrentContainerId] = useState()
    const [containerName, setContainerName] = useState('')
    const [itemName, setItemName] = useState('')
    const [showAddContainerModal, setShowAddContainerModal] = useState(false)
    const [showAddItemModal, setShowAddItemModal] = useState(false)

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    if (state.currentProject && !containers?.activities) {
        return (
            <>Loading Activities</>
        )
    }

    console.log("containers", containers)

    // Find the value of the items
    // const findValueOfItems = (id, items = containers) => {
    //     for (const item of items) {
    //         if (item._id === id) return item
    //         if (item.activities?.length) {
    //             const found = findValueOfItems(id, item.activities)
    //             if (found) return found
    //         }
    //     }
    //     return null
    // }
    const findValueOfItems = (id, type) => {
    if (type === 'container') {
      return containers.find((item) => item.id === id)
    }
    if (type === 'item') {
      return containers.find((container) =>
        container.items.find((item) => item.id === id),
      )
    }
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

    const handleDragStart = (event) => {
        const { active } = event
        const { id } = active
        console.log("handleDragStart: setActiveId", id)
        setActiveId(id)
    }

    const handleDragMove = (event) => {
        const { active, over } = event

        // Handle Items Sorting
        if (
        active.id.toString().includes('item') &&
        over?.id.toString().includes('item') &&
        active &&
        over &&
        active.id !== over.id
        ) {
        // Find the active container and over container
        const activeContainer = findValueOfItems(active.id, 'item')
        const overContainer = findValueOfItems(over.id, 'item')

        console.log("from to ontainers", activeContainer, overContainer)
        // If the active or over container is not found, return
        if (!activeContainer || !overContainer) return

        // Find the index of the active and over container
        const activeContainerIndex = containers.findIndex(
            (container) => container.id === activeContainer.id,
        )
        const overContainerIndex = containers.findIndex(
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
            let newItems = [...containers]
            newItems[activeContainerIndex].items = arrayMove(
            newItems[activeContainerIndex].items,
            activeitemIndex,
            overitemIndex,
            )

            setContainers(newItems)
        } else {
            // In different containers
            let newItems = [...containers]
            const [removeditem] = newItems[activeContainerIndex].items.splice(
            activeitemIndex,
            1,
            )
            newItems[overContainerIndex].items.splice(
            overitemIndex,
            0,
            removeditem,
            )
            setContainers(newItems)
        }
        }

        // Handling Item Drop Into a Container
        if (
        active.id.toString().includes('.') &&
        !over?.id.toString().includes('.') &&
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
        const activeContainerIndex = containers.findIndex(
            (container) => container.id === activeContainer.id,
        )
        const overContainerIndex = containers.findIndex(
            (container) => container.id === overContainer.id,
        )

        // Find the index of the active and over item
        const activeitemIndex = activeContainer.items.findIndex(
            (item) => item.id === active.id,
        )

        // Remove the active item from the active container and add it to the over container
        let newItems = [...containers]
        const [removeditem] = newItems[activeContainerIndex].items.splice(
            activeitemIndex,
            1,
        )
        newItems[overContainerIndex].items.push(removeditem)
        setContainers(newItems)
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
        const activeContainerIndex = containers.findIndex(
            (container) => container.id === active.id,
        )
        const overContainerIndex = containers.findIndex(
            (container) => container.id === over.id,
        )
        // Swap the active and over container
        let newItems = [...containers]
        newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex)
        setContainers(newItems)
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
        const activeContainerIndex = containers.findIndex(
            (container) => container.id === activeContainer.id,
        )
        const overContainerIndex = containers.findIndex(
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
            let newItems = [...containers]
            newItems[activeContainerIndex].items = arrayMove(
            newItems[activeContainerIndex].items,
            activeitemIndex,
            overitemIndex,
            )
            setContainers(newItems)
        } else {
            // In different containers
            let newItems = [...containers]
            const [removeditem] = newItems[activeContainerIndex].items.splice(
            activeitemIndex,
            1,
            )
            newItems[overContainerIndex].items.splice(
            overitemIndex,
            0,
            removeditem,
            )
            setContainers(newItems)
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
        const activeContainerIndex = containers.findIndex(
            (container) => container.id === activeContainer.id,
        )
        const overContainerIndex = containers.findIndex(
            (container) => container.id === overContainer.id,
        )
        // Find the index of the active and over item
        const activeitemIndex = activeContainer.items.findIndex(
            (item) => item.id === active.id,
        )

        let newItems = [...containers]
        const [removeditem] = newItems[activeContainerIndex].items.splice(
            activeitemIndex,
            1,
        )
        newItems[overContainerIndex].items.push(removeditem)
        setContainers(newItems)
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
                                // container={{userList: {}}}
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
                                itemsToDisplay={containers.activities}
                                // container={containers}
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
