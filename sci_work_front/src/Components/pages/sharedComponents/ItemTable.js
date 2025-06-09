import { useState, useMemo } from 'react'
import { useNavigate } from "react-router-dom"

import * as Shared from './'
import * as Items from '../../items'

/* from
Projects
List
AddEditUserList
*/

const ItemTable = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    itemsToDisplay,
    itemKeys,
    itemTypes,
    editable, //editable content
    isItem, //is project or activity
    rights,
    recentActivities, setRecentActivities
}) => {

    //navigation for projects
    const navigate = useNavigate()

    //find activity if activities
    const parts = (itemsToDisplay.length > 0) ? itemsToDisplay[0]._id.split('.') : []
    parts.pop()
    const activity = Shared.GetItemById(activities, parts.join('.'))

    //column types for activities
    const liKeys = itemKeys.filter(val => val !== 'tech')

    const saveChanges = (key, value, activity, index) => {
    
        const updatedActivity = Shared.SetFieldValue(
            activity,
            `listItems.${index}.${key}`,
            value
        )

        setData({action: "content", item: {type: "Table", activity: updatedActivity}})
    }

    // get now "hh:mm"
    const getTime = () => {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const getTileContent = (key, item, index) => {
        
        switch(itemTypes[key]) {
            case "text": {
                return (
                    <Items.Text
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        item={item}
                        data={`listItems.${index}.${key}`}
                        rights={rights}
                    />
                )
            }
            case "checkbox": {
                return (
                    <input
                        type="checkbox"
                        checked={item[key] || false}
                        onChange={(e) => {saveChanges(key, e.target.checked, activity, index)}}
                    />
                )
            }
            case "plain": {
                return item[key]
            }
            case "checker": {
                return (item[key][0] === false) ? (//if not checked - show checkbox
                    <input
                        type="checkbox"
                        checked={item[key][0] || false}
                        onChange={(e) => {saveChanges(key, [e.target.checked, getTime()], activity, index)}}
                    />
                ) : (//if checked - show time of it being checked
                    <div>
                        {item[key][1]}
                    </div>
                )
            }
            case "button": {
                return item[key]
            }
            case "combobox": {
                return item[key]
            }
            case "access": {
                return rights.names[Number(item[key])]
            }
            case "tech": {
                return
            }
            default: {
                console.log("unknown key type", itemTypes[key])
                return item[key]
            }
        }

        
    }

    //sorting, not saveable
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

    const handleSort = (key) => {
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                setSortConfig({ key, direction: 'desc' })
            } else if (sortConfig.direction === 'desc') {
                setSortConfig({ key: null, direction: null }) // disable sorting
            } else {
                setSortConfig({ key, direction: 'asc' })
            }
        } else {
            setSortConfig({ key, direction: 'asc' })
        }
    }

    const sortedItems = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return itemsToDisplay

        const sorted = [...itemsToDisplay].sort((a, b) => {
            let valA = a[sortConfig.key]
            let valB = b[sortConfig.key]

            const getPrimitive = (val) => {
                if (typeof val === 'boolean') return val ? 1 : 0
                if (typeof val === 'number') return val
                if (typeof val === 'string') {
                    // Strip HTML if needed
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = val
                    return tempDiv.textContent || tempDiv.innerText || ''
                }
                return ''
            }

            valA = getPrimitive(valA)
            valB = getPrimitive(valB)

            if (valA < valB) return -1
            if (valA > valB) return 1
            return 0
        })

        return sortConfig.direction === 'desc' ? sorted.reverse() : sorted
    }, [itemsToDisplay, sortConfig])

    return (
        <table className="item-table">
            <thead>
                <tr>
                {liKeys.map((key) => (
                    <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                        {key}
                        {sortConfig.key === key && (
                            sortConfig.direction === 'asc' ? ' ↑' :
                            sortConfig.direction === 'desc' ? ' ↓' : ''
                        )}
                    </th>
                ))}
                {isItem &&
                    <th>Status</th>
                }
                {isItem &&
                    <th>Actions</th>
                }
                </tr>
            </thead>
            <tbody>
                {sortedItems.map((item, index) => {
                const daysLeft = (new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000)
                const isExpiring = daysLeft < 30
                const isExpired = new Date(item.endDate) < new Date()
                const status = isExpired ? 'Expired' : isExpiring ? 'Expiring' : 'Active'

                const items = (!state.currentProject) ? projects : activities

                const idParts = item._id.split('.')
                const i = parseInt(idParts[idParts.length - 1], 10)

                return (
                    <tr
                        key={index}
                        className={`${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''}`}
                        onClick={() => {
                            if (isItem && !state.currentProject) {//for projects
                                navigate(Shared.GoTo(item, items, recentActivities, setRecentActivities))
                            }
                        }}
                    >
                        {liKeys.map((key) => (
                            <td key={key}>
                                {!editable
                                    ? item[key] //text
                                    : getTileContent(key, item, i) //editable text
                                }
                            </td>
                        ))}
                        {isItem && <td>{status}</td>}
                        <td onClick={(e) => e.stopPropagation()}>
                            <Shared.ItemActions
                                userData={userData}
                                projects={projects}
                                activities={activities}
                                setData={setData}
                                setState={setState}
                                item={item}
                                rights={rights}
                            />
                        </td>
                    </tr>
                )
                })}
            </tbody>
        </table>
    )
}

export default ItemTable