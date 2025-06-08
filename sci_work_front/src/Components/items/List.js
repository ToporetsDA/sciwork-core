import { useEffect, useState, useMemo } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import * as Shared from '../pages/sharedComponents'
import * as Items from './'

/*structure
activity: {
    _id
    name
    template
    content: {
        currentSettings: {
            type: String
            markable: Boolean
        }
        listItems: [{
            _id                 (required)
            creatorId           (required)
            text: "list item"   (example)

            markable: {         (one per list item, not required)
                name            (required)
                startTime       (required)
                endTime         (required)
                date            (required)
                userEntries:[{
                    _id             (required)

                    name            (required)
                    middleName      (default: "")
                    surName         (required)
                    patronimic      (default: "")

                    checker         (default: [false, "--:--"])
                }]
            }
        }]
        liStructure: {
            markable: 'markable'
            text: 'html'
        }
    }
}
*/

const List = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    item,
    index,
    containerId,
    containerType,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const activity = Shared.GetItemById(activities, item._id)

    const project = Shared.GetItemById(projects, state.currentProject)
    const metaActivity = Shared.FindItemWithParent(project.activities, "_id", activity._id, project).item

    const [settings, setSettings] = useState(activity.content?.currentSettings || {})

    const allItems = useMemo(() => {
        return activity.content?.listItems || []
    }, [activity.content?.listItems])

    const [items, setItems] = useState(allItems.filter(i => !i.deleted))

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    useEffect(() => {
        setItems(allItems.filter(i => !i.deleted))
        setSettings((prevSettings) => ({
            ...prevSettings,
            type: prevSettings.type
        }))
    }, [activity, allItems])

    useEffect(() => {
        const parent = Shared.GetItemById(projects, containerId)
        const metaItem = Shared.FindItemWithParent(parent.activities, "_id", activity._id, parent)
        const access = Shared.GetAccess(metaItem.item, userData)

        const change = (activity.content?.currentSettings?.type !== settings?.type) && settings?.type

        if (rights.edit.includes(access) && change) {
            console.log("default ul/ol changed")
            const updatedActivity = {
                ...activity,
                content: {
                    ...activity.content,
                    currentSettings: settings
                }
            }
            setData({action: "content", item: {type: "List", activity: updatedActivity}})
        }
    }, [rights.edit, projects, setData, userData, containerId, activity, settings])

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex(i => i._id === active.id)
            const newIndex = items.findIndex(i => i._id === over.id)
            const newItems = arrayMove(items, oldIndex, newIndex)
            setItems(newItems)
            const updatedActivity = {
                ...activity,
                content: {
                    ...activity.content,
                    listItems: newItems
                }
            }
            setData({action: "content", item: {type: item.type, activity: updatedActivity}})
        }
    }

    const getItemTiles = () => {
        return (
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items.map((i) => i._id)}>
                    <Shared.ItemTiles
                        key={item._id}
                        
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        itemsToDisplay={items}
                        containerId={item._id}
                        containerType={item.type}
                        rights={rights}
                        users={users}
                        setUsers={setUsers}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                </SortableContext>
            </DndContext>
        )
    }

    const getList = (type) => {
        switch(type) {
            case"List": {
                return (
                    <>
                        {/* ordered/unordered */}
                        <Shared.ToggleButton
                            data={settings}
                            setter={setSettings}
                            field={"type"}
                            displayOptions={['ul', 'ol']}
                        />
                        {(settings.type === "ul")
                        ? (
                            <ul>
                                {getItemTiles()}
                            </ul>
                        ) : (
                            <ol>
                                {getItemTiles()}
                            </ol>
                        )}
                    </>
                )
            }
            case"Attendance" : {
                return (
                    <>
                        {getItemTiles()}
                    </>
                )
            }
            case"Table": {
                const itemKeys = Object.keys(activity?.content.liStructure).filter(key =>
                    key !== '_id' && key !== 'deleted' &&
                    !Array.isArray(activity?.content.liStructure[key])
                )
                return (
                    <>
                        {Shared.GetDialogButton(
                            setState,
                            "edit-structure",
                            "AddEditContent",
                            [true, false, false, activity._id, "Add Item"],
                            "Add Entry"
                        )}
                        <Shared.ItemTable
                            userData={userData}
                            projects={projects}
                            activities={activities}
                            setData={setData}
                            state={state}
                            setState={setState}
                            itemsToDisplay={items}
                            itemKeys={itemKeys}
                            itemTypes={activity?.content.liStructure}
                            rights={rights}
                            recentActivities={recentActivities}
                            setRecentActivities={setRecentActivities}
                        />
                    </>
                )
            }
            default: {
                return
            }
        }
    }

    return (
        <div className="list-editor-wrapper">
            {/* activity name */}
            <Items.Text
                key={item._id}
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                item={item}
                data={"name"}
                rights={rights}
            />
            {/* EditStructure button */}
            {Shared.GetDialogButton(
                setState,
                "edit-structure",
                "AddEditContent",
                [true, false, false, activity._id, "Edit Structure"],
                "Edit List")
            }
            {/* list items */}
            {getList(metaActivity.type)}
        </div>
    )
}

export default List