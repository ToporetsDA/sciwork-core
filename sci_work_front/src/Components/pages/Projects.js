import { Suspense, useState, useEffect }  from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors, } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates, } from '@dnd-kit/sortable'
import '../../css/components/pages/Projects.css'

import * as Shared from './sharedComponents'

const Projects = ({
    userData, setUserData,
    state, setState,
    projects, 
    activities,
    setData,
    itemsToDisplay, setItemsToDisplay,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const displayOptions = new Map([
        ['tiles', 'grid'],
        ['list', 'flex'],
        ['table', 'table']
    ])

    const [activeId, setActiveId] = useState(null)
    const [prevDnd, setPrevDnd] = useState(null)

    const [containers, setContainers] = useState([])
    useEffect(() => {
        if (state.currentProject) {
            const project = Shared.GetItemById(projects, state.currentProject)
            if (activities.length === project.dndCount) {
                setContainers([...project.activities])
            }
        }
    }, [projects, activities, state.currentProject])

    const saveDndUpdate = () => {
        const project = {
            ...Shared.GetItemById(projects, state.currentProject),
            activities: containers
        }
        setData({action: "edit", item: project})
    }

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    if (state.currentProject && containers.length !== Shared.GetItemById(projects, state.currentProject).activities.length) {
        return (
            <>Loading Activities</>
        )
    }

    const findValueOfContainer = (id, type) => {
        if (type === 'Group') {
            return containers.find((a) => a._id === id)
        }
        else {
            return containers.find((container) =>
                container.activities.find((a) => a._id === id),
            )
        }
    }

    const handleDragStart = (event) => {
        const { active } = event
        const { id } = active
        setActiveId(id)
        setPrevDnd(containers)
    }

    const handleDragMove = (event) => {
        const { active, over } = event

        // Handle Items Sorting
        if (
            active.data.current.type !== "Group" &&
            over?.data.current.type !== "Group" &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // console.log("Handle Items Sorting")

            // Find the active container and over container
            const activeContainer = findValueOfContainer(active.id, 'Item')
            const overContainer = findValueOfContainer(over.id, 'Item')

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container._id === activeContainer._id,
            )
            const overContainerIndex = containers.findIndex(
                (container) => container._id === overContainer._id,
            )

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.activities.findIndex(
                (a) => a._id === active.id,
            )
            const overitemIndex = overContainer.activities.findIndex(
                (a) => a._id === over.id,
            )
            // In the same container
            if (activeContainerIndex === overContainerIndex) {
                let newItems = [...containers]
                newItems[activeContainerIndex].activities = arrayMove(
                    newItems[activeContainerIndex].activities,
                    activeitemIndex,
                    overitemIndex,
                )
                setContainers(newItems)
            }
            else {
                // In different containers
                let newItems = [...containers]
                const [removeditem] = newItems[activeContainerIndex].activities.splice(
                activeitemIndex,
                1,
                )
                newItems[overContainerIndex].activities.splice(
                overitemIndex,
                0,
                removeditem,
                )
                setContainers(newItems)
            }
        }

        // Handling Item Drop Into a Container
        if (
            active.data.current.type !== "Group" &&
            over?.data.current.type === "Group" &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // console.log("Handling Item Drop Into a Container")

            // Find the active and over container
            const activeContainer = findValueOfContainer(active.id, 'Item')
            const overContainer = findValueOfContainer(over.id, 'Group')

            // If the active or over container is not found, return
            if (!activeContainer || !overContainer) return

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container._id === activeContainer._id,
            )
            const overContainerIndex = containers.findIndex(
                (container) => container._id === overContainer._id,
            )

            // Find the index of the active and over item
            const activeitemIndex = activeContainer.activities.findIndex(
                (a) => a._id === active.id,
            )

            // Remove the active item from the active container and add it to the over container
            let newItems = [...containers]
            const [removeditem] = newItems[activeContainerIndex].activities.splice(
                activeitemIndex,
                1,
            )
            newItems[overContainerIndex].activities.push(removeditem)
            setContainers(newItems)
        }

        // Handling Container Sorting
        if (
            active.data.current.type === "Group" &&
            over?.data.current.type === "Group" &&
            active &&
            over &&
            active.id !== over.id
        ) {
            // console.log("Handling Container Sorting")

            // Find the index of the active and over container
            const activeContainerIndex = containers.findIndex(
                (container) => container._id === active.id,
            )
            const overContainerIndex = containers.findIndex(
                (container) => container._id === over.id,
            )
            // Swap the active and over container
            const newItems = arrayMove(containers, activeContainerIndex, overContainerIndex)
            setContainers(newItems)
        }
    }

  // This is the function that handles the sorting of the containers and items when the user is done dragging.
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over) {
            setContainers(prevDnd)
        }
        
        if (active && over) {
            saveDndUpdate()
        }
        
        setActiveId(null)
    }

    const getItemTiles = (content, item) => {
        switch(content) {
            case "tiles": {
                const items = (state.currentPage === "Projects") ? itemsToDisplay.projects : containers
                return (
                    <Shared.ItemTiles
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        itemsToDisplay={items}
                        containerId={state.currentProject}
                        containerType={item}
                        rights={rights}
                        users={users}
                        setUsers={setUsers}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                )
            }
            case "container": {
                return (
                    <Shared.Item
                        key={item._id}
                        
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        item={item}
                        containerId={state.currentProject}
                        containerType={"Project"}
                        rights={rights}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                )
            }
            case "item": {
                const i = item.activities.find((a) => a._id === activeId)
                return (
                    <Shared.Item
                        key={i._id}
                        
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        item={i}
                        containerId={activeId}
                        containerType={"Group"}
                        rights={rights}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                )
            }
            default: {
                return
            }
        }
    }

    return (
        <>
            <Shared.ControlPanel
                userData={userData}
                setUserData={setUserData}
                state={state}
                setState={setState}
                projects={projects}
                activities={activities}
                rights={rights}
                setItemsToDisplay={setItemsToDisplay}
            />
            <div className={`page-wrapper ${displayOptions.get(userData.currentSettings.displayProjects)}`}>
                {(state.currentPage === "Projects") ? (
                    <Suspense fallback={<div>Loading projects...</div>}>
                        {displayOptions.get(userData.currentSettings.displayProjects) !== 'table' ?
                        (
                            getItemTiles("tiles", "Project")
                        ) : (
                            <Shared.ItemTable
                                userData={userData}
                                projects={projects}
                                activities={activities}
                                setData={setData}
                                state={state}
                                setState={setState}
                                itemsToDisplay={projects}
                                itemKeys={["name", "dndCount", "startDate", "endDate"]}
                                //itemTypes
                                editable={false}
                                isItem={true}
                                //linkActions
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
                            {getItemTiles("tiles", "Project")}
                            <DragOverlay adjustScale={true}>
                                {/* Drag Overlay For item Item */}
                                {activeId && findValueOfContainer(activeId, "Item") && (
                                    getItemTiles("item", findValueOfContainer(activeId, "Item"))
                                )}
                                {/* Drag Overlay For Container */}
                                {activeId && findValueOfContainer(activeId, "Group") && (
                                    getItemTiles("container", findValueOfContainer(activeId, "Group"))
                                )}
                            </DragOverlay>
                        </DndContext>
                    </Suspense>
                )}
            </div>
        </>
    )}

export default Projects
