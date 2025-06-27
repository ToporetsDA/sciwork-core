import { Suspense, useCallback }  from 'react'
import '../../css/components/pages/Projects.css'

import * as Shared from './shared'

const Users = ({
    userData, setUserData,
    state, setState,
    itemsToDisplay, setItemsToDisplay,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const getSelect = useCallback((user) => {
        const options = rights.names
            .map((right, index) => {
                return { id: index, value: right }
            })
            .filter(right => right.id > userData.genStatus)
        
        return Shared.getSelect(
                user.genStatus,
                (e) => setUsers("access", user._id, e.target.value),
                options,
                "id",
                "id",
                "value"
            )
    }, [userData.genStatus, setUsers, rights])

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

    const getStrSpace = (str) => {
        return str ? str + " " : ""
    }

    const usersToDisplay = users.map(user => {

        const userToDisplay = {
            user: getStrSpace(user.name) + getStrSpace(user.middleName) + getStrSpace(user.surName) + getStrSpace(user.patronimic),
            genStatus: (userData.genStatus < user.genStatus)
                ? getSelect(user)
                : rights.names[user.genStatus],
            delete: (userData.genStatus < user.genStatus)
                ? getButton("add-remove-access", () => {setUsers("delete", user._id)}, user._id, "X")
                : ""
        }

        return userToDisplay
    })

    return (
        <>
            <Shared.ControlPanel
                userData={userData}
                setUserData={setUserData}
                state={state}
                setState={setState}
                rights={rights}
                setItemsToDisplay={setItemsToDisplay}
            />
            <div>
                <Suspense fallback={<div>Loading projects...</div>}>
                    <Shared.ItemTable
                        userData={userData}
                        state={state}
                        setState={setState}
                        itemsToDisplay={usersToDisplay}
                        itemKeys={["user", "genStatus", "delete"]}
                        //itemTypes
                        editable={false}
                        isItem={true}
                        //linkActions
                        rights={rights}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                </Suspense>
            </div>
        </>
    )}

export default Users
