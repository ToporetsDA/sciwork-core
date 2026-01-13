// Libraries
import { useState, useMemo, useContext } from 'react'
import { useNavigate } from "react-router-dom"
// Styles, Classes, Constants
import '../../../css/components/pages/shared/ItemTable.css'
// Methods, Components
import * as Shared from './'
import * as Items from '../../items'

/* from
Projects
List
AddEditUserList
JointEventOverlap
Notifications
*/

const ItemTable = ({
    itemsToDisplay,
    itemKeys,
    itemTypes,
    editable, //editable content
    isItem, //is project or activity
    linkActions
}) => {

    const {
        projects,
        activities,
        setData,
        state,
        rights,
        recentActivities, setRecentActivities
    } = useContext(Shared.AppContext)

    //navigation for projects
    const navigate = useNavigate()

    //find activity if activities
    const parts = (itemsToDisplay.length > 0) ? itemsToDisplay[0]._id.split('.') : []
    parts.pop()
    const activity = Shared.getItemById(activities, parts.join('.'))

    //column types for activities
    const liKeys = itemKeys.filter(val => val !== 'tech')

    const saveChanges = (key, value, activity, index) => {
    
        const updatedActivity = Shared.setFieldValue(
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
                        item={item}
                        data={`listItems.${index}.${key}`}
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
                return (
                    <>
                    {(item[key][0] === false) ? (//if not checked - show checkbox
                        <input
                            type="checkbox"
                            checked={item[key][0] || false}
                            onChange={(e) => {saveChanges(key, [e.target.checked, getTime()], activity, index)}}
                        />
                    ) : (//if checked - show time of it being checked
                        <div>
                            {item[key][1]}
                        </div>
                    )}
                    {item[key].length === 3 && //add to Text Editable param and pass this
                        <div className='text-wrapper'>
                            <div className='text-container'>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: item[key][2]
                                    }}
                                />
                            </div>
                        </div>
                    }
                    </>
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
                {isItem && (!state.currentDialog?.name) &&
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
                            className={`
                                ${item?.deleted ? "deleted" : ""}
                                ${isExpiring ? 'expiring' : ''}
                                ${isExpired ? 'expired' : ''}
                            `}
                            onClick={() => {
                                if (isItem) {//for links
                                    if (linkActions) {
                                        linkActions(item._id)
                                    }
                                    navigate(Shared.goTo(item, items, recentActivities, setRecentActivities))
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
                            {isItem &&
                                <td>{status}</td>
                            }
                            {isItem && (!state.currentDialog?.name) &&
                                <td onClick={(e) => e.stopPropagation()}>
                                    <Shared.ItemActions
                                        item={item}
                                    />
                                </td>
                            }
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default ItemTable