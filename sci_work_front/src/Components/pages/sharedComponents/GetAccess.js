const GetAccess = (item, userData) => {
    const access = item.userList?.find(user => user.id === userData._id)?.access
    return (typeof access === 'number') ? access : -1
}

export default GetAccess