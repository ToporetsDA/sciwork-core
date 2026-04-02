import { useState, useContext } from 'react'

import '../../../Styles/components/itemAssets/ListItem.sass'

import { MARKABLE_FIELDS, MARKABLE_TYPES } from '../../../lib/constants'
import { getInput, getItemById } from '../../../lib/helpers'

import { AppContext, ItemTable } from '../../pageAssets/shared'
import { Text } from '../../items'

const ListItem = ({
    item,
    index,
    containerId,
    containerType
}) => {

    const {
        projectId, activityId,
        userData,
        projects,
        activities,
        setData,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("itemAssets.subItems.chat")

    // ==================================
    // const, helpers and state management
    // ==================================

    const project = getItemById(projects, projectId)
    const {item: metaActivity} = project.findItemWithParent(project.activities, "_id", containerId, project)

    const activity = getItemById(activities, activityId)

    const fieldsToRender = activity.content?.liStructure

    //for Report activity
    const [reportInput, setReportInput] = useState("")

    // --- helpers ---

    // get now "hh:mm"
    const getTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // ==================================
    // const, helpers and state management
    // ==================================

    const saveChanges = (key, value, activity, index) => {
        setData({
            domain: "activities",
            id: activityId,
            recipe: (draft) => {
                draft.listItems[index][key] = value
            }
        })
    }

    const handleMarkable = (key) => {

        const markable = activity?.content.listItems[index].markable

        //allow marking if in time window
        const now = new Date()
        const allowedDay = new Date(markable.date)

        const start = new Date(allowedDay)
        const [startHours, startMinutes] = markable.startTime.split(":").map(Number)
        start.setHours(startHours, startMinutes, 0, 0)

        const end = new Date(allowedDay)
        const [endHours, endMinutes] = markable.endTime.split(":").map(Number)
        end.setHours(endHours, endMinutes, 0, 0)
        
        const inTimeWindow = (start < now ) && (now < end)

        const entryIndex = markable.userEntries.findIndex(e => e._id === userData._id)
        const keyPath = [key, "userEntries", entryIndex, "checker"].join('.')
        const check = markable?.userEntries[entryIndex]?.checker
            
        return (
            <div
                key={item._id + '.' + key}
            >
                <>
                    {t("markable.label", {
                        start: markable.startTime,
                        end: markable.endTime,
                        date: markable.date
                    })}
                </>
                {(userData._id === item.creatorId) ? (//creator sees if other users left mark
                    <ItemTable
                        itemsToDisplay={markable.userEntries}
                        itemKeys={MARKABLE_FIELDS}
                        itemTypes={MARKABLE_TYPES}
                        // nested={false}
                    />
                ) : (containerType !== "Report") ? (//other users see checkbox
                        <>
                            {(!check?.[0]) ? (//if not checked - show checkbox
                                <input
                                    type="checkbox"
                                    checked={check?.[0] || false}
                                    disabled={!inTimeWindow}
                                    onChange={(e) => {saveChanges(keyPath, [e.target.checked, getTime()], activity, index)}}
                                />
                            ) : (//if checked - show time of it being checked
                                <>
                                    {": " + check?.[1]}
                                </>
                            )}
                        </>
                    ) : (//other users see field(s) to save comment (and report, if it's private server with storage)
                        <div className="chat-input-row" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            {getInput(
                                "",
                                "text",
                                reportInput || check[2],
                                false,
                                (e) => setReportInput(e.target.value),
                                !inTimeWindow || check?.[0],
                                null,
                                100
                            )}
                            {(!check?.[0]) ? (//if no saved value or editing
                                <button
                                    onClick={(e) => {saveChanges(keyPath, [true, getTime(), reportInput], activity, index)}}
                                >
                                    {t("save")}
                                </button>
                            ) : (//if already saved
                                // <button
                                //     onClick={(e) => {check[0] = false}}
                                // >
                                //     Edit
                                // </button>
                                <></>
                            )
                            }
                        </div>
                    )
                }
            </div>
        )
    }

    const getField = (key, type) => {
        
        switch(type) {
            case "checkbox": {
                return (
                    <div
                        className='checkbox-wrapper'
                        key={item._id + '.' + key}
                    >
                        <p>{key}</p>
                        <input
                            type="checkbox"
                            checked={item[key] || false}
                            onChange={(e) => {saveChanges(key, e.target.checked, activity, index)}}
                        />
                    </div>
                )
            }
            case "text": {
                return (
                    <Text
                        key={item._id + '.' + key}

                        item={item}
                        data={`listItems.${index}.${key}`}
                    />
                )
            }
            case "markable": {
                return handleMarkable(key)
            }
            default: {
                return
            }
        }
    }

    return (metaActivity.type === "List") ? (
        <li className="wrapper list-item">
            {Object.entries(fieldsToRender).map(([key, type]) => (
                getField(key, type)
            ))}
        </li>
    ) : (
        <div className="wrapper list-item">
            {Object.entries(fieldsToRender).map(([key, type]) => (
                getField(key, type)
            ))}
        </div>
    )
}

export default ListItem