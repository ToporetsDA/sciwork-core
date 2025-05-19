import { Suspense }  from 'react'
import { closestCorners, DndContext } from '@dnd-kit/core'
import '../../css/pages/Projects.css'
import ControlPanel from './sharedComponents/ControlPanel'

import * as Shared from './sharedComponents'

const Projects = ({ userData, setUserData, state, setState, data, setData, itemsToDisplay, setItemsToDisplay, rights, recentActivities, setRecentActivities }) => {

    const displayOptions = new Map([
        ['tiles', 'grid'],
        ['list', 'flex'],
        ['table', 'table']
    ])

    const updateItemAndChildrenIds = (item, newBaseId) => {
        const updatedItem = {
            ...item,
            _id: newBaseId,
        }

        if (item.activities) {
            updatedItem.activities = item.activities.map((child, i) =>
                updateItemAndChildrenIds(child, `${newBaseId}.${i}`)
            )
        }

        return updatedItem
    }

    const findItemWithParent = (items, targetDnd, parent) => {
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.dnd === targetDnd) {
                return { item, parent, index: i }
            }
            if (item.activities) {
                const result = findItemWithParent(item.activities, targetDnd, item)
                if (result) return result
            }
        }
        return null
    }

    const normalizeItemIds = (project) => {
        const normalizedActivities = project.activities.map((item, index) => {
            const newBaseId = `${state.currentProject}.${index}`
            return updateItemAndChildrenIds(item, newBaseId)
        })

        const updatedProject = {
            ...project,
            activities: normalizedActivities
        }

        setData({ item: updatedProject, action: 'edit' })
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const project = Shared.GetItemById(data, state.currentProject)
        const activities = project.activities

        // Step 1: Find the moved item and its parent
        const fromInfo = findItemWithParent(activities, active.id, project)
        if (!fromInfo) return

        const { item: movedItem, parent: fromParent, index: oldIndex } = fromInfo
        const fromArray = fromParent ? fromParent.activities : activities

        // Remove the item from its original array
        fromArray.splice(oldIndex, 1)

        // Step 2: Find the drop target and its parent
        const toInfo = findItemWithParent(activities, over.id, project)
        if (!toInfo) return

        console.log("fromTo", fromInfo, toInfo)

        const { item: overItem, parent: toParent, index: newIndexInTarget } = toInfo

        // Step 3: Decide target array and index
        let toArray, insertIndex

        if (overItem.activities) {
            // Dropped over a container → insert as first child
            toArray = overItem.activities
            insertIndex = 0
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

        // Step 5: Normalize all _id values
        normalizeItemIds(project)
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
                            onDragEnd={handleDragEnd}
                            collisionDetection={closestCorners}
                        >
                            <Shared.ItemTiles
                                userData={userData}
                                data={data}
                                setData={setData}
                                state={state}
                                setState={setState}
                                itemsToDisplay={itemsToDisplay.activities}
                                container={Shared.GetItemById(data, state.currentProject)}
                                rights={rights}
                                recentActivities={recentActivities}
                                setRecentActivities={setRecentActivities}
                            />
                        </DndContext>
                    </Suspense>
                )}
            </div>
        </>
    )}

export default Projects
