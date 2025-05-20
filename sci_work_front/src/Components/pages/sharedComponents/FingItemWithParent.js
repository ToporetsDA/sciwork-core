const FindItemWithParent = (items, field, target, parent) => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item[field] === target) {
            return { item, parent, index: i }
        }
        if (item.activities) {
            const result = FindItemWithParent(item.activities, target, item)
            if (result) return result
        }
    }
    return null
}

export default FindItemWithParent