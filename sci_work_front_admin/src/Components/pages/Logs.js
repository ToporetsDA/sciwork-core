import { Suspense }  from 'react'
import '../../css/components/pages/Projects.css'

import * as Shared from './shared'

const Logs = ({
    userData, setUserData,
    state, setState,
    itemsToDisplay, setItemsToDisplay,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

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
                        itemsToDisplay={[]}
                        itemKeys={["user", "type", "dateTime", "event"]}
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

export default Logs
