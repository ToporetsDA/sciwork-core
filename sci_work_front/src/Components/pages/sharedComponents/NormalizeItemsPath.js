import * as Shared from './'

const NormalizeItemsPath = (items, item, parentPath, setData) => {
    const normalizedActivities = item.activities.map((item, index) => {
        const newBasePath = `${parentPath}.${index}`
        return Shared.UpdateItemAndChildrenPaths(items, Shared.GetItemById(items, item._id), newBasePath)
    })

    const updatedProject = {
        ...item,
        activities: normalizedActivities
    }

    setData({ item: updatedProject, action: 'edit' })
}

export default NormalizeItemsPath