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
            type
        }
        listItems: [{
            text: "list item"   (default)
        }]
        liStructure: {
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
    recentActivities, setRecentActivities
}) => {

    const activity = Shared.GetItemById(activities, item._id)

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
        const metaItem = Shared.FindItemWithParent(parent.activities, "_id", activity._id, parent).item
        const access = Shared.GetAccess(metaItem, userData)

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
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                </SortableContext>
            </DndContext>
        )
    }

    return (
        <div className="list-editor-wrapper">
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
            <Shared.ToggleButton
                data={settings}
                setter={setSettings}
                field={"type"}
                displayOptions={['ul', 'ol']}
            />
            {(settings.type === "ul") ? (
                <ul>
                    {getItemTiles()}
                </ul>
            ) : (
                <ol>
                    {getItemTiles()}
                </ol>
            )}
        </div>
    )
}

export default List