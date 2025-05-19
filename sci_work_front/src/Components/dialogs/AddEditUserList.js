import { useCallback, useMemo }  from 'react'
import '../../css/dialogs/AddEditUserList.css'
import '../../css/dialogs/dialog.css'

import * as Shared from '../pages/sharedComponents'

const AddEditUserList = ({ userData, setUserData, data, setData, state, setState, rights, users, itemStructure, defaultStructure, isCompany }) => {

    const getFullName = (user) => {
        let fullName = user.name + ' '
        if (user.secondName) {
            fullName += user.secondName + ' '
        }
        if (user.surName) {
            fullName += user.surName + ' '
        }
        if (user.patronymic) {
            fullName += user.patronymic + ' '
        }
        return fullName
    }

    const userList = useMemo(() => {
        return Shared.GetItemById(data, state.currentProject).userList || []
    }, [data, state.currentProject])

    const getAccess = useCallback((user, userList) => {
        return userList.find(listItem => listItem.id === user._id)?.access
    }, [])

    const usersWithAccess = useMemo(() => {
        return users.filter(user => userList.some(listItem => listItem.id === user._id))
            .map(user => {
                console.log("userList", userList)
                const userAccess = getAccess(user, userList)
                return { ...user, access: userAccess }
            });
    }, [users, userList, getAccess])

    const usersWithoutAccess = useMemo(() => {
        return users.filter(user => !userList.some(listItem => listItem.id === user._id))
            .map(user => {
                return { ...user, access: null }
            })
    }, [users, userList])

    // Close the dialog

    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            setState((prevState) => ({
                ...prevState,
                currentDialog: {
                    name: undefined,
                    params: []
                }
            }))
        }
    }

    const saveChanges = (updatedUserList) => {
        // Update state
        setState(prevState => {
            const newState = {
                ...prevState,
                currentProject: {
                    ...Shared.GetItemById(data, state.currentProject),
                    userList: updatedUserList,
                },
            }
            
            // Ensure the state is updated before sending data to the server
            setData({ action: "edit", item: newState.currentProject })
    
            // Return updated state
            return newState
        })
    }

    const handleRemoveUser = (userId) => {
        const updatedUserList = userList.filter(item => item.id !== userId)
        saveChanges(updatedUserList)
    }

    const handleAddUser = (userId) => {
        const defaultAccess = rights.names.length - 1 //lowest
        const updatedUserList = [...userList, { id: userId, access: defaultAccess }]
        saveChanges(updatedUserList)
    }

    const handleRightChange = (userId, newRight) => {
        const updatedUserList = userList.map(item => 
            item.id === userId ? { ...item, access: newRight } : item
        )
        saveChanges(updatedUserList)
    }

    return (
        <div className="AddEditUserListDialog dialogContainer" onClick={handleOutsideClick}>
            <div className="dialogContent">
                <div className="usersWithAccess">
                    <h3>Users with Access</h3>
                    <div className="scrollableList">
                        {usersWithAccess.map(user => (
                            <div key={user._id} className="userItem" >
                                <span>{getFullName(user)}</span>
                                { (user.access !== 0) && 
                                  (getAccess(userData, userList) < user.access) &&
                                <>
                                    <select
                                        value={user.access}
                                        onChange={(e) => handleRightChange(user._id, e.target.value)}
                                    >
                                        {rights.names.map((right, index) => {
                                            if (index !== 0) { // Exclude access level 0
                                                return (
                                                    <option key={index} value={index}>
                                                        {right}
                                                    </option>
                                                )
                                            }
                                            return null
                                        })}
                                    </select>
                                    <button onClick={() => handleRemoveUser(user._id)}>Remove</button>
                                </>
                                }
                            </div>
                        ))}
                    </div>
                </div>
                <div className="usersWithoutAccess">
                    <h3>Users without Access</h3>
                    <div className="scrollableList">
                        {usersWithoutAccess.map(user => (
                            <div key={user._id} className="userItem">
                                <span>{getFullName(user)}</span>
                                <button onClick={() => handleAddUser(user._id)}>Add</button>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    className='backButton'
                    onClick={handleOutsideClick}
                >
                    Back
                </button>
            </div>
        </div>
    )
}

export default AddEditUserList