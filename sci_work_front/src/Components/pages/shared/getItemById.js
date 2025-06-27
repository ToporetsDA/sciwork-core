const getItemById = (array, _id) => {
    return array.find(item => item._id === _id) || {}
}

export default getItemById