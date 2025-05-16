import { useNavigate } from "react-router-dom"

import * as Shared from './'

const ItemTable = ({userData, data, setData, setState, itemsToDisplay, rights, recentActivities, setRecentActivities}) => {

    const navigate = useNavigate()

    const sampleItem = itemsToDisplay[0] || {}

    // extract keys from project and filter out _id and arrays
    const itemKeys = Object.keys(sampleItem).filter(key =>
        key !== '_id' &&
        !Array.isArray(sampleItem[key])
    )

    return (
        <table className="project-table">
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

                return (
                    <tr
                    key={index}
                    className={`${isExpiring ? 'expiring' : ''} ${isExpired ? 'expired' : ''}`}
                    onClick={() => navigate(Shared.GoTo(item, data, recentActivities, setRecentActivities))}
                    >
                    {itemKeys.map((key) => (
                        <td key={key}>
                        {item[key]}
                        </td>
                    ))}
                    <td>{status}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                        <Shared.ItemActions
                            userData={userData}
                            data={data}
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