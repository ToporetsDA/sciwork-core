// Libraries
import { useEffect, useState, useMemo, useContext } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
// Styles, Classes, Constants
import '../../css/components/items/List.css'
// Methods, Components
import * as Shared from '../pages/shared'

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
    item,
    containerId,
}) => {

    const {
        userData,
        projects,
        activities,
        setData,
        state, setState,
        rights
    } = useContext(Shared.AppContext)

    const activity = Shared.getItemById(activities, item._id)

    const project = Shared.getItemById(projects, state.currentProject)
    const { item: metaActivity } = project.findItemWithParent(project.activities, "_id", activity._id, project)

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
        const parent = Shared.getItemById(projects, containerId)
        
        const access = parent.getAccess(userData, activity._id)

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
                        
                        itemsToDisplay={items}
                        containerId={item._id}
                        containerType={item.type}
                    />
                </SortableContext>
            </DndContext>
        )
    }

    const getDialog = (itemType, type) => {
        const hasDialogButton = ["List", "Attendance", "Table", /*no Chat*/]

        if (!hasDialogButton.includes(itemType)) {
            return
        }
        else {
            return (
                <div
                    className='list-actions'
                >
                {Shared.getDialogButton(
                    setState,
                    "button-mini",
                    "AddEditContent",
                    [true, false, false, activity._id, type],
                    type,
                    false
                )}
                </div>
            )
        }
    }

    const getList = (type) => {
        switch(type) {
            case"List": {
                return (
                    <div
                        className='list'
                    >
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
                    </div>
                )
            }
            case"Attendance" : {
                return getItemTiles()
            }
            case"Table": {
                const itemKeys = Object.keys(activity?.content.liStructure).filter(key =>
                    key !== '_id' && key !== 'deleted' && key !== 'creatorId' &&
                    !Array.isArray(activity?.content.liStructure[key])
                )
                return (
                    <Shared.ItemTable
                        itemsToDisplay={items}
                        itemKeys={itemKeys}
                        itemTypes={activity?.content.liStructure}
                        editable={true}
                        isItem={false}
                        //linkActions
                    />
                )
            }
            case"Chat": {
                return getItemTiles()
            }
            case "Report": {
                return getItemTiles()
            }
            default: {
                return
            }
        }
    }

    const [showLi, setShowLi] = useState(true)
    const toggleLi = () => {
        setShowLi(prev => !prev)
    }

    return (
        <div className="wrapper">
            {/* activity name */}
            <div
                className='list-header'
            >
                <p>{item?.name}</p>
                <button
                    className="list-toggle-button button-main"
                    onClick={toggleLi}
                >
                    {(showLi) ? "Hide" : "Show"}
                </button>
            </div>
            {showLi &&
                <>
                    {/* EditStructure button */}
                    {rights.edit.includes(metaActivity.getAccess(userData)) &&
                        getDialog(metaActivity.type, "Edit Structure")
                    }
                    {rights.edit.includes(metaActivity.getAccess(userData)) && metaActivity.type === "Table" &&
                        getDialog(metaActivity.type, "Add Item")
                    }
                    {/* list items */}
                    <div
                        className='scrollable-wrapper'
                    >
                        {getList(metaActivity.type)}
                    </div>
                </>
            }
        </div>
    )
}

export default List