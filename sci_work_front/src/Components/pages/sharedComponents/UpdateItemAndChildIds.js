const UpdateItemAndChildrenIds = (item, newBaseId) => {
    const updatedItem = {
        ...item,
        _id: newBaseId,
    }

    if (item.activities) {
        updatedItem.activities = item.activities.map((child, i) =>
            UpdateItemAndChildrenIds(child, `${newBaseId}.${i}`)
        )
    }

    return updatedItem
}

export default UpdateItemAndChildrenIds