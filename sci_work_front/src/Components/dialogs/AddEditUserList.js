import { useMemo, useCallback }  from 'react'
import '../../css/components/dialogs/AddEditUserList.css'

import * as Shared from '../pages/sharedComponents'

const AddEditUserList = ({
    userData, setUserData,
    projects,
    activities,
    setData,
    state, setState,
    rights,
    users,
    itemStructure,
    defaultStructure,
    isCompany}
) => {

    /*
    chat will be styled list based activity
    filled with items with buttons to delete(set deleted: true with who and when deleted)
    and Text item with send button to send messages

    Chat activity like attendance to be allowed only 1 per container (project/Group) (check through meta-tree of activities)

    Test = AddEditContent-with-template based editor + iterable "questions" made of plain text and list(answer options)
    Test can have more questions than allowed for attemps, if so - pick randomly
    */

    //get item
    const parts = state.currentDialog.params[0].split('.')
    const project = Shared.GetItemById(projects, parts[0])
    const metaActivity = Shared.FindItemWithParent(project.activities, "_id", (parts[0] + '.' + parts[1]), project).item
    const activity = Shared.GetItemById(activities, metaActivity?._id)

    //cant give yourself access
    let usersData = users
    let item

    switch(parts.length) {
        case 0:{
            console.warn("no item _id")
            break
        }
        case 1:{
            item = project
            break
        }
        case 2:{
            item = metaActivity
            break
        }
        default: {
            usersData = users.filter(user => user._id !== userData._id)
            item = activity.content?.listItems[parts[2]]
        }
    }

    console.log("from AddEditUserList", parts, project, metaActivity, activity, item)

    const currentUserParam = (parts.length < 2) ? item : metaActivity
    const currentUserAccess = Shared.GetAccess(currentUserParam, userData)

    const closeDialog = useCallback(() => {
        setState((prevState) => ({
            ...prevState,
            currentDialog: {
                name: undefined,
                params: []
            }
        }))
    }, [setState])

    const saveChanges = useCallback((updatedUserList) => {
        let updatedItem
        if (parts.length < 3) {
            console.log("item update", )
            updatedItem = {
                ...item,
                userList: updatedUserList
            }
            console.log("updatedItem", updatedItem)
            setData({ action: "edit", item: updatedItem })
        }
        else {
            console.log("activity update", )
            updatedItem = structuredClone(activity)
            updatedItem.content.listItems[parts[2]].userList = updatedUserList

            const userList = updatedItem.content.listItems[parts[2]].userList
            const addedUser = usersData.find(user => user._id === userList[userList.length - 1].id)
            
            updatedItem.content.listItems[parts[2]].markable.userEntries = [
                ...updatedItem.content.listItems[parts[2]].markable.userEntries,
                {
                    _id: addedUser._id,
                    name: addedUser.name,
                    middleName: addedUser.middleName,
                    surName: addedUser.surName,
                    patronimic: addedUser.patronimic,
                    checker: [false, "--:--"]
                }
            ]

            setData({
                action: "content",
                item: {
                    type: metaActivity.type,
                    activity: updatedItem
                }
            })
            
        }
        console.log("updatedItem", parts.length < 3, updatedItem, updatedUserList)
        
    }, [usersData, item, metaActivity, activity, parts, setData])

    const userList = (parts.length < 3) ? item.userList : activity.content.listItems[parts[2]].userList

    const handleRemoveUser = useCallback((userId) => {
        const updatedUserList = userList.filter(item => item.id !== userId)

        saveChanges(updatedUserList)
    }, [userList, saveChanges])

    const handleAddUser = useCallback((userId) => {
        console.log("updatedUserList", activity, userList)
        const defaultAccess = rights.names.length - 1 //lowest
        const updatedUserList = [...userList, { id: userId, access: defaultAccess }]

        saveChanges(updatedUserList)
    }, [rights, userList, activity, saveChanges])

    const handleRightChange = useCallback((userId, newRight) => {
        const updatedUserList = userList.map(user =>
            user.id === userId ? { ...user, access: newRight } : user
        )

        saveChanges(updatedUserList)
    }, [userList, saveChanges])

    //fields

    //add/remove access button
    const getButton = (buttonClass, clickHandler, param, text) => {
        return (
            <button
                className={`${buttonClass} button-mini`}
                onClick={() => clickHandler(param)}
            >
                {text}
            </button>
        )
    }

    //change access level combobox
    const getSelect = useCallback((listItem, user) => {
        return (
            <select
                className="accessLevel"
                value={listItem.access}
                onChange={(e) => handleRightChange(user._id, parseInt(e.target.value))}
            >
                {rights.names.map((right, index) => {

                    if (index > currentUserAccess) {
                        return (
                            <option key={index} value={index}>
                                {right}
                            </option>
                        )
                    }
                    else {
                        return null
                    }
                })}
            </select>
        )
    }, [handleRightChange, currentUserAccess, rights.names])

    const { usersWithAccess, usersWithoutAccess } = useMemo(() => {
        const userList = item.userList || []
        const withAccess = []
        const withoutAccess = []

        usersData.forEach(user => {
            const listItem = userList.find(item => item.id === user._id)
            if (listItem) {
                let button = getButton("add-remove-access", handleRemoveUser, user._id, "X")
                let select = getSelect(listItem, user, )

                //cant edit yourself
                if (user._id === userData._id) {
                    button = ""
                    select = rights.names[listItem.access]
                }
                //cant edit users with higher access
                if (currentUserAccess > Shared.GetAccess(item, user)) {
                    select = rights.names[listItem.access]
                }

                withAccess.push({ ...user, access: button, accessLevel: select })
            }
            else {
                const button = getButton("add-remove-access", handleAddUser, user._id, "+")

                withoutAccess.push({ ...user, access: button, accessLevel: "" })
            }
        })

        return { usersWithAccess: withAccess, usersWithoutAccess: withoutAccess }
    }, [usersData, item, currentUserAccess, rights.names, userData, handleAddUser, handleRemoveUser, getSelect])

    const itemKeys = ["name", "middleName", "surName", "patronimic", "genStatus", "access", "accessLevel"]
    const itemTypes = {
        name: "plain",
        middleName: "plain",
        surName: "plain",
        patronimic: "plain",
        genStatus: "access",
        access: "button",
        accessLevel: "combobox"
    }

    const getTable = (itemsToDisplay) => {
        return (
            <Shared.ItemTable
                userData={userData}
                projects={projects}
                activities={activities}
                setData={setData}
                state={state}
                setState={setState}
                itemsToDisplay={itemsToDisplay}
                itemKeys={itemKeys}
                itemTypes={itemTypes}
                editable={true}
                isItem={false}
                //linkActions
                rights={rights}
                // recentActivities={recentActivities}
                // setRecentActivities={setRecentActivities}
            />
        )
    }

    return (
        <div className="AddEditUserListDialog dialogContainer">
            <div className="dialogContent">
                <p>Users of {currentUserParam.name}</p>
                <div className="usersWithAccess">
                    <h3>Users with Access</h3>
                    <div className="scrollableList">
                        {getTable(usersWithAccess)}
                    </div>
                </div>
                <div className="usersWithoutAccess">
                    <h3>Users without Access</h3>
                    <div className="scrollableList">
                        {getTable(usersWithoutAccess)}
                    </div>
                </div>
                <button
                    className='button-main'
                    onClick={closeDialog}
                >
                    Back
                </button>
            </div>
        </div>
    )
}

export default AddEditUserList