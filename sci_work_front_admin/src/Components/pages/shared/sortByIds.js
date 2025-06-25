const sortByIds = (array, ids, fullArr) => {
    let sortedArray = []
    for (let i = 0; i < ids.length; i++) {
        let item = array.find(a => a._id === ids[i])
        if (!item) {
            console.log(ids[i], "is a new item, look from source", fullArr)
            item = fullArr.find(a => a._id === ids[i])
        }
        sortedArray.push(item)
    }
    return sortedArray
}

export default sortByIds