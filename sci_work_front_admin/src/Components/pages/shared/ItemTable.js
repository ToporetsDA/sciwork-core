import { useState, useMemo } from 'react'
import '../../../css/components/pages/shared/ItemTable.css'

/* from
Logs
Users
*/

const ItemTable = ({
    userData,
    setData,
    state, setState,
    itemsToDisplay,
    itemKeys,
    itemTypes,
    editable, //editable content
    isItem, //is project or activity
    linkActions,
    rights,
    recentActivities, setRecentActivities
}) => {

    //column types for activities
    const liKeys = itemKeys.filter(val => val !== 'tech')

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
                </tr>
            </thead>
            <tbody>
                {sortedItems.map((item, index) => {

                    return (
                        <tr
                            key={index}
                            onClick={() => {
                                if (isItem) {//for links
                                    if (linkActions) {
                                        linkActions(item._id)
                                    }
                                }
                            }}
                        >
                            {liKeys.map((key) => (
                                <td key={key}>
                                    {item[key]}
                                </td>
                            ))}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}

export default ItemTable