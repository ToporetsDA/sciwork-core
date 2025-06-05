import { useNavigate } from "react-router-dom"

import * as Shared from './'
import * as Items from '../../items'

const ItemTable = ({
    userData,
    projects,
    activities,
    setData,
    state, setState,
    itemsToDisplay,
    itemKeys,
    itemTypes,
    rights,
    recentActivities, setRecentActivities
}) => {

    const navigate = useNavigate()

    const saveChanges = (key, value, activity, index) => {
    
        const updatedActivity = Shared.SetFieldValue(
            activity,
            `listItems.${index}.${key}`,
            value
        )

        setData({action: "content", item: {type: "Table", activity: updatedActivity}})
    }

    const getTileContent = (key, item, index) => {
        switch(itemTypes[key]) {
            case"text" : {
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
            case"checkbox" : {
                const parts = item._id.split('.')
                parts.pop()
                const activity = Shared.GetItemById(activities, parts.join('.'))
                return (
                    <input
                        type="checkbox"
                        checked={item[key] || false}
                        onChange={(e) => {saveChanges(key, e.target.checked, activity, index)}}
                    />
                )
            }
            default: {
                console.log("unknown key type", itemTypes[key])
                return item[key]
            }
        }

        
    }

    return (
        <table className="item-table">
            <thead>
                <tr>
                {itemKeys.map((key) => (
                    <th key={key}>{key}</th>
                ))}
                <th>Status</th>
                <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {itemsToDisplay.map((item, index) => {
                const daysLeft = (new Date(item.endDate) - new Date()) / (24 * 60 * 60 * 1000)
                const isExpiring = daysLeft < 30
                const isExpired = new Date(item.endDate) < new Date()
                const status = isExpired ? 'Expired' : isExpiring ? 'Expiring' : 'Active'

                const items = (!state.currentProject) ? projects : activities

                return (
                    <tr
                    key={index}
                    className={`${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''}`}
                    onClick={() => {
                        if (!state.currentProject) {
                            navigate(Shared.GoTo(item, items, recentActivities, setRecentActivities))
                        }
                    }}
                    >
                    {itemKeys.map((key) => (
                        <td key={key}>
                        {(!state.currentProject) ? (
                            item[key]
                        ) : (
                            getTileContent(key, item, index)
                        )}
                        </td>
                    ))}
                    {!state.currentProject &&
                        <td>{status}</td>
                    }
                    <td onClick={(e) => e.stopPropagation()}>
                        <Shared.ItemActions
                            userData={userData}
                            data={projects}
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