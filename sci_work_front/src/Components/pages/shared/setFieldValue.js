const setFieldValue = (activity, dataPath, value) => {
    const parts = dataPath.split('.')
    const newContent = structuredClone(activity.content) // deep clone
    let curr = newContent

    for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i]
        const index = parseInt(key)
        const k = isNaN(index) ? key : index

        // Ensure path exists
        if (curr[k] === undefined) curr[k] = {}

        curr = curr[k]
    }

    const lastKey = parts[parts.length - 1]
    const lastIndex = parseInt(lastKey)
    curr[isNaN(lastIndex) ? lastKey : lastIndex] = value

    return { ...activity, content: newContent }
}

export default setFieldValue