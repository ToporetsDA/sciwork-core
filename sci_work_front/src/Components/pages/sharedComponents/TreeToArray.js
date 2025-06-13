const TreeToArray = (list, field, result = []) => {
    for (const item of list) {
        result.push(item)
        if (item[field]?.length) {
            TreeToArray(item[field], result)
        }
    }
    return result
}

export default TreeToArray