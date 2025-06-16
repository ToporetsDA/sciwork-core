const treeToArray = (list, field, result = []) => {
    for (const item of list) {
        result.push(item)
        if (item[field]?.length) {
            treeToArray(item[field], result)
        }
    }
    return result
}

export default treeToArray