const UpdateItemAndChildrenIds = (item, newBasePath) => {
    const updatedItem = {
        ...item,
        path: newBasePath,
    }

    if (item.activities) {
        updatedItem.activities = item.activities.map((child, i) =>
            UpdateItemAndChildrenIds(child, `${newBasePath}.${i}`)
        )
    }

    return updatedItem
}

export default UpdateItemAndChildrenIds