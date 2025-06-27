import { Suspense }  from 'react'
import '../../css/components/pages/Projects.css'

import * as Shared from './shared'

const Logs = ({
    userData, setUserData,
    state, setState,
    projects, 
    activities,
    setData,
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
            <div className={`page-wrapper`}>
                <Suspense fallback={<div>Loading projects...</div>}>
                    <Shared.ItemTable
                        userData={userData}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        state={state}
                        setState={setState}
                        itemsToDisplay={projects}
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
