import { useEffect, useState, useMemo, useContext } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

import '../../Styles/components/items/List.sass'

import { ITEMS_WITH_DIALOG_BUTTON } from '../../lib/constants'
import { getDialogButton, getItemById } from '../../lib/helpers'

import { AppContext, ItemTable, ItemTiles, ToggleButton } from '../pageAssets/shared'

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
        projectId, activityId,
        userData,
        projects,
        activities,
        setData,
        setDialog,
        rights
    } = useContext(AppContext)

    // ==================================
    // const, helpers and state management
    // ==================================

    const activity = getItemById(activities, activityId)
    const project = getItemById(projects, projectId)

    const { item: metaActivity } = project.findItemWithParent(project.activities, "_id", activityId, project)

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

    const [showLi, setShowLi] = useState(true)
    

    // --- helpers ---

    useEffect(() => {
        setItems(allItems.filter(i => !i.deleted))
        setSettings((prevSettings) => ({
            ...prevSettings,
            type: prevSettings.type
        }))
    }, [activity, allItems])

    useEffect(() => {
        const parent = getItemById(projects, containerId)
        const access = parent.getAccess(userData, activityId)
        const change = (activity.content?.currentSettings?.type !== settings?.type) && settings?.type

        if (rights.edit.includes(access) && change) {
            console.log("default ul/ol changed")
            
            setData({
                domain: "activities",
                id: activityId,
                recipe: (draft) => {
                    draft.content.currentSettings = settings
                }
            })
        }
    }, [rights.edit, projects, setData, userData, containerId, activity, activityId, settings])

    const toggleLi = () => {
        setShowLi(prev => !prev)
    }

    // ==================================
    // dnd management
    // ==================================

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = items.findIndex(i => i._id === active.id)
            const newIndex = items.findIndex(i => i._id === over.id)
            const newItems = arrayMove(items, oldIndex, newIndex)
            setItems(newItems)

            setData({
                domain: "activities",
                id: activityId,
                recipe: (draft) => {
                    draft.content.listItems = newItems
                }
            })
        }
    }

    // ==================================
    // display logic management
    // ==================================

    const getItemTiles = () => {
        return (
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items.map((i) => i._id)}>
                    <ItemTiles
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

        if (!ITEMS_WITH_DIALOG_BUTTON.includes(itemType)) {
            return
        }
        else {
            return (
                <div
                    className='list-actions'
                >
                {getDialogButton(
                    setDialog,
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
                        <ToggleButton
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
                    <ItemTable
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

    // ==================================

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