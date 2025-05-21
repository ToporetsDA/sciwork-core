import * as Shared from './'

const NormalizeItemsPath = (items, item, parentPath) => {
    let updatedActivities = []
    const normalizedActivities = item.activities.map((item, index) => {
        const newBasePath = `${parentPath}.${index}`
        updatedActivities.push(Shared.UpdateItemAndChildrenPaths(items, Shared.GetItemById(items, item._id), newBasePath))

        return {
            ...item,
            path: newBasePath
        }
    })

    const updatedActivity = {
        ...item,
        activities: normalizedActivities
    }

    return [...updatedActivities, updatedActivity]
}

export default NormalizeItemsPath