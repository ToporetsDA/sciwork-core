import React from 'react'
import '../../css/components/dialogs/JointEventOverlap.css'

import * as Shared from '../pages/sharedComponents'

const JointEventOverlapDialog = ({
    userData, setUserData,
    projects,
    activities,
    setData,
    state, setState,
    rights,
    users,
    recentActivities, setRecentActivities,
    isCompany
}) => {

    // Close the dialog

    const closeDialog = (e) => {
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

    return (
        <div
            className="JointEventOverlapDialog dialogContainer"
            onClick={closeDialog}
        >
            <div className="dialogContent">
                <Shared.ItemTable
                    userData={userData}
                    projects={projects}
                    activities={activities}
                    setData={setData}
                    state={state}
                    setState={setState}
                    itemsToDisplay={projects}
                    itemKeys={["name", "startDate", "endDate"]}
                    //itemTypes
                    editable={false}
                    isItem={false}
                    rights={rights}
                    recentActivities={recentActivities}
                    setRecentActivities={setRecentActivities}
                />
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

export default JointEventOverlapDialog