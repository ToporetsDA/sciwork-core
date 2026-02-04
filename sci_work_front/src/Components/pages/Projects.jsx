import { Suspense, useState, useEffect, useContext }  from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, pointerWithin, rectIntersection, useSensor, useSensors, } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates, } from '@dnd-kit/sortable'

import '../../Styles/components/pages/Projects.sass'

import { createItemsToDisplay } from '../../lib/classes'
import { DISPLAY_OPTIONS } from '../../lib/constants'
import { getItemById } from '../../lib/helpers'

import { AppContext, ControlPanel, Item, ItemTable, ItemTiles } from '../pageAssets/shared'

const Projects = () => {

    const {
        currentPage, projectId,
        userData,
        projects, 
        activities,
        setData
    } = useContext(AppContext)

    // ==================================
    // const, helpers and state management
    // ==================================

    const [itemsToDisplay, setItemsToDisplay] = useState(createItemsToDisplay(projects, projectId))

    const [activeId, setActiveId] = useState(null)
    const [prevDnd, setPrevDnd] = useState(null)

    const [containers, setContainers] = useState([])

    // DND Handlers
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // ==================================
    // lazy loading fallback
    // ==================================

    useEffect(() => {
        if (projectId) {
            const project = getItemById(projects, projectId)
            if (activities.length === project.dndCount) {
                setContainers([...project.activities])
            }
        }
    }, [projects, activities, projectId])

    if (projectId && containers.length !== getItemById(projects, projectId).activities.length) {
        return (
            <>Loading Activities</>
        )
    }

    // ==================================
    // dnd management
    // ==================================

    const saveDndUpdate = () => {
        setData({
            domain: "projects",        // editing project
            id: projectId,             // project's _id
            recipe: (draft) => {       // draft — Immer draft of Project object
                draft.activities = containers  // update
            }
        })
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

            const project = getItemById(projects, projectId)
            const { item: metaItem } = project.findItemWithParent(project.activities, "_id", over.id, project)

            if (!metaItem || metaItem?.type !== "Group") {
                return // Skip "not containers"
            }

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
                const items = (projectId === "Projects") ? itemsToDisplay.projects : containers
                return (
                    <ItemTiles
                        itemsToDisplay={items}
                        containerId={projectId}
                        containerType={item}
                    />
                )
            }
            case "container": {
                return (
                    <Item
                        key={item._id}
                        
                        item={item}
                        containerId={projectId}
                        containerType={"Project"}
                    />
                )
            }
            case "item": {
                const i = item.activities.find((a) => a._id === activeId)
                return (
                    <Item
                        key={i._id}
                        
                        item={i}
                        containerId={activeId}
                        containerType={"Group"}
                    />
                )
            }
            default: {
                return
            }
        }
    }

    // handle cross-level dnd
    const collisionDetection = (args) => {
        const pointer = pointerWithin(args)
        if (pointer.length > 0) {
            return pointer
        }
        return rectIntersection(args)
    }

    // ==================================

    return (
        <>
            <ControlPanel
                setItemsToDisplay={setItemsToDisplay}
            />
            <div className={`page-wrapper ${DISPLAY_OPTIONS.get(userData.currentSettings.displayProjects)}`}>
                {(currentPage === "Projects") ? (
                    <Suspense fallback={<div>Loading projects...</div>}>
                        {DISPLAY_OPTIONS.get(userData.currentSettings.displayProjects) !== 'table' ?
                        (
                            getItemTiles("tiles", "Project")
                        ) : (
                            <ItemTable
                                itemsToDisplay={projects}
                                itemKeys={["name", "dndCount", "startDate", "endDate"]}
                                //itemTypes
                                editable={false}
                                isItem={true}
                                //linkActions
                            />
                        )}
                    </Suspense>
                ) : (
                    <Suspense fallback={<div>Loading activities...</div>}>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={collisionDetection}
                            // collisionDetection={pointerWithin}
                            // collisionDetection={closestCorners}
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
    )
}

export default Projects
